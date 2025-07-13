#include <iostream>
#include <cstring>

void vulnerable(char *input) {
  char buffer[10];
  strcpy(buffer, input); // Buffer Overflow
}

int main() {
  char data[] = "AAAAAAAAAAAAAAAAAAAA";
  vulnerable(data);
}
