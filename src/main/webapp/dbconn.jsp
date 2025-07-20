<%@ page contentType="text/html; charset=UTF-8"%>
<%@ page import="java.sql.*"%>
<%@ page import="java.util.*, java.io.*" %>
<%
Connection conn = null;
Properties props = new Properties();
InputStream in = application.getResourceAsStream("/WEB-INF/classes/db.properties");
props.load(in);
try {
	String url = props.getProperty("db.url");
	String user = props.getProperty("db.user");
	String password = props.getProperty("db.password");

	Class.forName("com.mysql.jdbc.Driver");
	conn = DriverManager.getConnection(url, user, password);
	System.out.println("데이터베이스 연결이 성공했습니다.");
} catch (SQLException ex) {
	System.out.println("데이터베이스 연결이 실패했습니다.<br>");
	System.out.println("SQLException: " + ex.getMessage());
} 
%>
<html>
<head>
<meta charset="UTF-8">
</head>
<body>

</body>
</html>