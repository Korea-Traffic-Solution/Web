import { collection, query, where, getDocs, onSnapshot, orderBy, Timestamp, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
import { db } from './firebase-init.js';

// 현재 날짜 및 이번 달 범위 계산
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0-based (0=1월, 4=5월)

// 이번 달 시작일과 다음 달 시작일 (Firestore Timestamp)
const startOfMonth = Timestamp.fromDate(new Date(currentYear, currentMonth, 1));
const startOfNextMonth = Timestamp.fromDate(new Date(currentYear, currentMonth + 1, 1));

// 오늘 날짜 표시
document.getElementById('today-date').textContent = now.toLocaleDateString('ko-KR', {
	year: 'numeric', month: '2-digit', day: '2-digit'
});
document.getElementById('current-month').textContent = currentMonth + 1; // 1-based로 표시

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
	const utcFrom = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
	const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
	return Math.floor((utcToday - utcFrom) / (1000 * 60 * 60 * 24));
}

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

// 이번 달 신고 목록 실시간 표시
async function subscribeMonthlyReports() {
	try {
		// 관할 지역 정보 가져오기
		const jurisdiction = await getManagerJurisdiction();
		if (jurisdiction.length === 0) {
			console.warn('관할 지역이 없습니다.');
			return;
		}

		const urlParams = new URLSearchParams(window.location.search);
		const filter = urlParams.get('filter') || 'all';

		let qAll;
		if (filter === 'folder') {
			// 전체 기간
			qAll = query(collection(db, "Conclusion"), orderBy("date", "desc"));
		} else {
			// 이번 달만
			qAll = query(
				collection(db, "Conclusion"),
				where("date", ">=", startOfMonth),
				where("date", "<", startOfNextMonth),
				orderBy("date", "desc")
			);
		}

		const excludeValues = ["사람 감지 실패", "킥보드 감지 실패", "보행자로 판단됨"];

		onSnapshot(qAll, (snapshot) => {
			const listDiv = document.getElementById('conclusion-list');
			listDiv.innerHTML = '';
			let colorIndex = 0;
			const colors = [
				{ bg: "#fee4cb", bar: "#ff942e" },
				{ bg: "#e9e7fd", bar: "#4f3ff0" },
				{ bg: "#dbf6fd", bar: "#096c86" },
				{ bg: "#ffd3e2", bar: "#df3670" },
				{ bg: "#c8f7dc", bar: "#34c471" },
				{ bg: "#d5deff", bar: "#4067f9" }
			];

			let hasMatchingData = false;

			snapshot.forEach(async doc => {
				const data = doc.data();
				const aiConclusion = Array.isArray(data.aiConclusion) ? data.aiConclusion : [data.aiConclusion];
				const region = data.region || '';

				// 관할 지역에 해당하는지 확인
				if (!isRegionInJurisdiction(region, jurisdiction)) {
					return; // 관할 지역이 아니면 건너뛰기
				}

				// 배열에 하나라도 걸리면 제외
				if (excludeValues.some(value => aiConclusion.includes(value))) {
					return;
				}

				// 필터별 조건
				if (filter === 'unconfirmed' && data.result !== '미확인') return;
				if (filter === 'confirmed' && !(data.result === '승인' || data.result === '반려')) return;

				hasMatchingData = true;
				const color = colors[colorIndex % 6];
				colorIndex++;

				let statusIcon = '';
				if (data.result === "승인") {
					statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
				} else if (data.result === "반려") {
					statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-circle"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
				} else {
					statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>`;
				}

				const dateStr = data.date ? data.date.toDate().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
				const daysAgo = getDaysBetween(data.date);
				const confidence = (data.confidence === 0 ? 1 : (data.confidence || 0)) * 100;
				const regionShort = region.length > 25 ? region.slice(0, 25) + '…' : region;

				listDiv.innerHTML += `
	                    <div class="project-box-wrapper" onclick="window.location='conclusionPage.jsp?id=${doc.id}&backcolar=${encodeURIComponent(color.bg)}&barcolar=${encodeURIComponent(color.bar)}';" style="cursor: pointer;">
	                        <div class="project-box" style="background-color: ${color.bg};">
	                            <div class="project-box-header">
	                                <span>${dateStr}</span>
	                                <div class="more-wrapper">${statusIcon}</div>
	                            </div>
	                            <div class="project-box-content-header">
	                                <p class="box-content-header">${data.aiConclusion || ''}</p>
	                                <p class="box-content-subheader">${regionShort}</p>
	                            </div>
	                            <div class="box-progress-wrapper">
	                                <p class="box-progress-header">AI 신뢰도</p>
	                                <div class="box-progress-bar">
	                                    <span class="box-progress" style="width: ${confidence}%; background-color: ${color.bar}"></span>
	                                </div>
	                                <p class="box-progress-percentage">${Math.round(confidence)}%</p>
	                            </div>
								<div class="project-box-footer">
								    <div class="days-left" style="color: ${color.bar};">${daysAgo}일전</div>
								</div>
	                        </div>
	                    </div>
	                `;
			});

			if (!hasMatchingData) {
				listDiv.innerHTML = `<div class="project-box"><div class="project-box-content">오늘 처리해야 할 관할 지역 신고 내역이 없습니다.</div></div>`;
			}
		});

	} catch (error) {
		console.error("신고 목록 조회 오류:", error);
		showError("신고 목록을 불러오는 중 오류가 발생했습니다.");
	}
}

function showError(message) {
	console.error(message);
	// 에러 표시 로직 추가
}

// 실행
updateMonthlyStats();
subscribeMonthlyReports();
