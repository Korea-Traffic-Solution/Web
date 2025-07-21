import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
import { db, app, auth } from './firebase-init.js';

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('loginForm').addEventListener('submit', async (e) => {
		e.preventDefault();

		const auth = getAuth(app);
		const email = document.getElementById('login-email').value;
		const password = document.getElementById('login-pass').value;

		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			const managerRef = doc(db, 'Manager', user.uid);
			const managerSnap = await getDoc(managerRef);

			if (managerSnap.exists()) {
				const manager = managerSnap.data();
				sessionStorage.setItem('managerUid', user.uid);
				sessionStorage.setItem('managerEmail', email);
				sessionStorage.setItem('managerName', manager.name);
				sessionStorage.setItem('managerRegion', manager.region);

				fetch('loginSuccess.jsp', {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: `managerUid=${encodeURIComponent(user.uid)}&managerEmail=${encodeURIComponent(email)}&managerName=${encodeURIComponent(manager.name)}&managerRegion=${encodeURIComponent(manager.region)}`
				})
					.then(response => {
						if (!response.ok) {
							throw new Error(`HTTP error! Status: ${response.status}`);
						}
						return response.text();
					})
					.then(data => {
						if (data.trim() === "OK") {
							window.location.href = "mainPage.jsp";
						} else {
							showError("세션 저장 실패");
						}
					})
					.catch(error => {
						showError("서버 오류: " + error.message);
					});
			} else {
				showError("관리자 정보가 존재하지 않습니다.");
			}
		} catch (error) {
			console.error("로그인 오류:", error);
			showError("이메일 또는 비밀번호가 잘못되었습니다.");
		}
	});
});

function showError(message) {
	const errorDiv = document.getElementById('error-message');
	errorDiv.textContent = message;
	errorDiv.style.display = 'block';
}