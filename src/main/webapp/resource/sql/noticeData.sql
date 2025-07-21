USE KTSDB;

CREATE TABLE IF NOT EXISTS Notice(
	notice_id INT AUTO_INCREMENT NOT NULL,
	date VARCHAR(50) NOT NULL,
	title VARCHAR(50) NOT NULL,
	content VARCHAR(225) NOT NULL,
	PRIMARY KEY(notice_id)
)DEFAULT CHARSET=utf8;

INSERT INTO Notice (date,title, content) VALUES
('2025-03-10', 'PM 규제 관련 범칙금 부과 변경 사항 안내', '2025년부터 PM 규제 관련 범칙금이 강화되며, 특히 고농도 미세먼지가 발생한 지역에 대해 더 높은 부과율이 적용됩니다. 자세한 사항은 환경부 홈페이지를 참고해 주세요.'),
('2025-03-11', '전동 킥보드 안전 규제 강화 안내', '2025년부터 전동 킥보드 이용 시 헬멧 착용 의무화 및 주정차 금지 구역에서의 무정차 벌금이 강화됩니다. 이용자들은 규정을 준수해 안전한 이용을 부탁드립니다.'),
('2025-03-12', '전동 킥보드 속도 제한 및 구역 설정 안내', '2025 년부터 전동 킥보드의 최고 속도가 25km/h로 제한되며, 특정 규역에서는 전동 킥보드 운행이 금지됩니다. 관련 법규틀 위반할 경우 벌금이 부과되니 이용 시 주의해 주세요.');

drop table notice;
select * from notice;
SELECT * FROM notice ORDER BY notice_id DESC;