<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<%@ page import="java.sql.*"%>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css" rel="stylesheet">
<link rel="stylesheet" href="resource/css/register.css">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="resource/js/register.js"></script>
<script type="module" src="./resource/js/firebase/register.js"></script>
<title>Register Page</title>
</head>
<body>
	<!-- 알림창 -->
	<div class="notification" id="notification"></div>

	<div class="register">
		<img src="resource/images/background.png" alt="register image" class="register__img">
		<form class="container" id="registerForm">
			<h1 class="register__title">회원가입</h1>

			<div class="register__content">
				<div class="register__box">
					<i class="ri-id-card-line register__icon"></i>
					<div class="register__box-input">
						<input type="email" required class="register__input" id="register-email" name="register-email" placeholder=" " autocomplete="off" > 
						<label for="register-email" class="register__label">이메일</label>
					</div>
				</div>

				<div class="register__box">
					<i class="ri-lock-2-line register__icon"></i>
					<div class="register__box-input">
						<input type="password" required class="register__input" 
						id="register-pass" name="register-pass" placeholder=" "
							pattern=".{8,}" title="비밀번호는 8자 이상으로 작성해주세요."> 
							<label for="register-pass" class="register__label">비밀번호</label> 
							<i class="ri-eye-off-line register__eye" id="register-eye" onclick="togglePasswordVisibility()"></i>
					</div>
				</div>

				<div class="register__box">
					<i class="ri-user-line register__icon"></i>
					<div class="register__box-input">
						<input type="text" required class="register__input" id="register-name" name="register-name" placeholder=" " autocomplete="off" >
						<label for="register-name" class="register__label">이름</label>
					</div>
				</div>

				<div class="register__box">
					<i class="ri-police-badge-line"></i>
					<div class="register__box-input">
						<input type="text" required class="register__input" id="register-class" name="register-class" placeholder=" " autocomplete="off" >
						<label for="register-class" class="register__label">직급</label>
					</div>
				</div>

				<div class="register__box">
					<i class="ri-building-4-line"></i>
					<div class="register__box-input">
						<input type="text" required class="register__input" id="register-region" name="register-region" placeholder=" " autocomplete="off" >
						<label for="register-region" class="register__label">소속</label>
					</div>
				</div>

			</div>

			<button type="submit" class="register__button">회원가입 하기</button>

			<p class="register__login">
				이미 계정이 있으신가요? <a href="login.jsp">로그인</a>
			</p>
		</form>
	</div>
</body>
</html>
