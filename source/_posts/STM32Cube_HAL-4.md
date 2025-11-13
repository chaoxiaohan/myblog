---
<<<<<<< HEAD
title: STM32Cube_HAL库笔记（四）
date: 2025-10-10 00:00:00
type: paper
photos: 
tags:
excerpt: 正在施工ing...
=======
title: STM32Cube_HAL库笔记（三）-ADC
date: 2025-11-13 00:00:00
type: paper
photos: 
tags:
  - STM32
  - HAL
  - ADC
excerpt: 本文介绍了HAL库的ADC模数转换使用。
>>>>>>> 8401b80 (25111302)
description: 


---

<<<<<<< HEAD
> 本系列主要讲解STM32CubeHAL的使用，详细的安装部署教程请见[【STM32】STM32 CubeMx使用教程一--安装教程-CSDN博客](https://blog.csdn.net/as480133937/article/details/98885316)
=======
> 本系列主要讲解STM32CubeHAL的使用，详细的安装部署教程请见[【STM32】STM32 CubeMx使用教程一--安装教程-CSDN博客](https://blog.csdn.net/as480133937/article/details/98885316)

# 工程配置

### **设置RCC**

**设置高速外部时钟HSE 选择外部时钟源**

![image-20251113200634185](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113200634185.png)

### **设置ADC引脚**

![image-20251113200725061](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113205220536.png)

### **设置时钟**

![image-20251113201350498](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113211034752.png)

我的是 外部晶振为8MHz

- **1选择外部时钟HSE 8MHz**
- **2PLL锁相环倍频9倍**
- **3系统时钟来源选择为PLL**
- **4设置APB1分频器为 /2**
- **5 设置ADC时钟分频 ，只能是6/8分频**

如果ADC时钟频率大于14MHz则会报错

### **ADC配置**

![image-20251113205220536](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113211202720.png)

**ADCs_Common_Settings**          ADC模式设置
**Mode     ADC_Mode_Independent**
这里设置为独立模式

独立模式模式下，双ADC不能同步，每个ADC接口独立工作。所以如果不需要ADC同步或者只是用了一个ADC的时候，应该设成独立模式，多个ADC同时使用时会有其他模式，如双重ADC同步模式，两个ADC同时采集一个或多个通道，可以提高采样率

**Data Alignment (数据对齐方式)**: 右对齐/左对齐

**Scan Conversion Mode( 扫描模式 )** ：   DISABLE

如果只是用了一个通道的话，DISABLE就可以了(也只能DISABLE)，如果使用了多个通道的话，会自动设置为ENABLE。 就是是否开启扫描模式

**Continuous Conversion Mode(连续转换模式)**    ENABLE

设置为ENABLE，即连续转换。如果设置为DISABLE，则是单次转换。两者的区别在于连续转换直到所有的数据转换完成后才停止转换，而单次转换则只转换一次数据就停止，要再次触发转换才可以进行转换

**Discontinuous Conversion Mode(间断模式)**    DISABLE

因为我们只用到了1个ADC,所以这个直接不使能即可

规则通道设置
**Enable Regular Conversions (启用常规转换模式)**    ENABLE

使能 否则无发进行下方配置

**Number OF Conversion(转换通道数)**    1
用到几个通道就设置为几
多个通道自动使能扫描模式
**Extenal Trigger Conversion Source (外部触发转换源)**

![image-20251113211034752](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113201350498.png)

Regular Conversion launched by software 规则的软件触发 调用函数触发即可

Timer X Capture Compare X event 外部引脚触发,

Timer X Trigger Out event 定时器通道输出触发 需要设置相应的定时器设置

**Rank**         **转换顺序**
这个只修改**通道采样时间**即可 默认为1.5个周期

![image-20251113211116741](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113200725061.png)

多个通道时会有多个Rank，可以设定每个通道的转换顺序
ADC总转换时间如下计算：

TCONV = 采样时间+ 12.5个周期

当ADCCLK=14MHz(最大)，采样时间为1.5周期(最快)时，TCONV =1.5+12.5=14周期=1μs。

因此，**ADC的最小采样时间1us**（ADC时钟=14MHz，采样周期为1.5周期下得到） 这个上方也有讲解

注入通道设置
![image-20251113211202720](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113211338146.png)

也就是注入通道的设置，和转换通道没啥太大区别，这里不再详解

**WahchDog**

Enable Analog WatchDog Mode(使能模拟看门狗中断)

这个上方有讲解，本质也测量值就是超出测量范围或者低于最低范围，启动看门狗

![image-20251113211250123](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113211355140.png)



### **ADC转换结束中断**

![image-20251113211338146](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113211116741.png)

### **ADC的DMA传输**

![image-20251113211355140](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113211250123.png)



## 代码

**(1) 初始化过程**

- **引用头文件**：需要使用 sprintf 打印输出，以及数学函数，在 main.c 引用头文件：

```c
#include "stdio.h"
#include "string.h"
#include "math.h"
```

**在ADC初始化之后加上AD校准函数**

```C
MX_ADC1_Init();
HAL_ADCEx_Calibration_Start(&hadc1);    //AD校准
​
​
```



- **启动连续ADC转换**

```c
// 启动连续ADC转换
HAL_ADC_Start(&hadc1);
// 等待ADC稳定
HAL_ADC_PollForConversion(&hadc1, 50);   //等待转换完成，50为最大等待时间，单位为ms
```



**(2) 读取ADC结果**

```c
// 获取ADC值
result = HAL_ADC_GetValue(&hadc1);
// 计算电压值：电压 = ADC结果 × 3.3V ÷ 4095
voltage = result * 3.3f / 4095;
// 将变量打印为字符串
sprintf(send_buf, "原始值: %d，电压值: %.3f V\r\n", result, voltage);
// 通过串口2发送
HAL_UART_Transmit(&huart2, (uint8_t*) send_buf, strlen(send_buf), 20);
```

>>>>>>> 8401b80 (25111302)
