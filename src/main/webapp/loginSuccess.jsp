<%@ page language="java" contentType="text/plain; charset=UTF-8" pageEncoding="UTF-8"%>
<%
request.setCharacterEncoding("UTF-8");
session.setMaxInactiveInterval(30 * 60);
String managerUid = request.getParameter("managerUid");
String managerEmail = request.getParameter("managerEmail");
String managerName = request.getParameter("managerName");
String managerRegion = request.getParameter("managerRegion");
session.setAttribute("managerUid", managerUid);
session.setAttribute("managerEmail", managerEmail);
session.setAttribute("managerName", managerName);
session.setAttribute("managerRegion", managerRegion);
out.print("OK");
%>
