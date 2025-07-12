# Vulnerable Python
import os
user_input = input("Enter command:")
eval(user_input)  # ❌ Dangerous
os.system("rm -rf /")  # ❌ System command execution
password = "123456"  # ❌ Weak password
SECRET_KEY = "secret_token_123"  # ❌ Hardcoded secret
