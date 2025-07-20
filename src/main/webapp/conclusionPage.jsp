
<%@page import="java.time.Period"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ page
	import="java.util.Date, java.text.SimpleDateFormat, java.util.Locale, java.time.LocalDate, java.time.format.DateTimeFormatter"%>
<%@ page import="java.sql.*"%>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script type="module" src="./resource/js/firebase/conclusion.js"></script>
<title></title>
<script>
	//화면 깜빡임 방지
	(function() {
		try {
			var isDark = localStorage.getItem('dark-mode') === 'true';
			if (isDark) {
				document.documentElement.classList.add('dark');
			}
		} catch (e) {
		}
	})();
</script>
<link rel="stylesheet" href="resource/css/conclusion.css">
</head>
<%
if (session.getAttribute("managerUid") == null) {
	response.sendRedirect("login.jsp");
	return;
}
%>
<body>
	<div class="app-container">
		<%@include file="header.jsp"%>
		<%--상단 헤더 부분--%>
		<div class="app-content">
			<div class="app-sidebar">
				<%--왼쪽 사이드바 부분 아이콘/홈페이지, 진행중, 완료, 전체, 브랜드별--%>
				<a href="mainPage.jsp" class="app-sidebar-link"> <svg
						xmlns="http://www.w3.org/2000/svg" width="24" height="24"
						viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="feather feather-home"> <path
							d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> <polyline
							points="9 22 9 12 15 12 15 22" /></svg>
				</a> <a href="mainPage.jsp?filter=unconfirmed" class="app-sidebar-link">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
						viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="feather feather-square">
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
				</a> <a href="mainPage.jsp?filter=confirmed" class="app-sidebar-link">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
						viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="feather feather-check-square">
						<polyline points="9 11 12 14 22 4"></polyline>
						<path
							d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
				</a> <a href="mainPage.jsp?filter=folder" class="app-sidebar-link">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
						viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="feather feather-folder">
						<path
							d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
				</a> <a href="brandData.jsp" class="app-sidebar-link"> <svg
						xmlns="http://www.w3.org/2000/svg" width="24" height="24"
						viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="feather feather-send">
						<line x1="22" y1="2" x2="11" y2="13"></line>
						<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
				</a> <a href="brandData.jsp?filter=list" class="app-sidebar-link"> <svg
						xmlns="http://www.w3.org/2000/svg" width="24" height="24"
						viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="feather feather-archive">
						<polyline points="21 8 21 21 3 21 3 8"></polyline>
						<rect x="1" y="3" width="22" height="5"></rect>
						<line x1="10" y1="12" x2="14" y2="12"></line></svg>
				</a>
			</div>
			<div class="projects-section">
				<div class="projects-section-header">
					<p>세부정보</p>
					<%
					// 현재 날짜 가져오기
					LocalDate today = LocalDate.now();
					DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy. MM. dd"); // "2025 .05 .07" 형식
					String todayDate = today.format(formatter);
					%>
					<p class="time"><%=todayDate%></p>
				</div>
				
				<div class="project-boxes jsGridView" id="conclusion-detail-list"></div>
				
			</div>
			<%@include file="notice.jsp"%>			
		</div>
	</div>
	<script src="resource/js/main.js"></script>
</body>
</html>
