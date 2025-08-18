---
title: C语言教程-环境搭建（VS）
date: 2025-08-17 00:00:00
type: paper
photos: https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/PixPin_2025-08-17_21-12-34.png
excerpt: 本教程详细介绍了如何使用Visual Studio搭建C语言开发环境。从下载安装Visual Studio，到创建第一个“Hello World”项目，再到编写和运行代码，本文为初学者提供了清晰、分步的指导，帮助读者快速上手C语言编程。
tags:
  - C
  - teach
  - Virual Studio
---

### 环境搭建：

1. 打开微软的官方网站 https://visualstudio.microsoft.com/，下载 Visual Studio 安装包。

<img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/环境搭建1.png" style="zoom:50%">

2. 双击安装包进行安装

   **操作一：**在 “工作负荷” 标签页中，选择 “使用 C++的桌面开发” 选项即可。

<img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/安装1.png" style="zoom:50%">

​	**操作二：**“安装位置” 中修改安装路径。

路径的要求：

​	1，不要有中文，不要有空格，不要有一些特殊符号

​	2，选择一个统一的文件夹进行管理

​	3，最好不要放C盘

<img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/安装2.png" style="zoom:50%">

3. 自动下载并安装，过程略微漫长，耐心等待。

<img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/安装3.png" style="zoom:50%">

4. 安装完成，弹出 “安装完毕” 对话框。 点击确定。

<img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/安装4.png" style="zoom:50%">

5. 接下来，VS希望你使用微软的账号登录，没有可以注册一个。也可以点击“暂时跳过此项”。

<img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/安装5.png" style="zoom:50%">

6. 根据提示选择一个自己喜欢的主题

<img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/安装7.png" style="zoom:50%">

7. 点击启动，到此整个环境全部搭建完毕

### 第一个代码HelloWorld

1. 创建项目

   点击 “创建新项目”，创建一个项目。

<img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/安装6.png" style="zoom:50%">

2. 选择创建 “控制台应用”，点击下一步。

 <img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/6.png" style="zoom:50%">

3. 指定项目名称。确保位置下的项目存储目录存在。 勾选 “将解决方案和项目.....” ，点击 “创建”。

 <img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/3.png" style="zoom:50%">

4. 右侧的解决方案管理器可以按照自己的习惯是放在左侧或者右侧

   默认是右侧，可以拖到左侧来，每个人的习惯不同，没有固定标准

 <img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/4.png" style="zoom:50%">

5. 创建 helloworld.c ⽂件

   右键选择原文件，选择添加，选择新建项

 <img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1.png" style="zoom:50%">

6. 在弹出的编辑框中，选中 “C++文件(.cpp)”，将 下方 “源.cpp” 手动改为要新创建的文件名，

   如：helloWorld.c 。注意，默认 cpp 后缀名，要手动改为 .c 后缀名，然后点击 “添加”。

 <img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/7.png" style="zoom:50%">

7. 编写 helloworld.c程序。

```c
#include <stdio.h>
int main(void)
{
    printf("hello world!\n");
    return 0;
}
```

8. 点击上方绿色空心三角运行即可

 <img src="https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/2.png" style="zoom:50%">



> 文章来源：黑马程序员