// Vulnerable Java
import java.sql.*;

public class Main {
  public static void main(String[] args) {
    String password = "123456"; // ❌ Weak password
    String apiKey = "secretKey=abcd123"; // ❌ Hardcoded key
    String query = "SELECT * FROM users WHERE email = '" + args[0] + "'"; // ❌ SQL injection
    System.out.println("Login: " + password);
  }
}
