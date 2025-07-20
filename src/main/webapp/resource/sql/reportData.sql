USE KTSDB;

CREATE TABLE IF NOT EXISTS Report (
	report_id INT AUTO_INCREMENT NOT NULL,
	region VARCHAR(50) NOT NULL,
	date VARCHAR(50) NOT NULL,
	title VARCHAR(50) NOT NULL,
	content VARCHAR(100),
	picture VARCHAR(255) NOT NULL,
	user_id VARCHAR(50),
	PRIMARY KEY (report_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8;

INSERT INTO Report (region, date, title, content, picture, user_id) VALUES
('수원', '2025-05-03', '2인 주행','수원시 장안문 인근에서 2인 주행', 'pic1.jpg', 'hong123'),
('수원', '2025-05-04', '헬멧 미착용','수원역 앞 교차로에서 헬멧 미착용', 'pic2.jpg', 'kim123'),
('수원', '2025-05-05', '2인 주행','경기대 정문 앞에서 2인 주행', 'pic3.jpg', 'kim123'),
('수원', '2025-05-05', '헬멧 미착용','광교역 인근에서 헬멧 미착용', 'pic4.jpg', 'hong123'),
('화성', '2025-05-07', '헬멧 미착용','화성종합경기타운 전방에서 헬멧 미착용', 'pic5.jpg', 'park123'),
('화성', '2025-05-07', '2인 주행','매양교회 인근에서 2인 주행', 'pic6.jpg', 'park123'),
('화성', '2025-05-08', '헬멧 미착용','철쭉공원 전방 횡단보도에서 헬멧 미착용', 'pic7.jpg', 'kim123'),
('화성', '2025-05-08', '2인 주행','하얀풍차제과점 전방에서 2인 주행', 'pic8.jpg', 'hong123'),
('화성', '2025-05-08', '헬멧 미착용','동탄 롯데백화점 전방에서 헬멧 미착용', 'pic9.jpg', 'hong123');

DESC Report;
SELECT * FROM Report;
drop table Report;