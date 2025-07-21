document.addEventListener('DOMContentLoaded', function() {
	var modeSwitch = document.querySelector('.mode-switch');
	if (modeSwitch) {
		// 페이지 로드 시 로컬스토리지에서 다크모드 상태 확인
		if (localStorage.getItem('dark-mode') === 'true') {
			document.documentElement.classList.add('dark');
			modeSwitch.classList.add('active');
		}

		modeSwitch.addEventListener('click', function() {
			document.documentElement.classList.toggle('dark');
			modeSwitch.classList.toggle('active');
			if (document.documentElement.classList.contains('dark')) {
				localStorage.setItem('dark-mode', 'true');
			} else {
				localStorage.setItem('dark-mode', 'false');
			}
		});
	}

	var listView = document.querySelector('.list-view');
	var gridView = document.querySelector('.grid-view');
	var projectsList = document.querySelector('.project-boxes');
	if (listView && gridView && projectsList) {
		listView.addEventListener('click', function() {
			gridView.classList.remove('active');
			listView.classList.add('active');
			projectsList.classList.remove('jsGridView');
			projectsList.classList.add('jsListView');
		});
		gridView.addEventListener('click', function() {
			gridView.classList.add('active');
			listView.classList.remove('active');
			projectsList.classList.remove('jsListView');
			projectsList.classList.add('jsGridView');
		});
	}

	var messagesBtn = document.querySelector('.messages-btn');
	var messagesSection = document.querySelector('.messages-section');
	var messagesClose = document.querySelector('.messages-close');
	if (messagesBtn && messagesSection && messagesClose) {
		messagesBtn.addEventListener('click', function() {
			messagesSection.classList.add('show');
		});
		messagesClose.addEventListener('click', function() {
			messagesSection.classList.remove('show');
		});
	}

	// 사이드바 링크 핸들링
	const sidebarLinks = document.querySelectorAll('.app-sidebar-link');
	if (sidebarLinks.length > 0) {
		// 1. 현재 URL 기반 active 클래스 부여
		const currentUrl = new URL(window.location.href);
		const currentFilter = currentUrl.searchParams.get('filter') || 'send';

		sidebarLinks.forEach(link => {
			const linkFilter = link.getAttribute('data-filter');
			// 모든 버튼에서 active 제거
			link.classList.remove('active');
			// filter 값이 일치하는 버튼에만 active 부여
			if (linkFilter === currentFilter) {
				link.classList.add('active');
			}
		});

		// 2. 클릭 이벤트 분리
		sidebarLinks.forEach(link => {
			link.addEventListener('click', function(e) {
				const filter = this.getAttribute('data-filter');
				if (filter) {
					e.preventDefault();
					const newUrl = new URL(window.location.href);
					newUrl.searchParams.set('filter', filter);
					window.location.href = newUrl.toString();
				}
			});
		});
	}

});

// 다크모드 토글 함수
function toggleDarkMode() {
	document.documentElement.classList.toggle('dark');
	this.classList.toggle('active');
	localStorage.setItem('dark-mode', document.documentElement.classList.contains('dark'));
}

// 뷰 전환 함수
function toggleView(activeBtn, inactiveBtn, viewClass) {
	activeBtn.classList.add('active');
	inactiveBtn.classList.remove('active');
	document.querySelector('.project-boxes').className = `project-boxes ${viewClass}`;
}