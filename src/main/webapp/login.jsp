<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<%@ page import="java.sql.*"%>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link
	href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css"
	rel="stylesheet">
<link rel="stylesheet" href="resource/css/login.css">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="resource/js/login.js"></script>
<script type="module" src="./resource/js/firebase/login.js"></script>
<title>Login Page</title>
</head>
<body>
	<div class="login">
		<img src="resource/images/background.png" alt="login image"
			class="login__img">
		<form class="container" id="loginForm">
			<h1 class="login__title">로그인</h1>

			<div class="login__content">
				<div class="login__box">
					<i class="ri-user-3-line login__icon"></i>
					<div class="login__box-input">
						<input type="text" name="email" required class="login__input"
							id="login-email" placeholder=" " autocomplete="off" /> <label
							for="login-email" class="login__label">아이디</label>
					</div>
				</div>

				<div class="login__box">
					<i class="ri-lock-2-line login__icon"></i>
					<div class="login__box-input">
						<input type="password" name="password" required
							class="login__input" id="login-pass" placeholder=" " /> <label
							for="login-pass" class="login__label">비밀번호</label> <i
							class="ri-eye-off-line login__eye" id="login-eye"
							onclick="togglePasswordVisibility()"></i>
					</div>
				</div>
				<!-- 오류 메시지 출력 위치 -->
				<div class="error-message" id="error-message"></div>
			</div>

			<button type="submit" class="login__button">로그인</button>

			<p class="login__register">
				<a href="register.jsp">회원가입</a>
			</p>
		</form>
	</div>
</body>
</html>
