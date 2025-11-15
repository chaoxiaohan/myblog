---
title: STM32Cube_HAL库笔记（五）-DAC
date: 2025-11-13 05:00:00
type: paper
category: HAL
photos: 
tags:
excerpt: 正在施工ing...
description: 
---

> 本系列主要讲解STM32CubeHAL的使用，详细的安装部署教程请见[【STM32】STM32 CubeMx使用教程一--安装教程-CSDN博客](https://blog.csdn.net/as480133937/article/details/98885316)

# DAC

## DAC原理

Digital-to-Analog Converter的缩写，**数模转换器**，简称DAC，**是指将离散的数字信号转换为连续变量的模拟信号的器件**。

DAC 有两个用途：**输出波形**和**输出固定电压**

DAC工作框图

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/5b8c5d63074101940ade5f97cb3ce995.png)

这里我们把它分为三部分讲解：

**"触发方式 " “控制逻辑” "数模转换器"**

### 触发方式

第一部分，触发方式，是指DAC转换可以由**某外部事件触发**（定时器计数器、外部中断线）。配置控制位**TSELx**[2:0]可以选择8个触发事件之一触发DAC转换，任意一种触发源都可以触发DAC转换。

具体的外部触发可看下图：

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/21859b28b944be87a20a45c952e898d8.png)
六个是定时器触发：TIM2，TIM4，TIM5，TIM6，TIM7和TIM8。剩下两个分别是：**EXTI线路9(PC9)和软件触发**

每次DAC接口侦测到来自选中的**定时器TRGO输出**，或者**外部中断线9的上升沿**，近存放在寄 存器**DAC_DHRx**中的数据会被传送到寄存器**DAC_DORx**中。在**3个APB1时钟周期**后，寄存器 DAC_DORx更新为新值。

如果选择软件触发，一旦SWTRIG位置’1’，转换即开始。在数据从DAC_DHRx寄存器传送到 DAC_DORx寄存器后，SWTRIG位由硬件自动清’0’

### 控制逻辑

此部分决定了DAC的波形控制，输出方式，DMA传输，等等，

我们来具体讲解下，
从框图可以看出，**DAC受DORx寄存器直接控制的**，但是
数据并不是直接传入DORx的，需要先传入DHRx 之后在间接地传给DORx寄存器 **不能直接往DORx寄存器写入数据**

- 如果没有选择硬件触发（TENx=0），在一个APB1周期后传入DORx，
- 如果选择硬件触发（TENx=1），则在3个APB1周期后传入DORx

一旦数据从DAC_DHRx寄存器装入DAC_DORx寄存器，在经过时间**Tsetting**（大约3us） 之后，输出即有效，这段时间的长短依**电源电压和模拟输出负载的不同会有所变化**

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/c1fbc9b48e0666b8b1dda099d9e83c48.png)

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/5d932f5b6f7e178f33e875eb933b9011.png)
上图的DMAENx TENx MAMOx[3:0],WAVENx[1:0]位 都是由**DAC_CR**寄存器控制的

**DMAENx 控制DAC通道1/2 的DMA使能**

**MAMP2[3:0]：\**DAC通道2屏蔽/幅值选择器 位 \*\*27:24\*\* 由软件设置这些位，
用来在噪声生成模式下选择屏蔽位，在\**三角波生成模式下选择波形的幅值**。

**WAVE2[1:0]：DAC通道2噪声/三角波生成使能**

**位23:22**

决定是否产生波形，和产生什么波形。
**00：关闭波形发生器；
10：使能噪声波形发生器；
1x：使能三角波发生器。**

TENx：DAC通道x触发使能，**用来使能/关闭DAC通道x的触发。**

**0：关闭DAC通道x触发，写入DAC_DHRx寄存器的数据在1个APB1时钟周期后传入 DAC_DORx寄存器；
1：使能DAC通道x触发，写入DAC_DHRx寄存器的数据在3个APB1时钟周期后传入 DAC_DORx寄存器。
注意：如果选择软件触发，写入寄存器DAC_DHRx的数据只需要1个APB1时钟周期就可以传入 寄存器DAC_DORx。**

### 数模转换器

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/36cc132b9eec0f8d321bfe413699dea5.png)

**VDDA和VSSA为DAC模块模拟部分的供电。
Vref+则是DAC模块的参考电压。
DAC_OUTx就是DAC的输出通道了（对应PA4或者PA5引脚）**

**从左边的参考电压Vref+ ---->数模转换器 ---->模拟信号输出引脚**

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/1198eb37675a3df1a4c1fcd987a743b7.png)

注意：**DAC的引脚应该设置成模拟输入(AIN)模式**

**DAC输出电压：**

数字输入经过DAC被线性地转换为模拟电压输出

其范围为 **0~VREF+**

**DAC输出 = VREF x (DOR/4095)**

**特殊功能：**
噪声波形生成，三角波形生成，外部触发转换，双DAC同时或者分别转换；每个通道都有DMA功能；

参考电压：2.4V~ 3.3V

### DAC的主要特征

- 2个DAC转换器：
- 每个转换器对应1个输出通道；
- 8位或者12位单调输出；
- 12位模式下数据左对齐或者右对齐；
- 同步更新功能；
- 噪声波形生成；
- 三角波形生成；
- 双DAC通道同时或者分别转换；
- 外部触发转换；
- 输入参考电压VREF+。

### DAC原理总括

数字/模拟转换模块(DAC)是**12位数字输入，电压输出的数字/模拟转换器**。DAC可以配置为8位或12位模式，也可以与DMA控制器配合使用。DAC工作在12位模式时，数据可以设置成**左对齐或右对齐**。DAC模块有**2个输出通道**，每个通道都有单独的转换器。在双DAC模式下，2个通道可以独立地进行转换，也可以同时进行转换并同步地更新2个通道的输出。DAC可以通过引脚**输入参考电压VREF+** 以获得更精确的转换结果。

## 工程创建

**1设置RCC时钟**

**设置高速外部时钟HSE 选择外部时钟源**

![image-20251114174935363](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251114174935363.png)

**2时钟源设置**
![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/44351f192b5e1df1462debdc403c3b9f.png)

- **1选择外部时钟HSE 12MHz**
- **2PLL锁相环倍频72倍**
- **3系统时钟来源选择为PLL**
- 4**设置APB1分频器为 /2**

**3DAC设置**

![image-20251114175147927](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/5a0f0e5114584e8a5223556a614e09e3.png)

1.**OUT1 和 OUT2对应两个输出通道**

2.**External Trigger** 外部中断EXTI9 触发

就是使用外部中断来触发ADC

3.**Tigger 选择DAC的触发方式** 上方都有讲解

**Output Buffer** 使能DAC输出缓存

> DAC集成了2个输出缓存，可以用来减少输出阻抗，无需外部运放即可直接驱动外部负载。每个 DAC通道输出缓存可以通过设置DAC_CR寄存器的BOFFx位来使能或者关闭

## 例程

### **DAC库函数**

```C

/* IO operation functions *****************************************************/
HAL_StatusTypeDef HAL_DAC_Start(DAC_HandleTypeDef* hdac, uint32_t Channel);     //开启DAC输出
HAL_StatusTypeDef HAL_DAC_Stop(DAC_HandleTypeDef* hdac, uint32_t Channel);   //关闭DAC输出
HAL_StatusTypeDef HAL_DAC_Start_DMA(DAC_HandleTypeDef* hdac, uint32_t Channel, uint32_t* pData, uint32_t Length, uint32_t Alignment); //需要函数中不断开启   //开启DAC的DMA输出
HAL_StatusTypeDef HAL_DAC_Stop_DMA(DAC_HandleTypeDef* hdac, uint32_t Channel); //关闭DAC的DMA输出
HAL_StatusTypeDef HAL_DAC_SetValue(DAC_HandleTypeDef* hdac, uint32_t Channel, uint32_t Alignment, uint32_t Data);  //设置DAC输出值
uint32_t HAL_DAC_GetValue(DAC_HandleTypeDef* hdac, uint32_t Channel);  //获取DAC输出值


```

**DAC输出电压：**

在main()主函数中设置DAC输出的数据为12位右对齐，DAC输出为2048，并使能DAC1输出通道

```C
  /* USER CODE BEGIN 2 */
  HAL_DAC_SetValue(&hdac, DAC_CHANNEL_1, DAC_ALIGN_12B_R, 2048);

	HAL_DAC_Start(&hdac,DAC_CHANNEL_1);
  /* USER CODE END 2 */


```

**DAC输出 = VREF x (DOR/4095)**

- **HAL_DAC_SetValue(&hdac, DAC_CHANNEL_1, DAC_ALIGN_12B_R, 2048);**

功能：设置DAC的输出值
参数一： DAC结构体名
参数二： 设置DAC通道
参数三： 设置DAC对齐方式
参数四： 设置输出电压值 12位最大位4095

- **HAL_DAC_Start(&hdac,DAC_CHANNEL_1);**

功能：开启DAC输出
参数一： DAC结构体名
参数二： DAC通道

### **DAC输出三角波**

打开STM32cubeMX的DAC工程文件重新配置

![image-20251114180203780](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251114175147927.png)

**使能DAC输出通道2。**

**DAC外部触发(Trigger)** ：定时器2触发，

**波形生成模式(Wave generation mode)** ：**三角波发生器(Triangle wave generation).**

可以选择**三角波形**，和**噪声波形**(noise wave generation)

**最大三角波幅(Maximum Triangle Amplitude) ：4095**，

**设三角波幅值为3.3V，即4095**

DAC12位数据存储，最大为4095

**0-4095 对应 0V~3.3V**

打开Timers，使能定时器2

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/074907624a22f0289a6da7797216801b.png)

这里讲下三角波的频率

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/6bbd2fc7c9776cecd0238b053f90d98b-1763114622977-13.png)
简单的说，首先设置一个DAC最大幅值， 之后设置定时器溢出时间，在每次定时器发生溢出等事件之后，定时器会发送触发信号TRGO到DAC，这是内部的三角波计数器就会累加1 然后于DAC_DHRx寄存器的值相加，写到DAC_DORx计数器中，如果该值小于设定的最大幅值，就会正常输出，当大于最大幅值时就会递减，减到0之后又开始累加，周而复始，就形成了三角波

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251114180203780.png)
**三角波频率：**

设三角波幅值为3.3V，即4095，所以一个周期计数器计数4096*2=8192次，则三角波频率为“**定时器频率/8192**”

代码实现：

在main函数中添加以下两行代码，即可**输出三角波**

```C

    /* USER CODE BEGIN 2 */
     HAL_TIM_Base_Start(&htim2);
     HAL_DAC_Start(&hdac, DAC_CHANNEL_2);
     /* USER CODE END 2 */

```

分别为**开启定时器TIM2 和开启DAC**,波形产生
