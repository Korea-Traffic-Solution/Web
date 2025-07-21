USE KTSDB;

CREATE TABLE IF NOT EXISTS Manager (
    manager_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    pw VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL,
    class VARCHAR(50) NOT NULL,
    PRIMARY KEY (manager_id)
) DEFAULT CHARSET=utf8;

INSERT INTO Manager(manager_id, name, pw, region, class) VALUES
('admin1', '김철수', '1234', '수원', '순경'),
('admin2', '이영희', '1234', '수원', '경장'),
('admin3', '박민준', '1234', '화성', '순경');


DESC Manager;
SELECT * FROM Manager;
drop table Manager;