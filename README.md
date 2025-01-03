# **Custom Language Documentation**

## **Overview**
This is a lightweight, custom programming language designed with basic features for assignments, expressions, conditionals, and print statements. Below is the detailed documentation of its features.

---

## **Features**

### **1. Variables and Assignments**
You can declare and assign variables using the `=` operator.

#### Syntax:

```
<variable_name> = <expression>
```

#### Example:

```
x = 10
y = x + 5
```

- Supports arithmetic operations: `+`, `-`, `*`, `/`.
- Variables can be used in expressions after assignment.

---

### **2. Print Statements**
Prints a string or the result of an expression to the console.

#### Syntax:

```
print(<expression>)
```

#### Example:

```
print("Hello, world!")
print(x + y)
```

- Strings should be enclosed in double quotes (`"`).
- Supports any valid expression or variable as an argument.

---

### **3. If Statements**
Executes a block of code if the condition evaluates to `true`.

#### Syntax:

```
if(<condition>) {
    <statements>
}
```

#### Example:

```
x = 10
y = 5
if(x > y) {
    print("x is greater than y")
}
```

#### Features:
- Supports logical operators: `AND`, `OR`, and `NOT`.
- Supports comparison operators: `>`, `<`, `>=`, `<=`, `==`, `!=`.
- Can include multiple statements within the block.

---

### **4. Expressions**
Expressions are used in assignments, conditions, and print statements.

#### Supported Operators:
- **Arithmetic:** `+`, `-`, `*`, `/`
- **Comparison:** `>`, `<`, `>=`, `<=`, `==`, `!=`
- **Logical:** `AND`, `OR`, `NOT`

#### Example:

```
z = (x + y) * 2
if(x > y AND y < 10) {
    print("Complex condition met")
}
```

#### Notes:
- Parentheses (`()`) are supported for grouping and controlling precedence.
- Division by zero will raise an error.

---

### **5. Strings**
Strings are enclosed in double quotes (`"`) and can be used in `print` or assigned to variables.

#### Example:

```
message = "Hello, World!"
print(message)
```

---

## **Error Handling**
The language provides meaningful error messages for:
1. Syntax errors in statements.
2. Division by zero in expressions.
3. Unmatched parentheses or braces.
4. Unsupported operators or tokens.

---

## **Limitations**
1. Currently does not support functions or loops.
2. String concatenation is not yet implemented.
3. No support for `else` or `elif` in conditionals.

---

## **Example Program**

```
x = 10
y = 5

if(x > y) {
    print("x is greater than y")
}

z = x + y * 2
print("The value of z is:")
print(z)
```