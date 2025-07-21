<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>우측 공지 페이지</title>
<!-- link rel="stylesheet" href="resource/css/main.css" -->
<script type="module" src="./resource/js/firebase/notices.js"></script>
</head>
<body>
	<%--@include file="dbconn.jsp"--%>
	<div class="messages-section">
		<button class="messages-close">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
				viewBox="0 0 24 24" fill="none" stroke="currentColor"
				stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
				class="feather feather-x-circle">
        		<circle cx="12" cy="12" r="10" />
        		<line x1="15" y1="9" x2="9" y2="15" />
        		<line x1="9" y1="9" x2="15" y2="15" />
        	</svg>
		</button>
		<div class="projects-section-header">
			<p>공지사항</p>
		</div>
		<div class="messages"></div>
	</div>
</body>
</html>