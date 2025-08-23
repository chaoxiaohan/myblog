---
title: C语言学习笔记-条件、循环、数组（三）
date: 2024-09-21 00:00:00
type: paper
photos: 
excerpt: 本文围绕 C 语言的条件语句（if、switch）、循环语句（while、for 等）及数组展开，详解其语法、用法与实例，助你掌握这些基础且关键的编程结构。
tags:
  - Virual Studio
  - C
  - learn
---

# 一.条件语句

## 1.1 if语句

C 语言中 **if...else** 语句的语法：

```C
if(boolean_expression)
{
   /* 如果布尔表达式为真将执行的语句 */
}
else
{
   /* 如果布尔表达式为假将执行的语句 */
}
```

如果布尔表达式为 **true**，则执行 **if** 块内的代码。如果布尔表达式为 **false**，则执行 **else** 块内的代码。

C 语言把任何**非零**和**非空**的值假定为 **true**，把**零**或 **null** 假定为 **false**。

```C
#include <stdio.h>
 
int main ()
{
   /* 局部变量定义 */
   int a = 100;
 
   /* 检查布尔条件 */
   if( a < 20 )
   {
       /* 如果条件为真，则输出下面的语句 */
       printf("a 小于 20\n" );
   }
   else
   {
       /* 如果条件为假，则输出下面的语句 */
       printf("a 大于 20\n" );
   }
   printf("a 的值是 %d\n", a);
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
a 大于 20
a 的值是 100
```

## 1.2 if...else if...else 语句

一个 **if** 语句后可跟一个可选的 **else if...else** 语句，这可用于测试多种条件。

当使用 if...else if...else 语句时，以下几点需要注意：

- 一个 if 后可跟零个或一个 else，else 必须在所有 else if 之后。
- 一个 if 后可跟零个或多个 else if，else if 必须在 else 之前。
- 一旦某个 else if 匹配成功，其他的 else if 或 else 将不会被测试。

```C
if(boolean_expression 1)
{
   /* 当布尔表达式 1 为真时执行 */
}
else if( boolean_expression 2)
{
   /* 当布尔表达式 2 为真时执行 */
}
else if( boolean_expression 3)
{
   /* 当布尔表达式 3 为真时执行 */
}
else 
{
   /* 当上面条件都不为真时执行 */
}

```

## 1.3 switch语句

switch 语句是一种有限制的控制流语句，它用于根据表达式的值执行不同的代码块。

一个 **switch** 语句允许测试一个变量等于多个值时的情况，每个值称为一个 case，且被测试的变量会对每个 **switch case** 进行检查。

C 语言中 **switch** 语句的语法：

```C
switch(expression){
    case constant-expression  :
       statement(s);
       break; /* 可选的 */
    case constant-expression  :
       statement(s);
       break; /* 可选的 */
  
    /* 您可以有任意数量的 case 语句 */
    default : /* 可选的 */
       statement(s);
}
```

**switch 语句说明：**

- switch 后面的表达式的值将会与每个 case 后面的常量值进行比较，直到找到匹配的值或者执行到 default（如果存在）。
- 如果找到匹配的值，将执行相应 case 后面的代码块，然后跳出 switch 语句。
- 如果没有匹配的值，并且有 default，则执行 default 后面的代码块。
- 如果没有匹配的值，并且没有 default，则跳过整个 switch 语句直到结束。

**switch** 语句必须遵循下面的规则：

- **switch 表达式的类型：** switch 语句中的表达式必须是整数类型（char、short、int或枚举），或者是能够隐式转换为整数类型的表达式。
- **case 标签的唯一性：** 在 switch 语句中，每个 case 标签必须是唯一的，不能有重复的值。
- **默认情况的可选性：** switch 语句中的 default 标签是可选的。如果没有匹配的 case 标签，则会执行 default 标签下的代码块（如果存在）。
- **case 标签中的常量值：** case 标签后面的值必须是一个常量表达式，这意味着它的值在编译时就能确定。
- **case 标签的顺序：** switch 语句中的 case 标签的顺序并不重要，它们可以按照任意顺序编写。程序会按照 case 标签出现的顺序依次匹配。
- **break 语句的使用：** 在每个 case 标签的代码块结束处通常需要使用 break 语句来终止 switch 语句的执行。如果没有 break 语句，程序将会继续执行下一个 case 标签中的代码，直到遇到 break 语句或 switch 语句结束。
- **switch 语句的嵌套：** switch 语句可以嵌套在其他 switch 语句中，但是需要注意代码的可读性和复杂性。
- **case 标签和表达式的范围：** switch 语句的 case 标签可以是整数常量表达式，但不能是浮点数或字符串。

# 二.循环语句

有的时候，我们可能需要多次执行同一块代码。一般情况下，语句是按顺序执行的：函数中的第一个语句先执行，接着是第二个语句，依此类推。

编程语言提供了更为复杂执行路径的多种控制结构。

循环语句允许我们多次执行一个语句或语句组

## 2.1while循环

C 语言中 **while** 循环的语法：

```
while(condition)
{
   statement(s);
}
```

在这里，**statement(s)** 可以是一个单独的语句，也可以是几个语句组成的代码块。

**condition** 可以是任意的表达式，当为任意非零值时都为 true。当条件为 true 时执行循环。 当条件为 false 时，退出循环，程序流将继续执行紧接着循环的下一条语句。

```C
#include <stdio.h>
 
int main ()
{
  */\* 局部变量定义 \*/*
  int a = 10;

  */\* while 循环执行 \*/*
  while( a < 20 )
  {
   printf("a 的值： %d**\n**", a);
   a++;
  }
 
  return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
a 的值： 10
a 的值： 11
a 的值： 12
a 的值： 13
a 的值： 14
a 的值： 15
a 的值： 16
a 的值： 17
a 的值： 18
a 的值： 19
```

## 2.2for循环

C 语言中 **for** 循环的语法：

for ( init; condition; increment ) {   statement(s); }

下面是 for 循环的控制流：

1. **init** 会首先被执行，且只会执行一次。这一步允许您声明并初始化任何循环控制变量。您也可以不在这里写任何语句，只要有一个分号出现即可。

2. 接下来，会判断 **condition**。如果为真，则执行循环主体。如果为假，则不执行循环主体，且控制流会跳转到紧接着 for 循环的下一条语句。

3. 在执行完 for 循环主体后，控制流会跳回上面的 **increment** 语句。该语句允许您更新循环控制变量。该语句可以留空，只要在条件后有一个分号出现即可。

4. 条件再次被判断。如果为真，则执行循环，这个过程会不断重复（循环主体，然后增加步值，再然后重新判断条件）。在条件变为假时，for 循环终止。

   ```C
   #include <stdio.h>
    
   int main ()
   {
      /* for 循环执行 */
      for( int a = 10; a < 20; a = a + 1 )
      {
         printf("a 的值： %d\n", a);
      }
    
      return 0;
   }
   ```

   当上面的代码被编译和执行时，它会产生下列结果：

   ```
   a 的值： 10
   a 的值： 11
   a 的值： 12
   a 的值： 13
   a 的值： 14
   a 的值： 15
   a 的值： 16
   a 的值： 17
   a 的值： 18
   a 的值： 19
   ```

## 2.3do...while循环

不像 **for** 和 **while** 循环，它们是在循环头部测试循环条件。在 C 语言中，**do...while** 循环是在循环的尾部检查它的条件。

**do...while** 循环与 while 循环类似，但是 do...while 循环会确保至少执行一次循环。

C 语言中 **do...while** 循环的语法：

```C
do
{
   statement(s);

}while( condition );
```

请注意，条件表达式出现在循环的尾部，所以循环中的 statement(s) 会在条件被测试之前至少执行一次。

如果条件为真，控制流会跳转回上面的 do，然后重新执行循环中的 statement(s)。这个过程会不断重复，直到给定条件变为假为止。

```C
#include <stdio.h>
 
int main ()
{
  */\* 局部变量定义 \*/*
  int a = 10;

  */\* do 循环执行，在条件被测试之前至少执行一次 \*/*
  do
  {
    printf("a 的值： %d**\n**", a);
    a = a + 1;
  }while( a < 20 );
 
  return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
a 的值： 10
a 的值： 11
a 的值： 12
a 的值： 13
a 的值： 14
a 的值： 15
a 的值： 16
a 的值： 17
a 的值： 18
a 的值： 19
```

## 2.4break语句

C 语言中 **break** 语句有以下两种用法：

1. 当 **break** 语句出现在一个循环内时，循环会立即终止，且程序流将继续执行紧接着循环的下一条语句。
2. 它可用于终止 **switch** 语句中的一个 case。

如果您使用的是嵌套循环（即一个循环内嵌套另一个循环），break 语句会停止执行最内层的循环，然后开始执行该块之后的下一行代码。

C 语言中 **break** 语句的语法：

```
break;
```

![img](https://www.runoob.com/wp-content/uploads/2014/09/c-break-statement-works.jpg)

```C
#include <stdio.h>
 
int main ()
{
   /* 局部变量定义 */
   int a = 10;

   /* while 循环执行 */
   while( a < 20 )
   {
      printf("a 的值： %d\n", a);
      a++;
      if( a > 15)
      {
         /* 使用 break 语句终止循环 */
          break;
      }
   }
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
a 的值： 10
a 的值： 11
a 的值： 12
a 的值： 13
a 的值： 14
a 的值： 15
```

## 2.5continue语句

C 语言中的 **continue** 语句有点像 **break** 语句。但它不是强制终止，continue 会跳过当前循环中的代码，强迫开始下一次循环。

对于 **for** 循环，**continue** 语句执行后自增语句仍然会执行。对于 **while** 和 **do...while** 循环，**continue** 语句重新执行条件判断语句。

C 语言中 **continue** 语句的语法：

```
continue;
```

![img](https://www.runoob.com/wp-content/uploads/2014/09/c-continue-statement-works.jpg)

```C
#include <stdio.h>
 
int main ()
{
   /* 局部变量定义 */
   int a = 10;

   /* do 循环执行 */
   do
   {
      if( a == 15)
      {
         /* 跳过迭代 */
         a = a + 1;
         continue;
      }
      printf("a 的值： %d\n", a);
      a++;
     
   }while( a < 20 );
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
a 的值： 10
a 的值： 11
a 的值： 12
a 的值： 13
a 的值： 14
a 的值： 16
a 的值： 17
a 的值： 18
a 的值： 19
```

## 2.6goto语句

C 语言中的 **goto** 语句允许把控制无条件转移到同一函数内的被标记的语句。

**注意：**在任何编程语言中，都不建议使用 goto 语句。因为它使得程序的控制流难以跟踪，使程序难以理解和难以修改。任何使用 goto 语句的程序可以改写成不需要使用 goto 语句的写法。

C 语言中 **goto** 语句的语法：

```
goto label;
..
.
label: statement;
```

在这里，**label** 可以是任何除 C 关键字以外的纯文本，它可以设置在 C 程序中 **goto** 语句的前面或者后面。

![img](https://www.runoob.com/wp-content/uploads/2015/01/goto.png)

```C
#include <stdio.h>
 
int main ()
{
   /* 局部变量定义 */
   int a = 10;
 
   /* do 循环执行 */
   LOOP:do
   {
      if( a == 15)
      {
         /* 跳过迭代 */
         a = a + 1;
         goto LOOP;
      }
      printf("a 的值： %d\n", a);
      a++;
     
   }while( a < 20 );
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
a 的值： 10
a 的值： 11
a 的值： 12
a 的值： 13
a 的值： 14
a 的值： 16
a 的值： 17
a 的值： 18
a 的值： 19
```

# 三.数组

C 语言支持**数组**数据结构，它可以存储一个固定大小的相同类型元素的顺序集合。数组是用来存储一系列数据，但它往往被认为是一系列相同类型的变量。

数组的声明并不是声明一个个单独的变量，比如 runoob0、runoob1、...、runoob99，而是声明一个数组变量，比如 runoob，然后使用 runoob[0]、runoob[1]、...、runoob[99] 来代表一个个单独的变量。

所有的数组都是由连续的内存位置组成。最低的地址对应第一个元素，最高的地址对应最后一个元素。

![C 中的数组](https://www.runoob.com/wp-content/uploads/2014/09/c-arrays-2021-1-18-3.png)

数组中的特定元素可以通过索引访问，第一个索引值为 **0**。

C 语言还允许我们使用指针来处理数组，这使得对数组的操作更加灵活和高效。

![img](https://www.runoob.com/wp-content/uploads/2014/09/c-array-2021-01-18-2.png)

## 3.1数组基础

### 3.1.1声明数组

在 C 中要声明一个数组，需要指定元素的类型和元素的数量，如下所示：

```
type arrayName [ arraySize ];
```

这叫做一维数组。**arraySize** 必须是一个大于零的整数常量，**type** 可以是任意有效的 C 数据类型。例如，要声明一个类型为 double 的包含 10 个元素的数组 **balance**，声明语句如下：

```
double balance[10];
```

现在 *balance* 是一个可用的数组，可以容纳 10 个类型为 double 的数字。

### 3.1.2初始化数组

在 C 中，您可以逐个初始化数组，也可以使用一个初始化语句，如下所示：

```
double balance[5] = {1000.0, 2.0, 3.4, 7.0, 50.0};
```

大括号 { } 之间的值的数目不能大于我们在数组声明时在方括号 [ ] 中指定的元素数目。

如果您省略掉了数组的大小，数组的大小则为初始化时元素的个数。因此，如果：

```
double balance[] = {1000.0, 2.0, 3.4, 7.0, 50.0};
```

您将创建一个数组，它与前一个实例中所创建的数组是完全相同的。下面是一个为数组中某个元素赋值的实例：

```
balance[4] = 50.0;
```

上述的语句把数组中第五个元素的值赋为 50.0。所有的数组都是以 0 作为它们第一个元素的索引，也被称为基索引，数组的最后一个索引是数组的总大小减去 1。以下是上面所讨论的数组的的图形表示：

![数组表示](https://www.runoob.com/wp-content/uploads/2014/09/c-arrays-2021-1-18-4.png)

下图是一个长度为 **10** 的数组，第一个元素的索引值为 **0**，第九个元素 **runoob** 的索引值为 **8**:

![img](https://www.runoob.com/wp-content/uploads/2014/09/c-array-2021-01-18-2.png)

### 3.1.3访问数组元素

数组元素可以通过数组名称加索引进行访问。元素的索引是放在方括号内，跟在数组名称的后边。例如：

```
double salary = balance[9];
```

上面的语句将把数组中第 10 个元素的值赋给 salary 变量。下面的实例使用了上述的三个概念，即，声明数组、数组赋值、访问数组：

```C
#include <stdio.h>
 
int main ()
{
   int n[ 10 ]; /* n 是一个包含 10 个整数的数组 */
   int i,j;
 
   /* 初始化数组元素 */         
   for ( i = 0; i < 10; i++ )
   {
      n[ i ] = i + 100; /* 设置元素 i 为 i + 100 */
   }
   
   /* 输出数组中每个元素的值 */
   for (j = 0; j < 10; j++ )
   {
      printf("Element[%d] = %d\n", j, n[j] );
   }
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
Element[0] = 100
Element[1] = 101
Element[2] = 102
Element[3] = 103
Element[4] = 104
Element[5] = 105
Element[6] = 106
Element[7] = 107
Element[8] = 108
Element[9] = 109
```

### 3.1.4获取数组长度

数组长度可以使用 **sizeof** 运算符来获取数组的长度，例如：

```
int numbers[] = {1, 2, 3, 4, 5};
int length = sizeof(numbers) / sizeof(numbers[0]);
```

```C
#include <stdio.h>

int main() {
    int array[] = {1, 2, 3, 4, 5};
    int length = sizeof(array) / sizeof(array[0]);

    printf("数组长度为: %d\n", length);

    return 0;
}
```

使用宏定义：

```C
#include <stdio.h>

#define LENGTH(array) (sizeof(array) / sizeof(array[0]))

int main() {
    int array[] = {1, 2, 3, 4, 5};
    int length = LENGTH(array);

    printf("数组长度为: %d\n", length);

    return 0;
}
```

以上实例输出结果为：

```
数组长度为: 5
```

### 3.1.5数组名

在 C 语言中，数组名表示数组的地址，即数组首元素的地址。当我们在声明和定义一个数组时，该数组名就代表着该数组的地址。

例如，在以下代码中：

```
int myArray[5] = {10, 20, 30, 40, 50};
```

在这里，myArray 是数组名，它表示整数类型的数组，包含 5 个元素。myArray 也代表着数组的地址，即第一个元素的地址。

数组名本身是一个常量指针，意味着它的值是不能被改变的，一旦确定，就不能再指向其他地方。

我们可以使用&运算符来获取数组的地址，如下所示：

```
int myArray[5] = {10, 20, 30, 40, 50};
int *ptr = &myArray[0]; // 或者直接写作 int *ptr = myArray;
```

在上面的例子中，ptr 指针变量被初始化为 myArray 的地址，即数组的第一个元素的地址。

需要注意的是，虽然数组名表示数组的地址，但在大多数情况下，数组名会自动转换为指向数组首元素的指针。这意味着我们可以直接将数组名用于指针运算，例如在函数传递参数或遍历数组时：

```C
void printArray(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]); // 数组名arr被当作指针使用
    }
}

int main() {
    int myArray[5] = {10, 20, 30, 40, 50};
    printArray(myArray, 5); // 将数组名传递给函数
    return 0;
}
```

在上述代码中，printArray 函数接受一个整数数组和数组大小作为参数，我们将 myArray 数组名传递给函数，函数内部可以像使用指针一样使用 arr 数组名。

## 3.2多维数组

C 语言支持多维数组。多维数组声明的一般形式如下：

```
type name[size1][size2]...[sizeN];
```

例如，下面的声明创建了一个三维 5 . 10 . 4 整型数组：

```
int threedim[5][10][4];
```

### 3.2.1二维数组

多维数组最简单的形式是二维数组。一个二维数组，在本质上，是一个一维数组的列表。声明一个 x 行 y 列的二维整型数组，形式如下：

```
type arrayName [ x ][ y ];
```

其中，**type** 可以是任意有效的 C 数据类型，**arrayName** 是一个有效的 C 标识符。一个二维数组可以被认为是一个带有 x 行和 y 列的表格。下面是一个二维数组，包含 3 行和 4 列：

```
int x[3][4];
```

![C 中的二维数组](https://www.runoob.com/wp-content/uploads/2014/09/two_dimensional_arrays.jpg)

因此，数组中的每个元素是使用形式为 a[ i , j ] 的元素名称来标识的，其中 a 是数组名称，i 和 j 是唯一标识 a 中每个元素的下标。

### 3.2.2初始化二维数组

多维数组可以通过在括号内为每行指定值来进行初始化。下面是一个带有 3 行 4 列的数组。

```
int a[3][4] = {  
 {0, 1, 2, 3} ,   /*  初始化索引号为 0 的行 */
 {4, 5, 6, 7} ,   /*  初始化索引号为 1 的行 */
 {8, 9, 10, 11}   /*  初始化索引号为 2 的行 */
};
```

内部嵌套的括号是可选的，下面的初始化与上面是等同的：

```
int a[3][4] = {0,1,2,3,4,5,6,7,8,9,10,11};
```

### 3.2.3访问二维数组元素

二维数组中的元素是通过使用下标（即数组的行索引和列索引）来访问的。例如：

```
int val = a[2][3];
```

上面的语句将获取数组中第 3 行第 4 个元素。您可以通过上面的示意图来进行验证。让我们来看看下面的程序，我们将使用嵌套循环来处理二维数组：

```C
#include <stdio.h>
 
int main ()
{
   /* 一个带有 5 行 2 列的数组 */
   int a[5][2] = { {0,0}, {1,2}, {2,4}, {3,6},{4,8}};
   int i, j;
 
   /* 输出数组中每个元素的值 */
   for ( i = 0; i < 5; i++ )
   {
      for ( j = 0; j < 2; j++ )
      {
         printf("a[%d][%d] = %d\n", i,j, a[i][j] );
      }
   }
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
a[0][0] = 0
a[0][1] = 0
a[1][0] = 1
a[1][1] = 2
a[2][0] = 2
a[2][1] = 4
a[3][0] = 3
a[3][1] = 6
a[4][0] = 4
a[4][1] = 8
```

## 3.3传递数组给函数

如果您想要在函数中传递一个一维数组作为参数，您必须以下面三种方式来声明函数形式参数，这三种声明方式的结果是一样的，因为每种方式都会告诉编译器将要接收一个整型指针。同样地，您也可以传递一个多维数组作为形式参数。

方式 1

形式参数是一个指针（您可以在下一章中学习到有关指针的知识）：

void myFunction(int *param) { . . . }

方式 2

形式参数是一个已定义大小的数组：

void myFunction(int param[10]) { . . . }

方式 3

形式参数是一个未定义大小的数组：

void myFunction(int param[]) { . . . }

现在，让我们来看下面这个函数，它把数组作为参数，同时还传递了另一个参数，根据所传的参数，会返回数组中元素的平均值：

```C
double getAverage(int arr[], int size)
{
  int    i;
  double avg;
  double sum;
 
  for (i = 0; i < size; ++i)
  {
    sum += arr[i];
  }
 
  avg = sum / size;
 
  return avg;
}
```

现在，让我们调用上面的函数，如下所示：

```C
#include <stdio.h>
 
/* 函数声明 */
double getAverage(int arr[], int size);
 
int main ()
{
   /* 带有 5 个元素的整型数组 */
   int balance[5] = {1000, 2, 3, 17, 50};
   double avg;
 
   /* 传递一个指向数组的指针作为参数 */
   avg = getAverage( balance, 5 ) ;
 
   /* 输出返回值 */
   printf( "平均值是： %f ", avg );
    
   return 0;
}
 
double getAverage(int arr[], int size)
{
  int    i;
  double avg;
  double sum=0;
 
  for (i = 0; i < size; ++i)
  {
    sum += arr[i];
  }
 
  avg = sum / size;
 
  return avg;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```
平均值是： 214.400000
```

## 3.4从函数返回数组

C 语言不允许返回一个完整的数组作为函数的参数。但是，您可以通过指定不带索引的数组名来返回一个指向数组的指针。我们将在下一章中讲解有关指针的知识，您可以先跳过本章，等了解了 C 指针的概念之后，再来学习本章的内容。

如果您想要从函数返回一个一维数组，您必须声明一个返回指针的函数，如下：

int * myFunction() { . . . }

另外，C 不支持在函数外返回局部变量的地址，除非定义局部变量为 **static** 变量。

现在，让我们来看下面的函数，它会生成 10 个随机数，并使用数组来返回它们，具体如下：

```C
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
 
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
     printf( "r[%d] = %d\n", i, r[i]);
 
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
       printf( "*(p + %d) : %d\n", i, *(p + i));
   }
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
r[0] = 313959809
r[1] = 1759055877
r[2] = 1113101911
r[3] = 2133832223
r[4] = 2073354073
r[5] = 167288147
r[6] = 1827471542
r[7] = 834791014
r[8] = 1901409888
r[9] = 1990469526
*(p + 0) : 313959809
*(p + 1) : 1759055877
*(p + 2) : 1113101911
*(p + 3) : 2133832223
*(p + 4) : 2073354073
*(p + 5) : 167288147
*(p + 6) : 1827471542
*(p + 7) : 834791014
*(p + 8) : 1901409888
*(p + 9) : 1990469526
```

## 3.5指向数组的指针

您可以先跳过本章，等了解了 C 指针的概念之后，再来学习本章的内容。

如果您对 C 语言中指针的概念有所了解，那么就可以开始本章的学习。

组名本身是一个常量指针，意味着它的值是不能被改变的，一旦确定，就不能再指向其他地方。

因此，在下面的声明中：

```
double balance[50];
```

**balance** 是一个指向 &balance[0] 的指针，即数组 balance 的第一个元素的地址。因此，下面的程序片段把 **p** 赋值为 **balance** 的第一个元素的地址：

```
double *p;
double balance[10];

p = balance;
```

使用数组名作为常量指针是合法的，反之亦然。因此，*(balance + 4) 是一种访问 balance[4] 数据的合法方式。

一旦您把第一个元素的地址存储在 p 中，您就可以使用 *p、*(p+1)、*(p+2) 等来访问数组元素。下面的实例演示了上面讨论到的这些概念：

```C
#include <stdio.h>
 
int main ()
{
   /* 带有 5 个元素的整型数组 */
   double balance[5] = {1000.0, 2.0, 3.4, 17.0, 50.0};
   double *p;
   int i;
 
   p = balance;
 
   /* 输出数组中每个元素的值 */
   printf( "使用指针的数组值\n");
   for ( i = 0; i < 5; i++ )
   {
       printf("*(p + %d) : %f\n",  i, *(p + i) );
   }
 
   printf( "使用 balance 作为地址的数组值\n");
   for ( i = 0; i < 5; i++ )
   {
       printf("*(balance + %d) : %f\n",  i, *(balance + i) );
   }
 
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```C
使用指针的数组值
*(p + 0) : 1000.000000
*(p + 1) : 2.000000
*(p + 2) : 3.400000
*(p + 3) : 17.000000
*(p + 4) : 50.000000
使用 balance 作为地址的数组值
*(balance + 0) : 1000.000000
*(balance + 1) : 2.000000
*(balance + 2) : 3.400000
*(balance + 3) : 17.000000
*(balance + 4) : 50.000000
```

在上面的实例中，p 是一个指向 double 型的指针，这意味着它可以存储一个 double 类型的变量。一旦我们有了 p 中的地址，***p** 将给出存储在 p 中相应地址的值，正如上面实例中所演示的。

## 3.6静态数组和动态数组

在 C 语言中，有两种类型的数组：

- 静态数组：编译时分配内存，大小固定。
- 动态数组：运行时手动分配内存，大小可变。

静态数组的生命周期与作用域相关，而动态数组的生命周期由程序员控制。

在使用动态数组时，需要注意合理地分配和释放内存，以避免内存泄漏和访问无效内存的问题。

------

### 3.6.1静态数组

静态数组是指在编译时确定大小的数组，其大小在程序运行期间不能改变。

在 C 语言中，静态数组的内存分配在栈区，通常使用方括号 **[]** 来定义。

静态数组的特点包括：

- 内存分配：静态数组的内存通常分配在栈上，随着函数的调用和返回而自动管理。
- 大小固定：在定义时指定大小，且在程序运行过程中不能更改。
- 效率：由于在栈上分配内存，访问速度较快。
- 生命周期：静态数组的生命周期始于其定义时。如果在函数内部定义，生命周期与函数的调用相同；如果在全局范围定义，生命周期贯穿整个程序运行。

静态数组的声明和初始化示例：

```
int staticArray[5]; // 静态数组声明
int staticArray[] = {1, 2, 3, 4, 5}; // 静态数组声明并初始化
```

对于静态数组，可以使用 sizeof 运算符来获取数组长度，例如：

```
int array[] = {1, 2, 3, 4, 5};
int length = sizeof(array) / sizeof(array[0]);
```

以上代码中 sizeof(array) 返回整个数组所占用的字节数，而 sizeof(array[0]) 返回数组中单个元素的字节数，将两者相除，就得到了数组的长度。

以上是一个简单的静态数组实例：

```C
#include <stdio.h>

int main() {
    int staticArray[] = {1, 2, 3, 4, 5}; // 静态数组声明并初始化
    int length = sizeof(staticArray) / sizeof(staticArray[0]);

    printf("静态数组: ");
    for (int i = 0; i < length; i++) {
        printf("%d ", staticArray[i]);
    }
    printf("\n");

    return 0;
}
```

以上实例中，我们声明并初始化了一个静态数组 staticArray，它包含了 5 个整数元素，然后我们通过 sizeof 运算符，我们计算了静态数组的长度，并使用循环遍历并打印数组的元素。

输出结果：

```
静态数组: 1 2 3 4 5
```

------

### 3.6.2动态数组

动态数组是在运行时通过动态内存分配函数（如 **malloc** 和 **calloc**）手动分配内存的数组。

动态数组特点如下：

- 内存分配：动态数组的内存空间在运行时通过动态内存分配函数手动分配，并存储在堆上。需要使用 `malloc`、`calloc` 等函数来申请内存，并使用 `free` 函数来释放内存。
- 大小可变：动态数组的大小在运行时可以根据需要进行调整。可以使用 `realloc` 函数来重新分配内存，并改变数组的大小。
- 生命周期：动态数组的生命周期由程序员控制。需要在使用完数组后手动释放内存，以避免内存泄漏。

动态数组的声明、内存分配和释放实例：

```
int size = 5;
int *dynamicArray = (int *)malloc(size * sizeof(int)); // 动态数组内存分配
// 使用动态数组
free(dynamicArray); // 动态数组内存释放
```

动态分配的数组，可以在动态分配内存时保存数组长度，并在需要时使用该长度，例如：

```
int size = 5; // 数组长度
int *array = malloc(size * sizeof(int));

// 使用数组

free(array); // 释放内存
```

以上代码我们使用 malloc 函数动态分配了一个整型数组，并将长度保存在变量 size 中。然后可以根据需要使用这个长度进行操作，在使用完数组后，使用 free 函数释放内存。

> **注意：**动态数组的使用需要注意内存管理的问题，确保在不再需要使用数组时释放内存，避免内存泄漏和访问无效的内存位置。

以上是一个简单的动态数组使用实例：

```C
#include <stdio.h>
#include <stdlib.h>

int main() {
    int size = 5;
    int *dynamicArray = (int *)malloc(size * sizeof(int)); // 动态数组内存分配

    if (dynamicArray == NULL) {
        printf("Memory allocation failed.\n");
        return 1;
    }

    printf("Enter %d elements: ", size);
    for (int i = 0; i < size; i++) {
        scanf("%d", &dynamicArray[i]);
    }

    printf("Dynamic Array: ");
    for (int i = 0; i < size; i++) {
        printf("%d ", dynamicArray[i]);
    }
    printf("\n");

    free(dynamicArray); // 动态数组内存释放

    return 0;
}
```

以上实例中，我们首先声明了一个变量 size 来指定动态数组的大小。

然后使用 malloc 函数为动态数组分配内存，并通过 sizeof 运算符计算所需的内存大小。

接下来，通过循环和 scanf 函数，从用户输入中读取元素值并存储到动态数组中。

最后，使用循环遍历并打印动态数组的元素。在程序结束时，使用 free 函数释放动态数组所占用的内存。

请注意，在使用动态数组时，需要检查内存分配是否成功（即 dynamicArray 是否为 NULL），以避免在内存分配失败时发生错误。

> 笔记来源：菜鸟教程
