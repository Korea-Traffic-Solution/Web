<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>상단 헤더 페이지</title>
<link rel="stylesheet" href="resource/css/header.css">
</head>
<body>
	<div class="app-header">
		<div class="app-header-left">
			<span class="app-icon"></span> <a href="mainPage.jsp"
				style="text-decoration: none;">
				<p class="app-name">TRAFFICSOLUTION</p>
			</a>
			<%-- 검색 부분 추후 업데이트
				<div class="search-wrapper">
					<input class="search-input" type="text" placeholder="Search">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
						fill="none" stroke="currentColor" stroke-linecap="round"
						stroke-linejoin="round" stroke-width="2"
						class="feather feather-search" viewBox="0 0 24 24">
        				<defs></defs>
        				<circle cx="11" cy="11" r="8"></circle>
        				<path d="M21 21l-4.35-4.35"></path>
        			</svg>
				</div> 
			--%>
		</div>
		<div class="app-header-right">
			<a href="logout.jsp?" class="logout-link">Logout</a>
			<button class="mode-switch" title="Switch Theme">
				<svg class="moon" fill="none" stroke="currentColor"
					stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					width="24" height="24" viewBox="0 0 24 24">
        			<defs></defs>
        			<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
        		</svg>
			</button>
			<%
			String managerRegion = (String) session.getAttribute("managerRegion");
			%>
			<button class="profile-btn">
			
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
					viewBox="0 0 24 24" fill="none" stroke="currentColor"
					stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
					class="feather feather-map-pin">
					<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
					<circle cx="12" cy="10" r="3"></circle></svg>
				<span>&nbsp;<%=managerRegion %></span>
			</button>
			<%
			String name = (String) session.getAttribute("managerName");
			%>
			<button class="profile-btn">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
					viewBox="0 0 24 24" fill="none" stroke="currentColor"
					stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
					class="feather feather-user">
					<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
					<circle cx="12" cy="7" r="4"></circle></svg>
				<span>&nbsp;<%=name%></span>
			</button>
		</div>
		<button class="messages-btn">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
				viewBox="0 0 24 24" fill="none" stroke="currentColor"
				stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
				class="feather feather-message-circle">
        			<path
					d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        	</svg>
		</button>
	</div>
</body>
</html>