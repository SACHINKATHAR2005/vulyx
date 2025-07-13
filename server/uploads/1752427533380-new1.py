import pickle

data = input("Enter pickle data:")
loaded = pickle.loads(data)  # Insecure Deserialization

import hashlib
print(hashlib.md5(b"password").hexdigest())  # Weak cryptography

os.system("rm -rf /")  # Command Injection
