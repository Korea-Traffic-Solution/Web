import { Timestamp, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { db } from './firebase-init.js';

// 파라미터 추출
function getUrlParameter(name) {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get(name);
}

// 3. 날짜 차이(일수) 계산
function getDaysBetween(fromDateStr) {
	if (!fromDateStr) return '';
	let fromDate;
	if (typeof fromDateStr === 'string') {
		// '2025년 5월 23일 ...' 형태 처리
		const match = fromDateStr.match(/(\d{4})년 (\d{1,2})월 (\d{1,2})일/);
		if (match) {
			fromDate = new Date(`${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`);
		} else {
			fromDate = new Date(fromDateStr);
		}
	} else if (fromDateStr.toDate) {
		fromDate = fromDateStr.toDate();
	} else {
		fromDate = new Date(fromDateStr);
	}
	const today = new Date();
	const diffTime = today - fromDate;
	return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// 4. 상태 아이콘 SVG
function getStatusIcon(result) {
	if (result === "승인") {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" class="feather feather-check-circle">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
	} else if (result === "반려") {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" class="feather feather-x-circle">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
	} else {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" class="feather feather-circle">
            <circle cx="12" cy="12" r="10"></circle></svg>`;
	}
}

// 5. 상세 데이터 렌더링
async function renderConclusionDetail() {
	const params = new URLSearchParams(window.location.search);
	const reportId = getUrlParameter('id');
	const background = params.get('backcolar');
	const bar = params.get('barcolar');

	if (!reportId) {
		document.getElementById('conclusion-detail-list').innerHTML = `<div class="error">ID 파라미터가 없습니다.</div>`;
		return;
	}

	try {
		const docRef = doc(db, "Conclusion", reportId);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) {
			document.getElementById('conclusion-detail-list').innerHTML = `<div class="error">데이터가 없습니다.</div>`;
			return;
		}
		const data = docSnap.data();

		// 날짜/지역 포맷
		let dateStr = '';
		if (data.date && data.date.toDate) {
			const dateObj = data.date.toDate();
			dateStr = dateObj.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
		} else if (typeof data.date === 'string') {
			dateStr = data.date.split(' ')[0];
		}
		const region = data.region || '';

		// days ago
		const daysAgo = getDaysBetween(data.date);

		// 상태 아이콘
		const statusIcon = getStatusIcon(data.result);

		// 신뢰도
		const confidence = (data.confidence === 0 ? 1 : (data.confidence || 0)) * 100;
		const accuracyPercent = Math.round(confidence);

		// 이미지
		const fileId = reportId.replace(/^conclusion_/, '');
		const fileName = `${fileId}.jpg`;
		const bucket = "koreatrafficsolution.firebasestorage.app";
		const path = `Conclusion/${fileName}`;
		const encodedPath = encodeURIComponent(path);
		const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;

		// HTML 생성
		document.getElementById('conclusion-detail-list').innerHTML = `
<div class="project-box-wrapper">
    <div class="project-box" style="background-color: ${background};">
        <div class="project-box-header">
            <span>${dateStr}</span>
            <div class="more-wrapper">
                <button class="project-btn-more">${statusIcon}</button>
            </div>
        </div>
        <div class="project-box-content-header">
            <div class="box-content-left">
                <img src="${imageUrl}" alt="Project Icon" class="project-icon">
            </div>
            <div class="box-content-text">
                <section class="conclusion">
                    <h2>${dateStr}<br>${region}</h2>
					<p><strong>분석 결과 :&nbsp;</strong>${data.aiConclusion || ''}</p>
                    <p><strong>킥보드사 &nbsp;:&nbsp;</strong>${data.detectedBrand || ''}</p>
                    <p><strong>신고 내용 :&nbsp;</strong>${data.violation || ''}</p>
                    <br>
                    <form id="updateForm">
                        <input type="hidden" name="backcolar" value="${background}">
                        <input type="hidden" name="barcolar" value="${bar}">
                        <input type="hidden" name="reportId" value="${reportId}">
                        <input type="hidden" name="date" value="${dateStr}">
                        <input type="hidden" name="managerId" value="${sessionStorage.getItem('managerUid') || ''}">
                        <div class="form-group">
                            <label for="result">처리 상태 :</label>
                            <select id="result" name="result">
                                <option value="미확인" ${data.result === '미확인' ? 'selected' : ''}>미확인</option>
                                <option value="승인" ${data.result === '승인' ? 'selected' : ''}>승인</option>
                                <option value="반려" ${data.result === '반려' ? 'selected' : ''}>반려</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="fine">벌금 :</label>
                            <input type="text" name="fine" id="fine" value="${data.fine || ''}">
                        </div>
                        <div class="form-group">
                            <label for="reseon">사유 :</label>
                            <textarea name="reseon" id="reseon" rows="5">${data.reseon || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <input type="submit" value="제출">
                        </div>
                    </form>
                </section>
            </div>
        </div>
        <div class="box-progress-wrapper">
            <p class="box-progress-header">AI 신뢰도</p>
            <div class="box-progress-bar">
                <span class="box-progress" style="width: ${accuracyPercent}%; background-color: ${bar}"></span>
            </div>
            <p class="box-progress-percentage">${accuracyPercent}%</p>
        </div>
        <div class="project-box-footer">
            <div class="days-left" style="color: ${bar};">${daysAgo}일전</div>
        </div>
    </div>
</div>
        `;

		// 폼 이벤트 등록
		document.getElementById('updateForm').addEventListener('submit', async function(e) {
			e.preventDefault();

			const formData = new FormData(this);
			const updateData = {
				result: formData.get('result'),
				fine: formData.get('fine'),
				reseon: formData.get('reseon'),
				managerId: formData.get('managerId'),
				processingDate: Timestamp.now()
			};
			try {
				await updateDoc(docRef, updateData);
				alert('업데이트 완료');
				location.reload();
			} catch (err) {
				alert('업데이트 실패: ' + err.message);
			}
		});

	} catch (err) {
		document.getElementById('conclusion-detail-list').innerHTML = `<div class="error">오류: ${err.message}</div>`;
	}
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', renderConclusionDetail);
