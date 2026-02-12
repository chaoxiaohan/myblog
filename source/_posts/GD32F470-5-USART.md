---
title: GD32F470入门教程（五）串口
date: 2026-02-12 15:00:00
type: paper
category: GD32F470xx
photos: 
tags:
excerpt: 本文介绍了GD32F470的USART串口通信，包括配置方法、数据收发、printf重定向及详细的固件库函数说明，帮助开发者快速实现串口应用。
description: 
---

# USART

对于GD32F4来说，通用同步异步收发器（USART）提供了一个灵活方便的串行数据交换接口，数据帧可以通过全双工或半双工，同步或异步的方式进行传输。USART提供了可编程的波特率发生器，能对UCLK（PCLK1, PCLK2）进行分频产生USART发送和接收所需的特定频率。USART不仅支持标准的异步收发模式，还实现了一些其他类型的串行数据交换模式，如红外编码规范，SIR，智能卡协议，LIN，以及同步单双工模式。它还支持多处理器通信和Modem流控操作（CTS/RTS）。数据帧支持从LSB或者MSB开始传输。数据位的极性和TX/RX引脚都可以灵活配置。
所有USART都支持DMA功能，以实现高速率的数据通信。

**主要特性**

![image-20260212155009513](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212155009513.png)

![image-20260212155026249](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212155026249.png)

## 串口库函数配置

一般我们使用串口，都需要有以下几个步骤。

- 开启时钟（包括串口时钟和 GPIO 时钟）
- 配置 GPIO 复用模式
- 配置 GPIO 的模式
- 配置 GPIO 的输出
- 配置串口（配置一些参数）
- 使能串口（串口使能和发送使能）

### 1.开启时钟

使用串口 0 的话就是 PA9 和 PA10 引脚。那第一步就是先开启端口 A 的时钟，在库函数点灯那一章节给大家介绍了使能时钟的函数 rcu_periph_clock_enable，只需要传入对应的参数即可。使能端口 A 的时钟就把 RCU_GPIOA 当做参数传入。第二步就是开启串口的时钟，把对应的串口 0 的时钟 RCU_USART0 传入即可。

```C
rcu_periph_clock_enable(BSP_USART_RCU); // 开启串口时钟
rcu_periph_clock_enable(RCU_GPIOA); // 开启端口时钟
```

### 2.配置 GPIO 复用模式

GD32的引脚大部分默认并不是串口引脚，所以我们需要复用GPIO

找到设置复用的函数

`void gpio_af_set(uint32_t gpio_periph, uint32_t alt_func_num, uint32_t pin);`

这个函数有三个参数，第一个参数就是要配置的引脚端口，第二个参数就是要复用的功能，第三个参数就是要配置的引脚。第一个参数和第三个参数我们知道分别为 GPIOA，GPIO_PIN_9，GPIOA，GPIO_PIN_10。关于第二个参数可以到数据手册找到

附GD32F470xx pin alternate functions

![image-20260212155824675](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212155824675.png)

根据上述表格，我们得到复用代码为

```C
gpio_af_set(GPIOA,BSP_USART_AF,GPIO_PIN_9);
gpio_af_set（GPIOA,BSP_USART_AF,GPIO_PIN_10);
```

### 3.配置 GPIO 的模式

配置 GPIO 的模式还是使用 gpio_mode_set 这个函数，不同的是第二个参数要配置为复用功能而不是输出功能，第三个参数要配置为上拉

### 4.配置 GPIO 的输出

配置 GPIO 的输出也还是用 gpio_output_options_set 这个函数，这个和之前库函数点灯配置的一样，修改一下引脚就可以直接套用。

### 5.配置串口

在使用一个外设之前，可以先复位一下，防止一些不必要的事情发生。在对应的外设库文件中一般都会有这个函数。

配置串口的大致流程：

复位对应串口->设置串口比特率->设置串口校验->设置数据位长度->设置停止位的位数

对应函数可查阅本文档末尾的函数库或参考手册固件库

6.使能串口

串口配置好之后并不能开始工作，还需要去使能，就是相当于有一个开关可以打开关闭。值得注意的是发送和接收也需要分别去使能，串口使能相当于一个总开关，发送和接收相当于分别控制的开关。要使用串口，首先要打开总开关，

`void usart_enable(uint32_t usart_periph);`

这个函数使能串口，有一个参数，就是要使能的串口。

然后如果要发送数据的话还需要使能发送功能。

`void usart_transmit_config(uint32_t usart_periph, uint32_t txconfig);`

如果要接收数据的话还需要使能接收功能。

`void usart_receive_config(uint32_t usart_periph, uint32_t rxconfig);`

## 串口发送数据

配置好串口之后，下一步的操作就是要发送数据。

`void usart_data_transmit(uint32_t usart_periph, uint32_t data);`

这个函数可以发送数据，有两个参数，第一个参数是要使用的串口，第二个参数是要发送的数据，不过需要注意的是这个函数一次只能发送一个字节。要保证串口稳定的传输，就需要在发送完一个字节之后再发送下一个字节。需要去检测数据发送完成。

`FlagStatus usart_flag_get(uint32_t usart_periph, usart_flag_enum flag);`

这个函数是获取状态寄存器的标志。有两个参数，第一个参数是要使用的串口，第二个参数是要获取的状态位

## printf 重定向

**在 keil 中使用 printf 一定要勾选“微库”选项**

首先 c 语言的 printf 函数中不断循环调用 fputc 函数，所以需要重写 fputc 函数，这个函数的功能就是打印输出一个字符，这不正和我们编写的 usart_send_data 函数功能一样。fputc 函数可写为



```C
int fputc(int ch, FILE *f)
{
    usart_data_transmit(BSP_USART, (uint8_t)ch);
    while(RESET == usart_flag_get(BSP_USART, USART_FLAG_TBE)); // 等待发送数据缓冲区标志置位
    return ch;
}
```

## USART相关库函数

GD32F4xx固件库提供了丰富的USART（通用同步异步收发器）函数，用于配置和管理串行通信。以下是主要USART函数的详细介绍，基于GD32F4xx_固件库使用指南_Rev1.2。

### 1. USART初始化和配置函数

#### usart_deinit
**函数原型：**
```C
void usart_deinit(uint32_t usart_periph);
```

**功能描述：**
将指定的USART重置为默认状态。

**参数：**
- `usart_periph`: USART外设（USART0, USART1等）。

**返回值：** 无

**示例：**
```C
usart_deinit(USART0); // 重置USART0
```

#### usart_baudrate_set
**函数原型：**
```C
void usart_baudrate_set(uint32_t usart_periph, uint32_t baudval);
```

**功能描述：**
设置USART波特率。

**参数：**
- `usart_periph`: USART外设。
- `baudval`: 波特率值（例如9600, 115200）。

**返回值：** 无

**示例：**
```C
usart_baudrate_set(USART0, 115200); // 设置USART0波特率为115200
```

#### usart_parity_config
**函数原型：**
```C
void usart_parity_config(uint32_t usart_periph, uint32_t paritycfg);
```

**功能描述：**
配置USART校验位。

**参数：**
- `usart_periph`: USART外设。
- `paritycfg`: 校验配置（USART_PM_NONE: 无校验, USART_PM_EVEN: 偶校验, USART_PM_ODD: 奇校验）。

**返回值：** 无

**示例：**
```C
usart_parity_config(USART0, USART_PM_NONE); // 无校验
```

#### usart_word_length_set
**函数原型：**
```C
void usart_word_length_set(uint32_t usart_periph, uint32_t wlen);
```

**功能描述：**
设置USART数据字长度。

**参数：**
- `usart_periph`: USART外设。
- `wlen`: 字长度（USART_WL_8BIT: 8位, USART_WL_9BIT: 9位）。

**返回值：** 无

**示例：**
```C
usart_word_length_set(USART0, USART_WL_8BIT); // 8位数据
```

#### usart_stop_bit_set
**函数原型：**
```C
void usart_stop_bit_set(uint32_t usart_periph, uint32_t stblen);
```

**功能描述：**
设置USART停止位长度。

**参数：**
- `usart_periph`: USART外设。
- `stblen`: 停止位长度（USART_STB_1BIT: 1位, USART_STB_0_5BIT: 0.5位, USART_STB_2BIT: 2位, USART_STB_1_5BIT: 1.5位）。

**返回值：** 无

**示例：**
```C
usart_stop_bit_set(USART0, USART_STB_1BIT); // 1位停止位
```

#### usart_enable
**函数原型：**
```C
void usart_enable(uint32_t usart_periph);
```

**功能描述：**
使能USART。

**参数：**
- `usart_periph`: USART外设。

**返回值：** 无

**示例：**
```C
usart_enable(USART0); // 使能USART0
```

#### usart_disable
**函数原型：**
```C
void usart_disable(uint32_t usart_periph);
```

**功能描述：**
禁用USART。

**参数：**
- `usart_periph`: USART外设。

**返回值：** 无

**示例：**
```C
usart_disable(USART0); // 禁用USART0
```

#### usart_transmit_config
**函数原型：**
```C
void usart_transmit_config(uint32_t usart_periph, uint32_t txconfig);
```

**功能描述：**
配置USART发送功能。

**参数：**
- `usart_periph`: USART外设。
- `txconfig`: 发送配置（USART_TRANSMIT_ENABLE: 使能发送, USART_TRANSMIT_DISABLE: 禁用发送）。

**返回值：** 无

**示例：**
```C
usart_transmit_config(USART0, USART_TRANSMIT_ENABLE); // 使能发送
```

#### usart_receive_config
**函数原型：**
```C
void usart_receive_config(uint32_t usart_periph, uint32_t rxconfig);
```

**功能描述：**
配置USART接收功能。

**参数：**
- `usart_periph`: USART外设。
- `rxconfig`: 接收配置（USART_RECEIVE_ENABLE: 使能接收, USART_RECEIVE_DISABLE: 禁用接收）。

**返回值：** 无

**示例：**
```C
usart_receive_config(USART0, USART_RECEIVE_ENABLE); // 使能接收
```

### 2. USART数据传输函数

#### usart_data_transmit
**函数原型：**
```C
void usart_data_transmit(uint32_t usart_periph, uint32_t data);
```

**功能描述：**
发送一个字节数据。

**参数：**
- `usart_periph`: USART外设。
- `data`: 要发送的数据（8位或9位）。

**返回值：** 无

**示例：**
```C
usart_data_transmit(USART0, 'A'); // 发送字符'A'
```

#### usart_data_receive
**函数原型：**
```C
uint16_t usart_data_receive(uint32_t usart_periph);
```

**功能描述：**
接收一个字节数据。

**参数：**
- `usart_periph`: USART外设。

**返回值：** 接收到的数据。

**示例：**
```C
uint16_t data = usart_data_receive(USART0); // 接收数据
```

### 3. USART状态和标志函数

#### usart_flag_get
**函数原型：**
```C
FlagStatus usart_flag_get(uint32_t usart_periph, usart_flag_enum flag);
```

**功能描述：**
获取USART状态标志位。

**参数：**
- `usart_periph`: USART外设。
- `flag`: 标志位（USART_FLAG_CTS: CTS, USART_FLAG_LBD: LIN断开, USART_FLAG_TBE: 发送缓冲区空, USART_FLAG_TC: 发送完成, USART_FLAG_RBNE: 接收缓冲区非空, USART_FLAG_IDLE: 空闲, USART_FLAG_ORERR: 过载错误, USART_FLAG_NERR: 噪声错误, USART_FLAG_FERR: 帧错误, USART_FLAG_PERR: 校验错误）。

**返回值：** SET或RESET。

**示例：**
```C
if (usart_flag_get(USART0, USART_FLAG_RBNE) == SET) {
    // 有数据可读
}
```

#### usart_flag_clear
**函数原型：**
```C
void usart_flag_clear(uint32_t usart_periph, usart_flag_enum flag);
```

**功能描述：**
清除USART状态标志位。

**参数：**
- `usart_periph`: USART外设。
- `flag`: 标志位。

**返回值：** 无

**示例：**
```C
usart_flag_clear(USART0, USART_FLAG_ORERR); // 清除过载错误标志
```

### 4. USART中断函数

#### usart_interrupt_enable
**函数原型：**
```C
void usart_interrupt_enable(uint32_t usart_periph, uint32_t interrupt);
```

**功能描述：**
使能USART中断。

**参数：**
- `usart_periph`: USART外设。
- `interrupt`: 中断类型（USART_INT_PERR: 校验错误, USART_INT_TBE: 发送缓冲区空, USART_INT_TC: 发送完成, USART_INT_RBNE: 接收缓冲区非空, USART_INT_IDLE: 空闲, USART_INT_LBD: LIN断开, USART_INT_CTS: CTS, USART_INT_ERR: 错误）。

**返回值：** 无

**示例：**
```C
usart_interrupt_enable(USART0, USART_INT_RBNE); // 使能接收中断
```

#### usart_interrupt_disable
**函数原型：**
```C
void usart_interrupt_disable(uint32_t usart_periph, uint32_t interrupt);
```

**功能描述：**
禁用USART中断。

**参数：**
- `usart_periph`: USART外设。
- `interrupt`: 中断类型。

**返回值：** 无

**示例：**
```C
usart_interrupt_disable(USART0, USART_INT_RBNE); // 禁用接收中断
```

#### usart_interrupt_flag_get
**函数原型：**
```C
FlagStatus usart_interrupt_flag_get(uint32_t usart_periph, uint32_t int_flag);
```

**功能描述：**
获取USART中断标志位。

**参数：**
- `usart_periph`: USART外设。
- `int_flag`: 中断标志（USART_INT_FLAG_PERR: 校验错误, USART_INT_FLAG_TBE: 发送缓冲区空, USART_INT_FLAG_TC: 发送完成, USART_INT_FLAG_RBNE: 接收缓冲区非空, USART_INT_FLAG_IDLE: 空闲, USART_INT_FLAG_LBD: LIN断开, USART_INT_FLAG_CTS: CTS, USART_INT_FLAG_ORERR: 过载错误, USART_INT_FLAG_NERR: 噪声错误, USART_INT_FLAG_FERR: 帧错误, USART_INT_FLAG_PERR: 校验错误）。

**返回值：** SET或RESET。

**示例：**
```C
if (usart_interrupt_flag_get(USART0, USART_INT_FLAG_RBNE) == SET) {
    // 处理接收中断
}
```

#### usart_interrupt_flag_clear
**函数原型：**
```C
void usart_interrupt_flag_clear(uint32_t usart_periph, uint32_t int_flag);
```

**功能描述：**
清除USART中断标志位。

**参数：**
- `usart_periph`: USART外设。
- `int_flag`: 中断标志。

**返回值：** 无

**示例：**
```C
usart_interrupt_flag_clear(USART0, USART_INT_FLAG_RBNE); // 清除接收中断标志
```

### 5. 其他USART函数

#### usart_hardware_flow_rts_config
**函数原型：**
```C
void usart_hardware_flow_rts_config(uint32_t usart_periph, uint32_t rtsconfig);
```

**功能描述：**
配置RTS硬件流控。

**参数：**
- `usart_periph`: USART外设。
- `rtsconfig`: RTS配置（USART_RTS_ENABLE: 使能, USART_RTS_DISABLE: 禁用）。

**返回值：** 无

**示例：**
```C
usart_hardware_flow_rts_config(USART0, USART_RTS_ENABLE);
```

#### usart_hardware_flow_cts_config
**函数原型：**
```C
void usart_hardware_flow_cts_config(uint32_t usart_periph, uint32_t ctsconfig);
```

**功能描述：**
配置CTS硬件流控。

**参数：**
- `usart_periph`: USART外设。
- `ctsconfig`: CTS配置（USART_CTS_ENABLE: 使能, USART_CTS_DISABLE: 禁用）。

**返回值：** 无

**示例：**
```C
usart_hardware_flow_cts_config(USART0, USART_CTS_ENABLE);
```

### 6. 相关宏定义和枚举

- **USART外设：** USART0, USART1, ..., USART5
- **校验配置：** USART_PM_NONE, USART_PM_EVEN, USART_PM_ODD
- **字长度：** USART_WL_8BIT, USART_WL_9BIT
- **停止位：** USART_STB_1BIT, USART_STB_0_5BIT, USART_STB_2BIT, USART_STB_1_5BIT
- **发送/接收配置：** USART_TRANSMIT_ENABLE, USART_TRANSMIT_DISABLE, USART_RECEIVE_ENABLE, USART_RECEIVE_DISABLE
- **标志位：** USART_FLAG_CTS, USART_FLAG_LBD, USART_FLAG_TBE, USART_FLAG_TC, USART_FLAG_RBNE, USART_FLAG_IDLE, USART_FLAG_ORERR, USART_FLAG_NERR, USART_FLAG_FERR, USART_FLAG_PERR
- **中断类型：** USART_INT_PERR, USART_INT_TBE, USART_INT_TC, USART_INT_RBNE, USART_INT_IDLE, USART_INT_LBD, USART_INT_CTS, USART_INT_ERR

在使用USART时，先开启时钟，配置GPIO复用，然后初始化USART参数，使能USART，最后进行数据收发。所有函数都在gd32f4xx_usart.h头文件中声明。

