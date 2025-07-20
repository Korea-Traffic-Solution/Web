package com.kts.traffic;

import java.io.IOException;
import java.io.InputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Date;
import java.util.concurrent.ExecutionException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import org.apache.poi.ss.formula.functions.Today;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.api.core.ApiFuture;
import com.google.auth.oauth2.GoogleCredentials;

@WebServlet("/excelDownload")
public class ExcelDownloadServlet extends HttpServlet {

	private Firestore firestore;

	@Override
	public void init() throws ServletException {
		// Firebase 초기화 (한 번만)
		try {
			if (FirebaseApp.getApps().isEmpty()) {
				InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json");

				if (serviceAccount == null) {
					throw new ServletException("serviceAccountKey.json 파일을 찾을 수 없습니다.");
				}

				FirebaseOptions options = new FirebaseOptions.Builder()
						.setCredentials(GoogleCredentials.fromStream(serviceAccount)).setProjectId("capstone-ce8e9")
						.build();
				FirebaseApp.initializeApp(options);
				serviceAccount.close(); // 리소스 해제
			}
			firestore = FirestoreClient.getFirestore();
		} catch (Exception e) {
			throw new ServletException("Firebase 초기화 실패" + e.getMessage(), e);
		}
	}

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		String managerId = request.getParameter("managerId");
		String brand = request.getParameter("brand");
		String date = request.getParameter("date");
		String managerName = request.getParameter("manager");
		String managerRegion = request.getParameter("managerRegion");

		try {
			// Firestore에서 데이터 조회
			List<ConclusionData> conclusionList = getConclusionData(managerId, brand, date);

			// 엑셀 생성
			generateExcel(response, conclusionList, brand, date, managerName, managerRegion);

		} catch (Exception e) {
			throw new ServletException("엑셀 생성 실패", e);
		}
	}

	private List<ConclusionData> getConclusionData(String managerId, String brand, String date)
			throws InterruptedException, ExecutionException {

		List<ConclusionData> results = new ArrayList<>();

		// 날짜 파싱 및 Timestamp 생성
		LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy. MM. dd."));
		Instant instant = localDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
		Timestamp startTimestamp = Timestamp.ofTimeSecondsAndNanos(instant.getEpochSecond(), 0);
		Timestamp endTimestamp = Timestamp.ofTimeSecondsAndNanos(instant.plus(1, ChronoUnit.DAYS).getEpochSecond(), 0);

		// Firestore 쿼리
		Query query = firestore.collection("Conclusion").whereEqualTo("result", "승인")
				.whereEqualTo("managerId", managerId).whereEqualTo("detectedBrand", brand)
				.whereGreaterThanOrEqualTo("processingDate", startTimestamp)
				.whereLessThan("processingDate", endTimestamp);

		ApiFuture<QuerySnapshot> querySnapshot = query.get();

		for (QueryDocumentSnapshot doc : querySnapshot.get().getDocuments()) {
			Map<String, Object> data = doc.getData();

			// Timestamp → Date → 문자열 변환
			Timestamp timestamp = (Timestamp) data.get("processingDate");
			Date processingDateObj = timestamp.toDate();
			String processingDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(processingDateObj);

			// date 필드 처리 (Timestamp → String)
			Timestamp dateTimestamp = (Timestamp) data.get("date"); // Timestamp로 캐스팅

			Date dateObj = dateTimestamp.toDate();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			String formattedDate = sdf.format(dateObj);

			ConclusionData conclusion = new ConclusionData();
			conclusion.id = doc.getId();
			conclusion.gpsInfo = (String) data.get("gpsInfo");
			conclusion.region = (String) data.get("region");
			conclusion.date = formattedDate; // 변환된 문자열 할당
			Object reseonObj = data.get("reseon");
			conclusion.reseon = (reseonObj == null) ? "" : reseonObj.toString();
			Object fineObj = data.get("fine");
			conclusion.fine = (fineObj == null) ? "" : fineObj.toString();

			results.add(conclusion);

		}

		return results;
	}

	private void generateExcel(HttpServletResponse response, List<ConclusionData> data, String brand, String date,
			String managerName, String managerRegion) throws IOException, ParseException {

		Workbook workbook = new XSSFWorkbook();
		Sheet sheet = workbook.createSheet("요청명단");

		// 스타일 생성
		CellStyle bigBoldCenterStyle = createBigBoldCenterStyle(workbook);
		CellStyle boldCenterStyle = createBoldCenterStyle(workbook);
		CellStyle borderStyle = createBorderStyle(workbook);

		// 헤더 생성
		createHeaders(sheet, bigBoldCenterStyle, boldCenterStyle, borderStyle, managerName, managerRegion, date);

		// 데이터 행 생성
		String[] columns = { "관리번호", "GPS정보", "지역", "사유", "시간대", "벌금" };

		Row headerRow = sheet.createRow(2);
		for (int i = 0; i < columns.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(columns[i]);
			cell.setCellStyle(boldCenterStyle);
		}

		// 데이터 입력
		int rowIdx = 3;
		for (ConclusionData conclusion : data) {
			Row row = sheet.createRow(rowIdx++);

			row.createCell(0).setCellValue(conclusion.id);
			row.createCell(1).setCellValue(conclusion.gpsInfo);
			row.createCell(2).setCellValue(conclusion.region);
			row.createCell(3).setCellValue(conclusion.reseon);
			row.createCell(4).setCellValue(conclusion.date);
			row.createCell(5).setCellValue(conclusion.fine);

			for (int i = 0; i < 6; i++) {
				Cell cell = row.getCell(i);
				if (cell == null)
					cell = row.createCell(i); // 반드시 셀을 생성
				cell.setCellStyle(borderStyle);
			}

		}

// 컬럼 너비 조정
		for (int i = 0; i < columns.length; i++) {
			sheet.autoSizeColumn(i);

			if (sheet.getColumnWidth(i) < 3200) {
		        sheet.setColumnWidth(i, 3200);
		    }
			
			switch (i) {
			case 0:
				sheet.setColumnWidth(i, 10000);
				break; // 관리번호
			case 1:
				sheet.setColumnWidth(i, 10000);
				break; // GPS정보
			case 2:
				sheet.setColumnWidth(i, 10000);
				break; // 지역
			}
		}

		String dateOrigin = date; // 예: "2025. 05. 29."
		Date parsedDate = new SimpleDateFormat("yyyy. MM. dd.").parse(dateOrigin);
		String formattedDate = new SimpleDateFormat("yyyy-MM-dd").format(parsedDate);
		
		// 응답 헤더 설정
		response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		response.setHeader("Content-Disposition", "attachment; filename=" + brand + "_" + formattedDate + ".xlsx");

		workbook.write(response.getOutputStream());
		workbook.close();
	}

	// 스타일 생성 메서드들 (기존과 동일)
	private CellStyle createBigBoldCenterStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setBold(true);
		font.setFontHeightInPoints((short) 18);
		style.setFont(font);
		style.setAlignment(HorizontalAlignment.CENTER);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		setAllBorders(style);
		return style;
	}

	private CellStyle createBoldCenterStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setBold(true);
		font.setFontHeightInPoints((short) 11);
		style.setFont(font);
		style.setAlignment(HorizontalAlignment.CENTER);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		setAllBorders(style);
		return style;
	}

	private CellStyle createBorderStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		style.setAlignment(HorizontalAlignment.CENTER);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		setAllBorders(style);
		return style;
	}

	private void setAllBorders(CellStyle style) {
		style.setBorderTop(BorderStyle.THIN);
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle.THIN);
	}

	private void createHeaders(Sheet sheet, CellStyle bigBoldCenterStyle, CellStyle boldCenterStyle,
			CellStyle borderStyle, String managerName, String managerRegion, String date) throws ParseException {

		String dateOrigin = date; // 예: "2025. 05. 29."
		Date parsedDate = new SimpleDateFormat("yyyy. MM. dd.").parse(dateOrigin);
		String formattedDate = new SimpleDateFormat("yyyy-MM-dd").format(parsedDate);
		
		// "요청명단" 0~1행, 0~5열 병합
		sheet.addMergedRegion(new CellRangeAddress(0, 1, 0, 2));
		Row titleRow = sheet.createRow(0);
		Cell titleCell = titleRow.createCell(0);
		titleCell.setCellValue("요청명단");
		titleCell.setCellStyle(bigBoldCenterStyle);

		// 0행: "관리자", "소속", "승인날짜"
		Row subHeaderRow = sheet.getRow(0);
		if (subHeaderRow == null)
			subHeaderRow = sheet.createRow(1);
		Cell adminCell = subHeaderRow.createCell(3);
		adminCell.setCellValue("관리자");
		adminCell.setCellStyle(boldCenterStyle);

		Cell regionCell = subHeaderRow.createCell(4);
		regionCell.setCellValue("소속");
		regionCell.setCellStyle(boldCenterStyle);

		Cell dateCell = subHeaderRow.createCell(5);
		dateCell.setCellValue("승인날짜");
		dateCell.setCellStyle(boldCenterStyle);

		// 1행: name, region, 2025-04-05
		Row infoValueRow = sheet.createRow(1);
		infoValueRow.createCell(3).setCellValue(managerName);
		infoValueRow.createCell(4).setCellValue(managerRegion);
		infoValueRow.createCell(5).setCellValue(formattedDate);
		// 테두리 적용
		for (int i = 3; i <= 5; i++) {
			Cell cell = infoValueRow.getCell(i);
			if (cell == null)
				cell = infoValueRow.createCell(i); // 셀이 없으면 생성
			cell.setCellStyle(borderStyle);
		}
		
		
	}

	private static class ConclusionData {
		String id;
		String gpsInfo;
		String region;
		String date;
		String reseon;
		String fine;
	}
}
