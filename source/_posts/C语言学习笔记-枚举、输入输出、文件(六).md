---
title: C语言学习笔记-枚举、输入输出、文件(六)
date: 2023-10-25 00:00:00
type: paper
photos: 
tags:
  - Virual Studio
  - C
  - learn
excerpt: 这是摘要
description: 
---

# 一、输入输出

## 1.1标准文件

C 语言把所有的设备都当作文件。所以设备（比如显示器）被处理的方式与文件相同。以下三个文件会在程序执行时自动打开，以便访问键盘和屏幕。

| 标准文件 | 文件指针 | 设备     |
| :------- | :------- | :------- |
| 标准输入 | stdin    | 键盘     |
| 标准输出 | stdout   | 屏幕     |
| 标准错误 | stderr   | 您的屏幕 |

文件指针是访问文件的方式，本节将讲解如何从键盘上读取值以及如何把结果输出到屏幕上。

C 语言中的 I/O (输入/输出) 通常使用 **printf()** 和 **scanf()** 两个函数。

scanf() 函数用于从标准输入（键盘）读取并格式化， printf() 函数发送格式化输出到标准输出（屏幕）。

## 1.2printf() 函数

printf() 函数用于将格式化的数据输出到标准输出设备（通常是屏幕）。

语法：

```
int printf(const char *format, ...);
```

参数：

- `format`：格式化字符串，指定输出的格式。
- `...`：可变参数列表，根据格式化字符串中的格式说明符，提供要输出的数据。

- 所有的 C 语言程序都需要包含 **main()** 函数。 代码从 **main()** 函数开始执行。
- **printf()** 用于格式化输出到屏幕。**printf()** 函数在 **"stdio.h"** 头文件中声明。
- **stdio.h** 是一个头文件 (标准输入输出头文件) and **#include** 是一个预处理命令，用来引入头文件。 当编译器遇到 **printf()** 函数时，如果没有找到 **stdio.h** 头文件，会发生编译错误。
- **return 0;** 语句用于表示退出程序。

## 1.3scanf() 函数

scanf() 函数用于从标准输入设备（通常是键盘）读取格式化的输入。

语法：

```
int scanf(const char *format, ...);
```

参数：

- `format`：格式化字符串，指定输入的格式。
- `...`：可变参数列表，根据格式化字符串中的格式说明符，提供存储输入数据的变量地址。

## 1.4getchar() & putchar() 函数

**int getchar(void)** 函数从屏幕读取下一个可用的字符，并把它返回为一个整数。这个函数在同一个时间内只会读取一个单一的字符。您可以在循环内使用这个方法，以便从屏幕上读取多个字符。

**int putchar(int c)** 函数把字符输出到屏幕上，并返回相同的字符。这个函数在同一个时间内只会输出一个单一的字符。您可以在循环内使用这个方法，以便在屏幕上输出多个字符。

## 1.5gets() 和 fgets() 函数

gets() 函数用于从标准输入设备读取一行字符串，但不推荐使用，因为它容易导致缓冲区溢出，推荐使用 **fgets()** 函数。

语法：

```
char *fgets(char *str, int n, FILE *stream);
```

参数：

- `str`：指向字符数组的指针，用于存储读取的字符串。
- `n`：要读取的最大字符数（包括空字符`\0`）。
- `stream`：文件流，通常使用`stdin`表示标准输入。

## 1.6puts() 函数

puts() 函数用于将一个字符串输出到标准输出设备，并自动在末尾添加换行符。

语法：

```
int puts(const char *str);
```

参数：

- `str`：要输出的字符串。

返回值：

- 成功时返回非负值，失败时返回`EOF`。

## 1.7fputs() 函数

fputs() 函数用于将字符串输出到指定的流（如标准输出、文件等），但不会自动在字符串末尾添加换行符。

语法：

```
int fputs(const char *str, FILE *stream);
```

参数：

- `str`：要输出的字符串（以空字符 `\0` 结尾的字符数组）。
- `stream`：指定输出的流，可以是标准输出（`stdout`）、文件流等。

返回值：

- 成功时返回一个非负值（通常是输出的字符数）。
- 失败时返回 `EOF`。

特点：

1. **不添加换行符**：`fputs()` 不会在输出字符串后自动添加换行符。
2. **灵活的输出流**：`fputs()` 可以输出到任意流，如标准输出、文件等。

## 1.8puts() 和 fputs() 的区别

| 特性       | `puts()`                           | `fputs()`                          |
| :--------- | :--------------------------------- | :--------------------------------- |
| **换行符** | 自动在字符串末尾添加换行符         | 不添加换行符                       |
| **输出流** | 只能输出到标准输出（屏幕）         | 可以输出到任意流（如文件、屏幕）   |
| **参数**   | 只需要一个字符串参数               | 需要字符串参数和流参数             |
| **返回值** | 成功时返回非负值，失败时返回 `EOF` | 成功时返回非负值，失败时返回 `EOF` |

## 1.9scanf() 和 printf() 函数

**int scanf(const char \*format, ...)** 函数从标准输入流 **stdin** 读取输入，并根据提供的 **format** 来浏览输入。

**int printf(const char \*format, ...)** 函数把输出写入到标准输出流 **stdout** ，并根据提供的格式产生输出。

**format** 可以是一个简单的常量字符串，但是您可以分别指定 %s、%d、%c、%f 等来输出或读取字符串、整数、字符或浮点数。还有许多其他可用的格式选项，可以根据需要使用。如需了解完整的细节，可以查看这些函数的参考手册。

## 1.10fopen() 函数

fopen() 函数用于打开一个文件。

语法：

```
FILE *fopen(const char *filename, const char *mode);
```

参数：

- `filename`：要打开的文件名。
- `mode`：打开文件的模式，如`"r"`（只读）、`"w"`（只写）、`"a"`（追加）等。

返回值：

- 成功时返回指向`FILE`对象的指针，失败时返回`NULL`。

## 1.11fclose() 函数

fclose() 函数用于关闭一个已打开的文件。

语法：

```
int fclose(FILE *stream);
```

参数：

- `stream`：指向`FILE`对象的指针。

返回值：

- 成功时返回`0`，失败时返回`EOF`。

```C
#include <stdio.h>

int main() {
    FILE *file;
    file = fopen("example.txt", "w");  // 打开文件用于写入
    if (file != NULL) {
        fprintf(file, "Hello, world!\n");  // 写入文件
        fclose(file);  // 关闭文件
    }

    char buffer[100];
    file = fopen("example.txt", "r");  // 打开文件用于读取
    if (file != NULL) {
        fscanf(file, "%s", buffer);  // 读取数据
        printf("Read from file: %s\n", buffer);
        fclose(file);  // 关闭文件
    }
    return 0;
}
```

# 二、文件读写

## 2.1打开文件

您可以使用 **fopen( )** 函数来创建一个新的文件或者打开一个已有的文件，这个调用会初始化类型 **FILE** 的一个对象，类型 **FILE** 包含了所有用来控制流的必要的信息。下面是这个函数调用的原型：

```
FILE *fopen( const char *filename, const char *mode );
```

在这里，**filename** 是字符串，用来命名文件，访问模式 **mode** 的值可以是下列值中的一个：

| 模式 | 描述                                                         |
| :--- | :----------------------------------------------------------- |
| r    | 打开一个已有的文本文件，允许读取文件。                       |
| w    | 打开一个文本文件，允许写入文件。如果文件不存在，则会创建一个新文件。在这里，您的程序会从文件的开头写入内容。如果文件存在，文件内容会被清空（即文件长度被截断为0）。 |
| a    | 打开一个文本文件，以追加模式写入文件。如果文件不存在，则会创建一个新文件。在这里，您的程序会在已有的文件内容中追加内容。 |
| r+   | 打开一个文本文件，允许读写文件。                             |
| w+   | 打开一个文本文件，允许读写文件。如果文件已存在，则文件会被截断为零长度，如果文件不存在，则会创建一个新文件。 |
| a+   | 打开一个文本文件，允许读写文件。如果文件不存在，则会创建一个新文件。读取会从文件的开头开始，写入则只能是追加模式。 |

如果处理的是二进制文件，则需使用下面的访问模式来取代上面的访问模式：

```
"rb", "wb", "ab", "rb+", "r+b", "wb+", "w+b", "ab+", "a+b"
```

## 2.2关闭文件

为了关闭文件，请使用 fclose( ) 函数。函数的原型如下：

```
 int fclose( FILE *fp );
```

如果成功关闭文件，**fclose( )** 函数返回零，如果关闭文件时发生错误，函数返回 **EOF**。这个函数实际上，会清空缓冲区中的数据，关闭文件，并释放用于该文件的所有内存。EOF 是一个定义在头文件 **stdio.h** 中的常量。

C 标准库提供了各种函数来按字符或者以固定长度字符串的形式读写文件。

## 2.3写入文件

下面是把字符写入到流中的最简单的函数：

```
int fputc( int c, FILE *fp );
```

函数 **fputc()** 把参数 c 的字符值写入到 fp 所指向的输出流中。如果写入成功，它会返回写入的字符，如果发生错误，则会返回 **EOF**。您可以使用下面的函数来把一个以 null 结尾的字符串写入到流中：

```
int fputs( const char *s, FILE *fp );
```

函数 **fputs()** 把字符串 **s** 写入到 fp 所指向的输出流中。如果写入成功，它会返回一个非负值，如果发生错误，则会返回 **EOF**。您也可以使用 **int fprintf(FILE \*fp,const char \*format, ...)** 函数把一个字符串写入到文件中。尝试下面的实例：

> **注意：**请确保您有可用的 **tmp** 目录，如果不存在该目录，则需要在您的计算机上先创建该目录。
>
> **/tmp** 一般是 Linux 系统上的临时目录，如果你在 Windows 系统上运行，则需要修改为本地环境中已存在的目录，例如: **C:\tmp**、**D:\tmp**等。

```C
#include <stdio.h>
 
int main()
{
   FILE *fp = NULL;
 
   fp = fopen("/tmp/test.txt", "w+");
   fprintf(fp, "This is testing for fprintf...\n");
   fputs("This is testing for fputs...\n", fp);
   fclose(fp);
}
```

当上面的代码被编译和执行时，它会在 /tmp 目录中创建一个新的文件 **test.txt**，并使用两个不同的函数写入两行。接下来让我们来读取这个文件。

## 2.4读取文件

下面是从文件读取单个字符的最简单的函数：

```
int fgetc( FILE * fp );
```

**fgetc()** 函数从 fp 所指向的输入文件中读取一个字符。返回值是读取的字符，如果发生错误则返回 **EOF**。下面的函数允许您从流中读取一个字符串：

```
char *fgets( char *buf, int n, FILE *fp );
```

函数 **fgets()** 从 fp 所指向的输入流中读取 n - 1 个字符。它会把读取的字符串复制到缓冲区 **buf**，并在最后追加一个 **null** 字符来终止字符串。

如果这个函数在读取最后一个字符之前就遇到一个换行符 '\n' 或文件的末尾 EOF，则只会返回读取到的字符，包括换行符。您也可以使用 **int fscanf(FILE \*fp, const char \*format, ...)** 函数来从文件中读取字符串，但是在遇到第一个空格和换行符时，它会停止读取。

```C
#include <stdio.h>
 
int main()
{
   FILE *fp = NULL;
   char buff[255];
 
   fp = fopen("/tmp/test.txt", "r");
   fscanf(fp, "%s", buff);
   printf("1: %s\n", buff );
 
   fgets(buff, 255, (FILE*)fp);
   printf("2: %s\n", buff );
   
   fgets(buff, 255, (FILE*)fp);
   printf("3: %s\n", buff );
   fclose(fp);
 
}
```

当上面的代码被编译和执行时，它会读取上一部分创建的文件，产生下列结果：

```
1: This
2: is testing for fprintf...

3: This is testing for fputs...
```

首先，**fscanf()** 方法只读取了 **This**，因为它在后边遇到了一个空格。其次，调用 **fgets()** 读取剩余的部分，直到行尾。最后，调用 **fgets()** 完整地读取第二行。

## 2.5二进制 I/O 函数

下面两个函数用于二进制输入和输出：

```C
size_t fread(void *ptr, size_t size_of_elements, 
             size_t number_of_elements, FILE *a_file);
              
size_t fwrite(const void *ptr, size_t size_of_elements, 
             size_t number_of_elements, FILE *a_file);
```

这两个函数都是用于存储块的读写 - 通常是数组或结构体。

# 三、强制类型转换

强制类型转换是把变量从一种类型转换为另一种数据类型。例如，如果您想存储一个 long 类型的值到一个简单的整型中，您需要把 long 类型强制转换为 int 类型。您可以使用**强制类型转换运算符**来把值显式地从一种类型转换为另一种类型，如下所示：

```
(type_name) expression
```

请看下面的实例，使用强制类型转换运算符把一个整数变量除以另一个整数变量，得到一个浮点数：

```C
#include <stdio.h>
 
int main()
{
   int sum = 17, count = 5;
   double mean;
 
   mean = (double) sum / count;
   printf("Value of mean : %f\n", mean );
 
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
Value of mean : 3.400000
```

这里要注意的是强制类型转换运算符的优先级大于除法，因此 **sum** 的值首先被转换为 **double** 型，然后除以 count，得到一个类型为 double 的值。

类型转换可以是隐式的，由编译器自动执行，也可以是显式的，通过使用**强制类型转换运算符**来指定。在编程时，有需要类型转换的时候都用上强制类型转换运算符，是一种良好的编程习惯。

## 3.1整数提升

整数提升是指把小于 **int** 或 **unsigned int** 的整数类型转换为 **int** 或 **unsigned int** 的过程。请看下面的实例，在 int 中添加一个字符：

```C
#include <stdio.h>
 
int main()
{
   int  i = 17;
   char c = 'c'; /* ascii 值是 99 */
   int sum;
 
   sum = i + c;
   printf("Value of sum : %d\n", sum );
 
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
Value of sum : 116
```

在这里，sum 的值为 116，因为编译器进行了整数提升，在执行实际加法运算时，把 'c' 的值转换为对应的 ascii 值。

## 3.2常用的算术转换

**常用的算术转换**是隐式地把值强制转换为相同的类型。编译器首先执行**整数提升**，如果操作数类型不同，则它们会被转换为下列层次中出现的最高层次的类型：

![Usual Arithmetic Conversion](https://www.runoob.com/wp-content/uploads/2014/08/usual_arithmetic_conversion.png)

常用的算术转换不适用于赋值运算符、逻辑运算符 && 和 ||。让我们看看下面的实例来理解这个概念：

```C
#include <stdio.h>
 
int main()
{
   int  i = 17;
   char c = 'c'; /* ascii 值是 99 */
   float sum;
 
   sum = i + c;
   printf("Value of sum : %f\n", sum );
 
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
Value of sum : 116.000000
```

在这里，c 首先被转换为整数，但是由于最后的值是 float 型的，所以会应用常用的算术转换，编译器会把 i 和 c 转换为浮点型，并把它们相加得到一个浮点数。