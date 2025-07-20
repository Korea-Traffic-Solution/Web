USE KTSDB;

CREATE TABLE IF NOT EXISTS User (
	user_id VARCHAR(20) NOT NULL UNIQUE,
	name VARCHAR(50) NOT NULL,
	pw VARCHAR(50) NOT NULL,
	phone VARCHAR(20) NOT NULL,
	email VARCHAR(20) NOT NULL,
	PRIMARY KEY (user_id)
) DEFAULT CHARSET=utf8;

INSERT INTO User (user_id, name, pw, phone, email) VALUES
('hong123', '홍길동', '1234', '010-1234-5678', 'hong@example.com'),
('kim123', '김영희', '1234', '010-2345-6789', 'kim@example.com'),
('park123', '박철수', '1234', '010-3456-7890', 'park@example.com');


DESC User;
SELECT * FROM User;
drop table User;