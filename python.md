# 🐍 Ryan's Python Learning Log

---

## 1️⃣ Functions (Defining + Parameters)

### Basic Function
```python
def greet():
    print("Hello!")
```

### Function with a Parameter
```python
def greet(name):
    print("Hello " + name)
```

### Calling the Function
```python
greet("Ryan")
```

---

## 2️⃣ Variables & Data Types

### Defining Variables
```python
age = 14              # int
height = 5.9          # float
name = "Ryan"         # str
is_drummer = True     # bool
```

### Checking Type
```python
print(type(age))
```

### Converting Between Types
```python
num_str = "10"

num_int = int(num_str)
num_float = float(num_str)
num_string_again = str(num_int)

print(num_int)
print(num_float)
print(num_string_again)
```

---

## 3️⃣ Capturing User Input

```python
name = input("What is your name? ")
print("Hello " + name)
```

⚠️ `input()` always returns a string.

If you need a number:

```python
age = int(input("How old are you? "))
print(age + 1)
```

---

## 4️⃣ String Concatenation

```python
first = "Ryan"
last = "Gabbard"

full_name = first + " " + last
print(full_name)
```

---

## 5️⃣ print() Function

```python
print("Hello world")
print("Ryan is", 14, "years old")
```

---

## 6️⃣ For Loops (Start, End, Increment)

### Basic Loop
```python
for i in range(5):
    print(i)
```

### Start and End
```python
for i in range(1, 6):
    print(i)
```

### Start, End, Increment
```python
for i in range(0, 10, 2):
    print(i)
```

---

## 7️⃣ If Statements (if / elif / else)

```python
score = 85

if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("Keep trying!")
```

---

## 8️⃣ Comparison Operators

| Operator | Meaning |
|----------|----------|
| `==` | Equal to |
| `!=` | Not equal to |
| `>`  | Greater than |
| `>=` | Greater than or equal |
| `<`  | Less than |
| `<=` | Less than or equal |
| `%`  | Modulus (remainder) |

### Example Using %
```python
number = 10

if number % 2 == 0:
    print("Even number")
else:
    print("Odd number")
```

---

## 9️⃣ While Loops

```python
count = 0

while count < 5:
    print(count)
    count += 1
```

⚠️ Be careful — if the condition never becomes False, the loop runs forever:

```python
while True:
    print("This never stops!")
```

---

## 🔥 Mini Program Example

```python
def check_even(number):
    if number % 2 == 0:
        print("That number is even!")
    else:
        print("That number is odd!")

user_input = int(input("Enter a number: "))
check_even(user_input)
```

---

## 🧠 Important Rules to Remember

- Indentation matters in Python  
- Code runs top to bottom  
- Variables store values  
- Functions organize code  
- Loops repeat code  
- Conditionals make decisions  
