---
title: STM32标准库笔记（三）-USART、I2C、SPI
date: 2025-10-05 00:00:00
type: paper
photos: 
tags:
  - C
  - STM32
  - Standard
excerpt: 本笔记详细介绍了标准库下的常用通信协议（USART、I2C、SPI）
description: 
---

[TOC]



# 通信接口了解

- **通信的目的︰**将一个设备的数据传送到另一个设备，扩展硬件系统
- **通信协议︰**制定通信的规则，**通信双方按照协议规则进行数据收发**
- STM32里边有下表这么多的通讯协议（表格仅列一些常看的典型参数）

| **名称**  | **引脚**             | **传输模式** | **时钟** | **电平** | **设备** |
| --------- | -------------------- | ------------ | -------- | -------- | -------- |
| **USART** | TX、RX               | 全双工       | 同/异步  | 单端     | 点对点   |
| **I2C**   | SCL、SDA             | 半双工       | 同步     | 单端     | 多设备   |
| **SPI**   | SCLK、MOSI、MISO、CS | 全双工       | 同步     | 单端     | 多设备   |
| **CAN**   | CAN_H、CAN_L         | 半双工       | 异步     | 差分     | 多设备   |
| **USB**   | DP、DM               | 半双工       | 异步     | 差分     | 点对点   |

同步需要时钟线来保证传输数据不冲突。

**【注】**全双工：打电话。	半双工：对讲机。	单工：广播。


# 一、USART通信



## 1.1 串口通讯协议

**通讯时钟：**同步靠时钟线，异步靠比特率（用的多）

### 1.1.1 简介

串口是一种应用十分广泛的通讯接口，串口成本低、容易使用、通信线路简单，可实现两个设备的互相通信。单片机的串口可以使单片机与单片机、单片机与电脑、单片机与各式各样的模块互相通信，极大地扩展了单片机的应用范围，增强了单片机系统的硬件实力。

![image-20251005170217041](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251005170217041.png)

### 1.1.2硬件电路

- 简单双向串口通信有两根通信线(发送端TX和接收端RX)
- TX与RX要交叉连接
- **当只需单向的数据传输时，可以只接一根通信线**
- 当电平标准不一致时，需要加电平转换芯片
- ![image-20251005170225431](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251005170225431.png)

| **因为TX/RX的高低电平是相对于GND来说的，所以这三根都是通讯线，双向通信必须要连接的。**VCC则看设备双方是否都有供电而考虑。 |      |
| ------------------------------------------------------------ | ---- |
|                                                              |      |

**【电平标准】**

电平标准是数据1和数据0的表达方式，是传输线缆中人为规定的电压与数据的对应关系，串口常用的电平标准有如下三种︰

TTL电平：+3.3V或+5V表示1，OV表示0

RS232电平（大机器）：-3~-15V表示1，+3~+15V表示0

RS485电平：两线压差+2~+6V表示1，-2~-6V表示0（差分信号）抗干扰（可达上千米）

### 1.1.3串口参数及时序

- **波特率∶**串口通信的速率（决定每隔多久发送一位）
- **起始位︰**标志一个数据帧的开始，固定为低电平
- **数据位︰**数据帧的有效载荷，1为高电平。0为低电平，低位先行
- **校验位︰**用于数据验证，根据数据位计算得来
- **停止位︰**用于数据帧间隔，固定为高电平
- ![image-20251005170311204](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251005170311204.png)

![1位校验](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1691033223554-d47c9fe6-19a1-47f6-9adb-bdd1c446beb5.png)

**校验方式：****奇偶校验、和校验、CRC校验、LRC校验.....**

**【时序波形】**![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1691033618972-9bff9465-8742-4039-b8ec-4b68f4468e7c.png)

## 1.2USART外设

### 1.2.1 USART简介

- UART：universal asynchronous receiver and transmitter通用异步收/发器

- USART： (Universal Synchronous/Asynchronous Receiver/Transmitter）通用同步/**异步收发器**

**注：**这里的同步模式，多了一个仅支持输出的时钟，是兼容别的协议或者特殊用途而设计；不支持两个USART之间进行同步通信。因此我们主要还是学习**异步通信**。

- USART是STM32内部集成的硬件外设，可根据数据寄存器的一个字节数据自动生成数据帧时序，从TX引脚发送出去，也可自动接收RX引脚的数据帧时序，**拼接为一个字节数据**，存放在数据寄存器里。
- 自带波特率发生器，最高达4.5Mbits/s
- **可配置参数：**数据位长度(**8**/9)、停止位长度(0.5/**1**/1.5/2)，即间隔
- 可选校验位（**无校验**/奇校验/偶校验)
- 支持同步模式、**硬件流控制**、DMA、智能卡、IrDA（红外通信）、LIN（局域网通信协议）

**【硬件流控制】**如果数据发送得过快来不及接收，那么就可以通过这个来控制USART处于可收发的状态，一般不用。

- STM32F103C8T6 USART资源：USART1、USART2、USART3

**注意：**开启时钟时候注意挂载的总线

### 1.2.2 USART框图

一开始比较乱，可以先忽略图中长条状寄存器每一位的描述。

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712124904471-ef939b0b-3d65-4505-b876-aed889f438c4.png)

主要关注TX/RX引脚，一个发送一个接收。

**DR寄存器：**占用同一个地址，但是硬件上是两个寄存器，TDR发送数据寄存器、RDR接收数据寄存器。

**移位寄存器：**一个发送，从寄存器转移（低位往高位发送）；一个接收，转移到寄存器（高位往低位接收）。通过标志位进行判断数据接收/发送完成。

发送接收器控制：

硬件数据流控：了解

SCK输出：用于兼容其他协议。

唤醒单元：**（了解）**串口实现挂载多设备，可以给串口分配一个地址，当发送制定地址时，此设备唤醒开始工作。当你发送别的设备地址时，别的设备就唤醒工作，没收到的就保持沉默。

 中断申请位：就是**状态寄存器**这里的各种标志位，标志位的TXE发送寄存器**空**，RXNE接收寄存器**非空**，是判断发送和接收状态的**必要标志位**。（其他可以看手册）

**USART中断控制：**配置中断是不是能通向NVIC

波特率发生器：分频器，APB时钟进行分频，得到发送和接收移位的时钟。

### 1.2.3 USART基本结构

发送接收引脚是GPIO的复用输出，开发时候，如果硬工没给你画好，则需要注意引脚的划分，避免冲突。

![USART简化结构图](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712126364830-821edca5-86e3-4d66-bbca-4989116d8282.png)

发送接收移位寄存器硬件上看着有四个，但实际软件成眠只有一个DR寄存器供我们读写。



## 1.3 数据帧解析

### 1.3.1 字长设置

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712126765468-747055a3-6622-45de-88ad-470dfd78138a.png)![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712130864481-d76b3cc7-953c-4147-b772-afd8cef0f9cc.png)

有效载荷保持1字节，会比较的...使强迫症情绪稳定。

### 1.3.2 配置停止位

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712127281220-c6e6365c-89ac-4a2f-8011-6896ab5f599e.png)不常用，随便配

### 1.3.3 USART输入数据策略

**起始位侦测：**数据采样位置对齐正中间

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712127532362-9833263d-7fef-4af4-b34e-ccb5ba9fcaf9.png)![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712127532362-9833263d-7fef-4af4-b34e-ccb5ba9fcaf9-1759655096590-117.png)

**数据采样流程：**可以对噪声进行判断，三次采样规则（全一致，采样电平不同，则按次数最多的考虑），但凡有不一致的就置位NE，代表有噪声。

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712128204113-7d8dbbfb-9882-40a5-8c27-3d306d8d72ed.png)

### 1.3.4 波特率发生器

发送器和接收器的波特率由波特率寄存器BRR里的DIV确定

**计算公式：**波特率= fPCLkK2/1/(16*DIV)

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712128613795-ac545a14-ce56-4d6a-8264-de01e13b41c3.png)自行理解。

### 1.3.5CH340模块

![USB转串口模块](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712129017094-2e6ebc9b-cc5e-441d-8002-66a0ca2dd193.png)

CH340的供电跳线帽最好不要拿掉，拿掉也没事，但只有3.3V供电。通讯电平不一致没啥关系，模块的供电正确就行了。其他是LED指示灯。



### 【案例】串口发送+接收

① 使能相关时钟：开启 USART1、GPIOA、AFIO 的时钟，USART1 和 GPIOA 属于 APB2 总线：

```c
#include "stm32f10x.h"
#include <string.h>

void USART1_Init(void) {
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_USART1 | RCC_APB2Periph_GPIOA | RCC_APB2Periph_AFIO, ENABLE);
```

② 配置串口 GPIO 引脚：PA9（TX）为复用推挽输出，PA10（RX）为浮空输入：

```c
    GPIO_InitTypeDef GPIO_InitStructure;
    // TX引脚（PA9）
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_9;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
    
    // RX引脚（PA10）
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_10;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
```

③ 初始化 USART1 核心参数：设置波特率 115200、8 位数据、1 位停止位、无校验：

```c
    USART_InitTypeDef USART_InitStructure;
    USART_InitStructure.USART_BaudRate = 115200;
    USART_InitStructure.USART_WordLength = USART_WordLength_8b;
    USART_InitStructure.USART_StopBits = USART_StopBits_1;
    USART_InitStructure.USART_Parity = USART_Parity_No;
    USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
    USART_InitStructure.USART_Mode = USART_Mode_Tx | USART_Mode_Rx;
    USART_Init(USART1, &USART_InitStructure);
```

④ 配置串口接收中断：配置 NVIC 优先级，使能 USART1 接收中断：

```c
    NVIC_InitTypeDef NVIC_InitStructure;
    NVIC_InitStructure.NVIC_IRQChannel = USART1_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 1;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);
    
    USART_ITConfig(USART1, USART_IT_RXNE, ENABLE);
    USART_Cmd(USART1, ENABLE);
}
```

⑤ 实现串口发送函数：包括单个字节发送和字符串发送：

```c
void USART1_SendByte(uint8_t byte) {
    while (USART_GetFlagStatus(USART1, USART_FLAG_TXE) == RESET);
    USART_SendData(USART1, byte);
}

void USART1_SendString(uint8_t *str) {
    uint16_t i = 0;
    while (str[i] != '\0') {
        USART1_SendByte(str[i]);
        i++;
    }
}
```

⑥ 定义接收缓冲区和标志：用于存储接收数据和标记接收完成：

```c
uint8_t rx_buf[100];
uint16_t rx_len = 0;
uint8_t rx_flag = 0; // 接收完成标志（如收到回车符置1）
```

⑦ 编写串口中断服务函数：接收数据并判断结束条件：

```c
void USART1_IRQHandler(void) {
    if (USART_GetITStatus(USART1, USART_IT_RXNE) != RESET) {
        uint8_t data = USART_ReceiveData(USART1); // 读取接收数据
        
        // 存储数据到缓冲区，遇到回车符结束
        if (rx_len < 99 && data != '\r') {
            rx_buf[rx_len++] = data;
        } else {
            rx_buf[rx_len] = '\0'; // 字符串结尾
            rx_flag = 1; // 置接收完成标志
            rx_len = 0; // 重置长度
        }
        
        USART_ClearITPendingBit(USART1, USART_IT_RXNE);
    }
}
```

⑧ 在 main 函数中使用：发送测试数据，接收并回传数据：

```c
int main(void) {
    USART1_Init();
    
    while (1) {
        // 发送示例
        USART1_SendString((uint8_t*)"Hello World!\r\n");
        
        // 接收处理
        if (rx_flag == 1) {
            USART1_SendString((uint8_t*)"Received: ");
            USART1_SendString(rx_buf);
            USART1_SendString((uint8_t*)"\r\n");
            rx_flag = 0; // 清除标志
        }
        
        // 延时
        for (uint32_t i = 0; i < 7200000; i++);
    }
}
```

## 1.4 USART串口数据包

### 1.4.1 HEX数据包

**数据包的作用？**

把一个个单独的数据打包起来，方便进行多字节通讯。打包的方式可以是自己设定，也可以是别开发者规定，即**自拟通讯协议**。根据协议规则（掐包头包尾）在连续不断接收的数据流中提取出需要的数据。

- **固定包长，含包头包尾（课程自拟）**

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712126765468-747055a3-6622-45de-88ad-470dfd78138a-1759654607515-18.png)

- **可变包长，含包头包尾**

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712130936028-02ce905e-b033-4724-8ab9-3dd8ecc0aab8.png)

**如果****数据位****和****包头****包尾****重复怎么办？**

**基础解决方案：**①限制载荷数据的范围，在范围内即为正常数据。②尽量使用固定包长，即规定有效数据长度，对齐后用于接收后判断提取。③增加包头包尾的字节数量，多次判断，好确定是包头。....（工作中还有其他方式，可自行学习）

**固定包长和可变包长如何选择？**

如果载荷数据会跟包头包尾重复，则固定长度比较合适。不重复就选可变。

### 1.4.2 文本数据包

**说明：**HEX数据包本身就是以原始的字节数据本身呈现的字节流，而文本数据包里面，每个字节就多了一层编码和译码，最终呈现出来的就是文本格式。虽然背后还是字节数据，这就存在**独特的字符**，可以有效避免数据载荷和包头包尾重复的问题。

**缺点：**解析效率低，需要根据使用场景来使用。

- **固定包长，含包头包尾**

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712131135216-2f3f9a13-ce0e-4846-9583-f0d10f3f6775.png)

- **可变包长，含包头包尾**

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712131162476-592e104f-33d4-4770-88b8-508858b7fa7c.png)

### 1.4.3 数据包接收

发送比较简单，接收比较复杂，因此复杂内容较值得讨论。接收逻辑通用。

![固定包长，HEX数据包接收](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713407933451-f4767ad8-a935-464a-bce2-b9b5296a071c.png)![可变包长，文本数据接收](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713407952381-eaed4fda-fd9a-457a-be21-c62aeb64027d.png)

**笔者说明：**使用状态机用于表示标志位再接受过程中的状态变化，用于判断不同情况，根据这些状态执行不同的操作代码。比如开始接收到一个字节，进入中断，此时状态还没有接收到包头=0，就需要先判断是不是包头，而不判断其他。就这样一个字节一个字节的判断，终于拿到了完整的包头，状态就发生了改变=1，这时候再接收到一个字节，直接就保存接收后面固定长度的内容，

## 【案例】串口收发HEX数据包

① 使能相关时钟：开启 USART1、GPIOA、AFIO 时钟：

```c
#include "stm32f10x.h"
#include <string.h>

#define HEX_BUF_SIZE 50 // HEX数据包最大长度

void USART1_Init(uint32_t baudrate) {
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_USART1 | RCC_APB2Periph_GPIOA | RCC_APB2Periph_AFIO, ENABLE);
```

② 配置串口 GPIO：PA9（TX）复用推挽，PA10（RX）浮空输入：

```c
    GPIO_InitTypeDef GPIO_InitStructure;
    // TX引脚（PA9）
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_9;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
    
    // RX引脚（PA10）
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_10;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
```

③ 初始化 USART 参数：设置波特率、无校验、8 位数据：

```c
    USART_InitTypeDef USART_InitStructure;
    USART_InitStructure.USART_BaudRate = baudrate;
    USART_InitStructure.USART_WordLength = USART_WordLength_8b;
    USART_InitStructure.USART_StopBits = USART_StopBits_1;
    USART_InitStructure.USART_Parity = USART_Parity_No;
    USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
    USART_InitStructure.USART_Mode = USART_Mode_Tx | USART_Mode_Rx;
    USART_Init(USART1, &USART_InitStructure);
```

④ 配置接收中断：使能 USART1 接收中断及 NVIC：

```c
    NVIC_InitTypeDef NVIC_InitStructure;
    NVIC_InitStructure.NVIC_IRQChannel = USART1_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 1;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);
    
    USART_ITConfig(USART1, USART_IT_RXNE, ENABLE); // 使能接收中断
    USART_Cmd(USART1, ENABLE);
}
```

⑤ 实现 HEX 发送函数：发送单字节 HEX 数据：

```c
// 发送单个HEX字节（如0xAB → 发送0x41 0x42，即字符'A''B'）
void USART1_SendHexByte(uint8_t hex) {
    uint8_t high = (hex >> 4) & 0x0F; // 高4位
    uint8_t low = hex & 0x0F;         // 低4位
    
    // 发送高4位（0-9→'0'-'9'，A-F→'A'-'F'）
    high += (high < 10) ? '0' : ('A' - 10);
    while (USART_GetFlagStatus(USART1, USART_FLAG_TXE) == RESET);
    USART_SendData(USART1, high);
    
    // 发送低4位
    low += (low < 10) ? '0' : ('A' - 10);
    while (USART_GetFlagStatus(USART1, USART_FLAG_TXE) == RESET);
    USART_SendData(USART1, low);
}

// 发送HEX数据包（带前缀0x和后缀空格，如0xAB 0xCD）
void USART1_SendHexPacket(uint8_t *buf, uint16_t len) {
    for (uint16_t i = 0; i < len; i++) {
        USART1_SendString((uint8_t*)"0x");
        USART1_SendHexByte(buf[i]);
        USART1_SendByte(' ');
    }
    USART1_SendString((uint8_t*)"\r\n");
}
```

⑥ 定义 HEX 接收缓冲区及状态变量：

```c
uint8_t hex_rx_buf[HEX_BUF_SIZE]; // 存储解析后的HEX数据
uint8_t hex_rx_len = 0;           // 接收长度
uint8_t rx_state = 0;             // 接收状态：0-空闲，1-接收高4位，2-接收低4位
uint8_t temp_hex = 0;             // 临时存储拼接的HEX值
```

⑦ 编写中断服务函数解析 HEX 数据：

```c
void USART1_IRQHandler(void) {
    if (USART_GetITStatus(USART1, USART_IT_RXNE) != RESET) {
        uint8_t data = USART_ReceiveData(USART1);
        uint8_t hex_val;
        
        // 字符转HEX值（0-9、A-F、a-f）
        if (data >= '0' && data <= '9') {
            hex_val = data - '0';
        } else if (data >= 'A' && data <= 'F') {
            hex_val = data - 'A' + 10;
        } else if (data >= 'a' && data <= 'f') {
            hex_val = data - 'a' + 10;
        } else {
            // 非HEX字符，重置状态（如空格、回车等作为分隔符）
            rx_state = 0;
            USART_ClearITPendingBit(USART1, USART_IT_RXNE);
            return;
        }
        
        // 状态机解析HEX
        switch (rx_state) {
            case 0: // 空闲状态，接收高4位
                temp_hex = hex_val << 4;
                rx_state = 1;
                break;
            case 1: // 接收低4位，拼接成完整字节
                temp_hex |= hex_val;
                if (hex_rx_len < HEX_BUF_SIZE) {
                    hex_rx_buf[hex_rx_len++] = temp_hex;
                }
                rx_state = 0; // 解析完成，回到空闲
                break;
        }
        
        USART_ClearITPendingBit(USART1, USART_IT_RXNE);
    }
}
```

⑧ 主函数中使用：发送测试 HEX 包，接收后回传：

```c
int main(void) {
    USART1_Init(115200); // 初始化串口，波特率115200
    
    // 测试发送：0x12 0x34 0xAB 0xCD
    uint8_t test_buf[] = {0x12, 0x34, 0xAB, 0xCD};
    USART1_SendString((uint8_t*)"Send: ");
    USART1_SendHexPacket(test_buf, 4);
    
    while (1) {
        // 接收处理：当收到数据时回传
        if (hex_rx_len > 0) {
            USART1_SendString((uint8_t*)"Received: ");
            USART1_SendHexPacket(hex_rx_buf, hex_rx_len);
            hex_rx_len = 0; // 重置接收长度
        }
    }
}
```

## 【案例】串口收发文本数据包

① 使能相关时钟：开启 USART1、GPIOA、AFIO 时钟：

```c
#include "stm32f10x.h"
#include <string.h>

#define TEXT_BUF_SIZE 100 // 文本数据包最大长度

void USART1_Init(uint32_t baudrate) {
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_USART1 | RCC_APB2Periph_GPIOA | RCC_APB2Periph_AFIO, ENABLE);
```

② 配置串口 GPIO：PA9（TX）复用推挽输出，PA10（RX）浮空输入：

```c
    GPIO_InitTypeDef GPIO_InitStructure;
    // TX引脚（PA9）
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_9;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
    
    // RX引脚（PA10）
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_10;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
```

③ 初始化 USART 参数：设置波特率、8 位数据、1 位停止位、无校验：

```c
    USART_InitTypeDef USART_InitStructure;
    USART_InitStructure.USART_BaudRate = baudrate;
    USART_InitStructure.USART_WordLength = USART_WordLength_8b;
    USART_InitStructure.USART_StopBits = USART_StopBits_1;
    USART_InitStructure.USART_Parity = USART_Parity_No;
    USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
    USART_InitStructure.USART_Mode = USART_Mode_Tx | USART_Mode_Rx;
    USART_Init(USART1, &USART_InitStructure);
```

④ 配置接收中断：使能 USART1 接收中断及 NVIC：

```c
    NVIC_InitTypeDef NVIC_InitStructure;
    NVIC_InitStructure.NVIC_IRQChannel = USART1_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 1;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);
    
    USART_ITConfig(USART1, USART_IT_RXNE, ENABLE);
    USART_Cmd(USART1, ENABLE);
}
```

⑤ 实现文本发送函数：发送字符串（以 '\0' 结尾）：

```c
// 发送单个字符
void USART1_SendChar(char c) {
    while (USART_GetFlagStatus(USART1, USART_FLAG_TXE) == RESET);
    USART_SendData(USART1, (uint8_t)c);
}

// 发送文本字符串
void USART1_SendText(const char *text) {
    while (*text != '\0') {
        USART1_SendChar(*text++);
    }
}

// 发送文本数据包（带换行符）
void USART1_SendTextPacket(const char *packet) {
    USART1_SendText(packet);
    USART1_SendText("\r\n"); // 换行作为包结束标志
}
```

⑥ 定义文本接收缓冲区及标志：

```c
char text_rx_buf[TEXT_BUF_SIZE]; // 接收缓冲区
uint16_t text_rx_len = 0;        // 接收长度
uint8_t text_rx_complete = 0;    // 接收完成标志（收到换行符置1）
```

⑦ 编写中断服务函数接收文本：

```c
void USART1_IRQHandler(void) {
    if (USART_GetITStatus(USART1, USART_IT_RXNE) != RESET) {
        char data = (char)USART_ReceiveData(USART1);
        
        // 处理接收：遇到换行符结束，否则存入缓冲区
        if (data == '\n' || data == '\r') {
            if (text_rx_len > 0) {
                text_rx_buf[text_rx_len] = '\0'; // 字符串结尾
                text_rx_complete = 1; // 置完成标志
                text_rx_len = 0; // 重置长度
            }
        } else {
            // 缓冲区未满则存储字符
            if (text_rx_len < TEXT_BUF_SIZE - 1) {
                text_rx_buf[text_rx_len++] = data;
            }
        }
        
        USART_ClearITPendingBit(USART1, USART_IT_RXNE);
    }
}
```

⑧ 主函数中使用：发送文本包，接收后回传：

```c
int main(void) {
    USART1_Init(115200); // 初始化串口，波特率115200
    
    // 发送测试文本包
    USART1_SendTextPacket("STM32 Serial Text Test");
    
    while (1) {
        // 接收完成后回传
        if (text_rx_complete) {
            USART1_SendText("Received: ");
            USART1_SendTextPacket(text_rx_buf);
            text_rx_complete = 0; // 清除标志
        }
    }
}
```



# 二、I2C通讯

## 2.1 简介

- I2C总线(InterIC BUS)是由Philips公司开发的一种通用数据总线
- **两根通信线：**SCL(SerialClock)、SDA(Serial Data)
- 同步，半双工
- 带数据应答
- 支持总线挂载多设备(一主多从、多主多从)

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713408530227-9cf6dcb4-b3f8-4aa8-bb4e-911e1b616030.png)

串口有USART硬件电路支持，异步通讯才比较稳定，但是软件模拟比较复杂。I2C因为是同步协议，软件模拟起来非常容易。**使用同步时序就可以极大地降低单片机对硬件电路的依赖。**即使没有硬件，也可以通过软件的引脚反转电平来实现时钟控制。而单片机去干别的事情的事就可以中断时钟线，这样设备也会停止接收，减少数据错误的可能。

异步通信就是省一根时钟线，对时间要求严格，对硬件电路的依赖比较严重。同步通讯则相反。

本教程主要任务：通过数据线，实现单片机外挂设备的控制功能，即实现读写外挂模块的寄存器。至少实现在指定位置写寄存器。

**一般使用一主多从的模式：**类似一个老师讲课，很多学生听课，学生只能被老师点名后才可以发言。

## 2.2 硬件电路

- 所有I2C设备的SCL连在一起，SDA连在一起
- 设备的SCL和SDA均要配置成开漏输出模式
- SCL和SDA各添加一个上拉电阻，阻值一般为4.7K左右

![I2C典型电路：一主多从](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712131240557-3889fa5d-0426-4dab-a086-725e3ba59c01.png)![设备引脚的内部结构](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713409169589-a7c164a4-76c6-47b5-8253-7697e647a136.png)

主机对SCL线具有完全控制功能，空闲时候主机控制SDA，只有从机发送数据或从机应答的时候，主机才会转交SDA的控制权给从机。

**为了防止电平没协调好而起冲突，****I2C设计禁止了所有设备输出强上拉的高电平，采用外置弱上拉电阻加开漏输出的电路结构**

**即只允许向下拉或者松手**![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1712131266676-9ee61f3f-21f4-4c21-9a5d-f60bf8e795d7.png)**，有电阻弹簧会自动拉高（弱上拉)。**

**【好处】：**

①完全杜绝了电源短路现象，保证电路的安全，防止同时被强拉或推的状态，即使多个根下拉杆子也没有问题。

②避免了引脚模式的频繁切换，开漏加弱上拉的模式，同时兼具了输入和输出的功能。想输出就拉杆子放手，操作杆子变化，观察即可得到电平。因为开漏模式下，输出高电平就相当于断开引脚，所有在输入之前，可以直接输出高电平，不需要切换成输入模式。

③模式会有一个线与的现象，只要有任意一个或多个设备输出了低电平，总线就处于低电平；所有设备输出高电平（放手）才处于高电平。I2C可以利用电路特征，执行多主机模式下的时钟同步和总线仲裁。

## 2.3 I2C时序基本单元

- **起始条件：**SCL高电平期间，SDA从高电平切换到低电平
- **终止条件：**SCL高电平期间，SDA从低电平切换到高电平

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713405351539-b1d8d705-d26c-4c4b-8d65-b7f90890c5f0.png)起始和终止条件都是由主机产生的，所有在总线空闲状态时，从机必须始终双手放开，不允许碰（如果触碰了就是多主机模式了)。

- **发送一个字节：**SCL低电平期间，主机将数据位依次放到SDA线上**（高位先行）**，然后释放SCL，从机将在SCL高电平期间读取数据位所以**SCL高电平期间SDA不允许有数据变化**，依次**循环**上述过程**8次**即可发送一个字节

![主机先改变SDA再改变SCL，循环8次即发送一个字节](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713409546978-ba7943dd-567e-4fc1-9379-f08f5fac6caf.png)一般上升沿时刻从机就已经读取完了。

- **接收一个字节：**SCL低电平期间，从机将数据位依次放到SDA线上**（高位先行）**，然后释放SCL，主机将在SCL高电平期间读取数据位所以SCL高电平期间SDA不允许有数据变化，依次循环上述过程8次即可接收一个字节**（主机在接收之前，需要释放SDA，**让发送从机控制**）**

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713410591126-1c8d605c-0a24-4979-b8a1-7350583d3d46.png)从机的数据变换贴着SCL下降沿，因为接受到SCL上升沿后需要响应时间。

- **发送应答：**主机在接收完一个字节之后，在下一个时钟**发送一位数据**，数据0表示应答，数据1表示非应答
- **接收应答：**主机在发送完一个字节之后，在下一个时钟**接收一位数据**，判断从机是否应答，数据0表示应答，数据1表示非应答（主机在接收之前，需要释放SDA）

![字节与字节收发之间的应答](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713410069864-ea206230-dcb7-40f6-8c0c-1c9dc5f1b525.png)

## 2.4 I2C时序

### 2.4.1 指定地址写

【过程说明】主机要确定访问的设备，就需要把每个从机都确定一个唯一的设备地址，从机设备地址就是名字。而主机发送前会叫一下这个名字，所有从机都会收到，但只有匹配的从机才进行响应读写操作。

【从机设备地址】在I2C标准里分为7位和10位地址，**教程讲7位，因为比较简单和应用范围广。**在每个设备出厂时候就会会被分配一个地址。具体可以在芯片手册里找到。相同型号的地址一般都是一样的地址。如果多个相同型号都挂在总线上。就需要用到**地址中的可变部分**来进行区分。

- **对于指定设备（Slave Address），在指定地址（Reg Address）下，写入指定数据（Data）**

![起始+从机地址+从应答+数据+从应答+...+结束](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713411995785-4ba966ae-9ddf-427a-ac54-acc57aedaf4a.png)

### 2.4.2 当前地址读

- 对于指定设备（Slave Address），**在当前地址指针指示的地址下，读取从机数据（Data）**

此时传输数据并没有指定写入从机的寄存器地址，因此需要用到地址指针。会自动增加地址写入。

![起始+从地址+应答+数据+应答+停止](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713412629590-8c8a7421-e3a5-4f87-9a5c-34289dc1467b.png)

### 2.4.3 指定地址读

对于指定设备（Slave Address），在指定地址（Reg Address）下，读取从机数据（Data）

需要在指定地址写的从机地址时序部分后+当前地址读的时序，从而得到。

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713413009421-4a3aa9af-dfc2-40c4-af32-a7e7872b29f3.png)

如果想发多个数据，只需要将数据部分重复即可，即在指定地址输入后，写入多个字节，地址会自增。注意这时候主机如果想要结束数据，就需要在最后一个数据结束后加上非应答，否则会让从机认为主机还需要数据，从机继续发生下一个数据，从而占据SDA，主机想产生停止条件就不能正常回答高电平了。



## 2.5 I2C外设简介

- STM32内部集成了硬件I2C收发电路，可以由**硬件自动执行**时钟生成、起始终止条件生成、应答位收发、数据收发等功能，**减轻CPU的负担**
- 支持多主机模型
- 支持7位/10位地址模式
- 支持不同的通讯速度，**标准速度(高达100 kHz)，快速(高达400 kHz)**
- 支持DMA
- 兼容SMBus（System Managerment Bus主要用于电源管理系统）协议
- STM32F103C8T6 硬件I2C资源**（硬件I2C受限于资源）**：I2C1、I2C2

软件模拟I2C是非常常见的，但是作为一个协议标准，I2C通讯也是可以有硬件收发电路的。**如果是简单应用，那么软件模拟会比较灵活，如果要求性能指标要求比较高，就考虑硬件I2C**。本小结讲硬件STM32内部的I2C外设。

多主机模式下，两个主机同时通讯占用总线就要发起总线仲裁。可变多主机模式，所有设备一视同仁，谁想当主机谁就站出来。

关于I2C地址，可以通过**修改低位可变地址部分**来避免地址冲突，也可以另外再开辟I2C总线，比较容易解决。而STM32支持10位地址，1024种可能。在实现中，剩下的5位地址会用作标志位。



## 2.6 I2C框图

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713431476418-bae840b6-1dbc-46b1-b71b-01b59599c60e.png)

**核心部分是数据寄存器和移位寄存器：**

- 当我们需要发送数据时，可以把一个字节数据写到数据寄存器DR，这个数据寄存器的值就会进一步转到移位寄存器里，在移位的过程中，就可以把下一个数据放到数据寄存器里等着了，一但前一个数据移位完成，下一个数据就可以无缝衔接，继续发送。其中数据寄存器转到移位寄存器时候，就会置状态寄存器的TXE位为1，表示**发送数据寄存器**为空。
- 当我们需要接收时候，也是输入的数据一位一位的，从引脚移入到移位寄存器里，当一个字数据具收齐后，数据整体从移位寄存器转移到数据寄存器，同时置标志位RXNE，表示**接收数据寄存器**非空。这时候就可以把数据读出来了。

略。

## 2.7 I2C基本结构

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713430249785-0a739fa7-7e7b-4ebf-a3b4-24969abc4a1c.png)略。

## 2.8 硬件I2C操作流程

参考序列图，才知道程序什么时候该做什么事情。手册给出了从机发送接收、主机发送接收，四个图，教程只关注主**机发送和接收**部分。

### 2.8.1 主机发送

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713431908451-df61800d-296e-45ad-9009-20d6f4d7828f.png)

7位地址起始条件后的**一个字节是寻址**，10位地址起始条件后的**两个字节都是寻址**。后续的数据可以由厂商规定。

STM32默认从模式，将硬件标志位置位，会因此转成主模式，表示有数据要发。之后软件检查EV5标志位（EVx标志位是组合了多个标志位的大标志位），看硬件是否都达到了想要的状态。

结合基本结构框图进行观看。

### 2.8.2 主机接收

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713432898610-3de4fd3b-7370-42eb-9c0b-3143170fe9de.png)

## 2.9 软硬件波形对比

![软件波形](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713491289906-4ceff14e-6038-4456-9f5c-bd9102901f1f.png)

![硬件波形](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713432903634-2d03b03f-bf6c-4f45-9574-3453cee155cb.png)

不标准的波形也不影响通讯。

手册，略。

## 【案例】硬件I2C读写

① 使能相关时钟：开启 I2C1、GPIO（连接 SCL 和 SDA）时钟，I2C1 属于 APB1 总线，GPIOB 属于 APB2 总线：

```c
#include "stm32f10x.h"

#define I2C_SCL_PIN GPIO_Pin_6 // GPIOB6作为SCL
#define I2C_SDA_PIN GPIO_Pin_7 // GPIOB7作为SDA
#define I2Cx I2C1

void I2C_Config(void) {
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_I2C1, ENABLE);
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB | RCC_APB2Periph_AFIO, ENABLE);
```

② 配置 I2C GPIO 引脚：SCL 和 SDA 需配置为复用开漏输出（I2C 总线要求）：

```c
    GPIO_InitTypeDef GPIO_InitStructure;
    GPIO_InitStructure.GPIO_Pin = I2C_SCL_PIN | I2C_SDA_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_OD; // 复用开漏输出
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOB, &GPIO_InitStructure);
```

③ 初始化 I2C 参数：设置时钟频率（如 100kHz 标准模式）、地址模式等：

```c
    I2C_InitTypeDef I2C_InitStructure;
    I2C_InitStructure.I2C_Mode = I2C_Mode_I2C; // I2C模式
    I2C_InitStructure.I2C_DutyCycle = I2C_DutyCycle_2; // 占空比2:1
    I2C_InitStructure.I2C_OwnAddress1 = 0x00; // 自身地址（从机模式用，主机模式可不设）
    I2C_InitStructure.I2C_Ack = I2C_Ack_Enable; // 使能应答
    I2C_InitStructure.I2C_AcknowledgedAddress = I2C_AcknowledgedAddress_7bit; // 7位地址模式
    I2C_InitStructure.I2C_ClockSpeed = 100000; // 时钟频率100kHz
    I2C_Init(I2Cx, &I2C_InitStructure);
    
    I2C_Cmd(I2Cx, ENABLE); // 使能I2C
```

④ 实现 I2C 起始信号函数：

```c
// 发送起始信号，返回0表示成功
uint8_t I2C_Start(void) {
    I2C_GenerateSTART(I2Cx, ENABLE);
    // 等待起始信号发送完成
    while (!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_MODE_SELECT));
    return 0;
}
```

⑤ 实现 I2C 发送设备地址函数（含读写位）：

```c
// 发送设备地址+读写位（read=1读，0写），返回0表示成功
uint8_t I2C_SendAddr(uint8_t addr, uint8_t read) {
    addr <<= 1;
    if (read) addr |= 0x01; // 读操作
    else addr &= ~0x01; // 写操作
    
    I2C_Send7bitAddress(I2Cx, addr, (read ? I2C_Direction_Receiver : I2C_Direction_Transmitter));
    
    // 等待地址应答
    if (read) {
        while (!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_RECEIVER_MODE_SELECTED));
    } else {
        while (!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_TRANSMITTER_MODE_SELECTED));
    }
    return 0;
}
```

⑥ 实现 I2C 发送数据函数：

```c
// 发送单个字节数据，返回0表示成功
uint8_t I2C_SendData(uint8_t data) {
    I2C_SendData(I2Cx, data);
    // 等待数据发送完成
    while (!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_BYTE_TRANSMITTED));
    return 0;
}
```

⑦ 实现 I2C 接收数据函数（带应答控制）：

```c
// 接收数据，last=1表示最后一个字节（不应答），返回接收值
uint8_t I2C_ReceiveData(uint8_t last) {
    if (last) {
        I2C_AcknowledgeConfig(I2Cx, DISABLE); // 最后一个字节不应答
        I2C_NACKPositionConfig(I2Cx, I2C_NACKPosition_Current);
    }
    
    // 等待数据接收完成
    while (!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_BYTE_RECEIVED));
    
    uint8_t data = I2C_ReceiveData(I2Cx);
    
    if (last) {
        I2C_AcknowledgeConfig(I2Cx, ENABLE); // 恢复应答使能
    }
    return data;
}
```

⑧ 实现 I2C 停止信号函数：

```c
void I2C_Stop(void) {
    I2C_GenerateSTOP(I2Cx, ENABLE);
}
```

⑨ 封装 I2C 写设备寄存器函数：

```c
// 向设备addr的reg寄存器写入data
uint8_t I2C_WriteReg(uint8_t addr, uint8_t reg, uint8_t data) {
    I2C_Start();
    I2C_SendAddr(addr, 0); // 写设备地址
    I2C_SendData(reg); // 发送寄存器地址
    I2C_SendData(data); // 发送数据
    I2C_Stop();
    return 0;
}
```

⑩ 封装 I2C 读设备寄存器函数：

```c
// 从设备addr的reg寄存器读取数据，返回读取值
uint8_t I2C_ReadReg(uint8_t addr, uint8_t reg) {
    uint8_t data;
    I2C_Start();
    I2C_SendAddr(addr, 0); // 写设备地址（用于发送寄存器地址）
    I2C_SendData(reg); // 发送寄存器地址
    
    I2C_Start(); // 重复起始信号
    I2C_SendAddr(addr, 1); // 读设备地址
    data = I2C_ReceiveData(1); // 读数据（最后一个字节）
    I2C_Stop();
    return data;
}
```

⑪ 主函数中使用示例（读写某 I2C 设备寄存器）：

```c
int main(void) {
    I2C_Config(); // 初始化I2C
    
    // 向设备0x48的0x00寄存器写入0x55
    I2C_WriteReg(0x48, 0x00, 0x55);
    
    // 从设备0x48的0x00寄存器读取数据
    uint8_t val = I2C_ReadReg(0x48, 0x00);
    
    while (1) {
        // 循环执行其他任务
    }
}
```

# 三、SPI通讯

## 3.1 简介

- SPI（Serial Peripheral Interface）是由Motorola公司开发的一种通用数据总线
- **四根通信线：**SCK（Serial Clock）、MOSI（Master Output Slave Input）、MISO（Master Input Slave Output）、SS（Slave Select）。名称会有不同，注意对照芯片手册即可。
- 同步，全双工
- 支持总线挂载多设备**（仅一主多从），会有多根SS线**

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713431916293-9ee70aa6-a40e-4f9a-9a76-2453d2b19207.png)

比较之前学习的I2C还是比较复杂的，地址限制下多设备都只需要两根线。但是其通讯线高电平驱动能力比较弱，这会导致上升沿的过程耗时长，限制通讯速度100、400KHz。**相对于I2C，SPI的优缺点：**

①SPI协议并没有严格规定最大传输速度，其取决于芯片厂商需求。

②SPI比较简单，没有I2C那么多功能。

③全双工，SPI硬件开销大，通讯过程中经常会有资源库浪费现象。有钱！就是要快速。

## 3.2 硬件电路

- 所有SPI设备的SCK、MOSI、MISO分别连在一起

- **SCK：**时钟线完全由主机掌控，主机输出，从机输入。
- MOSI：主机输出，从机输入
- MISO：主机输入**（看图中箭头）**，从机输出

- 主机另外引出**多条SS控制线**，分别接到各从机的SS引脚
- 输出引脚配置为推挽输出，输入引脚配置为浮空或上拉输入

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713433592337-3f0d7136-1782-4e5c-83a9-0f691a952171.png)

SPI的输入输出引脚是固定的，基本不会出现冲突，因此可以使用推挽输出。但SPI仍有可能在MISO线上多个从机推挽输出造成冲突，因此**SPI规定从机未被选中时候的MISO引脚必须为高阻态**，当然写主机程序不需要关注从机这个问题。

## 3.3 移位示意图

移位寄存器随着SCK的频率**触发移位**，会将箭头方向**移出**去的一位**放到引脚上**。在SCK频率触发的**间隔**，主机和从机都进行数据采集，**获取**移除位所在的引脚的电平存放到各自箭头方向连接的寄存器上。

![核心移位模型](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713493545035-4d02dfbe-fa5c-4955-91be-ddc801d7f597.png)![转移操作](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713492156937-2e2f0049-fdf3-4e0a-b96f-9a25918eab71.png)

多次后就完成了**一个字节的数据交换**。只收或只发的情况下，只需要忽略掉发送或者接收信号即可。

## 3.4 SPI时序基本单元

- 起始条件：SS从高电平切换到低电平
- 终止条件：SS从低电平切换到高电平

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713492999754-4c630ca1-e856-4a80-928c-37442192231d.png)

交换数据过程，SPI并没偶有规定在SCK的什么时候进行移位，给了开发者配置的选择，兼容更多芯片。**有两个可以配置的位，提高协议****兼容性****，产生了如下四种模式：****模式虽然多，功能相似，只学习一种即可。**

**【交换一个字节（模式0）】**

- （时钟极性）CPOL=0：空闲状态时，SCK为低电平
- （时钟相位）CPHA=0：**SCK第一个边沿移入数据**，第二个边沿移出数据

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713492423241-e822f06d-cad2-4df4-99e4-c402209fae4c.png)MISO不发送数据时候为高阻态（中间线)，只要SS不置高，可以一致重复交换数据。

**【交换一个字节（模式1）】****（常用、高速）**

- CPOL=0：空闲状态时，SCK为低电平
- CPHA=1：**SCK第一个边沿移出数据**，第二个边沿移入数据

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713493593360-5ed2396d-accf-41b5-85b1-93920dc0f837.png)

【交换一个字节（模式2）】

- CPOL=1：空闲状态时，SCK为高电平
- CPHA=0：SCK第一个边沿移入数据，第二个边沿移出数据

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713493728501-c407fbe7-198c-4214-b565-beb52215f646.png)

【交换一个字节（模式3）】

- CPOL=1：空闲状态时，SCK为高电平
- CPHA=1：SCK第一个边沿移出数据，第二个边沿移入数据

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713493662258-b3bf1661-67bb-4a1d-b44c-2336a21f1ee1.png)



## 3.5 SPI时序

### 3.5.1 发送指令

在I2C中使用的是读写寄存器的模型（地址+数据），而SPI通常采用指令码加读写数据的模型（指令码+数据）。

![（模式0）W24Q64时序例子：向SS指定的设备，发送指令（0x06）](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713494639985-291d367b-a600-4486-8f09-3429ece35da1.png)

### 3.5.2 指定地址写

向SS指定的设备，发送**写指令（0x02）**，随后在指定地址（**Address[23:0]**）下，写入指定数据（Data）

![W25Q64写](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713511798135-b47a97fa-ffab-4b47-bc84-e9453b387c8e.png)

W25Q64规定写指令之后的字节定义为地址高位。

### 3.5.3 指定地址读

向SS指定的设备，发送**读指令（0x03）**，随后在指定地址（Address[23:0]）下，读取从机数据（Data）

![W25Q64读](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713511360559-d01a436c-80a6-4357-9795-382a3f018243.png)

因为要读取数据，所以在指令码（0x03）+地址（0x123456）之后随便给从机一个数据，一般给0xFF，这时从机就会把0x123456地址下的数据通过MISO发给主机。如果主机继续发送数据，从机地址指针自动+1，就可以获取下一个地址的数据，实现多个地址接收。



## 3.6 SPI外设简介

- STM32内部集成了硬件SPI收发电路，可以由硬件自动执行时钟生成、数据收发等功能，减轻CPU的负担
- 可配置**8位**/16位数据帧（用得少）、**高位先行（SPI基本都是）**/低位先行**（串口是低位先行）**
- 时钟频率： fPCLK / (2, 4, 8, 16, 32, 64, 128, 256)
- 支持多主机模型、主或从操作
- 可精简为半双工/单工通信
- 支持DMA
- 兼容I2S协议（音频传输协议）
- STM32F103C8T6 硬件SPI资源：SPI1（72MHz）、SPI2（36MHz）



## 3.7 SPI框图

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713495033053-93e204af-b5d6-4788-b3d8-618ccf9a56bb.png)

MOSI和MISO引脚交叉连接部分，用于引脚变化的，用于主从机切换，只当主机时就不用管了。**其中箭头错误已更改**。移位寄存器参考先前的**移位示意图**的内容。

略

## 3.8 SPI基本结构

注：阅读手册时候，手册不同部分的名词翻译会有略微区别，但指代一致，注意理解。

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713513107476-d9939451-050a-457f-9ad1-4ea1c6b2a094.png)

注意TDR、TXE、RDR、RXNE等标志位。框图缺少SS，这个引脚使用普通GPIO来模拟即可。



## 3.9 主模式传输操作

### 3.9.1 全双工连续传输

![SPI模式3连续传输时序说明：如果对传输效率有要求可以研究](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713513113822-255dd4ea-5082-4691-a0d2-8f5bb75b3f17.png)

### 3.9.2 非连续传输

正常考虑这个传输方式。![SPI模式3非连续传输时序](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713514783672-1856fadf-f0b6-4a9a-b640-0459d5f0f490.png)

**【区别】：**当TXE置1后，第一个字节写入TDR，等待传输**第一个字节时序结束**，即接收完成，这时RXNE会置1，然后把第一个接受到的数据从RDR读出来**（较晚写入的原因）**，之后再写入下一个字节数据。

**【总结】：**

**①**等待TXE置1。**②**写入TDR数据。**③**等待RXNE置1。**④**读取RDR数据

继续循环等待TXE...再写入TDR数据.....将这4步骤封装成一个函数，掉一次写入一个字节，实现起来就非常简单。

**【缺点】：**在TXE置1的位置，没有及时把下一个数据写入TDR等候着，当读取数据完成后，下一个字节数据还没有传输，就会使得**字节与字节之间**有等待间隙。慢的时钟速度下不明显，但一快起来就明显拖慢。

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713514909266-89ef990b-0f9e-4cb0-be70-127d3f810ff3.png)![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713495070777-ba528e60-140d-4319-ba0b-8df398629627.png)

因此在追求最高性能的，还是使用连续传输操作逻辑或者进一步采用DMA转运。

## 3.10 软硬件波形对比

![软件SPI](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713513072335-c709c6db-691a-4ce3-ae6c-378efbc5da0d.png)

![硬件SPI](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713513084349-37b0d6af-35e5-4712-9a6a-f4119483e79a.png)

手册，略

## 【案例】硬件SPI读写W25Q64

① 使能相关时钟：开启 SPI1、GPIO（SCK、MOSI、MISO、CS）时钟，SPI1 属于 APB2 总线，GPIOA 属于 APB2 总线：

```c
#include "stm32f10x.h"

// W25Q64引脚定义（SPI1）
#define W25Q_SCK_PIN  GPIO_Pin_5  // PA5
#define W25Q_MOSI_PIN GPIO_Pin_7  // PA7
#define W25Q_MISO_PIN GPIO_Pin_6  // PA6
#define W25Q_CS_PIN   GPIO_Pin_4  // PA4（片选）
#define W25Q_SPI      SPI1

void W25Q64_Init(void) {
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_SPI1 | RCC_APB2Periph_GPIOA, ENABLE);
```

② 配置 SPI GPIO 引脚：SCK、MOSI 为复用推挽输出，MISO 为浮空输入，CS 为推挽输出：

```c
    GPIO_InitTypeDef GPIO_InitStructure;
    // SCK、MOSI：复用推挽输出
    GPIO_InitStructure.GPIO_Pin = W25Q_SCK_PIN | W25Q_MOSI_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
    
    // MISO：浮空输入
    GPIO_InitStructure.GPIO_Pin = W25Q_MISO_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
    
    // CS：推挽输出（手动控制片选）
    GPIO_InitStructure.GPIO_Pin = W25Q_CS_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
    GPIO_SetBits(GPIOA, W25Q_CS_PIN); // 初始拉高（未选中）
    GPIO_Init(GPIOA, &GPIO_InitStructure);
```

③ 初始化 SPI 参数：设置为主机模式，时钟极性 / 相位（CPOL=1，CPHA=1，匹配 W25Q64）：

```c
    SPI_InitTypeDef SPI_InitStructure;
    SPI_InitStructure.SPI_Direction = SPI_Direction_2Line_FullDuplex; // 全双工
    SPI_InitStructure.SPI_Mode = SPI_Mode_Master; // 主机模式
    SPI_InitStructure.SPI_DataSize = SPI_DataSize_8b; // 8位数据
    SPI_InitStructure.SPI_CPOL = SPI_CPOL_High; // 时钟极性：高电平空闲
    SPI_InitStructure.SPI_CPHA = SPI_CPHA_2Edge; // 时钟相位：第二个边沿采样
    SPI_InitStructure.SPI_NSS = SPI_NSS_Soft; // 软件控制片选
    SPI_InitStructure.SPI_BaudRatePrescaler = SPI_BaudRatePrescaler_2; // 分频（72MHz/2=36MHz）
    SPI_InitStructure.SPI_FirstBit = SPI_FirstBit_MSB; // 高位在前
    SPI_InitStructure.SPI_CRCPolynomial = 7; // CRC多项式（不使用CRC）
    SPI_Init(W25Q_SPI, &SPI_InitStructure);
    
    SPI_Cmd(W25Q_SPI, ENABLE); // 使能SPI
```

④ 实现 SPI 单字节收发函数：

```c
// SPI发送并接收一个字节（全双工）
uint8_t SPI_WriteReadByte(uint8_t tx_data) {
    // 等待发送缓冲区为空
    while (SPI_I2S_GetFlagStatus(W25Q_SPI, SPI_I2S_FLAG_TXE) == RESET);
    SPI_I2S_SendData(W25Q_SPI, tx_data);
    
    // 等待接收缓冲区非空
    while (SPI_I2S_GetFlagStatus(W25Q_SPI, SPI_I2S_FLAG_RXNE) == RESET);
    return SPI_I2S_ReceiveData(W25Q_SPI);
}
```

⑤ 实现 W25Q64 基础控制函数（片选、唤醒、擦除等）：

```c
// 选中W25Q64
void W25Q_Select(void) {
    GPIO_ResetBits(GPIOA, W25Q_CS_PIN);
}

// 取消选中W25Q64
void W25Q_Deselect(void) {
    GPIO_SetBits(GPIOA, W25Q_CS_PIN);
}

// 读取设备ID（验证通信）
uint16_t W25Q_ReadID(void) {
    uint16_t id;
    W25Q_Select();
    SPI_WriteReadByte(0x90); // 读ID命令
    SPI_WriteReadByte(0x00); // 地址高位
    SPI_WriteReadByte(0x00); // 地址中位
    SPI_WriteReadByte(0x00); // 地址低位
    id = (SPI_WriteReadByte(0xFF) << 8) | SPI_WriteReadByte(0xFF); // 读取ID
    W25Q_Deselect();
    return id; // W25Q64的ID应为0xEF16
}

// 写使能
void W25Q_WriteEnable(void) {
    W25Q_Select();
    SPI_WriteReadByte(0x06); // 写使能命令
    W25Q_Deselect();
}

// 等待忙状态结束
void W25Q_WaitBusy(void) {
    W25Q_Select();
    SPI_WriteReadByte(0x05); // 读状态寄存器命令
    while ((SPI_WriteReadByte(0xFF) & 0x01) == 0x01); // 忙标志位为1时等待
    W25Q_Deselect();
}
```

⑥ 实现扇区擦除函数（W25Q64 最小擦除单位为 4KB 扇区）：

```c
void W25Q_EraseSector(uint32_t addr) {
    W25Q_WriteEnable();
    W25Q_WaitBusy();
    
    W25Q_Select();
    SPI_WriteReadByte(0x20); // 扇区擦除命令
    // 发送3字节地址（24位）
    SPI_WriteReadByte((addr >> 16) & 0xFF);
    SPI_WriteReadByte((addr >> 8) & 0xFF);
    SPI_WriteReadByte(addr & 0xFF);
    W25Q_Deselect();
    
    W25Q_WaitBusy(); // 等待擦除完成（约400ms）
}
```

⑦ 实现页写入函数（W25Q64 一页为 256 字节）：

```c
void W25Q_WritePage(uint32_t addr, uint8_t *data, uint16_t len) {
    if (len > 256) len = 256; // 超过一页限制
    
    W25Q_WriteEnable();
    W25Q_WaitBusy();
    
    W25Q_Select();
    SPI_WriteReadByte(0x02); // 页写入命令
    // 发送3字节地址
    SPI_WriteReadByte((addr >> 16) & 0xFF);
    SPI_WriteReadByte((addr >> 8) & 0xFF);
    SPI_WriteReadByte(addr & 0xFF);
    // 写入数据
    for (uint16_t i = 0; i < len; i++) {
        SPI_WriteReadByte(data[i]);
    }
    W25Q_Deselect();
    
    W25Q_WaitBusy();
}
```

⑧ 实现连续读取函数：

```c
void W25Q_ReadData(uint32_t addr, uint8_t *data, uint16_t len) {
    W25Q_Select();
    SPI_WriteReadByte(0x03); // 读数据命令
    // 发送3字节地址
    SPI_WriteReadByte((addr >> 16) & 0xFF);
    SPI_WriteReadByte((addr >> 8) & 0xFF);
    SPI_WriteReadByte(addr & 0xFF);
    // 读取数据
    for (uint16_t i = 0; i < len; i++) {
        data[i] = SPI_WriteReadByte(0xFF);
    }
    W25Q_Deselect();
}
```

⑨ 主函数使用示例（擦除→写入→读取验证）：

```c
int main(void) {
    uint8_t w_data[5] = {0x11, 0x22, 0x33, 0x44, 0x55};
    uint8_t r_data[5];
    uint16_t id;
    
    W25Q64_Init();
    id = W25Q_ReadID(); // 读取ID，验证是否为0xEF16
    
    // 擦除0x00000地址的扇区
    W25Q_EraseSector(0x00000);
    
    // 向0x00000地址写入5字节数据
    W25Q_WritePage(0x00000, w_data, 5);
    
    // 从0x00000地址读取5字节数据
    W25Q_ReadData(0x00000, r_data, 5);
    
    while (1) {
        // 循环执行
    }
}
```

> 笔记部分引用菜工啊潜

>  STM32标准库系列文章
>
>  [STM32标准库笔记（一）-准备、GPIO、中断 | 超小韓の个人博客](https://blog.chaoxiaohan.cyou/2025/10/01/STM32_Standard_Peripheral_Libraries-1/)
>
>  [STM32标准库笔记（二）-PWM、ADC、DMA | 超小韓の个人博客](https://blog.chaoxiaohan.cyou/2025/10/03/STM32_Standard_Peripheral_Libraries-2/)
>
>  [STM32标准库笔记（三）-USART、I2C、SPI | 超小韓の个人博客](https://blog.chaoxiaohan.cyou/2025/10/05/STM32_Standard_Peripheral_Libraries-3/)
>
>  [STM32标准库笔记（四）-BKP、RTC、PWR、WDG、FLASH | 超小韓の个人博客](https://blog.chaoxiaohan.cyou/2025/10/06/STM32_Standard_Peripheral_Libraries-4/)