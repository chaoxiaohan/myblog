---
title: C语言学习笔记-函数、指针（四）
date: 2024-09-28 00:00:00
type: paper
photos: 
excerpt: 本文详细介绍了C语言中函数和指针的基本概念及其使用方法，包括函数的定义、声明、调用、参数传递方式（传值调用与引用调用），以及指针的定义、操作、指针数组、指向指针的指针、指针的算术运算等内容。
tags:
  - Virual Studio
  - C
  - learn
---



# 一.函数

数是一组一起执行一个任务的语句。每个 C 程序都至少有一个函数，即主函数 **main()** ，所有简单的程序都可以定义其他额外的函数。

您可以把代码划分到不同的函数中。如何划分代码到不同的函数中是由您来决定的，但在逻辑上，划分通常是根据每个函数执行一个特定的任务来进行的。

函数**声明**告诉编译器函数的名称、返回类型和参数。函数**定义**提供了函数的实际主体。

C 标准库提供了大量的程序可以调用的内置函数。例如，函数 **strcat()** 用来连接两个字符串，函数 **memcpy()** 用来复制内存到另一个位置。

函数还有很多叫法，比如方法、子例程或程序，等等。

## 1.1定义函数

C 语言中的函数定义的一般形式如下：

```
return_type function_name( parameter list )
{
   body of the function
}
```

在 C 语言中，函数由一个函数头和一个函数主体组成。下面列出一个函数的所有组成部分：

- **返回类型：**一个函数可以返回一个值。**return_type** 是函数返回的值的数据类型。有些函数执行所需的操作而不返回值，在这种情况下，return_type 是关键字 **void**。
- **函数名称：**这是函数的实际名称。函数名和参数列表一起构成了函数签名。
- **参数：**参数就像是占位符。当函数被调用时，您向参数传递一个值，这个值被称为实际参数。参数列表包括函数参数的类型、顺序、数量。参数是可选的，也就是说，函数可能不包含参数。
- **函数主体：**函数主体包含一组定义函数执行任务的语句。

以下是 **max()** 函数的源代码。该函数有两个参数 num1 和 num2，会返回这两个数中较大的那个数：

/* 函数返回两个数中较大的那个数 */ int max(int num1, int num2)  {   /* 局部变量声明 */   int result;    if (num1 > num2) {      result = num1;   } else {      result = num2;   }   return result;  }

## 1.2函数声明

函数**声明**会告诉编译器函数名称及如何调用函数。函数的实际主体可以单独定义。

函数声明包括以下几个部分：

```
return_type function_name( parameter list );
```

针对上面定义的函数 max()，以下是函数声明：

```
int max(int num1, int num2);
```

在函数声明中，参数的名称并不重要，只有参数的类型是必需的，因此下面也是有效的声明：

```
int max(int, int);
```

当您在一个源文件中定义函数且在另一个文件中调用函数时，函数声明是必需的。在这种情况下，您应该在调用函数的文件顶部声明函数。

## 1.3调用函数

创建 C 函数时，会定义函数做什么，然后通过调用函数来完成已定义的任务。

当程序调用函数时，程序控制权会转移给被调用的函数。被调用的函数执行已定义的任务，当函数的返回语句被执行时，或到达函数的结束括号时，会把程序控制权交还给主程序。

调用函数时，传递所需参数，如果函数返回一个值，则可以存储返回值。例如：

```C
#include <stdio.h>
 
/* 函数声明 */
int max(int num1, int num2);
 
int main ()
{
   /* 局部变量定义 */
   int a = 100;
   int b = 200;
   int ret;
 
   /* 调用函数来获取最大值 */
   ret = max(a, b);
 
   printf( "Max value is : %d\n", ret );
 
   return 0;
}
 
/* 函数返回两个数中较大的那个数 */
int max(int num1, int num2) 
{
   /* 局部变量声明 */
   int result;
 
   if (num1 > num2)
      result = num1;
   else
      result = num2;
 
   return result; 
}
```

把 max() 函数和 main() 函数放一块，编译源代码。当运行最后的可执行文件时，会产生下列结果：

```C
Max value is : 200
```

## 1.4函数参数

如果函数要使用参数，则必须声明接受参数值的变量。这些变量称为函数的**形式参数**。

形式参数就像函数内的其他局部变量，在进入函数时被创建，退出函数时被销毁。

### 1.4.1传值调用

向函数传递参数的**传值调用**方法，把参数的实际值复制给函数的形式参数。在这种情况下，修改函数内的形式参数不会影响实际参数。

默认情况下，C 语言使用*传值调用*方法来传递参数。一般来说，这意味着函数内的代码不会改变用于调用函数的实际参数。函数 **swap()** 定义如下：

```C
/* 函数定义 */
void swap(int x, int y)
{
   int temp;

   temp = x; /* 保存 x 的值 */
   x = y;    /* 把 y 赋值给 x */
   y = temp; /* 把 temp 赋值给 y */
  
   return;
}
```

现在，让我们通过传递实际参数来调用函数 **swap()**：

```C
#include <stdio.h>
 
/* 函数声明 */
void swap(int x, int y);
 
int main ()
{
   /* 局部变量定义 */
   int a = 100;
   int b = 200;
 
   printf("交换前，a 的值： %d\n", a );
   printf("交换前，b 的值： %d\n", b );
 
   /* 调用函数来交换值 */
   swap(a, b);
 
   printf("交换后，a 的值： %d\n", a );
   printf("交换后，b 的值： %d\n", b );
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
交换前，a 的值： 100
交换前，b 的值： 200
交换后，a 的值： 100
交换后，b 的值： 200
```

上面的实例表明了，虽然在函数内改变了 a 和 b 的值，但是实际上 a 和 b 的值没有发生变化。

### 1.4.2引用调用

通过引用传递方式，形参为指向实参地址的指针，当对形参的指向操作时，就相当于对实参本身进行的操作。

传递指针可以让多个函数访问指针所引用的对象，而不用把对象声明为全局可访问。

```C
/* 函数定义 */
void swap(int *x, int *y)
{
   int temp;
   temp = *x;    /* 保存地址 x 的值 */
   *x = *y;      /* 把 y 赋值给 x */
   *y = temp;    /* 把 temp 赋值给 y */
  
   return;
}
```

如需了解 C 中指针的更多细节，请访问 [C - 指针](https://www.runoob.com/cprogramming/c-pointers.html) 。

现在，让我们通过引用传值来调用函数 **swap()**：

```C
#include <stdio.h>
 
/* 函数声明 */
void swap(int *x, int *y);
 
int main ()
{
   /* 局部变量定义 */
   int a = 100;
   int b = 200;
 
   printf("交换前，a 的值： %d\n", a );
   printf("交换前，b 的值： %d\n", b );
 
   /* 调用函数来交换值
    * &a 表示指向 a 的指针，即变量 a 的地址 
    * &b 表示指向 b 的指针，即变量 b 的地址 
   */
   swap(&a, &b);
 
   printf("交换后，a 的值： %d\n", a );
   printf("交换后，b 的值： %d\n", b );
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
交换前，a 的值： 100
交换前，b 的值： 200
交换后，a 的值： 200
交换后，b 的值： 100
```

上面的实例表明了，与传值调用不同，引用调用在函数内改变了 a 和 b 的值，实际上也改变了函数外 a 和 b 的值。

# 二.指针

学习 C 语言的指针既简单又有趣。通过指针，可以简化一些 C 编程任务的执行，还有一些任务，如动态内存分配，没有指针是无法执行的。所以，想要成为一名优秀的 C 程序员，学习指针是很有必要的。

正如您所知道的，每一个变量都有一个内存位置，每一个内存位置都定义了可使用 **&** 运算符访问的地址，它表示了在内存中的一个地址。

请看下面的实例，它将输出定义的变量地址：

```C
#include <stdio.h>
 
int main ()
{
    int var_runoob = 10;
    int *p;              // 定义指针变量
    p = &var_runoob;
 
   printf("var_runoob 变量的地址： %p\n", p);
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
var_runoob 变量的地址： 0x7ffeeaae08d8
```

![img](https://www.runoob.com/wp-content/uploads/2014/09/c-pointer.png)

通过上面的实例，我们了解了什么是内存地址以及如何访问它。接下来让我们看看什么是指针。

## 2.1什么是指针？

指针也就是内存地址，指针变量是用来存放内存地址的变量。就像其他变量或常量一样，您必须在使用指针存储其他变量地址之前，对其进行声明。指针变量声明的一般形式为：

```
type *var_name;
```

在这里，**type** 是指针的基类型，它必须是一个有效的 C 数据类型，**var_name** 是指针变量的名称。用来声明指针的星号 ***** 与乘法中使用的星号是相同的。但是，在这个语句中，星号是用来指定一个变量是指针。以下是有效的指针声明：

int    *ip;    /* 一个整型的指针 */ double *dp;    /* 一个 double 型的指针 */ float  *fp;    /* 一个浮点型的指针 */ char   *ch;    /* 一个字符型的指针 */

所有实际数据类型，不管是整型、浮点型、字符型，还是其他的数据类型，对应指针的值的类型都是一样的，都是一个代表内存地址的长的十六进制数。

不同数据类型的指针之间唯一的不同是，指针所指向的变量或常量的数据类型不同。

## 2.2如何使用指针？

使用指针时会频繁进行以下几个操作：定义一个指针变量、把变量地址赋值给指针、访问指针变量中可用地址的值。这些是通过使用一元运算符 ***** 来返回位于操作数所指定地址的变量的值。下面的实例涉及到了这些操作：

```C
#include <stdio.h>
 
int main ()
{
   int  var = 20;   /* 实际变量的声明 */
   int  *ip;        /* 指针变量的声明 */
 
   ip = &var;  /* 在指针变量中存储 var 的地址 */
 
   printf("var 变量的地址: %p\n", &var  );
 
   /* 在指针变量中存储的地址 */
   printf("ip 变量存储的地址: %p\n", ip );
 
   /* 使用指针访问值 */
   printf("*ip 变量的值: %d\n", *ip );
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
var 变量的地址: 0x7ffeeef168d8
ip 变量存储的地址: 0x7ffeeef168d8
*ip 变量的值: 20
```

## 2.3C 中的 NULL 指针

在变量声明的时候，如果没有确切的地址可以赋值，为指针变量赋一个 NULL 值是一个良好的编程习惯。赋为 NULL 值的指针被称为**空**指针。

NULL 指针是一个定义在标准库中的值为零的常量。请看下面的程序：

```C
#include <stdio.h>
 
int main ()
{
   int  *ptr = NULL;
 
   printf("ptr 的地址是 %p\n", ptr  );
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
ptr 的地址是 0x0
```

在大多数的操作系统上，程序不允许访问地址为 0 的内存，因为该内存是操作系统保留的。然而，内存地址 0 有特别重要的意义，它表明该指针不指向一个可访问的内存位置。但按照惯例，如果指针包含空值（零值），则假定它不指向任何东西。

如需检查一个空指针，您可以使用 if 语句，如下所示：

```C
if(ptr)     /* 如果 p 非空，则完成 */
if(!ptr)    /* 如果 p 为空，则完成 */
```

## 2.4指针的算术运算

C 指针是一个用数值表示的地址。因此，您可以对指针执行算术运算。可以对指针进行四种算术运算：++、--、+、-。

假设 **ptr** 是一个指向地址 1000 的整型指针，是一个 32 位的整数，让我们对该指针执行下列的算术运算：

```
ptr++
```

在执行完上述的运算之后，**ptr** 将指向位置 1004，因为 ptr 每增加一次，它都将指向下一个整数位置，即当前位置往后移 4 字节。这个运算会在不影响内存位置中实际值的情况下，移动指针到下一个内存位置。如果 **ptr** 指向一个地址为 1000 的字符，上面的运算会导致指针指向位置 1001，因为下一个字符位置是在 1001。

我们概括一下：

- 指针的每一次递增，它其实会指向下一个元素的存储单元。
- 指针的每一次递减，它都会指向前一个元素的存储单元。
- 指针在递增和递减时跳跃的字节数取决于指针所指向变量数据类型长度，比如 int 就是 4 个字节。

### 2.4.1递增一个指针

递增一个指针意味着让指针指向下一个内存位置。

指针的递增操作会根据指针所指向的数据类型进行适当的内存偏移。

我们喜欢在程序中使用指针代替数组，因为变量指针可以递增，而数组不能递增，数组可以看成一个指针常量。下面的程序递增变量指针，以便顺序访问数组中的每一个元素：

```C
#include <stdio.h>
 
const int MAX = 3;
 
int main ()
{
   // 定义一个整数数组
   int var[] = {10, 100, 200};
   // 定义一个整数变量 i 和一个整数指针 ptr
   int i, *ptr;
 
   // 将指针 ptr 指向数组 var 的起始地址
   ptr = var;
   // 循环遍历数组
   for ( i = 0; i < MAX; i++)
   {
      // 打印当前指针 ptr 所指向的地址
      printf("存储地址：var[%d] = %p\n", i, ptr );
      // 打印当前指针 ptr 所指向地址的值
      printf("存储值：var[%d] = %d\n", i, *ptr );
 
      // 将指针 ptr 移动到下一个数组元素的位置
      ptr++;
   }
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
存储地址：var[0] = e4a298cc
存储值：var[0] = 10
存储地址：var[1] = e4a298d0
存储值：var[1] = 100
存储地址：var[2] = e4a298d4
存储值：var[2] = 200
```

递增字符指针：

```C
#include <stdio.h>

int main() {
    char str[] = "Hello";
    char *ptr = str;  // 指针指向字符串的第一个字符

    printf("初始字符: %c\n", *ptr);  // 输出 H

    ptr++;  // 递增指针，使其指向下一个字符
    printf("递增后字符: %c\n", *ptr);  // 输出 e

    return 0;
}
```

在这个示例中，ptr++ 使指针从 str[0] 指向 str[1]。因为 ptr 是一个 char 类型指针，所以它递增时会移动 sizeof(char) 个字节，即 1 个字节。

当上面的代码被编译和执行时，它会产生下列结果：

```
初始字符: H
递增后字符: e
```

递增结构体指针:

```C
#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main() {
    struct Point points[] = {{1, 2}, {3, 4}, {5, 6}};
    struct Point *ptr = points;  // 指针指向结构体数组的第一个元素

    printf("初始点: (%d, %d)\n", ptr->x, ptr->y);  // 输出 (1, 2)

    ptr++;  // 递增指针，使其指向下一个结构体
    printf("递增后点: (%d, %d)\n", ptr->x, ptr->y);  // 输出 (3, 4)

    return 0;
}
```

在这个示例中，ptr++ 使指针从 points[0] 指向 points[1]。因为 ptr 是一个 struct Point 类型指针，所以它递增时会移动 sizeof(struct Point) 个字节。

当上面的代码被编译和执行时，它会产生下列结果：

```
初始点: (1, 2)
递增后点: (3, 4)
```

### 2.4.2递减一个指针

递减一个指针意味着让指针指向前一个内存位置。和递增指针类似，指针的递减操作也会根据指针所指向的数据类型进行适当的内存偏移。

对指针进行递减运算，即把值减去其数据类型的字节数，如下所示：

```C
#include <stdio.h>
 
int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int *ptr = &arr[4];  // 指针指向数组的最后一个元素
 
    printf("初始值: %d\n", *ptr);  // 输出 50
 
    ptr--;  // 递减指针，使其指向前一个整数元素
    printf("递减后值: %d\n", *ptr);  // 输出 40
 
    ptr--;  // 再次递减指针
    printf("再次递减后值: %d\n", *ptr);  // 输出 30
 
    return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
初始值: 50
递减后值: 40
再次递减后值: 30
```

递减字符指针：

```C
#include <stdio.h>

int main() {
    char str[] = "Hello";
    char *ptr = &str[4];  // 指针指向字符串的最后一个字符 'o'

    printf("初始字符: %c\n", *ptr);  // 输出 o

    ptr--;  // 递减指针，使其指向前一个字符
    printf("递减后字符: %c\n", *ptr);  // 输出 l

    ptr--;  // 再次递减指针
    printf("再次递减后字符: %c\n", *ptr);  // 输出 l

    return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
初始字符: o
递减后字符: l
再次递减后字符: l
```

递减结构体指针:

```C
#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main() {
    struct Point points[] = {{1, 2}, {3, 4}, {5, 6}};
    struct Point *ptr = &points[2];  // 指针指向结构体数组的最后一个元素

    printf("初始点: (%d, %d)\n", ptr->x, ptr->y);  // 输出 (5, 6)

    ptr--;  // 递减指针，使其指向前一个结构体
    printf("递减后点: (%d, %d)\n", ptr->x, ptr->y);  // 输出 (3, 4)

    ptr--;  // 再次递减指针
    printf("再次递减后点: (%d, %d)\n", ptr->x, ptr->y);  // 输出 (1, 2)

    return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
初始点: (5, 6)
递减后点: (3, 4)
再次递减后点: (1, 2)
```

### 2.4.3指针的比较

在 C 语言中，可以比较指针来确定它们的关系。指针比较主要用于确定两个指针是否指向相同的内存位置或确定一个指针是否位于另一个指针之前或之后。

指针可以用关系运算符进行比较，如`==`、`!=`、`<`、`>`、`<=` 和 `>=`。如果 p1 和 p2 指向两个相关的变量，比如同一个数组中的不同元素，则可对 p1 和 p2 进行大小比较。

以下是一些示例代码，展示了如何比较指针并输出结果。

指针相等比较：

```C
#include <stdio.h>
 
int main() {
    int a = 5;
    int b = 10;
    int *ptr1 = &a;
    int *ptr2 = &a;
    int *ptr3 = &b;
 
    if (ptr1 == ptr2) {
        printf("ptr1 和 ptr2 指向相同的内存地址\n");  // 这行会被输出
    } else {
        printf("ptr1 和 ptr2 指向不同的内存地址\n");
    }
 
    if (ptr1 != ptr3) {
        printf("ptr1 和 ptr3 指向不同的内存地址\n");  // 这行会被输出
    } else {
        printf("ptr1 和 ptr3 指向相同的内存地址\n");
    }
 
    return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
ptr1 和 ptr2 指向相同的内存地址
ptr1 和 ptr3 指向不同的内存地址
```

指针大小比较：

```C
#include <stdio.h>

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int *ptr1 = &arr[1];  // 指向 arr[1]，值为 20
    int *ptr2 = &arr[3];  // 指向 arr[3]，值为 40

    if (ptr1 < ptr2) {
        printf("ptr1 在 ptr2 之前\n");  // 这行会被输出
    } else {
        printf("ptr1 在 ptr2 之后或相同位置\n");
    }

    if (ptr1 > ptr2) {
        printf("ptr1 在 ptr2 之后\n");
    } else {
        printf("ptr1 在 ptr2 之前或相同位置\n");  // 这行会被输出
    }

    return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
ptr1 在 ptr2 之前
ptr1 在 ptr2 之前或相同位置
```

遍历数组并比较指针:

```C
#include <stdio.h>

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int *start = arr;           // 指向数组的第一个元素
    int *end = &arr[4];         // 指向数组的最后一个元素
    int *ptr;

    for (ptr = start; ptr <= end; ptr++) {
        printf("当前指针指向的值: %d\n", *ptr);
    }

    return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
当前指针指向的值: 10
当前指针指向的值: 20
当前指针指向的值: 30
当前指针指向的值: 40
当前指针指向的值: 50
```

## 2.5指针数组

C 指针数组是一个数组，其中的每个元素都是指向某种数据类型的指针。

指针数组存储了一组指针，每个指针可以指向不同的数据对象。

指针数组通常用于处理多个数据对象，例如字符串数组或其他复杂数据结构的数组。

让我们来看一个实例，它用到了一个由 3 个整数组成的数组：

```C
#include <stdio.h>
 
const int MAX = 3;
 
int main ()
{
   int  var[] = {10, 100, 200};
   int i;
 
   for (i = 0; i < MAX; i++)
   {
      printf("Value of var[%d] = %d\n", i, var[i] );
   }
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
Value of var[0] = 10
Value of var[1] = 100
Value of var[2] = 200
```

可能有一种情况，我们想要让数组存储指向 int 或 char 或其他数据类型的指针。

下面是一个指向整数的指针数组的声明：

```
int *ptr[MAX];
```

在这里，把 **ptr** 声明为一个数组，由 MAX 个整数指针组成。因此，ptr 中的每个元素，都是一个指向 int 值的指针。下面的实例用到了三个整数，它们将存储在一个指针数组中，如下所示：

```C
#include <stdio.h>
 
const int MAX = 3;
 
int main ()
{
   int  var[] = {10, 100, 200};
   int i, *ptr[MAX];
 
   for ( i = 0; i < MAX; i++)
   {
      ptr[i] = &var[i]; /* 赋值为整数的地址 */
   }
   for ( i = 0; i < MAX; i++)
   {
      printf("Value of var[%d] = %d\n", i, *ptr[i] );
   }
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
Value of var[0] = 10
Value of var[1] = 100
Value of var[2] = 200
```

您也可以用一个指向字符的指针数组来存储一个字符串列表，如下：

```C
#include <stdio.h>
 
const int MAX = 4;
 
int main ()
{
   const char *names[] = {
                   "Zara Ali",
                   "Hina Ali",
                   "Nuha Ali",
                   "Sara Ali",
   };
   int i = 0;
 
   for ( i = 0; i < MAX; i++)
   {
      printf("Value of names[%d] = %s\n", i, names[i] );
   }
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
Value of names[0] = Zara Ali
Value of names[1] = Hina Ali
Value of names[2] = Nuha Ali
Value of names[3] = Sara Ali
```

再看一个简单实例，我们首先声明了一个包含三个整数指针的指针数组 ptrArray，然后，我们将这些指针分别指向不同的整数变量 num1、num2 和 num3，最后，我们使用指针数组访问这些整数变量的值。

```C
#include <stdio.h>
 
int main() {
    int num1 = 10, num2 = 20, num3 = 30;
    
    // 声明一个整数指针数组，包含三个指针
    int *ptrArray[3];
    
    // 将指针指向不同的整数变量
    ptrArray[0] = &num1;
    ptrArray[1] = &num2;
    ptrArray[2] = &num3;
    
    // 使用指针数组访问这些整数变量的值
    printf("Value at index 0: %d\n", *ptrArray[0]);
    printf("Value at index 1: %d\n", *ptrArray[1]);
    printf("Value at index 2: %d\n", *ptrArray[2]);
    
    return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
Value at index 0: 10
Value at index 1: 20
Value at index 2: 30
```

指针数组在C中非常有用，特别是在处理具有不定数量元素的数据结构时，如动态分配的字符串数组或动态创建的结构体数组。

## 2.6指向指针的指针

指向指针的指针是一种多级间接寻址的形式，或者说是一个指针链。通常，一个指针包含一个变量的地址。当我们定义一个指向指针的指针时，第一个指针包含了第二个指针的地址，第二个指针指向包含实际值的位置。

![C 中指向指针的指针](https://www.runoob.com/wp-content/uploads/2014/09/pointer_to_pointer.jpg)

一个指向指针的指针变量必须如下声明，即在变量名前放置两个星号。例如，下面声明了一个指向 int 类型指针的指针：

```
int **var;
```

当一个目标值被一个指针间接指向到另一个指针时，访问这个值需要使用两个星号运算符，如下面实例所示：

![img](https://www.runoob.com/wp-content/uploads/2014/09/c-pointerxxxxx.png)

```C
#include <stdio.h>
 
int main ()
{
   int  V;
   int  *Pt1;
   int  **Pt2;
 
   V = 100;
 
   /* 获取 V 的地址 */
   Pt1 = &V;
 
   /* 使用运算符 & 获取 Pt1 的地址 */
   Pt2 = &Pt1;
 
   /* 使用 pptr 获取值 */
   printf("var = %d\n", V );
   printf("Pt1 = %p\n", Pt1 );
   printf("*Pt1 = %d\n", *Pt1 );
    printf("Pt2 = %p\n", Pt2 );
   printf("**Pt2 = %d\n", **Pt2);
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
var = 100
Pt1 = 0x7ffee2d5e8d8
*Pt1 = 100
Pt2 = 0x7ffee2d5e8d0
**Pt2 = 100
```

## 2.7传递指针给函数

C 语言允许您传递指针给函数，只需要简单地声明函数参数为指针类型即可。

下面的实例中，我们传递一个无符号的 long 型指针给函数，并在函数内改变这个值：

```C
#include <stdio.h>
#include <time.h>
 
void getSeconds(unsigned long *par);

int main ()
{
   unsigned long sec;


   getSeconds( &sec );

   /* 输出实际值 */
   printf("Number of seconds: %ld\n", sec );

   return 0;
}

void getSeconds(unsigned long *par)
{
   /* 获取当前的秒数 */
   *par = time( NULL );
   return;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
Number of seconds :1294450468
```

能接受指针作为参数的函数，也能接受数组作为参数，如下所示：

```C
#include <stdio.h>
 
/* 函数声明 */
double getAverage(int *arr, int size);
 
int main ()
{
   /* 带有 5 个元素的整型数组  */
   int balance[5] = {1000, 2, 3, 17, 50};
   double avg;
 
   /* 传递一个指向数组的指针作为参数 */
   avg = getAverage( balance, 5 ) ;
 
   /* 输出返回值  */
   printf("Average value is: %f\n", avg );
    
   return 0;
}

double getAverage(int *arr, int size)
{
  int    i, sum = 0;       
  double avg;          
 
  for (i = 0; i < size; ++i)
  {
    sum += arr[i];
  }
 
  avg = (double)sum / size;
 
  return avg;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
Average value is: 214.40000
```

2.8从函数返回指针

在上一章中，我们已经了解了 C 语言中如何从函数返回数组，类似地，C 允许您从函数返回指针。为了做到这点，您必须声明一个返回指针的函数，如下所示：

```
int * myFunction()
{
.
.
.
}
```

另外，C 语言不支持在调用函数时返回局部变量的地址，除非定义局部变量为 **static** 变量。

现在，让我们来看下面的函数，它会生成 10 个随机数，并使用表示指针的数组名（即第一个数组元素的地址）来返回它们，具体如下：

```C
#include <stdio.h>
#include <time.h>
#include <stdlib.h> 
 
/* 要生成和返回随机数的函数 */
int * getRandom( )
{
   static int  r[10];
   int i;
 
   /* 设置种子 */
   srand( (unsigned)time( NULL ) );
   for ( i = 0; i < 10; ++i)
   {
      r[i] = rand();
      printf("%d\n", r[i] );
   }
 
   return r;
}
 
/* 要调用上面定义函数的主函数 */
int main ()
{
   /* 一个指向整数的指针 */
   int *p;
   int i;
 
   p = getRandom();
   for ( i = 0; i < 10; i++ )
   {
       printf("*(p + [%d]) : %d\n", i, *(p + i) );
   }
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
1523198053
1187214107
1108300978
430494959
1421301276
930971084
123250484
106932140
1604461820
149169022
*(p + [0]) : 1523198053
*(p + [1]) : 1187214107
*(p + [2]) : 1108300978
*(p + [3]) : 430494959
*(p + [4]) : 1421301276
*(p + [5]) : 930971084
*(p + [6]) : 123250484
*(p + [7]) : 106932140
*(p + [8]) : 1604461820
*(p + [9]) : 149169022
```

> 笔记来源：菜鸟教程