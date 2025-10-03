---
title: STM32标准库笔记（一）-准备、GPIO、中断
date: 2025-10-01 02:51:00
type: paper
photos: 
tags:
excerpt: 内容包括环境搭建，材料准备、基本的GPIO使用、中断详解
description: 
---

> 【视频链接】：https://www.bilibili.com/video/BV1th411z7sn
>
> 【资料链接】：https://pan.baidu.com/s/18fhRyC879TZuWnGuqG618g?pwd=1234
> 提取码：1234（教程视频简介区也有官网下载路径）
> 链接里压缩包的解压密码：32

# 一、学习前准备

## 1.1 STM32F103资源

**认识芯片：STM32F103C8T6**

![image-20251001030014976](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001030014976.png)

### 1.1.1 片上资源

![image-20251001030108265](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001030108265.png)

NVIC：内核中管理中断的，比如中断优先级
SysTick：主要用来给操作系统提供定时服务，当然本课程不使用操作系统，因此可以用来生成Delay函
数。
RCC：对系统的时钟进行配置，还有就是使能各模块的时钟。不给时钟的情况下，操作外设是无效的，
外设也不会工作，这样的目的是降低功耗。
GPIO：引脚控制。
AFIO：复用IO口，可以完成复用功能的重定义，还有中断端口的配置。
EXTI：是外部中断，配置好外部中断后，当引脚有电平变化时候，就可以出发中断，让CPU来处理任
务。

TIM：定时器，整个STM32中最常用、功能最多的外设。分为高级定时器（复杂）、通用定时器（常
用）、基本定时器三种类型。生产PWM波最常用。
ADC：模数转换器，STM32内置了12位的AD转换器，可以直接读IO口的模拟电压值，无需外部联结AD
芯片，使用非常方便。
DMA：是直接内存访问，这个可以帮助CPU完成搬运大量数据这样的繁杂任务。
USART：同步或者异步串口，我们常用的UART是异步串口的意思。
I2C：非常常用的通信协议。STM32内置了控制器，可以用硬件来输出时序波形。使用起来更高效，当
然，用通用IO口来模拟时序波形也是没有问题的。
SPI：非常常用的通信协议。STM32内置了控制器，可以用硬件来输出时序波形。使用起来更高效，当
然，用通用IO口来模拟时序波形也是没有问题的。
CAN：通信协议，一般用于汽车领域。
USB：通信协议，生活中到处都是，可以通过STM32USB外设制作模拟鼠标，模拟U盘。
RTC：是实时时钟，在STM32内部完成年月日、时分秒的计时功能，而且可以接外部备用电池，即使掉
点也能正常运行。
CRC：一种数据的校验方式，用于判断数据正确性，有了这个外设的支持，进行校验就会更方便一些。
PWR：电源控制，可以让芯片进入睡眠模式等状态。来达到省点的目的。
BKP：备份寄存器，一段存储器，当系统掉电，仍可用备用电池保持数据，这个根据需要可以完成一些
特殊功能。
IWDG：独立看门狗
WWDG：窗口看门狗，当单片机因为电磁干扰四级或者程序设计不合理出现死循环时候，看门狗可以及
时复位芯片，保证系统的稳定性。
DAC：数模转换器，可以直接在IO口输出模拟电压。
SDIO：是SD卡接口，可以用来读取SD卡。
FSMC：是可变静态存储控制器，可以用于扩展内存，或者配置成其他总线协议，用于某些硬件的操
作。
USB OTG：用OTG功能，可以让STM32作为USB主机去读取其他USB设备。

### 1.1.2 芯片命名规则

例图：

![image-20251003173103008](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173103008.png)

**1.产品系列：**
STM32代表ST品牌Cortex-Mx系列内核（ARM）的32位MCU

2.产品类型：
F ：通用快闪（FlashMemory）

L：低电压（1.65～3.6V）

F类型中F0xx和F1xx系列为2.0～3.6V;F2xx和F4xx系列为1.8～3.6V

W：无线系统芯片，开发版

**3.产品子系列：**
050：ARMCortex-M0内核

051：ARMCortex-M0内核

100：ARMCortex-M3内核，超值型

101：ARMCortex-M3内核，基本型

102：ARMCortex-M3内核，USB基本型

103：ARMCortex-M3内核，增强型

105：ARMCortex-M3内核，USB互联网型

107：ARMCortex-M3内核，USB互联网型、以太网型

108：ARMCortex-M3内核，IEEE802.15.4标准

151：ARMCortex-M3内核，不带LCD

152/162：ARMCortex-M3内核，带LCD

205/207：ARMCortex-M3内核，不加密模块（备注：150DMIPS，高达1MB闪存/128+4KBRAM，USBOTGHS/FS，以太网，17个TIM，3个ADC，15个通信外设接口和摄像头）

215/217：ARMCortex-M3内核，加密模块（备注：150DMIPS，高达1MB闪存/128+4KBRAM，USBOTGHS/FS，以太网，17个TIM，3个ADC，15个通信外设接口和摄像头）

405/407：ARMCortex-M4内核，不加密模块（备注：MCU+FPU，210DMIPS，高达1MB闪存/192+4KBRAM，USBOTGHS/FS，以太网，17个TIM，3个ADC，15个通信外设接口和摄像头）

415/417：ARMCortex-M4内核，加密模块（备注：MCU+FPU，210DMIPS，高达1MB闪存/192+4KBRAM，USBOTGHS/FS，以太网，17个TIM，3个ADC，15个通信外设接口和摄像头）

**4.管脚数：**
F：20PIN；

G：28PIN；

K：32PIN；

T：36PIN；

H：40PIN；

C：48PIN；

U：63PIN；

R：64PIN；

O：90PIN；

V：100PIN

Q：132PIN；

Z：144PIN；

I ：176PIN；

**5.Flash存储容量：**
4：16KB flash（小容量）

6：32KB flash（小容量）

8：64KB flash（中容量）

B：128KB flash（中容量）

C：256KB flash（大容量）

D：384KB flash（大容量）

E：512KB flash（大容量）

F：768KB flash（大容量）

G：1MKB flash（大容量）

**6.封装：**
T：LQFP
H：BGA
U：VFQFPN
Y：WLCSP/WLCSP64

**7.温度范围：**
6：-40℃-85℃

7：-40℃-105℃

### 1.1.3 芯片系统结构

STM32芯片主要由内核和片上外设组成，STM32F103采用的是Cortex-M3内核，内核由ARM公司设计。STM32的芯片生产厂商ST，负责在内核之外设计部件并生产整个芯片。这些内核之外的部件被称为核外外设或片上外设，如 GPIO、USART（串口）、I2C、SPI 等。

![st-img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/135243i7ekjhkn7bhabr8a.png)

 芯片内核与外设之间通过各种总线连接，其中驱动单元有 4 个，被动单元也有 4 个，具体如上图所示。可以把驱动单元理解成是内核部分，被动单元都理解成外设。
**ICode 总线**
  ICode总线是专门用来取指令的，其中的I表示Instruction（指令），指令的意思。写好的程序编译之后都是一条条指令，存放在 FLASH中，内核通过ICode总线读取这些指令来执行程序。
**DCode总线**
  DCode这条总线是用来取数的，其中的D表示Data（数据）。在写程序的时候，数据有常量和变量两种。常量就是固定不变的，用C语言中的const关键字修饰，放到内部FLASH当中。变量是可变的，不管是全局变量还是局部变量都放在内部的SRAM。

**系统System总线**
  我们通常说的寄存器编程，即读写寄存器都是通过系统总线来完成的，系统总线主要是用来访问外设的寄存器。

**DMA总线**
  DMA总线也主要是用来传输数据，这个数据可以是在某个外设的数据寄存器，可以在SRAM，可以在内部FLASH。

  因为数据可以被Dcode总线，也可以被DMA总线访问，为了避免访问冲突，在取数的时候需要经过一个总线矩阵来仲裁，决定哪个总线在取数。


**内部的闪存存储器Flash**
  内部的闪存存储器即FLASH，编写好的程序就放在这个地方。内核通过ICode总线来取里面的指令。

**内部的SRAM**
  内部的SRAM，是通常所说的内存，程序中的变量、堆栈等的开销都是基于内部SRAM，内核通过DCode总线来访问它。

**FSMC**
  FSMC的英文全称是Flexible static memory controller（灵活的静态的存储器控制器）。通过FSMC可以扩展内存，如外部的SRAM、NAND-FLASH和NORFLASH。但FSMC只能扩展静态的内存，不能是动态的内存，比如就不能用来扩展SDRAM。

**AHB**

  从AHB总线延伸出来的两条APB2和APB1总线是最常见的总线，GPIO、串口、I2C、SPI 这些外设就挂载在这两条总线上。这个是学习STM32的重点，要学会对这些外设编程，去驱动外部的各种设备。

### 1.1.4 引脚定义

有时候拿到⼀块芯⽚我们可以先看他的引脚定义，看完就⼤概知道这个芯⽚是怎么⽤的了。

注意：【资料⽂档中】红⾊是电源相关引脚，标蓝⾊是最⼩系统相关引脚，标绿⾊的是IO⼝、功能⼝引

脚

没有加粗的IO⼝需要另外配置，不能直接使⽤。

STM32采⽤分区供电的⽅式，因此这些引脚都接对应电压就可以了。 

我们如果要想要STM32正

常⼯作，⾸先就需要吧电源部分和最⼩系统部分的电路连接好。也就是图中红⾊和蓝⾊的部分。

### 1.1.5 启动配置

![image-20251001032052925](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001034926582.png)

注意BOOT引脚的值是在上电⼀瞬间有效的，之后就随便了。

### 1.1.6 最小系统电路

注意：学硬件可以跟别的视频着画一下。

一般来说单片机只有一个芯片是无法工作的，我们需要为它连接最基本的电路，即最小系统电路。

【STM32供电电路】3.3V和GND之间一般连接了一个滤波电容，会让电源更加稳定，一般遇到供电
都会习惯性的加几个滤波电容。其中VBAT是接备用电池的，是给RTC和备份寄存器使用的。

【晶振电路】接了一个8MHz的主时钟晶振，STM32的主晶振一般都是8MHz的，通过颞部锁相环倍
频得到了72MHz的主频。连接到5、6引脚，另外还需要两个20pF的电容，作为起振电容，电容的另一端
接地即可。原理图如下：

![image-20251003173127936](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173127936.png)

> **PCB绘制需要注意的点：**
>
> 1、画板时晶振尽量离芯片近一点；
> 2、晶振底部尽量不要穿过其他支路，防止信号串扰；
> 3、不同型号的晶振可能需要不同的电路设计，根据自己使用的晶振型号设计；

如果需要RTC的话，还需要再接一个32.768KHz的晶振（OSC32），电路和这个一样，但是接在
3、4号引脚。为什么是32.768KHz呢？因为32768是2的15次方，内部的RTC电路经过2^15分频就可以
生成1秒的时间信号了。

【复位电路】10k的电阻和0.1μF的电容组成的，提供复位信号。产生先低电平然后电容充完电又变
高电平，这个低电平信号就成为了复位信号，所以一上电的瞬间就复位了。当然他提供了一个摁键，当
摁键摁下的时候电容接地放电了，然后松开就会发生复位的过程，产生复位信号。

【启动配置】拨动开关，在最小系统板上使用的是跳线帽来选择的。

【下载端口】如果是用ST-Link下载程序的话，就需要吧SWDIO和SWCLK两个引脚印出来方便接
线，GND是一定要引出来的，3.3V如果板子自己有供电的话就不用引，建议都引。

> 详细电路见：[基于STM32的最小系统电路设计（STM32F103C8T6为例）_stm32微控制器和最小系统电路-CSDN博客](https://blog.csdn.net/black_sneak/article/details/138352997)

## 1.2 工程环境搭建

### 1.2.1 **软件安装（请看视频）** 

安装Keil5 MDK  

安装器件⽀持包 

软件注册 

安装STLINK驱动（win11能不能兼容STlink）

  安装USB转串⼝驱动....略

### 1.2.2 ⼯程环境搭建与配置

**【开发方式说明】**STM32的工程结构比较复杂。其开发方式目前主要有三：基于寄存器的方式、基于标
准库（库函数）的方式、基于HAL库的方式。
①一般用寄存器的方式最直接最高效，但是比较STM32的结构复杂，寄存器太多，所以不推荐这种
方式。

②库函数的方式则是官方写好函数来间接的配置寄存器，这种方式因为STM32封装比较难好，对开
发人员比较友好，本节课使用这种方式。



③最后一种HAL库，比较适合快速上手的情况，但是这种方式隐藏了底层逻辑，如果不熟悉
STM32，基本只能停留在很浅的水平。（但之后为了工作效率一定要了解）



【资料说明】《STM32F10x_StdPeriph_Lib_V3.5.0》文件夹当中Libraries就有固件库建立工程的时候
会用到，project文件夹是官方提供的例程和工程模板。第四个Utilities是STM32官方评估板的相关例
程，小电路板的测评程序。 剩下的Release_Notes.html是发布文档，有版本说明；
stm32f10x_stdperiph_lib_um.chm是说明文档，说明库函数如何使用。



**（1）开始keil工程搭建：**

（一开始建立的工程是不能直接用的，需要导入固件库：双击Keil.STM32F1xx_DFP.2.2.0.pack）
打开Keil5，新建工程，新建文件夹存放工程，然后给工程起名，起一个通用的名字，比较不容易
改，描述工程内容只需要改文件夹即可。这时候打开就可以选择芯片型号了。

![image-20251001034706868](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001034706868.png)

【扩展：在线安装固件包】略，看视频，用于需要其他芯片的时候，啊哈哈。
**（2）添加文件：**
项目里Start文件夹，将启动文件复制到Start中： ﻿F:\STM32入门教程资料\固件库\STM32F10x_StdPeriph_Lib_V3.5.0\Libraries\CMSIS\CM3\DeviceSupport\ST\STM32F10x\startup\arm﻿
退回F:\STM32入门教程资料\固件库\STM32F10x_StdPeriph_Lib_V3.5.0\Libraries\CMSIS\CM3\DeviceSupport\ST\STM32F10x﻿
将这些外设寄存器描述文件也放入Start文件夹中。
接下来，因为这个STM32是内核和内核外围的设备组成的，而且这个内核的寄存器描述和外部设备的描述文件不是在一起的，所以我么还需要添加一个内核寄存器的描述文件。
我们可以打开F:\STM32入门教程资料\固件库\STM32F10x_StdPeriph_Lib_V3.5.0\Libraries\CMSIS\CM3\CoreSupport﻿也复制到Start文件当中去。
回到Keil吧那些文件添加到工程里，修改工程文件夹名称为Start，把固定的文件先添加到项目当中（只要添加即可，内容不需要修改）；
并添加头文件路径，进入魔术棒——C/C++——Include psth的三点摁钮——添加Statr路径。
这些小钥匙的图标是只读文件的意思。

**（3）新建main.c文件与编写相关测试代码：**

然后同样的新建User文件夹（Windows和keil两处地方），在keil的User下建立main.c文件，
存放到Windows文件夹时候注意看路径是否在指定地方，另外注意添加的工程路径，不要有中文。
在main.c里右键添加头文件和代码，编译测试。Keil编辑风格可自行配置。注：扳手里Encoding->UTF-8可以防止中文乱码
①添加控制寄存器GPIO点灯代码：
略，寄存器操作，可以看视频跟着练习理解。

②添加控制GPIO点灯库函数编写代码：
【添加库函数相关配置文件】：这样才能使用库函数



打开标准外设驱动： F:\STM32入门教程资料\固件库\STM32F10x_StdPeriph_Lib_V3.5.0\Libraries\STM32F10x_StdPeriph_Driver\src﻿复制全部内核库函数.c文件。
同样的复制\inc﻿，这些是库函数的.h头文件。全部粘贴到项目新建的Library文件夹当中。在keil工程目录也添加上去。这时候还不能直接使用，我们还需要一些文件： ﻿F:\3单片机课件\STM3
2入门教程资料\固件库\STM32F10x_StdPeriph_Lib_V3.5.0\Project\STM32F10x_StdPeriph_Template﻿在这个目录下，复制几个文件conf是用来存放配置头文件的包含关系的，另外还有个用来参数检查的函数定义，是所有文件都需要的。剩下两个it文件是用来存放中断函数的。将这三个文件粘贴到项目工程的User目录下，同时添加到keil工程目录当中。

还需要复制stm32f10x.h﻿文件的宏定义名： ﻿USE_STDPERIPH_DRIVER﻿。

在魔术棒里将USE_STDPERIPH_DRIVER添加到工程才可以使用库函数。同时也不要忘记添加头文
件路径。
注：弄好后，以后使用直接复制这个工程文件就行，非大佬不建议删减。
控制灯亮灭代码（因为库函数是间接的操作寄存器，所以步骤是一样的），如果编译通过了，
很多都是程序问题。

```C
#include "stm32f10x.h" // Device header
int main()
{
//开启GPIOC的外设时钟
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC,ENABLE);
//设置端口参数模式
GPIO_InitTypeDef GPIO_InitStructure;
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP; //配置成推挽
输出模式
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_13; //引脚
GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz; //频率
GPIO_Init(GPIOC,&GPIO_InitStructure);
//改变端口灯泡的高低电平
GPIO_SetBits(GPIOC,GPIO_Pin_13);
GPIO_ResetBits(GPIOC,GPIO_Pin_13);
while(1)
{
}
}
```

使用库函数会使得寓意更明确，减少了去查手册之类的操作，已经将对寄存器的操作封装到函数中，并通过与或的形式来群不会影响到其他寄存器的变化。

**（4）项目编译检测：**
【编译报错】如果有报错，点击魔法棒，target->ARMCompiler选择V5.06或者改为降低5版本。
【改版本还是不行】可能需要自行添加编译器（其他问题可以看弹幕和视频简介资料地址）

添加编译器参考博客： https://blog.csdn.net/tytyvyibijk/article/details/125589391
如果已经有了的话，直接参考该博客自行添加即可：https://blog.csdn.net/s_Modesto/article/details/130367751

**（5）程序下载：**

①下载工具：ST-Link、杜邦线
②硬件接线：PC——STLink——STM32

![image-20251001034926582](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001032052925.png)

③Keil设置下载配置：点击魔术棒设置调试器，再点击旁边的Settings，进入其中勾选图二为下载立刻执行。

![image-20251001034939675](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001034939675.png)

![image-20251001034953005](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001034953005.png)

点击LOAD，即可直接下载。（注意相关驱动安装好）
注意：如果有报错，可以参考视频简介的问题解决记录网址。
【也可以用其他软件下载，可以自行了解】

### 1.2.3 启动文件说明

![image-20251001035018123](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001035018123.png)

## 1.3 常用C语言知识点

### 1.3.1 数据类型

推荐以后使用**stdint关键字**来表示C语言的数据类型。

![image-20251003173154189](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173234162.png)

### 1.3.2 宏定义

**关键字：**`#define`

**用途：**用一个字符串代替一个数字，便于理解，防止出错;提取程序中经常出现的参数，便于快速修改

定义宏定义：`#define ABC12345`

引用宏定义：`int a = ABC;	//等效于int a = 12345;`

可以多层定义引用，方便修改：

\#define ABA	ABC 

\#define ABC	2550

### 1.3.3 typedef定义

**关键字：**typedef

**用途：**将一个比较长的变量类型名换个名字,

便于使用定义typedef：`typedef unsigned char uint8_t;`

引用typedef：`uint8_t a;	//等效于unsigned char a;`

**二者比较：①**宏定义的新名字在左边，typedef的新名字在右边。

**②**宏定义不需要加分号，typedef必须加分号。**③**宏定义任何名字都可以换（改名范围更宽），typedef只能专门给变量类型换名字（防止变量重命名，更安全）。

### 1.3.4 结构体

注意：库函数中出现的频率比较高，理解结构体那是非常必要的。结构体也是一种数据类型

关键字：struct

用途∶数据打包，不同类型变量的集合

定义结构体变量∶

```
struct{char x; int y; float z;}structName;
```

因为结构体变量类型较长，所以通常用typedef更改变量类型名引用结构体成员︰

```
//通过结构体名称structName来获取/修改数据内容。 structName.x = 'A'； structName.y = 66； structName.z = 1.23； //或指针方式 pstructName->x = 'A'；	//pstructName为结构体的地址pstructName->y = 66； pStructName->z= 1.23;
```

参考视频，很好理解。或参考该UP主指针视频：[https://www.bilibili.com/video/BV1Mb4y1X7dz/](https://www.bilibili.com/video/BV1Mb4y1X7dz/?spm_id_from=333.999.0.0)

### 1.3.5 枚举

关键字：enum

用途：定义一个取值受限制的整形变量,用于**限制变量取值范围**；宏定义的集合

定义枚举变量：`enum{FALSE = 0，TRUE = 1} EnumName;`

因为枚举变量类型较长，所以通常用typedef更改变量类型名引用枚举成员：

```
EnumName = FALSE;	EnumName = TRUE;
```



**注意：**没有浙西内容C语言也可以跑，但是当工程复杂起来之后，就需要这些来管理工程，使得编程更加的便捷，容易理解，不易出错。

## 1.4调试方式介绍

### 1.4.1 显示屏调试

**使用OLED显示屏来显示数据︰**

直接将显示屏连接到单片机，将调试信息打印在显示屏上

**【OLED模块源码位置】：**

```
.\STM32入门教程资料\程序源码\STM32Project\4-1 OLED显示屏
```

**【教程提供OLED驱动函数说明】：**

![image-20251003173224953](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173247227.png)

![image-20251003173234162](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173314782.png)

**【修改使用位置】：改好后即可使用。****注意函数的使用方式。**

```c
/*引脚配置*/
#define OLED_W_SCL(x)		GPIO_WriteBit(GPIOB, GPIO_Pin_8, (BitAction)(x))
#define OLED_W_SDA(x)		GPIO_WriteBit(GPIOB, GPIO_Pin_9, (BitAction)(x))
```

### 1.4.2 串口调试

**串口主助手︰XCOM、江科大自写串口助手....**

通过UART串口通信，将调试信息发送到电脑端，电脑使用串口助手显示调试信息

### 1.4.3 Keil调试模式

借助Keil软件的调试模式，可使用单步运行、设置断点、查看寄存器及变量等功能。但需要注意是否支持要调试的芯片。

**【官方文档】：**软件内置。![image-20251003173247227](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173302441.png)有最详细的使用步骤说明。

**【使用步骤】：**

选择好硬件仿真器：![image-20251003173302441](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173224953.png)

编译项目之后，点击放大镜即可进入调试模式：![image-20251003173314782](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173154189.png)

![img](https://cdn.nlark.com/yuque/0/2023/png/25954489/1688378225858-90f84530-1111-4ceb-bcf8-f695cdc18f8c.png)程序控制按键。![image-20251003173327153](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173422116.png)

（图中蓝色的箭头的调试箭头，还有一个黄色的箭头，是程序运行的箭头，如果想看到，可以点击停止）

**另外可以点击外设菜单栏：**就可以查看对应的外设寄存器。

![image-20251003173422116](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173327153.png)



在调试过程中，我们点击运行程序，STM32就会跑起来；点击停止，STM32也是会停止。运行时候可以看到寄存器是实时变化的，虽然有那么一些延时，**但是还是非常厉害的。**

**stm32实时执行程，Keil软件实时显示外设寄存器状态。**

**注意：****在调试模式下是不能直接修改代码的，必须退出调试模式，然后修改代码重新编译，再进入调试模式。**

### 1.4.4批处理

项目工程文件编译后一般会比较大，主要是中间件占空间。如果想要分享给别人，可以**双击运行**项目存在中的`F:\STM32江科大入门教程资料\程序源码\STM32Project\1-2 keilkill批处理\`脚本`keilkill.bat`删掉中间文件，这样项目就会比较小。

## 1.5FlyMCU与STLink Utility

### 1.5.1 FlyMCU

FlyMCU通过用串口给STM32下载程序，与51的STC-ISP下载程序的功能一致。

开始编程之前，我们还需配置BOOT引脚，让STM32执行BootLoader程序，否则点击编程会卡住。BOOT引脚可以配置跳线帽，插拔完之后需要在上电状态下摁一下复位键，因为STM32在只有在刚复位时候才会读取BOOT引脚，这样芯片就进入BootLoader程序了：不断接收USART1的程序刷新到主闪存。此时回到FlyMCU选择好.hex文件点击开始编程即可。

![image-20251003173440042](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173526744.png)

此时并没有运行程序，因为STM32还在执行BootLoader程序，需要将其跳线帽复原，摁一下复位键，就会运行下载好的程序。

**【串口下载原理】**

通过一段程序，不断的接收串口数据并将其放到存储程序代码的地方。刷机程序。

![image-20251003173448399](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173448399.png)

在手册里，可以看到通过BOOT[1:0]引脚选择三种不同启动模式。

![image-20251003173459608](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173440042.png)

**【插拔跳线帽太麻烦，如何解决】**

需要STM32一键下载电路设计，**教程所用的最小系统板没有提供**，一般某些机构的**开发板**会配有，到时候只需要配置![image-20251003173526744](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173459608.png)即可。

当然也可以先设置BOOT进入BootLoader，再配置FlyMCU编程后执行(去掉编程到FLASH时写字节选项的勾)，下载后立刻就执行程序，可以直接查看现像。此时摁下复位键可直接恢复到BootLoader程序运行，节省了调试过程插拔跳线帽的动作，程序调试结束后再恢复跳线帽即可。

**【读Flash程序】**

FlyMCU可以直接读取STM32中Flash的程序，生成.bin文件（**相比于.hex缺少了地址信息，但是作用都是一致的）**。如果在产品中不使用加密手段的话，很容易就会被人抄完PCB板子，通过程序这样逆向出来，这样人家的开发周期大幅度缩水，直接摘桃子，跑通物料后直接和你开启价格战，很容易竞争失败。而加密呢，**虽然没有密不透风的加密手段，但是只要做到让解密的人脱几层皮，延长开发周期也就达到了目的了**。

所有以后想做自己的产品一定要注意这方面的学习。

比如FlyMCU的【选项字节】里边就有一个参数可以配置读保护，防止直接读取。像是一些ST Visual Programmer的下载器也有类似的选项，可以注意。

![image-20251003173520436](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173520436.png)

阻止之后读保护，下载程序会失败，解除后就正常了，解除的同时也会清除程序。

**然后这里有个硬件选项字节，其中的写保护字节大家估计比较懵：**

正常来讲，不管哪个区的地址，只要开启了写保护，就必须要解除保护后，才可以写入程序，否之就会出错。这时候因为**不能单独设置某个区的写保护开关**，只能在**下载flash(下载程序)的时候顺便打开或关闭**某个区的写保护开关，所以一旦在程序下载的地方打开写保护，这时候flash下载也无法写入，也就没法修改开关了。需要注意。

其它用到再自行了解即可。

### 1.5.2 STLink Utility

STLink Utility配合STLINK进行下载，也可以用作其他操作。目前官方改成了这个：一样使用。

![image-20251003173537266](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173537266.png)

![image-20251003173544357](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173558555.png)可下载了解。

# 二、GPIO输入输出

![image-20251001040358376](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001040358376.png)

## 2.1 GPIO是什么

单片机的GPIO（General Purpose Input/Output）是指通用输入输出口，是单片机上的一种通用的数字输入输出接口。它可以通过编程控制单片机与外部电路之间的数据传输，从而实现单片机控制外部电路或外部电路控制单片机的功能。 通常情况下，单片机的GPIO口可以配置为输入或输出模式。在输入模式下，GPIO口可以读取外部电路的信号，并将其转换为数字信号输入到单片机中进行处理。在输出模式下，GPIO口可以将单片机处理后的数字信号输出到外部电路中，控制外部电路的运行。 GPIO口的数量和功能因单片机型号而异，有些单片机只有几个GPIO口，而有些单片机则具有更多的GPIO口和更丰富的功能。GPIO口的使用需要根据具体的应用场景进行配置和编程。

可以说，GPIO是掌握单片机的一个重要基础，基本上后面所有的开发都离不开驱动GPIO的输入与输出，包括一些通信，都是通过高低电平来传输0跟1的。

## 2.2 GPIO的两种模式

GPIO大致上来说分为两种模式，输出跟输入，本次只讲解简单的推挽输出与输入模式，实际上分为8种模式：

1.输出模式（Output Mode）：GPIO口作为输出端口，用于将单片机处理后的信号输出到外部电路。

2.输入模式（Input Mode）：GPIO口作为输入端口，用于读取外部电路的信号。

3.上拉输入模式（Pull-up Input Mode）：GPIO口作为输入端口，同时启用上拉电阻，使得当外部信号未连接时，GPIO口的电平保持为高电平。

4.下拉输入模式（Pull-down Input Mode）：GPIO口作为输入端口，同时启用下拉电阻，使得当外部信号未连接时，GPIO口的电平保持为低电平。

5.开漏输出模式（Open-drain Output Mode）：GPIO口作为输出端口，输出为开漏（或称为双向电流输出）模式，这个模式下单片机引脚在未连接任何外部电路的时候不能输出高电平，但是可以通过上拉电阻连接到外部电源，实现更强大的电流输出。

6.推挽输出模式（Push-pull Output Mode）：GPIO口作为输出端口，输出为推挽模式，可以提供较高的输出电流能力。

7.复用功能模式（Alternate Function Mode）：GPIO口可以配置为其他功能模块所需的引脚，如串口通信、定时器、PWM输出等。

8.模拟模式（Analog Mode）：GPIO口可以配置为模拟输入或输出模式，用于连接模拟电路。

![image-20251001040627846](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001045538221.png)

### 2.2.1 推挽输出模式

输出模式顾名思义，是单片机引脚向外输出一个电平，也就是我们常说的高电平与低电平，我们这里只做简单的输出，STM32F103C8T6的引脚在推挽输出模式下能输出的高电平为3.3V，因此高电平为3.3V，低电平为0V。

在下面这个电路中，发光二极管的左侧通过一个限流电阻连接到了单片机的PA0引脚上，右侧接地，这样当我们的单片机输出高电平，发光二极管左右产生电压差，电流就像水流从高处流到低处一样从发光二极管的左侧流到右侧，于是乎发光二极管被点亮，同理STM32引脚输出低电平0V的时候，发光二极管左右两侧没有产生电压差，发光二极管没有电流通过，于是乎发光二极管被熄灭。

![image-20251003173558555](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173706333.png)

#### ①GPIO初始化

```C
void GPIO_Init(void)
{
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE);
GPIO_InitTypeDef GPIO_InitStruct;
GPIO_InitStruct.GPIO_Mode = GPIO_Mode_Out_PP;
GPIO_InitStruct.GPIO_Pin = GPIO_Pin_13;
GPIO_InitStruct.GPIO_Speed = GPIO_Speed_50MHz;
GPIO_Init(GPIOC, &GPIO_InitStruct);
}
```

上面的代码逐条解释如下：
1.开启GPIOC的时钟，它是被挂载在APB2总线上面的，所以用`RCC_APB2PeriphClockCmd()`这个函数（大多数外设在使用的第一步就应该使能时钟，否则外设不会工作）

2.定义一个结构体`GPIO_InitStruct`，这个结构体中的成员就是我们需要配置的引脚属性

3.设置为推挽输出模式

4.设置引脚为13号引脚

5.设置引脚速度为50MHz（一般我们直接设置最快的50MHz即可）

6.初始化引脚（起到将我们写入结构体的参数配置到寄存器的作用）

#### ②使用

直接在main函数中调用下面的语句即可实现相对的功能

```C
GPIO_SetBits(GPIOC, GPIO_Pin_13);
GPIO_ResetBits(GPIOC, GPIO_Pin_13);
GPIO_WriteBit(GPIOC, GPIO_Pin_13, (BitAction)0);
GPIO_WriteBit(GPIOC, GPIO_Pin_13, (BitAction)1);
```

上面的代码逐条解释如下：

1.`GPIO_SetBits()`函数可以将引脚设置为高电平，参数为端口号以及引脚号，在这里是将PC13引脚设置为高电平

2.`GPIO_ResetBits()`函数与上面的正好相反，将PC13引脚设置为低电平

3.`GPIO_WriteBit()`函数可以将单片机引脚设置为高电平或者低电平，这里是将PC13引脚拉高

4.与上面的正好相反，将PC13引脚拉低

（第三条第四条语句中的最后一个参数用了强制转换，通过转到定义可以查询到这是一个枚举类型，`(BitAction)0`这个参数也可以替换成Bit_RESET，`(BitAction)1`这个参数也可以换成Bit_SET，他们的作用都是一样的，只不过换了个名字而已）

### 2.2.2 输入模式（按键为例）

单片机引脚的输入模式是指将引脚配置为输入端口，用于读取外部电路的信号。在输入模式下，单片机引脚可以接收外部电路的信号，并将其转换为数字信号输入到单片机中进行处理。

我们这里已读取按键键值为例，下图中按键左侧接到单片机引脚PA0，右侧接到引脚地，我们会将单片机引脚配置为上拉输入模式，在这个模式下在没有外部因素影响之下一直保持为高电平，当我们按下按键时，按键左右两侧被导通，瞬间高电平跳转为低电平，在程序的角度来说，我们只需要一直监测引脚状态，当引脚为低电平时就判断为按键被按下。

![image-20251003173604957](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173544357.png)

#### ①GPIO初始化

```C
void Key_Init(void)
{
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB, ENABLE);
GPIO_InitTypeDef GPIO_InitStructure;
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IPU;
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_1 | GPIO_Pin_11;
GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
GPIO_Init(GPIOB, &GPIO_InitStructure);
}
```

上面的代码逐条解释如下：

1.GPIOB时钟初始化

2.定义结构体

3.设置为上拉输入模式

4.设置引脚为PB1跟PB10引脚

5.引脚速度设置为50MHz

6.初始化引脚（起到将我们写入结构体的参数配置到寄存器的作用）

#### ②使用

我们封装成一个按键函数，返回值为键值，只需要在main函数中的While(1)死循环中调用该函数，就可以检测按下的按键

```C
uint8_t Key_GetNum(void)
{
uint8_t KeyNum = 0;
if (GPIO_ReadInputDataBit(GPIOB, GPIO_Pin_1) == 0)
{
Delay_ms(20);
while (GPIO_ReadInputDataBit(GPIOB, GPIO_Pin_1) == 0);
Delay_ms(20);
KeyNum = 1;
}
if (GPIO_ReadInputDataBit(GPIOB, GPIO_Pin_11) == 0)
{
Delay_ms(20);
while (GPIO_ReadInputDataBit(GPIOB, GPIO_Pin_11) == 0);
Delay_ms(20);
KeyNum = 2;
}
return KeyNum;
}
```

上面的代码中，`GPIO_ReadInputDataBit()`函数是读取指定引脚的电平，我们在上述代码中的延时函数为消抖措施（不清楚的可以去百度一下），` while (GPIO_ReadInputDataBit(GPIOB, GPIO_Pin_11) == 0)`这一句是我们按键按下后跳转为低电平，程序卡死在while循环中，等我们松手电平跳转为高电平，while中的条件不成立，于是程序继续执行下面的语句，返回键值。

## 2.3 开发技巧

![image-20251003173614477](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173630235.png)

在开发过程中，大家肯定要问了，你怎么知道用哪个函数，实际上你需要开发那个外设，就去library组中找到它的头文件（比如说我要开发GPIO，那我就去查看stm32f10x_gpio.h），查看他们的函数声明(一般都在头文件的最底部)，右键跳转到函数主体，大多数函数都有它的注释，包括里面的参数应该填什么，不要看到英文就发怵，实际上单片机开发能用到的单词来来回回就那么几个，多看多练多熟悉，自然而然就能够上手。

## 2.4 LED/蜂鸣器

- LED：发光二极管，正向通电点亮，反向通电不亮

- 有源蜂鸣器：内部自带振荡源，将正负极接上直流电压即可持续发声，频率固定

- 无源蜂鸣器：内部不带振荡源，需要控制器提供振荡脉冲才可发声，调整提供振荡脉冲的频率，可发出不同频率的声音

  

**硬件电路接线方式**

**（1）LED电路**

限流电阻一般是要加上的，以防止电流过大。一下是两种控制LED的方式。该如何选择呢？一般是看IO口的驱动能力了，在单片机电路当中一般是选择第一种，因为很多单片机都采用了高电平弱驱动，低电平强驱动的方式，这样一定程度上可以避免高低电平打架。

![高电平控制亮](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173604957.png)

**（2）蜂鸣器电路**

使用了三极管开关驱动电路方案，三极管开关是最简单的驱动电路了。对于功率稍微大一点的，直接用IO口驱动可能会对单片机负担过重，这时候就可以用一个三极管驱动电路来完成驱动任务。

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173651044.png)

## 2.5 面包板的使用方法

其内部金属条，按着连接即可导通电流。略。

![img](https://cdn.nlark.com/yuque/0/2023/png/25954489/1688374528299-81b7224a-028a-4e12-a4b7-787879b6f51d.png?x-oss-process=image%2Fcrop%2Cx_0%2Cy_0%2Cw_769%2Ch_281)![img](https://cdn.nlark.com/yuque/0/2023/png/25954489/1688374528299-81b7224a-028a-4e12-a4b7-787879b6f51d.png?x-oss-process=image%2Fcrop%2Cx_0%2Cy_318%2Cw_769%2Ch_267)

## 2.6 通用GPIO输入

**1、摁键介绍**

按键：常见的输入设备，按下导通，松手断开

按键抖动：由于按键内部使用的是机械式弹簧片来进行通断的，所以在按下和松手的瞬间会伴随有一连串的抖动。因此一般程序需要消抖，最简单是就是加一个延时耗过去，在判断高低电平就可以了。

![image-20251003173706333](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173614477.png)



**2、传感器模块介绍**

传感器元件**（光敏电阻/热敏电阻/红外接收管等)**的电阻会随外界模拟量的变化而变化，**通过与定值电阻分压即可得到模拟电压输出**，再通过电压比较器进行二值化即可得到数字电压输出

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173724549.png)

对于图中分压电路的例子说明：接地的电容是其滤波作用的，分析时候可以直接拿掉。

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173839575.png)

电路中经常出现的弱上拉，强上拉，弱下拉，强下拉。这里的去那个若就是指电阻阻值的大小。因此该传感器的最终输出电压就是在弹簧拉车下最终杆子的高低。

**N1可以看做替换部分：**光敏电阻、热敏电阻、红外接收管（另外对应一个红外发射管）....

**3、按键和传感器模块的硬件电路**

![下接摁键方式2](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173758742.png)

一般常用下接摁键的方式，原因和LED的接法类似，是电路设计常用的规范。**方式1**必须要求引脚是上拉或下拉输入的模式；**方式2**可以允许引脚是浮空输入的模式，因为已经外置了上拉电阻和下拉电阻。

传感器接法，DO接数字量![image-20251003173758742](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173715553.png)，AO接模拟量。

# 三、中断

## 3.1 中断系统

### 3.1.1 中断的概念

**中断︰**在主程序运行过程中，出现了特定的中断触发条件（中断源)，使得CPU暂停当前正在运行的程序，转而去处理中断程序，处理完成后又返回原来被暂停的位置继续运行。

如果没用中断，那CPU总是询问有  没有事件的发生，就没法干其他活了，也只能靠delay来延时。有了中断之后，CPU可以专心执行当前程序，有中断时候就才去执行中断，不用询问，提高了效率。

**中断优先级︰**当有多个中断源同时申请中断时，CPU会根据中断源的轻重缓急进行裁决，优先响应更加紧急的中断源

**中断嵌套︰**当一个中断程序正在运行时，又有新的更高优先级的中断源申请中断，CPU再次暂停当前中断程序，转而去处理新的中断程序，处理完成后依次进行返回

![image-20251001044916167](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001045513880.png)

断点的信息编译器自动帮我们保存好了，以便处理完中断后继续执行

### 3.1.2 STM32的中断

68个可屏蔽**中断通道(中断源)，具体以手册为准**，包含EXTI、TIM、ADC、USART、SPI、12C、RTC等多个外设，几乎所有外设都能申请中断。

使用NVIC统一管理中断，每个中断通道都拥有16个可编程的优先等级，可对优先级进行分组，进一步设置抢占优先级和响应优先级。**下图****灰色是内核中断****一般用不到。**

![image-20251001045353966](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001044916167.png)

我们程序当中的中断函数，的地址是不确定的，是编译器自动分配的。但是我们的中断跳转，由于是硬件的限制，只能跳到固定的执行程序。所以为了能让硬件能跳转到不固定的硬件函数里，这里就需要在内存中定义一个地址的列表即——**中断向量表**。当中断发生后，就跳到这个固定位置。然后由编译器，在加上一条跳转到中断函数的代码。

### 3.1.3 NVIC中断优先级的结构

因为STM32的中断很多，如果外部中断直接连接到CPU，CPU就会多出很多引脚。所以二者之间就有一个NVIC出现了。用于排列中断执行的优先级，STM32**任何时候都是优先级高的先响应。**

![image-20251001045513880](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001045630616.png)

### 3.1.4NVIC优先级分组

**NVIC的中断优先级**由优先级寄存器的**4位（0~15)决定**，这4位可以进行切分，分为高n位的抢占优先级和低4-n位的响应优先级。

![image-20251001045538221](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001050528269.png)

## 3.2NVIC模块

### 3.2.1 NVIC模块概述

NVIC（Nested Vectored Interrupt Controller）是STM32微控制器中的中断控制器，负责管理中断的优先级、向量表配置以及中断的使能与禁用。与GPIO、DMA等外设不同，NVIC是CPU的一部分，因此在STM32标准库中，NVIC的实现位于`misc.c`和`misc.h`文件中，而非专门的`stm32f10x_nvic.c`文件。

NVIC模块的核心功能包括：

- 中断优先级配置
- 中断向量表配置
- 中断使能与禁用

以下将详细介绍NVIC模块的使用方法与实现细节。

### 3.2.2 NVIC优先级配置

NVIC支持中断优先级的配置，包括抢占优先级（Preemption Priority）和次优先级（Sub Priority）。优先级的配置通过优先级组（Priority Group）实现，优先级组决定了抢占优先级和次优先级的位数分配。

#### 3.2.2.1 中断优先级组

优先级组通过`NVIC_PriorityGroupConfig`函数设置。以下代码展示了优先级组的配置方法：

```c
// 设置优先级组为NVIC_PRIORITYGROUP_2
NVIC_PriorityGroupConfig(NVIC_PRIORITYGROUP_2);
1.2.
```

优先级组的分配方式如下：

| Priority Group       | 抢占优先级位数 | 次优先级位数 | 抢占优先级数量 | 次优先级数量 |
| -------------------- | -------------- | ------------ | -------------- | ------------ |
| NVIC_PRIORITYGROUP_0 | 0              | 4            | 1              | 16           |
| NVIC_PRIORITYGROUP_1 | 1              | 3            | 2              | 8            |
| NVIC_PRIORITYGROUP_2 | 2              | 2            | 4              | 4            |
| NVIC_PRIORITYGROUP_3 | 3              | 1            | 8              | 2            |
| NVIC_PRIORITYGROUP_4 | 4              | 0            | 16             | 1            |

### 3.2.2.2 中断优先级设置

通过`NVIC_Init`函数设置中断的抢占优先级和次优先级。以下代码展示了中断优先级的设置方法：

```c
NVIC_InitTypeDef NVIC_InitStruct;

NVIC_InitStruct.NVIC_IRQChannel = USART1_IRQn; // 设置中断通道
NVIC_InitStruct.NVIC_IRQChannelPreemptionPriority = 1; // 设置抢占优先级
NVIC_InitStruct.NVIC_IRQChannelSubPriority = 0; // 设置次优先级
NVIC_InitStruct.NVIC_IRQChannelCmd = ENABLE; // 使能中断
NVIC_Init(&NVIC_InitStruct);
1.2.3.4.5.6.7.
```

#### 2.2.2.3 中断优先级工作原理

中断优先级的判断规则如下：

- 抢占优先级高者优先执行
- 抢占优先级相同时，次优先级高者优先执行
- 抢占优先级和次优先级均相同时，先触发者优先执行

以下为中断优先级的时序图：

```plaintext
+-------------------+-------------------+-------------------+
| 中断源 A (1, 0)  | 中断源 B (1, 1)  | 中断源 C (0, 0)  |
+-------------------+-------------------+-------------------+
| 抢占优先级: 0    | 抢占优先级: 1    | 抢占优先级: 1    |
| 次优先级: 0      | 次优先级: 1      | 次优先级: 0      |
+-------------------+-------------------+-------------------+
1.2.3.4.5.6.
```

在上述时序图中：

- 中断源C的抢占优先级最高，优先执行
- 中断源A和B的抢占优先级相同，A的次优先级高于B，因此A优先执行

### 3.2.3 中断向量表配置

中断向量表的配置通过`NVIC_SetVectorTable`函数实现。以下代码展示了向量表的配置方法：

```c
// 设置向量表位于Flash
NVIC_SetVectorTable(NVIC_VectTab_FLASH, 0x0);
1.2.
```

中断向量表的地址可以设置为Flash或SRAM，具体取决于启动模式。以下为启动模式的映射关系：

| 启动模式  | 向量表地址 |
| --------- | ---------- |
| Flash启动 | 0x08000000 |
| SRAM启动  | 0x20000000 |

### 3.2.4 常见问题与解答

以下为关于NVIC模块的常见问题与解答：

| 问题                                  | 答案                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| 1. NVIC模块位于哪个文件中？           | NVIC模块的实现位于`misc.c`和`misc.h`文件中。                 |
| 2. 中断优先级组的作用是什么？         | 中断优先级组决定了抢占优先级和次优先级的位数分配。           |
| 3. 如何设置中断向量表的地址？         | 通过`NVIC_SetVectorTable`函数设置向量表的地址。              |
| 4. 抢占优先级和次优先级的区别是什么？ | 抢占优先级决定中断是否可以抢占当前中断，次优先级决定在同一抢占优先级下的执行顺序。 |
| 5. 如何使能中断？                     | 通过`NVIC_Init`函数设置中断通道、抢占优先级、次优先级，并使能中断。 |

### 3.2.5  NVIC模块与GPIO模块的对比

以下为NVIC模块与GPIO模块的对比：

| 特性     | NVIC模块                 | GPIO模块                 |
| -------- | ------------------------ | ------------------------ |
| 所属部分 | CPU                      | 外设                     |
| 配置文件 | `misc.c`                 | `stm32f10x_gpio.c`       |
| 核心功能 | 中断管理                 | 输入输出管理             |
| 配置方式 | 结构体`NVIC_InitTypeDef` | 结构体`GPIO_InitTypeDef` |

### 3.2.6 NVIC的使用

**① 配置中断优先级分组**

- 步骤：系统初始化阶段需统一配置中断优先级分组，确定抢占优先级和响应优先级的位数分配，整个系统仅需配置一次。

- 代码示例：

  ```c
  // 可选分组：NVIC_PriorityGroup_0至NVIC_PriorityGroup_4
  // 例：2位抢占优先级（0-3），2位响应优先级（0-3）
  NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2);
  ```

**②使能外设中断源**

- 步骤：针对具体外设（如定时器、串口、GPIO 等），开启对应中断类型（需参考外设手册确定可使能的中断）。

- 代码示例（不同外设）：

  ```c
  // 1. 串口1接收中断使能
  USART_ITConfig(USART1, USART_IT_RXNE, ENABLE);
  
  // 2. 定时器2更新中断使能
  TIM_ITConfig(TIM2, TIM_IT_Update, ENABLE);
  
  // 3. GPIO外部中断使能（需配合EXTI配置后）
  EXTI_ITConfig(EXTI_Line0, ENABLE);
  ```

**③配置 NVIC 中断通道参数**

- 步骤：定义`NVIC_InitTypeDef`结构体，设置中断通道、抢占优先级、响应优先级，并使能通道。

- 代码示例（多外设示例）：

  ```c
  // 配置USART1中断
  NVIC_InitTypeDef NVIC_USART1_Init;
  NVIC_USART1_Init.NVIC_IRQChannel = USART1_IRQn;                  // 中断通道
  NVIC_USART1_Init.NVIC_IRQChannelPreemptionPriority = 1;          // 抢占优先级
  NVIC_USART1_Init.NVIC_IRQChannelSubPriority = 0;                 // 响应优先级
  NVIC_USART1_Init.NVIC_IRQChannelCmd = ENABLE;                    // 使能通道
  
  // 配置TIM2中断
  NVIC_InitTypeDef NVIC_TIM2_Init;
  NVIC_TIM2_Init.NVIC_IRQChannel = TIM2_IRQn;
  NVIC_TIM2_Init.NVIC_IRQChannelPreemptionPriority = 2;
  NVIC_TIM2_Init.NVIC_IRQChannelSubPriority = 1;
  NVIC_TIM2_Init.NVIC_IRQChannelCmd = ENABLE;
  ```

**④应用 NVIC 配置**

- 步骤：调用`NVIC_Init`函数，将配置好的结构体参数写入 NVIC 寄存器，完成硬件层面配置。

- 代码示例：

  ```c
  NVIC_Init(&NVIC_USART1_Init);  // 应用USART1中断配置
  NVIC_Init(&NVIC_TIM2_Init);    // 应用TIM2中断配置
  ```

**⑤编写中断服务函数**

- 步骤：在中断服务文件（如`stm32f10x_it.c`）中，按中断通道名称定义函数，需包含中断标志位检查、清除及业务逻辑。

- 代码示例（多外设）：

  ```c
  // USART1中断服务函数
  void USART1_IRQHandler(void)
  {
    if (USART_GetITStatus(USART1, USART_IT_RXNE) != RESET)  // 检查接收中断
    {
      uint8_t data = USART_ReceiveData(USART1);             // 读取数据
      USART_ClearITPendingBit(USART1, USART_IT_RXNE);       // 清除标志位
      // 自定义处理逻辑
    }
  }
  
  // TIM2中断服务函数
  void TIM2_IRQHandler(void)
  {
    if (TIM_GetITStatus(TIM2, TIM_IT_Update) != RESET)      // 检查更新中断
    {
      TIM_ClearITPendingBit(TIM2, TIM_IT_Update);           // 清除标志位
      // 自定义处理逻辑（如计数、翻转GPIO等）
    }
  }
  ```

## 3.3 EXTI外部中断

中断系统是管理和执行中断的逻辑结构，外部中断是众多能产生中断的外设之一。**本节通过外部中断来学习中断。**

### 3.2.1 EXTI简介

**EXTI (Extern lnterrupt)外部中断**

EXTI可以监测指定GPIO口的电平信号，当其指定的GPIO口产生电平变化时，EXTI将立即向NVIC发出中断申请，经过NVIC裁决后即可中断CPU主程序,使CPU执行EXTI对应的中断程序

**支持的触发方式：**上升沿/下降沿/双边沿/软件触发

**支持的GPIO口：**所有GPIO口，但相同的Pin不能同时触发中断

**通道数：**16个GPIO_Pin**（主要）**，外加PVD输出、RTC闹钟、USB唤醒、以太网唤醒

**处触发响应方式：**

①中断响应（向CPU申请中断，让其执行中断函数，会触发中断引脚电平）

②事件响应（STM32对外部中断增加的一种额外的功能，当外部中断检测到引脚电平变化时，正常的流程是选择触发中断，但在STM32中也可以触发一个事件，这种触发的外部信号不会通向CPU了，**也就是不会触发中断，**而是触发其他外设的操作，触发ADC、触发DMA。）

**【注意】：**因为NVIC是内核外设，所以数据手册要去内核手册寻找。

### 3.2.2 EXTI基本结构

引脚比较多，每一个GPIO都有16pin的话，那外部中断的GPIO就的主要通道就不够了，所以这里会有一个，**AFIO数据选择器**，它可以在这前面3个GPIO外设的16个引脚里选择其中一个连接到后面或的通道里，前面提到，相同的pin不能同时触发中断。**这是因为经过AFIO进行选择后****只能有一个****接到EXTI的通道上。**

然后另外的四个（PVD/RTC/USB/ETH）蹭网的也接入进来，一共组成了EXTI的20个输入信号。

然后进一步的分成了两种输出信号，一种的NVIC输出中断信号，其中的9~5会触发同一个函数，15~10也会触发同一个中断函数，编程的时候需要根据标志位来确定到底是哪一个中断函数。一种是其他外设的输出信号，有20条线。

![image-20251001045630616](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001050406169.png)

**EXTI内部框图**

![image-20251001050406169](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001040627846.png)

![image-20251001050417439](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001045353966.png)

**AFIO数据选择器**
在GPIOx的16个引脚里选择其中一个连接到后面的EXTI的通道里。所以相同的Pin不能同时触发中断。

AFIO主要用于引脚复用功能的选择和重定义

在STM32中AFIO主要完成两个任务：复用功能引脚重映射、中断引脚选择。

一个引脚可以有多个功能为复用，有些引脚的功能可以映射到其他引脚进行使用（感觉有点像fate里的投影）。

**AFIO选择中断引脚结构图**

![image-20251001050528269](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251001050417439.png)

### 3.3.3配置流程

1.配置RCC     打开涉及到外设的时钟

2.配置GPIO    端口为输入模式

3.配置AFIO

4.配置EXTI    边沿触发方式选择以及触发响应方式，中断or事件

5.配置NVIC    选择合适优先级

**RCC时钟配置**

内核外设不用开启时钟

```C
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB, ENABLE);//开启GPIOB的时钟
RCC_APB2PeriphClockCmd(RCC_APB2Periph_AFIO, ENABLE);//开启AFIO的时钟
```

**GPIO初始化**

EXTI推荐配置为浮空、上拉或下拉

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/a5b9f7306b0569102f63ca638c5815d1.png)

```C
GPIO_InitTypeDef GPIO_InitStructure;
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IPU; //上拉输入
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_14;    //选择14号引脚
GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
GPIO_Init(GPIOB, &GPIO_InitStructure);	
```

**AFIO配置**

 **AFIO库函数**

```C
void GPIO_AFIODeInit(void);//复位
void GPIO_PinLockConfig(GPIO_TypeDef* GPIOx, uint16_t GPIO_Pin);//锁定配置
 
//事件输出
void GPIO_EventOutputConfig(uint8_t GPIO_PortSource, uint8_t GPIO_PinSource);
void GPIO_EventOutputCmd(FunctionalState NewState);
 
void GPIO_PinRemapConfig(uint32_t GPIO_Remap, FunctionalState NewState);//引脚重映射
 
//配置AFIO数据选择器，选择对应引脚
void GPIO_EXTILineConfig(uint8_t GPIO_PortSource, uint8_t GPIO_PinSource);
 
void GPIO_ETH_MediaInterfaceConfig(uint32_t GPIO_ETH_MediaInterface);//以太网相关
```

**初始化**

```C
//将外部中断的14号线映射到GPIOB，即选择PB14为外部中断引脚
GPIO_EXTILineConfig(GPIO_PortSourceGPIOB, GPIO_PinSource14);
```

**EXTI配置**

​	**EXTI库函数**

```C
void EXTI_DeInit(void);//复位
void EXTI_Init(EXTI_InitTypeDef* EXTI_InitStruct);//通过结构体配置，类似GPIO
void EXTI_StructInit(EXTI_InitTypeDef* EXTI_InitStruct);//结构体变量赋值
 
void EXTI_GenerateSWInterrupt(uint32_t EXTI_Line);//软件触发外部中断
 
FlagStatus EXTI_GetFlagStatus(uint32_t EXTI_Line);//获取指定标志位是否被置1，主程序使用
void EXTI_ClearFlag(uint32_t EXTI_Line);//清除标志位
 
ITStatus EXTI_GetITStatus(uint32_t EXTI_Line);//获取指定标志位是否被置1，中断函数中使用
void EXTI_ClearITPendingBit(uint32_t EXTI_Line);//清除标志位
```

**初始化EXTI**

```C
EXTI_InitTypeDef EXTI_InitStructure;						//定义结构体变量
EXTI_InitStructure.EXTI_Line = EXTI_Line14;					//选择配置外部中断的14号线
EXTI_InitStructure.EXTI_LineCmd = ENABLE;					//指定外部中断线使能
EXTI_InitStructure.EXTI_Mode = EXTI_Mode_Interrupt;			//指定外部中断线为中断模式
EXTI_InitStructure.EXTI_Trigger = EXTI_Trigger_Falling;		//指定外部中断线为下降沿触发
EXTI_Init(&EXTI_InitStructure);								//配置EXTI外设
```

![image-20251003173839575](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173732698.png)

**NVIC配置**

在misc库文件中

**NVIC库函数**

```C
void NVIC_PriorityGroupConfig(uint32_t NVIC_PriorityGroup);//中断分组
void NVIC_Init(NVIC_InitTypeDef* NVIC_InitStruct);         //设置结构体
void NVIC_SetVectorTable(uint32_t NVIC_VectTab, uint32_t Offset);//设置中断向量表
void NVIC_SystemLPConfig(uint8_t LowPowerMode, FunctionalState NewState);//系统低功耗配置
void SysTick_CLKSourceConfig(uint32_t SysTick_CLKSource);
```

**初始化NVIC**

```C
//NVIC中断分组
//此分组配置在整个工程中仅需调用一次
//若有多个中断，可以把此代码放在main函数内，while循环之前
//若调用多次配置分组的代码，则后执行的配置会覆盖先执行的配置
NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2);		//配置NVIC为分组2
	    											
	
NVIC_InitTypeDef NVIC_InitStructure;						//定义结构体变量
NVIC_InitStructure.NVIC_IRQChannel = EXTI15_10_IRQn;		//选择配置NVIC的EXTI15_10线
NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;				//指定NVIC线路使能
NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1;	//指定NVIC线路的抢占优先级为1
NVIC_InitStructure.NVIC_IRQChannelSubPriority = 1;			//指定NVIC线路的响应优先级为1
NVIC_Init(&NVIC_InitStructure);								//配置NVIC外设
```

**中断函数**

 在启动文件中IRQHeadler结尾的名称

```C
/*
EXTI0_IRQHandler           
EXTI1_IRQHandler           
EXTI2_IRQHandler          
EXTI3_IRQHandler          
EXTI4_IRQHandler 
EXTI9_5_IRQHandler
EXTI15_10_IRQHandler
*/
 
void EXTI15_10_IRQHandler(void)
{
	if (EXTI_GetITStatus(EXTI_Line14) == SET)//判断是否是外部中断14号线触发的中断
	{
		
 
		EXTI_ClearITPendingBit(EXTI_Line14);//清除外部中断14号线的中断标志位
											//中断标志位必须清除
											//否则中断将连续不断地触发，导致主程序卡死
	}
}
```

## 3.4 TIM定时器中断

### 3.4.1 TIM简介

- TIM (Timer) 定时器，定时器可以对输入的时钟进行计数**（****定时器本质是个计数器****）**，并在计数值达到设定值时触发中断。**是STM32中功能最强大、结构最复杂的外设。**
- 16位计数器、预分频器、自动重装寄存器的**时基单元**，在72MHz计数时钟下可以实现最大59.65s的定时。不仅具备基本的定时中断功能，而且还包含内外时钟源选择、输出比较、输入捕获、主从触发模式、编码器接口等多种功能（其它功能可以自行扩展学习）

**【如果觉得不够长】**STM32支持级联模式（一个定时器的输出当做另一个定时器的输入），一个定时器59.65s定时，级联一个（59.65 x 65536^2）定时8千年，级联两个（59.65 x 65536^4）定时34万亿年。

- 根据复杂度和应用场景分为了**高级定时器、通用定时器、基本定时器**三种类型。库函数中出现TIM9/10/11的定时器一般用不到。还有总线的连接，RCC开启时钟的时候要注意**编号数字**。功能如下所示：

![image-20251003173847647](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173854031.png)

- 使用ST单片机注意看其定时器资源，**不同型号定时器数量不同**。

STM32F103C8T6定时器资源：TIM1（一个高级）、TIM2、TIM3、TIM4（三个通用）

### 3.4.2定时器结构图

**（1）基本定时器**

![image-20251003173854031](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173912151.png)

**基本流程：**基准时钟——预分配器——计数器——产生中断/事件——中断优先级——CPU

**【时基单元】：**与分频器之前就是基准计数时钟的输入，连接到了内部时钟，其频率一般是系统主频72MHz，然后与分频器可以对其进行分频（**是十六位的，可以分0~65535频**，分频的目的是降低频率便于改变计算，使得外设间互不干扰，控制其工作速度，匹配外设要求，有的外设是检测不到72M这么快的速度的）。计数器对分频后的时钟单位进行计数，重装载寄存器保存设定的数值，计数过程二者不断比较，达到设定目标值（0~65535）时候，就会产生中断并清零计数器。

向上的小箭头表示可以产生中断，计数值的中断称为更新中断，中断后通往NVIC，所以接下来配置其定时器通道，就可以得到CPU响应。向下的箭头表示更新事件，更新事件不会触发中断，但是可以触发内部其他电路的工作。

**【主模式触发DAC功能】**STM32的特色主从触发模式，**可以让内部硬件在不受程序控制下实现自动运行，**极大的减轻CPU的负担。因为上图中如果在定时器产生的中断中去控制DAC的输出，此时主程序会被频繁中断，占用CPU资源，影响到程序的运行和其他中断的响应。所以使用**主模式**，产生的中断事件映射到出发输出TRGO的位置，使其控制输出DAC，这样便不需要在中断里触发DAC转换了。



**（2）通用定时器**

![image-20251003173902973](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173847647.png)

**【定时器计数方式】向上自增（从0开始增加，常用）**，向下自减（从设定值开始），中央对齐模式（先从零开始再从设定值开始），基本定时器只有向上自增一种方式，其余类型的定时器三种模式均有。

**【时钟源输入】**基本定时器只能是内部的时钟源，但是通用定时器可以多选择**外部时钟源信号**。

外部时钟输入模式2的输入：可以走**ETR通道**。经过滤波整形电路，输出基准时钟；

外部时钟输入模式1的输入：可以选择**ITR信号**，这部分信号是来自于其他定时器。TRGO接到**其他定时器**的同时**又接到了ITRx上**，具体连接关系可以通过表格来了解。可**用于级联**；

![image-20251003173912151](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173902973.png)

另外还可以选择CH1引脚边沿，CH1引脚和CH2引脚，可用于**输入捕获，检测频率**。

总结：输入还是比较复杂的，但是一般常用RCC内部时钟，而要使用外部时钟首选ETR输入就行了，其他的输入范围是为了一些特殊应用场景设计的，后续可了解。

【编码器接口】可以读取正交编码器的输出波形，后续讲解。

【输入捕获电路】四个通道，CH1~CH4

【输出比较电路】总共四个通道输出，与输入捕获电路公用一个组寄存器，因此不能同时使用。



**（3）高级定时器**

![image-20251003173920886](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173935189.png)

【重复计数器】：控制计数器中断的产生，可以隔几个周期触发更新中断，相当于对输出的更新中断信号进行了一次分频。

**【DTG死区生成电路】：**在框图中其前三路可以输出两个互补的PWM波输出，用于**控制三相无刷驱动**。因为其只需要三路，因此第四路没什么变化。在开关切换的瞬间，由于器件的不理想，造成短暂的直通现象，因此在输出之前加上了死区生成电路，**在开关切断的瞬间，产生一定时间的死区，让桥臂的上下管全都关断，防止直通现象**。

【刹车输入】：给电机驱动提供安全保障，如果外部引脚产生了刹车信号，或者内部时钟信号消失，控制电路就会自动切断电机的输出，防止意外。

### 3.4.3详细配置步骤及代码示例

**① 使能定时器时钟**

- **作用**：开启定时器外设的时钟，STM32 通用定时器（TIM2-TIM5）挂载在 APB1 总线上。

- 代码示例：

  ```c
  // 使能TIM2时钟
  RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
  ```

**② 配置定时器时基参数**

- **作用**：设置定时器的计数模式、预分频系数、自动重装载值等，决定定时器的计数频率和溢出周期。

- 关键参数：

  - 计数器时钟频率 = 定时器时钟源 / (预分频系数 + 1)
  - 溢出周期 = (自动重装载值 + 1) / 计数器时钟频率

- 代码示例（配置 TIM2 为 1ms 溢出一次）：

  ```c
  TIM_TimeBaseInitTypeDef TIM_TimeBaseStructure;
  
  // 预分频系数：假设APB1时钟为36MHz（默认分频），则计数器时钟 = 36MHz / (35999 + 1) = 1kHz
  TIM_TimeBaseStructure.TIM_Prescaler = 35999;
  // 自动重装载值：计数到999时溢出，溢出周期 = (999 + 1) / 1kHz = 1ms
  TIM_TimeBaseStructure.TIM_Period = 999;
  // 计数模式：向上计数（从0到自动重装载值）
  TIM_TimeBaseStructure.TIM_CounterMode = TIM_CounterMode_Up;
  // 时钟分割：默认不分割（仅高级定时器需配置）
  TIM_TimeBaseStructure.TIM_ClockDivision = TIM_CKD_DIV1;
  // 重复计数：仅高级定时器有效，通用定时器设为0
  TIM_TimeBaseStructure.TIM_RepetitionCounter = 0;
  
  // 应用时基配置
  TIM_TimeBaseInit(TIM2, &TIM_TimeBaseStructure);
  ```

#### ③ 配置定时器中断（如需中断功能）

- **步骤 1：使能定时器更新中断**开启定时器溢出时的中断触发（更新中断）。

  ```c
  // 使能TIM2的更新中断
  TIM_ITConfig(TIM2, TIM_IT_Update, ENABLE);
  ```

- **步骤 2：配置 NVIC 中断优先级**同外部中断配置，需设置中断分组、抢占优先级和响应优先级。

  ```c
  NVIC_InitTypeDef NVIC_InitStructure;
  
  // 选择TIM2中断通道
  NVIC_InitStructure.NVIC_IRQChannel = TIM2_IRQn;
  // 使能中断通道
  NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
  // 抢占优先级：假设分组2，值为1
  NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1;
  // 响应优先级：假设分组2，值为2
  NVIC_InitStructure.NVIC_IRQChannelSubPriority = 2;
  
  // 应用NVIC配置
  NVIC_Init(&NVIC_InitStructure);
  ```

#### ④ 使能定时器计数

- **作用**：启动定时器，开始计数。

- 代码示例：

  ```c
  // 使能TIM2计数器
  TIM_Cmd(TIM2, ENABLE);
  ```

#### ⑤ 编写定时器中断服务函数

- **作用**：定时器溢出时自动执行，需处理中断逻辑并清除中断标志位。

- 代码示例（每 1ms 进入一次中断，实现 LED 翻转）：

  ```c
  void TIM2_IRQHandler(void)
  {
    // 检查是否为TIM2更新中断
    if (TIM_GetITStatus(TIM2, TIM_IT_Update) != RESET)
    {
      // 清除中断标志位
      TIM_ClearITPendingBit(TIM2, TIM_IT_Update);
      
      // 自定义逻辑：如每1000ms翻转一次LED（需额外计数变量）
      static uint16_t cnt = 0;
      cnt++;
      if (cnt >= 1000)
      {
        cnt = 0;
        GPIO_WriteBit(GPIOC, GPIO_Pin_13, ~GPIO_ReadOutputDataBit(GPIOC, GPIO_Pin_13));
      }
    }
  }
  ```

## 3.5 时基单元相关时序分析

定时器中断，即定时产生一个中断。需要实现时钟、秒表等计时的时候都需要这个功能。

![image-20251003173926987](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173920886.png)

### 3.5.1 预分频器时序

![image-20251003173935189](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173940078.png)

当与分频器CNT_EN使能时候，计数器时钟才运行，但定时器仍然过了一段时间才发生改变，其改变的位置处于计数器寄存器清零部分，可知其重装值为FC，同时也会产生一个更新事件。后三行时序是一个缓冲机制，在计数周期过程中改变预分频系数，并不会直接改变定时器计数，而是等待计数周期结束后，产生了更新事件，此时预分频寄存器的值才生效，保障了稳定。

**计数器计数频率：**`CK_CNT=CK_PSC/(PSC+1)`

### 3.5.2 计数器时序

![image-20251003173940078](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173945159.png)

**定时器溢出频率：**`CK_CNT_OV=CK_CNT/(ARR+1)=CK_PSC/(PSC+1)/(ARR+1)`

同样的，也存在缓冲机制。**注：框图中的寄存器****带有阴影****的都是这样的缓冲机制，用或者不用均可自行设置。**

### 3.5.3 计数器无预装时序

没有缓冲的情况下

![image-20251003173945159](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173950313.png)

正常的计数周期后，变化分频频率。

### 3.5.4 计数器有预装时序

![image-20251003173950313](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003174011443.png)

修改分频没有缓冲直接改变频率，会导致计数器一直增加至FFFF全满，然后才清零。

## 3.6 RCC时钟树

时钟树是STM32用来产生和配置时钟，并且把配置好的时钟发送到各个外设的系统，是所有外设运行的基础，所以是最先要配置的东西。

![image-20251003174011443](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003173926987.png)

上图分为两个部分，一是时钟产生电路，二是时钟配置电路。

### 3.6.1 时钟产生电路

**【资源】：**（可参考F103手册）**一般使用外部晶振， 比较稳定**，除非精度不高可以使用内部。

- 内部8MHz；
- 外部4~16MHz高速石英晶体振荡器，也就是晶振，一般都是接8MHz；
- 外部的32.768KHz低速晶振，这个一般是给RTC提供时钟的。
- 内部40KHz低速RC震荡期，这个可以给看门狗提供时钟。

**【启动过程】：**首先以内部时钟8M启动，再启动外部时钟，进入PLL锁相环进行倍频，8MHz倍频9倍，获得72MHz。（据网友所说PLL不止9倍，可以用倍频16倍，进行超频运行）

如果外部晶振坏了，时钟会慢10倍。

【CSS】：时钟安全系统，负责切换时钟。比如先前提到的刹车系统里也有。

### 3.6.2时钟分配电路

默认情况下，无论是什么定时器，其内部基准时钟都是72MHz。如果更改了系统初始化函数SystemInit()的配置，需要重新计算速度。

> 笔记来源：江协科技、CSDN等
