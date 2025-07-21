import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
import { db, app, auth } from './firebase-init.js';

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('registerForm').addEventListener('submit', async (e) => {
		e.preventDefault();

		const email = document.getElementById('register-email').value;
		const password = document.getElementById('register-pass').value;
		const name = document.getElementById('register-name').value;
		const managerClass = document.getElementById('register-class').value;
		const region = document.getElementById('register-region').value;

		try {
			const auth = getAuth(app);
			// 1. 회원가입 (Firebase Auth)
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			// 2. Firestore에 UID를 문서 ID로 사용해 저장
			const managerRef = doc(db, "Manager", user.uid);
			await setDoc(managerRef, {
				email: email,
				name: name,
				class: managerClass,
				region: region
			});

			showNotification(`${name}님, 환영합니다!`, "success");
			setTimeout(() => {
				window.location.href = "login.jsp";
			}, 3000);

		} catch (error) {
			console.error("회원가입 오류:", error);
			if (error.code === "auth/email-already-in-use") {
				showNotification("이미 가입된 이메일입니다.", "error");
			} else if (error.code === "auth/invalid-email") {
				showNotification("유효하지 않은 이메일입니다.", "error");
			} else if (error.code === "auth/weak-password") {
				showNotification("비밀번호는 6자 이상이어야 합니다.", "error");
			} else {
				showNotification("회원가입 중 오류가 발생했습니다: " + error.message, "error");
			}
		}
	});
});

function showNotification(message, type) {
	const notification = document.getElementById('notification');
	notification.textContent = message;
	notification.className = `notification ${type}`;
	notification.style.display = 'block';
	setTimeout(() => {
		notification.style.display = 'none';
	}, 3000);
}
