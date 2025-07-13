String username = request.getParameter("username");
Statement stmt = conn.createStatement();
String query = "SELECT * FROM users WHERE username = '" + username + "'";  // SQL Injection
ResultSet rs = stmt.executeQuery(query);

String key = "HARDCODED_KEY"; // Hardcoded secret
