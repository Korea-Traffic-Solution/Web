<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>전동킥보드 법률 챗봇</title>
    <style>
        body {
            background: #f5f6fa;
            font-family: 'Malgun Gothic', Arial, sans-serif;
        }
        .container {
            max-width: 480px;
            margin: 40px auto;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            padding: 24px 16px 48px 16px;
        }
        h2 {
            text-align: center;
            color: #222;
            margin-bottom: 24px;
        }
        .chat-area {
            height: 700px;           /* 고정 높이 */
            overflow-y: auto;        /* 넘치면 스크롤 */
            margin-bottom: 24px;
            background: #f5f6fa;
            border-radius: 10px;
            padding: 8px;
        }
        .bubble {
            display: inline-block;
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 16px;
            margin: 8px 0;
            font-size: 16px;
            white-space: pre-wrap;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .user {
            background: #ffe400;
            color: #222;
            float: right;
            clear: both;
            border-bottom-right-radius: 4px;
        }
        .bot {
            background: #e6e9ef;
            color: #333;
            float: left;
            clear: both;
            border-bottom-left-radius: 4px;
        }
        .chat-form {
            display: flex;
            gap: 8px;
            margin-top: 16px;
        }
        input[type="text"] {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
        }
        button {
            background: #ffe400;
            border: none;
            border-radius: 8px;
            padding: 0 20px;
            font-size: 16px;
            font-weight: bold;
            color: #222;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover {
            background: #ffea70;
        }
        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }
    </style>
</head>
<body>
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
		<div class="chat-area clearfix" id="chat-area">
            <!-- 말풍선 대화가 여기에 추가됨 -->
        </div>
        <form id="chat-form" class="chat-form" autocomplete="off" onsubmit="return sendMessage();">
            <input type="text" id="violation" placeholder="위반사항을 입력하세요 (예: 2인탑승)" required autofocus>
            <button type="submit">질문</button>
        </form>
	</div>
    
    <script>
        function addBubble(text, who) {
            const area = document.getElementById('chat-area');
            const div = document.createElement('div');
            div.className = 'bubble ' + who;
            div.textContent = text;
            area.appendChild(div);
            area.scrollTop = area.scrollHeight; // 항상 아래로 스크롤
        }

        function sendMessage() {
            const input = document.getElementById('violation');
            const question = input.value.trim();
            if (!question) return false;

            addBubble(question, 'user');
            input.value = '';
            fetch(`http://172.30.1.91:8000/ask`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({violation: question})
            })
            .then(response => response.json())
            .then(data => {
                addBubble(data.result, 'bot');
            })
            .catch(err => {
                addBubble('⚠️ 서버 오류가 발생했습니다.', 'bot');
            });
            return false; // 폼 submit 막기
        }
    </script>
</body>
</html>
