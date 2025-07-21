import { collection, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
import { db } from './firebase-init.js';

// 날짜 포맷 함수 (예시: 2025. 05. 25)
function formatDate(dateStringOrTimestamp) {
    let dateObj;
    if (typeof dateStringOrTimestamp === 'string') {
        // Firestore Timestamp가 아니라면 문자열로 처리
        dateObj = new Date(dateStringOrTimestamp);
    } else if (dateStringOrTimestamp && dateStringOrTimestamp.toDate) {
        // Firestore Timestamp 객체라면 toDate() 사용
        dateObj = dateStringOrTimestamp.toDate();
    } else {
        return '';
    }
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}. ${mm}. ${dd}`;
}

// 공지사항 실시간 구독 및 렌더링
function subscribeNotices() {
    const noticeList = document.querySelector('.messages');
    if (!noticeList) return;

    const q = query(
        collection(db, 'Notices'),
        orderBy('create_date', 'desc')
    );

    onSnapshot(q, (snapshot) => {
        noticeList.innerHTML = ''; // 기존 목록 초기화

        snapshot.forEach((doc) => {
            const data = doc.data();
            const title = data.title || '';
            const content = data.content || '';
            const createDate = data.create_date || '';
            const noDate = formatDate(createDate);

            const noticeHTML = `
                <div class="message-box">
                    <div class="message-content">
                        <div class="message-header">
                            <div class="title">${title}</div>
                            <div class="star-checkbox">
                                <input type="checkbox" id="star-${doc.id}">
                                <label for="star-${doc.id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                        class="feather feather-star">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </label>
                            </div>
                        </div>
                        <p class="message-line">${content}</p>
                        <p class="message-line time">${noDate}</p>
                    </div>
                </div>
            `;
            noticeList.innerHTML += noticeHTML;
        });

        if (snapshot.empty) {
            noticeList.innerHTML = `<div class="message-box"><div class="message-content">공지사항이 없습니다.</div></div>`;
        }
    }, (error) => {
        showError("공지사항을 불러오는 중 오류가 발생했습니다: " + error.message);
    });
}

// 에러 메시지 표시 함수
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// DOMContentLoaded 시 구독 시작
document.addEventListener('DOMContentLoaded', () => {
    subscribeNotices();
});
