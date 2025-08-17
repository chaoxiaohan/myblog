---
title: 安卓学习笔记（一）
date: 2025-08-01 00:00:00
type: paper
photos: https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/androidNote1.png
tags:
  - Android
  - Kotlin
  - learn
---

## Kotlin创建和使用变量

### 数据类型

![image-20250718104812545](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20250718104812545.png)

![image-20250718104842561](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20250718104842561.png)



- `val` 关键字 - 预计变量值不会变化时使用。

- `var` 关键字 - 预计变量值会发生变化时使用。

  

## Kotlin创建和使用函数

![image-20250718110638822](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20250718110638822.png)

### 传入形参

![image-20250718111529864](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20250718111529864.png)

```kotlin
fun birthdayGreeting(name: String): String {
    val nameGreeting = "Happy Birthday, Rover!"
    val ageGreeting = "You are now 5 years old!"
    return "$nameGreeting\n$ageGreeting"
}
```

### 函数语法

![image-20250718183828848](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20250718183828848.png)

### 具名实参

![image-20250718184140936](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20250718184140936.png)

### 默认实参

![image-20250718184318075](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20250718184318075.png)

## 文本元素

```kotlin
@Composable
fun GreetingText(message: String, from: String, modifier: Modifier = Modifier) {
    Column(//纵向布局
        verticalArrangement = Arrangement.Center,//中心布局
        modifier = modifier
    ) {
        Text(//显示文本
            text = message,
            fontSize = 100.sp,//字号大小（sp为可缩放像素）
            lineHeight = 116.sp,//行高
            textAlign = TextAlign.Center//文本居中对齐
        )
        Text(
            text = from,
            fontSize = 36.sp,
            modifier = Modifier
                .padding(16.dp)
                .align(alignment = Alignment.End)//右对齐
        )
    }
}
```

### 文本布局

选择方式：选择两个 `Text` 可组合项，然后点击灯泡。依次选择 **Surround with widget** > **Surround with Row**

![image-20250719181143222](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20250719181143222.png)

## 图片元素

### 添加图片

1. 在 Android Studio 中，依次点击 **View > Tool Windows > Resource Manager**，或点击 **Project** 窗口旁边的 **Resource Manager** 标签页。

![318ae32952de3b49.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/318ae32952de3b49.png?hl=zh-cn)

![2703cd334049774f.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/2703cd334049774f.png?hl=zh-cn)

**注意**：Resource Manager 是一个工具窗口，可供您在应用中导入、创建、管理和使用资源。

1. 依次点击 **+ (Add resources to the module) > Import Drawables**。

![41054199d5299d08.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/41054199d5299d08.png?hl=zh-cn)

1. 在文件浏览器中，选择已下载的图片文件，然后点击 **Open**。

此操作会打开 **Import drawables** 对话框。

![727d06e96adc8b19.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/727d06e96adc8b19.png?hl=zh-cn)

1. Android Studio 会向您显示该图片的预览。从 **QUALIFIER TYPE** 下拉列表中选择 **Density**。后面会介绍为何要执行此操作。

![c8e37d10f3afb21d.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/c8e37d10f3afb21d.png?hl=zh-cn)

1. 从 **VALUE** 列表中选择 **No Density**。

![a8d0554a56c5a6e7.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/a8d0554a56c5a6e7.png?hl=zh-cn)

Android 设备具有不同的屏幕尺寸（手机、平板电脑和电视等），而且这些屏幕也具有不同的像素尺寸。也就是说，有可能一部设备的屏幕为每平方英寸 160 个像素，而另一部设备的屏幕在相同的空间内可以容纳 480 个像素。如果不考虑像素密度的这些变化，系统可能会按比例缩放图片，这可能会导致图片模糊或占用大量内存空间，或者图片大小不当。

如果所调整的图片超出了 Android 系统可处理的图片大小，系统会抛出内存不足错误。对于照片和背景图片（如当前图片 `androidparty.png`），应将其放在 `drawable-nodpi` 文件夹中，这样会停止调整大小行为。

如需详细了解像素密度，请参阅[支持不同的像素密度](https://developer.android.google.cn/training/multiscreen/screendensities?hl=zh-cn)。

1. 点击**下一步**。
2. Android Studio 会显示将在其中放置图片的文件夹结构。请注意 `drawable-nodpi` 文件夹。
3. 点击 **Import(C)**。

![6fbeec4f4d4fa984.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/6fbeec4f4d4fa984.png?hl=zh-cn)

### 访问资源

![R 是自动生成的类；drawable 是 res 文件夹中的子目录；graphic 是资源 ID](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/7f95dd836a249cdc.png?hl=zh-cn)

1. 在 `GreetingImage()` 函数中，声明 `val` 属性并将其命名为 `image`。
2. 通过传入 `androidparty` 资源来调用 [`painterResource()`](https://developer.android.google.cn/reference/kotlin/androidx/compose/ui/res/package-summary?hl=zh-cn#painterResource(kotlin.Int)) 函数。将返回值分配给 `image` 变量。

```kotlin
val image = painterResource(R.drawable.androidparty)
```

### 示例代码

```kotlin
@Composable
fun GreetingImage(message : String, from : String,modifier: Modifier = Modifier) {
    val image = painterResource(R.drawable.androidparty)//传入图片
    Box (modifier) { //使用 Box 布局可将元素堆叠在一起
        Image(
            painter = image,
            contentDescription = null,//不设置面向用户的内容说明
            contentScale = ContentScale.Crop,//缩放内容，使内容填充
            alpha = 0.5F //不透明度
        )
        GreetingText(
            message = message,
            from = from,
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp)
        )
    }
}
```

### 缩放图片内容

多种 [`ContentScale`](https://developer.android.google.cn/reference/kotlin/androidx/compose/ui/layout/ContentScale?hl=zh-cn) [类型](https://developer.android.google.cn/jetpack/compose/graphics/images/customize?hl=zh-cn#content-scale)

### 对齐和排列文本

在 `MainActivity.kt` 文件中，滚动到 `GreetingText()` 函数。此列中的 `verticalArrangement` 属性设置为 `Arrangement.Center`。因此，文本内容将在屏幕上居中。

### 内边距

界面元素会用自身包裹住其内容。为避免包裹地过紧，您可以在每一侧指定内边距大小。

| ![不带内边距的 Text 可组合项](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/f5ec4094db454c65.png?hl=zh-cn) | ![带内边距的 Text 可组合项](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/95e98cb1a1f6d3b3.png?hl=zh-cn) |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
|                                                              |                                                              |

内边距将作为修饰符使用，这意味着您可以将其应用于任何可组合项。对于可组合项的每一侧，`padding` 修饰符都接受一个可选实参，该实参定义了内边距的大小。

![该示意图显示了 top、start、bottom 和 end 四个方向的内边距](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/2e96e127f9f8c7.png?hl=zh-cn)

```kotlin
// This is an example.
Modifier.padding(
    start = 16.dp,
    top = 16.dp,
    end = 16.dp,
    bottom = 16.dp
)
```

### 字符串提取到资源文件

1. 点击屏幕左侧的灯泡。
2. 选择 **Extract string resource**。

![bd8451ea9a2aee25.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/bd8451ea9a2aee25.png?hl=zh-cn)

Android Studio 将打开 **Extract Resource** 对话框。在此对话框中，您可以自定义字符串资源的名称以及有关如何存储该资源的一些详细信息。**Resource name** 字段用于输入字符串的名称。**Resource value** 字段用于输入字符串的实际内容。

1. 在 **Extract Resource** 对话框中，将 **Resource name** 更改为 `happy_birthday_text`。

字符串资源应使用小写名称，并且多个单词之间应使用下划线分隔。将其他设置保留为默认值。

![c110d39102e88e4.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-add-images/img/c110d39102e88e4.png?hl=zh-cn)

1. 点击**确定**。
2. 请注意代码的变化。

硬编码字符串现已替换为对 `getString()` 函数的调用。

```kotlin
GreetingImage(
    message = getString(R.string.happy_birthday_text),
    from = "From Emma",
    modifier = Modifier.padding(8.dp)
)
```

## Kotlin条件

### if语句

if结构

![一个示意图，描述了一个 if 语句，其 if 关键字后跟一对圆括号，圆括号内包含一个条件。后面是一对大括号，大括号内包含正文。正文代码块已突出显示。](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-conditionals/img/f19b3393376d45e9.png?hl=zh-cn)

if分支

![一个示意图，描述了一个 if/else 语句，其 if 关键字后跟圆括号，圆括号内包含条件 1 代码块。后面是一对大括号，大括号内包含正文 1。大括号后面是 else if 关键字，以及包含条件 2 代码块的圆括号。圆括号后面是一对大括号，其中包含正文 2 代码块。再后面是 else 关键字，以及另一对大括号，其中包含正文 3 代码块。](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-conditionals/img/5443fb986621fe14.png?hl=zh-cn)

### when语句

![展示 when 语句详解的示意图。其开头是一个 when 关键字，后跟一对圆括号，圆括号中包含一个形参代码块。接下来是一对大括号，其中包含三行情形代码。每行代码中都包含一个条件代码块，后跟一个箭头符号和一个正文代码块。图中备注称，系统会依序评估每行情形代码。](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-conditionals/img/2f7c0a1e312a2581.png?hl=zh-cn)

使用英文逗号来处理多个条件

![展示 when 语句详解的示意图。其开头是一个 when 关键字，后跟一对圆括号，圆括号中包含一个形参代码块。接下来是一对大括号，其中包含两行情形代码。第一个代码行包含条件 1 代码块，后跟一个英文逗号，接下来是条件 2 正文，再后面是一个箭头符号和一个正文代码块。第二个代码行包含一个条件代码块，后跟一个箭头符号和一个正文代码块。](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-conditionals/img/4e778c4c4c044e51.png?hl=zh-cn)

```kotlin
fun main() {
    val x = 3

    when (x) {
        2, 3, 5, 7 -> println("x is a prime number between 1 and 10.")
        else -> println("x isn't a prime number between 1 and 10.")
    }
}
```

使用in处理一系列条件

![展示 when 语句详解的示意图。其开头是一个 when 关键字，后跟一对圆括号，圆括号中包含一个形参代码块。接下来是一对大括号，其中包含两行情形代码。第一个代码行包含 in 关键字，后跟一个范围起点代码块、两个点、一个范围终点代码块、一个箭头符号以及一个正文代码块。第二个代码行包含一个条件代码块，后跟一个箭头符号和一个正文代码块。](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-conditionals/img/400f940f363bd3c4.png?hl=zh-cn)

```kotlin
fun main() {
    val x = 4

    when (x) {
        2, 3, 5, 7 -> println("x is a prime number between 1 and 10.")
        in 1..10 -> println("x is a number between 1 and 10, but not a prime number.")
        else -> println("x isn't a prime number between 1 and 10.")
    }
}
```

使用is检查数据类型

![展示 when 语句详解的示意图。其开头是一个 when 关键字，后跟一对圆括号，圆括号中包含一个形参代码块。接下来是一对大括号，其中包含两行情形代码。第一个代码行包含一个 in 关键字，后跟一个类型代码块、一个箭头符号以及一个正文代码块。第二个代码行包含一个条件代码块，后跟一个箭头符号和一个正文代码块。](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-conditionals/img/66841365125b37aa.png?hl=zh-cn)

```kotlin
fun main() {
    val x: Any = 4

    when (x) {
        2, 3, 5, 7 -> println("x is a prime number between 1 and 10.")
        in 1..10 -> println("x is a number between 1 and 10, but not a prime number.")
        is Int -> println("x is an integer number, but not between 1 and 10.")
        else -> println("x isn't a prime number between 1 and 10.")
    }
}
```

### 使用if/else或when作为表达式

![一个示意图，描述了一个 if/else 表达式，其 val 关键字后跟一个名称代码块、一个等号、一个 if 关键字、圆括号（其中包含一个条件）、一对大括号（其中包含正文 1 代码块）、一个 else 关键字以及另一对大括号（其中包含一个正文代码块）。](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-conditionals/img/a6ff7ba09d3cdea3.png?hl=zh-cn)

如果正文仅包含一个返回值或表达式，您可以移除大括号，使代码更简洁。

![一个示意图，描述了一个 if/else 表达式，其 val 关键字后跟一个名称代码块、一个等号、一个 if 关键字、圆括号（其中包含一个条件）、一个表达式 1 代码块、一个 else 关键字以及一个表达式 2 代码块。](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-conditionals/img/411c2aff894a72e2.png?hl=zh-cn)

示例代码

```kotlin
fun main() {
    val trafficLightColor = "Black"

    val message = 
      if (trafficLightColor == "Red") "Stop"
      else if (trafficLightColor == "Yellow") "Slow"
      else if (trafficLightColor == "Green") "Go"
      else "Invalid traffic-light color"

    println(message)
}
```

## Kotlin null变量

### 使用方法

```kotlin
fun main() {
    val favoriteActor = null
}
```

如需在 Kotlin 中声明可为 null 的变量，您需要在相应类型的末尾添加 `?` 运算符。例如，`String?` 类型可以存储字符串或 `null`，而 `String` 类型只能存储字符串。如需声明某个可为 null 的变量，您需要明确添加可为 null 类型。如果没有可为 null 类型，Kotlin 编译器会推断该变量属于不可为 null 类型。

![此图展示了如何声明可为 null 类型的变量。这种变量以 var 关键字开头，后面依次是变量块的名称、分号、变量的类型、问号、等号和值块。类型块和问号使用“Nullable type”文字标示，表示该类型后接问号即变成可为 null 类型。](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-nullability/img/c3bbad8de6afdbe9.png?hl=zh-cn)

### 使用?.安全调用运算符

如需使用 `?.` 安全调用运算符访问方法或属性，请在变量名称后面添加 `?` 符号，并使用 `.` 表示法访问方法或属性。

`?.` 安全调用运算符可让您更安全地访问可为 null 的变量，因为 Kotlin 编译器会阻止变量成员为访问 `null` 引用而进行的任何尝试，并针对访问的成员返回 `null`。

如需安全地访问可为 null 的 `favoriteActor` 变量的属性，请按以下步骤操作：

1. 在 `println()` 语句中，将 `.` 运算符替换为 `?.` 安全调用运算符：

```kotlin
fun main() {
    var favoriteActor: String? = "Sandra Oh"
    println(favoriteActor?.length)
}
```

### 使用!!非null断言运算符

![此图展示了可为 null 的变量块，后面依次跟两个感叹号、一个点以及方法或属性块，各项之间没有空格。](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-nullability/img/1a6f269bfd700839.png?hl=zh-cn)

您需要在可为 null 的变量后面添加 `!!` 非 null 断言运算符，之后再跟 `.` 运算符，最后添加不含任何空格的方法或属性。

顾名思义，如果您使用 `!!` 非 null 断言运算符，即表示您断言变量的值不是 `null`，无论变量是否为该值都是如此。

与 `?.` 安全调用运算符不同，当可为 null 的变量确实为 `null` 时，使用 `!!` 非 null 断言运算符可能会导致系统抛出 `NullPointerException` 错误。因此，只有在变量始终为不可为 null 或设置了适当的异常处理时，才应使用该断言运算符。如果异常未得到处理，便会导致运行时错误。您将在本课程后面的单元中了解异常处理。

如需使用 `!!` 非 null 断言运算符访问 `favoriteActor` 变量的属性，请按以下步骤操作：

1. 为 `favoriteActor` 变量重新赋予喜爱演员的名称，然后在 `println()` 语句中将 `?.` 安全调用运算符替换为 `!!` 非 null 断言运算符：

```kotlin
fun main() {
    var favoriteActor: String? = "Sandra Oh"
    println(favoriteActor!!.length)
}
```

### 使用?:Elvis运算符

`?:` Elvis 运算符可以与 `?.` 安全调用运算符搭配使用。如果搭配使用 `?:` Elvis 运算符，您便可以在 `?.` 安全调用运算符返回 `null` 时添加默认值。这与 `if/else` 表达式类似，但更为常用。

如果该变量不为 `null`，则执行 `?:` Elvis 运算符之前的表达式；如果变量为 `null`，则执行 `?:` Elvis 运算符之后的表达式。

![此图展示了 val 关键字，后面依次跟名称块、等号、可为 null 的变量块、问号、点、方法或属性块、问号、冒号以及默认值块。](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-nullability/img/85be2b9161680ecf.png?hl=zh-cn)

## Kotlin类与对象

### 定义类

类定义以 `class` 关键字开头，后面依次跟名称和一对大括号。左大括号之前的语法部分也称为类标头。在大括号之间，您可以指定类的属性和函数。您很快就会学到属性和函数。类定义的语法如以下示意图所示：

![该语法是以类关键字开头，后跟名称和一对左/右大括号。大括号之间包含用于描述蓝图的类主体。](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/9a07f83c06449f38.png?hl=zh-cn)

以下是建议遵循的类命名惯例：

- 可以选择任何想要的类名称，但不要将 Kotlin [关键字](https://kotlinlang.org/docs/keyword-reference.html)用作类名称，例如 `fun` 关键字。
- 类名称采用 PascalCase 大小写形式编写，因此每个单词都以大写字母开头，且各个单词之间没有空格。以“SmartDevice”为例，每个单词的第一个字母都大写，且单词之间没有空格。

类由以下三大部分组成：

- **属性**：用于指定类对象属性的变量。
- **方法**：包含类的行为和操作的函数。
- **构造函数**：一种特殊的成员函数，用于在定义类的整个程序中创建类的实例。

### 创建类的示例

若要使用某个对象，您需要创建该对象，并将其赋给变量，方法与定义变量的方式类似。您可以使用 `val` 关键字来创建不可变变量，使用 `var` 关键字来创建可变变量。`val` 或 `var` 关键字后依次跟变量名称、`=` 赋值运算符和类对象的实例化。语法如下图所示：

![f58430542f2081a9.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/f58430542f2081a9.png?hl=zh-cn)

### 定义类方法

在类中定义函数的语法与您之前学习的语法相同。唯一的区别在于，该函数是放在类主体中。在类主体中定义函数时，该函数称为成员函数或方法，用于表示类的行为。在本 Codelab 的剩余部分中，出现在类主体内的函数一律称为方法。

在 `SmartDevice` 类中定义 `turnOn()` 和 `turnOff()` 方法：

1. 在 `SmartDevice` 类的主体中，定义主体为空的 `turnOn()` 方法：

```kotlin
class SmartDevice {
    fun turnOn() {

    }
}
```

1. 在 `turnOn()` 方法的主体中，添加 `println()` 语句，然后向其传递 `"Smart` `device` `is` `turned` `on."` 字符串：

```kotlin
class SmartDevice {
    fun turnOn() {
        println("Smart device is turned on.")
    }
}
```

若要在类的外部调用类方法，请以类对象开头，后面依次跟 `.` 运算符、函数名称和一对圆括号。可视情况在圆括号中包含方法所需的实参。语法如下图所示：

![fc609c15952551ce.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/fc609c15952551ce.png?hl=zh-cn)

对该对象调用 `turnOn()` 和 `turnOff()` 方法：

1. 在 `main()` 函数中 `smartTvDevice` 变量后面的代码行上，调用 `turnOn()` 方法：

```kotlin
fun main() {
    val smartTvDevice = SmartDevice()
    smartTvDevice.turnOn()
}
```

### 定义类属性

1. 在 `name` 属性后面的代码行上，定义 `category` 属性并为其赋予 `"Entertainment"` 字符串，然后定义 `deviceStatus` 属性并为其赋予 `"online"` 字符串：

```kotlin
class SmartDevice {

    val name = "Android TV"
    val category = "Entertainment"
    var deviceStatus = "online"

    fun turnOn() {
        println("Smart device is turned on.")
    }

    fun turnOff() {
        println("Smart device is turned off.")
    }
}
```

1. 在 `smartTvDevice` 变量后面的代码行上，调用 `println()` 函数，然后向其传递 `"Device` `name` `is:` `${smartTvDevice.name}"` 字符串：

```kotlin
fun main() {
    val smartTvDevice = SmartDevice()
    println("Device name is: ${smartTvDevice.name}")
    smartTvDevice.turnOn()
    smartTvDevice.turnOff()
}
```

1. 运行代码。

输出如下所示：

```kotlin
Device name is: Android TV
Smart device is turned on.
Smart device is turned off.
```

### 属性中的getter和setter函数

属性的用途比变量更广泛。例如，假设您创建了一个类结构来表示智能电视。您会执行的常见操作之一是调高和调低音量。如需在编程中表示此操作，您可以创建一个名为 `speakerVolume` 的属性，其中包含电视音箱当前设置的音量，但音量值有范围限制。可设置的音量下限为 0，上限为 100。若要确保 `speakerVolume` 属性始终不超过 100 或低于 0，您可以编写 setter 函数。在更新属性值时，您需要检查该值是否处于 0 到 100 的范围内。再举一例，假设您必须确保名称始终大写。您可以实现 getter 函数，将 `name` 属性转换为大写。

在深入了解如何实现这些属性之前，您需要了解用于声明这些属性的完整语法。定义可变属性的完整语法是以变量定义开头，后跟可选的 `get()` 和 `set()` 函数。语法如下图所示：

![f2cf50a63485599f.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/f2cf50a63485599f.png?hl=zh-cn)

例如，若要确保赋给 `speakerVolume` 属性的值介于 0 到 100 之间，您可以实现 setter 函数，如以下代码段所示：

```kotlin
var speakerVolume = 2
    set(value) {
        if (value in 0..100) {
            field = value
        }
    }
```

### 定义构造函数

### 定义形参化构造函数

在 `SmartDevice` 类中，`name` 和 `category` 属性不可变。您需要确保 `SmartDevice` 类的所有实例都会初始化 `name` 和 `category` 属性。在当前实现中，`name` 和 `category` 属性的值都采用硬编码。也就是说，所有智能设备都是以 `"Android` `TV"` 字符串命名，并使用 `"Entertainment"` 字符串进行分类。

若要保持不变性，同时避免使用硬编码值，请使用形参化构造函数进行初始化：

- 在 `SmartDevice` 类中，将 `name` 和 `category` 属性移至构造函数中，且不赋予默认值：

```
class SmartDevice(val name: String, val category: String) {

    var deviceStatus = "online"

    fun turnOn() {
        println("Smart device is turned on.")
    }

    fun turnOff() {
        println("Smart device is turned off.")
    }
}
```

现在，该构造函数可接受形参来设置其属性，因此，为此类实例化对象的方式也会随之更改。实例化对象的完整语法如下图所示：

![bbe674861ec370b6.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/bbe674861ec370b6.png?hl=zh-cn)

#### 主要构造函数

您可以使用主要构造函数来初始化类标头中的属性。传递给构造函数的实参会赋给属性。定义主要构造函数的语法是以类名称开头，后面依次跟 `constructor` 关键字和一对圆括号。圆括号中包含主要构造函数的形参。如果有多个形参，请用英文逗号分隔形参定义。定义主要构造函数的完整语法如下图所示：

![aa05214860533041.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/aa05214860533041.png?hl=zh-cn)

#### 辅助构造函数

辅助构造函数包含在类的主体中，其语法包括以下三个部分：

- **辅助构造函数声明**：辅助构造函数定义以 `constructor` 关键字开头，后跟圆括号。可视情况在圆括号中包含辅助构造函数所需的形参。
- **主要构造函数初始化**：初始化以冒号开头，后面依次跟 `this` 关键字和一对圆括号。可视情况在圆括号中包含主要构造函数所需的形参。
- **辅助构造函数主体**：在主要构造函数的初始化后跟一对大括号，其中包含辅助构造函数的主体。

语法如下图所示：

![2dc13ef136009e98.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/2dc13ef136009e98.png?hl=zh-cn)

### 实现类之间的关系

在 Kotlin 中，所有类默认都是最终类，也就是说您无法扩展这些类，因此必须定义类之间的关系。

定义 `SmartDevice` 父类及其子类之间的关系：

1. 在 `SmartDevice` 父类中的 `class` 关键字前面添加 `open` 关键字，使其具有扩展性：

```kotlin
open class SmartDevice(val name: String, val category: String) {
    ...
}
```

`open` 关键字会告知编译器此类可供扩展，因此其他类现在可对其进行扩展。

![1ac63b66e6b5c224.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/1ac63b66e6b5c224.png?hl=zh-cn)

1. 创建会扩展 `SmartDevice` 父类的 `SmartTvDevice` 子类：

```kotlin
class SmartTvDevice(deviceName: String, deviceCategory: String) :
    SmartDevice(name = deviceName, category = deviceCategory) {
}
```

### IS-A关系（继承）

如果在 `SmartDevice` 父类和 `SmartTvDevice` 子类之间指定 IS-A 关系，即表示 `SmartDevice` 父类可以执行的操作，`SmartTvDevice` 子类也可执行。这种关系是单向的，因此可以说每个智能电视“都是”智能设备，但不能说每个智能设备“都是”智能电视。IS-A 关系的代码表示形式如以下代码段所示：

```kotlin
// Smart TV IS-A smart device.
class SmartTvDevice : SmartDevice() {
}
```

### HAS-A关系（组合）

HAS-A 关系是指定两个类之间的关系的另一种方式。例如，您可能要使用住宅中的智能电视。在这种情况下，智能电视和住宅之间存在某种关系。住宅中包含智能设备，即住宅“拥有”智能设备。两个类之间的 HAS-A 关系也称为“组合”。

使用 HAS-A 关系定义 `SmartHome` 类：

1. 在 `SmartLightDevice` 类和 `main()` 函数之间，定义 `SmartHome` 类：

```
class SmartLightDevice(deviceName: String, deviceCategory: String) :
    SmartDevice(name = deviceName, category = deviceCategory) {

    ...

}

class SmartHome {
}

fun main() { 
    ...
}
```

1. 在 `SmartHome` 类构造函数中，使用 `val` 关键字创建 `SmartTvDevice` 类型的 `smartTvDevice` 属性：

```
// The SmartHome class HAS-A smart TV device.
class SmartHome(val smartTvDevice: SmartTvDevice) {

}
```

1. 在 `SmartHome` 类的主体中，定义会对 `smartTvDevice` 属性调用 `turnOn()` 方法的 `turnOnTv()` 方法：

```
class SmartHome(val smartTvDevice: SmartTvDevice) {

    fun turnOnTv() {
        smartTvDevice.turnOn()
    }
}
```

1. 在 `turnOnTv()` 方法之后的代码行上，定义会对 `smartTvDevice` 属性调用 `turnOff()` 方法的 `turnOffTv()` 方法：

```kotlin
class SmartHome(val smartTvDevice: SmartTvDevice) {

    fun turnOnTv() {
        smartTvDevice.turnOn()
    }

    fun turnOffTv() {
        smartTvDevice.turnOff()
    }

}
```

### 替换子类中的父类方法

替换 `SmartDevice` 类中的 `turnOn()` 和 `turnOff()` 方法：

在 `SmartDevice` 父类主体中，找到每个方法的 `fun` 关键字，并在前面添加 `open` 关键字：

```kotlin
open class SmartDevice(val name: String, val category: String) {

    var deviceStatus = "online"

    open fun turnOn() {
        // function body
    }

    open fun turnOff() {
        // function body
    }
}
```

在 `SmartLightDevice` 类的主体中，定义主体为空的 `turnOn()` 方法：

```kotlin
class SmartLightDevice(deviceName: String, deviceCategory: String) :
    SmartDevice(name = deviceName, category = deviceCategory) {

    var brightnessLevel = 0
        set(value) {
            if (value in 0..100) {
                field = value
            }
        }

    fun increaseBrightness() {
        brightnessLevel++
        println("Brightness increased to $brightnessLevel.")
    }

    fun turnOn() {
    }
}
```

在 `turnOn()` 方法的主体中，将 `deviceStatus` 属性设为字符串“`on`”，将 `brightnessLevel` 属性设为值“`2`”并添加 `println()` 语句，然后向它传递一个 `"$name` `turned` `on.` `The` `brightness` `level` `is` `$brightnessLevel."` 字符串：

```kotlin
    fun turnOn() {
        deviceStatus = "on"
        brightnessLevel = 2
        println("$name turned on. The brightness level is $brightnessLevel.")
    }
```

在 `SmartLightDevice` 子类中，找到 `turnOn()`  方法的 `fun` 关键字，并在前面添加 `override` 关键字

**`override` 关键字会告知 Kotlin 运行时去执行子类所定义方法中包含的代码**

1. 在 `main()` 函数中，使用 `var` 关键字定义 `SmartDevice` 类型的 `smartDevice` 变量，该变量会实例化接受 `"Android` `TV"` 实参和 `"Entertainment"` 实参的 `SmartTvDevice` 对象

2. 在 `smartDevice` 变量后面的代码行上，对 `smartDevice` 对象调用 `turnOn()` 方法

   

```kotlin
fun main() {
    var smartDevice: SmartDevice = SmartTvDevice("Android TV", "Entertainment")
    smartDevice.turnOn()
}
```

### 使用 `super` 关键字在子类中重复使用父类代码

若要从子类调用父类中被替换的方法，需要使用super关键字![18cc94fefe9851e0.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/18cc94fefe9851e0.png?hl=zh-cn)

1. 在 `SmartTvDevice` 和 `SmartLightDevice` 子类中，使用 `super` 关键字从 `SmartDevice` 类中调用方法：

```kotlin
class SmartTvDevice(deviceName: String, deviceCategory: String) :
    SmartDevice(name = deviceName, category = deviceCategory) {

    var speakerVolume = 2
        set(value) {
            if (value in 0..100) {
                field = value
            }
        }

     var channelNumber = 1
        set(value) {
            if (value in 0..200) {
                field = value
            }
        }

    fun increaseSpeakerVolume() {
        speakerVolume++
        println("Speaker volume increased to $speakerVolume.")
    }

    fun nextChannel() {
        channelNumber++
        println("Channel number increased to $channelNumber.")
    }

    override fun turnOn() {
        super.turnOn()
        println(
            "$name is turned on. Speaker volume is set to $speakerVolume and channel number is " +
                "set to $channelNumber."
        )
    }

    override fun turnOff() {
        super.turnOff()
        println("$name turned off")
    }
}
```

### 替换子类中的父类属性

在 `SmartDevice` 父类中 `deviceStatus` 属性后面的代码行上，使用 `open` 和 `val` 关键字定义 `deviceType` 属性，并将其设置为 `"unknown"` 字符串：

```kotlin
open class SmartDevice(val name: String, val category: String) {

    var deviceStatus = "online"

    open val deviceType = "unknown"
    ...
}
```

在 `SmartTvDevice` 类中，使用 `override` 和 `val` 关键字定义 `deviceType` 属性，并将其设置为 `"Smart` `TV"` 字符串：

```kotlin
class SmartTvDevice(deviceName: String, deviceCategory: String) :
    SmartDevice(name = deviceName, category = deviceCategory) {

    override val deviceType = "Smart TV"

    ...
}
```

## 可见性修饰符

Kotlin 提供了以下四种可见性修饰符：

- `public`：默认的可见性修饰符。可让系统在任何位置访问声明。对于您想在类外部使用的属性和方法，请标记为 public。
- `private`：可让系统在相同类或源文件中访问声明。

某些属性和方法可能仅在类的内部使用，而且您不一定想让其他类使用。您可以使用 `private` 可见性修饰符标记这些属性和方法，以确保其他类不会意外访问它们。

- `protected`：可让系统在子类中访问声明。对于您想在定义它们的类及其子类中使用的属性和方法，请使用 `protected` 可见性修饰符进行标记。
- `internal`：可让系统在相同模块中访问声明。internal 修饰符与 private 类似，但您可以从类的外部访问内部属性和方法，只要是在相同模块中进行访问即可。

#### 为属性指定可见性修饰符

为属性指定可见性修饰符的语法是以 `private`、`protected` 或 `internal` 修饰符开头，后跟定义属性的语法。语法如下图所示：

![47807a890d237744.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/47807a890d237744.png?hl=zh-cn)

也可将可见性修饰符设置为setter函数，并将修饰符放在set之前![cea29a49b7b26786.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/cea29a49b7b26786.png?hl=zh-cn)

protected：值应能通过类对象在类的外部读取，只有该类及其子类可以更新或写入这个值，您需要对属性的 `set()` 函数使用 `protected` 修饰符。

对 `deviceStatus` 属性的 `set()` 函数使用 `protected` 修饰符：

1. 在 `SmartDevice` 父类的 `deviceStatus` 属性中，将 `protected` 修饰符添加到 `set()` 函数中：

```kotlin
open class SmartDevice(val name: String, val category: String) {

    ...

    var deviceStatus = "online"
        protected set(value) {
           field = value
       }

    ...
}
```

#### 为方法指定可见性修饰符

为方法指定可见性修饰符的语法是以 `private`、`protected` 或 `internal` 修饰符开头，后跟定义方法的语法。语法如下图所示：

![e0a60ddc26b841de.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/e0a60ddc26b841de.png?hl=zh-cn)

```kotlin
class SmartTvDevice(deviceName: String, deviceCategory: String) :
    SmartDevice(name = deviceName, category = deviceCategory) {

    ...

    protected fun nextChannel() {
        channelNumber++
        println("Channel number increased to $channelNumber.")
    }      

    ...
}
```

#### 为构造函数指定可见性修饰符

为构造函数指定可见性修饰符的语法与定义主要构造函数的语法类似，但存在以下两点差异：

- 修饰符是在类名称之后、`constructor` 关键字之前的位置指定。
- 为主要构造函数指定修饰符时，即使函数内没有任何形参，也必须保留 `constructor` 关键字和圆括号。

语法如下图所示：

![6832575eba67f059.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/6832575eba67f059.png?hl=zh-cn)

例如，您可以查看以下代码段，了解如何在 `SmartDevice` 构造函数中添加 `protected` 修饰符：

```kotlin
open class SmartDevice protected constructor (val name: String, val category: String) {

    ...

}
```

#### 为类指定可见性修饰符

为类指定可见性修饰符的语法是以 `private`、`protected` 或 `internal` 修饰符开头，后跟定义类的语法。语法如下图所示：

![3ab4aa1c94a24a69.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/3ab4aa1c94a24a69.png?hl=zh-cn)

例如，您可以查看以下代码段，了解如何为 `SmartDevice` 类指定 `internal` 修饰符：

```kotlin
internal open class SmartDevice(val name: String, val category: String) {

    ...

}
```

理想情况下，您应努力严控属性和方法的可见性，因此请尽可能通过 `private` 修饰符来声明属性和方法。如果您无法确保它们私有，请使用 `protected` 修饰符；如果您无法确保它们受到保护，请使用 `internal` 修饰符；如果您无法确保它们仅在内部使用，请使用 `public` 修饰符。

| **修饰符**  | **可在相同类中访问** | **可在子类中访问** | **可在相同模块中访问** | **可在模块之外访问** |
| ----------- | -------------------- | ------------------ | ---------------------- | -------------------- |
| `private`   | ✔                    | 𝗫                  | 𝗫                      | 𝗫                    |
| `protected` | ✔                    | ✔                  | 𝗫                      | 𝗫                    |
| `internal`  | ✔                    | ✔                  | ✔                      | 𝗫                    |
| `public`    | ✔                    | ✔                  | ✔                      | ✔                    |

## 定义属性委托

创建属性委托的语法是以变量声明开头，后面一次跟by关键字以及用于为处理getter和setter函数的委托对象。语法如下图所示：

![928547ad52768115.png](https://developer.android.google.cn/static/codelabs/basic-android-kotlin-compose-classes-and-objects/img/928547ad52768115.png?hl=zh-cn)

为 `var` 类型创建委托：

1. 在 `main()` 函数之前，创建会实现 `ReadWriteProperty<Any?,` `Int>` 接口的 `RangeRegulator` 类：

```kotlin
class RangeRegulator() : ReadWriteProperty<Any?, Int>{//<>属于通用类型

}

fun main() {
    ...
}
```

1. 在 `RangeRegulator` 类的主体中，替换 `getValue()` 和 `setValue()` 方法：

```kotlin
class RangeRegulator(
    initialValue: Int,
    private val minValue: Int,
    private val maxValue: Int
) : ReadWriteProperty<Any?, Int> {

    override fun getValue(thisRef: Any?, property: KProperty<*>): Int {
    }

    override fun setValue(thisRef: Any?, property: KProperty<*>, value: Int) {
    }
}
```