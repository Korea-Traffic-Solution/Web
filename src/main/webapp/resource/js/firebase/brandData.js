import { Timestamp, collection, query, where, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { db } from './firebase-init.js';

// 현재 날짜 및 이번 달 범위 계산
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0-based (0=1월, 4=5월)

// 이번 달 시작일과 다음 달 시작일 (Firestore Timestamp)
const startOfMonth = Timestamp.fromDate(new Date(currentYear, currentMonth, 1));
const startOfNextMonth = Timestamp.fromDate(new Date(currentYear, currentMonth + 1, 1));

// 관할 지역 정보 가져오기
async function getManagerJurisdiction() {
	try {
		// 1. 세션에서 관리자 UID 가져오기
		const managerUid = sessionStorage.getItem('managerUid');
		if (!managerUid) {
			throw new Error('로그인 정보가 없습니다.');
		}

		// 2. Manager 컬렉션에서 관리자 정보 가져오기
		const managerRef = doc(db, 'Manager', managerUid);
		const managerSnap = await getDoc(managerRef);

		if (!managerSnap.exists()) {
			throw new Error('관리자 정보를 찾을 수 없습니다.');
		}

		const managerData = managerSnap.data();
		const managerRegion = managerData.region;

		// 3. Police_station 컬렉션에서 해당 region과 일치하는 문서 찾기
		const policeStationQuery = query(
			collection(db, 'Police_station'),
			where('__name__', '==', managerRegion)
		);
		const policeStationSnap = await getDocs(policeStationQuery);

		if (policeStationSnap.empty) {
			// 문서 ID로 직접 접근 시도
			const policeStationRef = doc(db, 'Police_station', managerRegion);
			const policeStationDoc = await getDoc(policeStationRef);

			if (!policeStationDoc.exists()) {
				throw new Error('관할 경찰서 정보를 찾을 수 없습니다.');
			}

			const jurisdiction = policeStationDoc.data().jurisdiction || [];
			return jurisdiction;
		}

		// 4. jurisdiction 배열 가져오기
		const policeStationData = policeStationSnap.docs[0].data();
		const jurisdiction = policeStationData.jurisdiction || [];

		return jurisdiction;

	} catch (error) {
		console.error('관할 지역 정보 가져오기 오류:', error);
		showError('관할 지역 정보를 불러오는 중 오류가 발생했습니다.');
		return [];
	}
}

// 지역 매칭 함수 (region 필드에 jurisdiction 배열의 값이 포함되는지 확인)
function isRegionInJurisdiction(region, jurisdiction) {
	if (!region || !jurisdiction || jurisdiction.length === 0) {
		return false;
	}

	// jurisdiction 배열의 각 항목이 region에 포함되는지 확인
	return jurisdiction.some(area => region.includes(area));
}

// 이번 달 기준 상태별 카운트 집계
async function updateMonthlyStats() {
	try {
		// 관할 지역 정보 가져오기
		const jurisdiction = await getManagerJurisdiction();
		if (jurisdiction.length === 0) {
			console.warn('관할 지역이 없습니다.');
			return;
		}

		console.log('관할 지역:', jurisdiction); // 디버깅용

		const excludeValues = ["사람 감지 실패", "킥보드 감지 실패", "보행자로 판단됨"];

		// 1. 진행 중 (미확인): result가 null이면서 이번 달
		const qAll = query(
			collection(db, "Conclusion"),
			where("date", ">=", startOfMonth),
			where("date", "<", startOfNextMonth)
		);
		const snapAll = await getDocs(qAll);

		let unconfirmedCount = 0;
		let approvedCount = 0;
		let rejectedCount = 0;
		let totalCount = 0;

		snapAll.forEach(doc => {
			const data = doc.data();
			const region = data.region || '';
			const aiConclusion = Array.isArray(data.aiConclusion) ? data.aiConclusion : [data.aiConclusion];
			
			// 제외 값이 포함되어 있으면 건너뜀
			if (excludeValues.some(v => aiConclusion.includes(v))) {
				return;
			}

			// 관할 지역에 해당하는지 확인
			if (isRegionInJurisdiction(region, jurisdiction)) {
				totalCount++;

				if (data.result === '미확인') {
					unconfirmedCount++;
				} else if (data.result === '승인') {
					approvedCount++;
				} else if (data.result === '반려') {
					rejectedCount++;
				}
			}
		});

		// 결과 표시
		document.getElementById('count-unconfirmed').textContent = unconfirmedCount;
		document.getElementById('count-completed').textContent = approvedCount + rejectedCount;
		document.getElementById('count-total').textContent = totalCount;

	} catch (error) {
		console.error("월별 통계 집계 오류:", error);
		showError("통계를 불러오는 중 오류가 발생했습니다.");
	}
}

// 오늘 날짜 포맷
function getTodayString() {
	const today = new Date();
	return today.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// 색상 배열 (기존과 동일)
const colorPalette = [
	{ bg: "#fee4cb", bar: "#ff942e" },
	{ bg: "#e9e7fd", bar: "#4f3ff0" },
	{ bg: "#dbf6fd", bar: "#096c86" },
	{ bg: "#ffd3e2", bar: "#df3670" },
	{ bg: "#c8f7dc", bar: "#34c471" },
	{ bg: "#d5deff", bar: "#4067f9" }
];

// Firestore에서 승인된 conclusion 데이터 가져오기
async function fetchApprovedConclusions() {
	try {
		const managerId = sessionStorage.getItem('managerUid'); // 현재 세션 관리자 UID
		const filter = new URLSearchParams(window.location.search).get('filter');
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);

		let q;
		if (filter === "send" || filter === null) {
			// 오늘 날짜만 필터링
			q = query(
				collection(db, "Conclusion"),
				where('result', '==', '승인'),
				where('managerId', '==', managerId),
				where('processingDate', '>=', today),
				where('processingDate', '<', tomorrow)
			);
		} else if (filter === "list") {
			// 전체 승인된 데이터
			q = query(
				collection(db, 'Conclusion'),
				where('result', '==', '승인'),
				where('managerId', '==', managerId)
			);
		}

		const querySnapshot = await getDocs(q);
		const conclusions = [];
		querySnapshot.forEach((doc) => {
			conclusions.push({ id: doc.id, ...doc.data() });
		});

		return conclusions;
	} catch (error) {
		console.error('데이터 가져오기 실패:', error);
		return [];
	}
}

// 다음 날 계산 (날짜 범위 쿼리용)
function getNextDay(dateStr) {
	const date = new Date(dateStr);
	date.setDate(date.getDate() + 1);
	return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// 데이터를 날짜+브랜드별로 그룹화
function groupByDateAndBrand(conclusions) {
	const groups = {};

	conclusions.forEach(conclusion => {
		// Timestamp → Date → 문자열 변환
		let dateStr;
		if (conclusion.processingDate?.toDate) {
			const dateObj = conclusion.processingDate.toDate();
			dateStr = dateObj.toLocaleDateString('ko-KR', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			});
		} else {
			// 이미 문자열인 경우 (예: "2025. 05. 28")
			dateStr = conclusion.processingDate?.split(' ')[0] || '';
		}

		const brand = conclusion.detectedBrand || '알 수 없음';
		const key = `${dateStr}_${brand}`;

		if (!groups[key]) {
			groups[key] = { date: dateStr, brand: brand, count: 0, conclusions: [] };
		}
		groups[key].count++;
		groups[key].conclusions.push(conclusion);
	});

	return Object.values(groups);
}

// HTML 렌더링
function renderBrandData(groupedData, totalCount) {
	const container = document.getElementById('brand-data-list');

	if (groupedData.length === 0) {
		container.innerHTML = '<div class="no-data">승인된 데이터가 없습니다.</div>';
		return;
	}

	let html = '';
	groupedData.forEach((group, index) => {
		const color = colorPalette[index % 6];
		const percentage = Math.round((group.count / totalCount) * 100);
		const encodedBg = encodeURIComponent(color.bg);
		const encodedBar = encodeURIComponent(color.bar);

		html += `
        <div class="project-box-wrapper">
            <div class="project-box" style="background-color: ${color.bg};">
                <div class="project-box-header">
                    <span>${group.date}</span>
                    <div class="more-wrapper">
                        <button class="project-btn-more">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="feather feather-check-circle">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </button>
                    </div>
                </div>
                <div class="project-box-content-header">
                    <p class="box-content-header">${group.brand}</p>
                    <p class="box-content-subheader">${group.date}일자 접수 내역</p>
                </div>
                <div class="box-progress-wrapper">
                    <p class="box-progress-header">신고 점유율</p>
                    <div class="box-progress-bar">
                        <span class="box-progress" style="width: ${percentage}%; background-color: ${color.bar}"></span>
                    </div>
                    <p class="box-progress-percentage">${percentage}%</p>
                </div>
                <div class="project-box-footer">
                    <div class="days-left" style="color: ${color.bar}; cursor: pointer;" 
                         onclick="downloadExcel('${group.brand}', '${group.date}');">다운로드</div>
                </div>
            </div>
        </div>`;
	});

	container.innerHTML = html;
}

// 엑셀 다운로드 (새로운 Firestore 기반)
window.downloadExcel = async function(brand, date) {
	const managerId = sessionStorage.getItem('managerUid');
	const managerName = sessionStorage.getItem('managerName') || '';
	const managerRegion = sessionStorage.getItem('managerRegion') || '';

	// 서블릿으로 바로 이동
	const url = `excelDownload?managerId=${encodeURIComponent(managerId)}&brand=${encodeURIComponent(brand)}&date=${encodeURIComponent(date)}&manager=${encodeURIComponent(managerName)}&managerRegion=${encodeURIComponent(managerRegion)}`;

	window.location.href = url;
};

// 메인 렌더링 함수
async function loadAndRenderBrandData() {
	try {
		const todayElement = document.getElementById('todayDate');
		const containerElement = document.getElementById('brand-data-list');

		// todayDate 요소가 존재하는지 확인
		if (todayElement) {
			todayElement.textContent = getTodayString();
		} else {
			console.warn('todayDate 요소를 찾을 수 없습니다.');
		}

		// brand-data-list 요소가 존재하는지 확인
		if (!containerElement) {
			console.error('brand-data-list 요소를 찾을 수 없습니다.');
			return;
		}

		// Firestore에서 데이터 가져오기
		const conclusions = await fetchApprovedConclusions();

		// 날짜+브랜드별 그룹화
		const groupedData = groupByDateAndBrand(conclusions);

		// 전체 카운트
		const totalCount = conclusions.length;

		// HTML 렌더링
		renderBrandData(groupedData, totalCount);

	} catch (error) {
		console.error('데이터 로딩 실패:', error);
		document.getElementById('brand-data-list').innerHTML = '<div class="error">데이터 로딩에 실패했습니다.</div>';
	}
}


// 실행
updateMonthlyStats();
// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', loadAndRenderBrandData);