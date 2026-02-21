---
title: GD32F470入门教程（四）中断（EXTI）
date: 2026-02-12 00:00:00
type: paper
category: GD32F470xx
photos: 
tags:
excerpt: 该教程包括了GD32F470xx的中断配置、外部中断的使用、EXTI相关函数
description: 
---

# 中断

Cortex®-M4 集成了嵌套式矢量型中断控制器（Nested Vectored Interrupt Controller （NVIC））来实现高效的异常和中断处理。NVIC 实现了低延迟的异常和中断处理，以及电源管理控制。它和内核是紧密耦合的。更多关于NVIC 的说明请参考《Cortex®-M4 技术参考手册》。

EXTI（中断/事件控制器）包括23 个相互独立的边沿检测电路并且能够向处理器内核产生中断请求或唤醒事件。EXTI 有三种触发类型：上升沿触发、下降沿触发和任意沿触发。EXTI 中的每一个边沿检测电路都可以独立配置和屏蔽。

## 中断向量表

![image-20260212105823589](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212105823589.png)

![image-20260212105912893](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212105912893.png)

![image-20260212105929109](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212105929109.png)

## 外部中断按键点灯

### 1.开启时钟

需要开启GPIO时钟和系统配置时钟

```C
/* 开启时钟 */
rcu_periph_clock_enable(RCU_GPIOA);
rcu_periph_clock_enable(RCU_SYSCFG); 
```

### 2.配置 GPIO 模式

```C
/* 配置为输入模式 下拉模式 */
gpio_mode_set(BSP_KEY_PORT, GPIO_MODE_INPUT, GPIO_PUPD_PULLDOWN, BSP_KEY_PIN);
// 按键默认状态是低电平，配置为下拉
```

### 3.使能 NVIC 中断并配置优先级

#### 设置中断优先级分组

使用`void nvic_priority_group_set(uint32_t nvic_prigroup);`

![image-20260212133136765](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212133136765.png)

关于优先级的选择根据系统功能的不同配置不同，选择一个合适的即可。这里就选择中间的作为讲解。

设置优先级分组代码为：

```C
nvic_priority_group_set(NVIC_PRIGROUP_PRE2_SUB2);
    // 设置中断优先级组  2位用于抢占优先级，2位用于响应优先级
```

#### 配置优先级

中断分组设置完成还需要配置中断的抢占优先级和响应优先级。

`void nvic_irq_enable(uint8_t nvic_irq, uint8_t nvic_irq_pre_priority, uint8_t nvic_irq_sub_priority);`

这个函数配置中断的优先级。有三个参数，第一个参数就是要配置的中断类型，第二个参数是抢占优先级，第三个参数是响应优先级。

翻阅固件库手册，我们可以找到中断类型的枚举

![image-20260212133833950](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212133833950.png)

![image-20260212133849313](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212133849313.png)

![image-20260212133906991](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212133906991.png)

> 这里需要注意一下，关于 16 个 IO 中断的中断类型为 0-4 引脚配置为 EXTIx_IRQn(x=可取 1-4)，
>
> 5-9 引脚配置为 EXTI5_9_IRQn，10-15 引脚配置为 EXTI10_15_IRQn 。

上一步中断分组设置了 2 位抢占优先级，2 位响应优先级，那对应的抢占优先级等级为 0-3，响应优先级等级为 0-3，按键检测事件属于不是很紧急的任务，我们配置为最低优先级。配置代码为：

```C
/* 使能NVIC中断 中断分组为2位抢占优先级，2位子优先级
*/nvic_irq_enable(EXTI0_IRQn,3U,3U);  // 抢占优先级3，子优先级3
```

### 4.配置 GPIO 中断

在配置中断优先级之后，需要将中断线和 gpio 进行连接。

我们需要使用`void syscfg_exti_line_config(uint8_t exti_port, uint8_t exti_pin);`

这个函数配置 GPIO 作为中断使用，有两个参数，第一个参数就是对应的中断引脚资源端口，第二个参数就是对应的中断引脚。关于中断资源引脚定义，如下

![image-20260212142934569](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212142934569.png)

配置中断到 GPIO 可写为：

```C
/* 连接中断线到GPIO */
syscfg_exti_line_config( EXTI_SOURCE_GPIOA,EXTI_SOURCE_PIN0);
```

配置好中断和 GPIO 连接之后，还需要对中断进行初始化，配置一些参数。在 gd32f4xx_exti.h 中有

`void exti_init(exti_line_enum linex, exti_mode_enum mode, exti_trig_type_enum trig_type);`

这个函数初始化中断配置。有三个参数，第一个参数是中断线，第二个参数是中断模式，第三个参数是触发类型。

关于中断线一共有 23 个，查阅手册我们得知

![image-20260212143234345](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212143234345.png)

![image-20260212143254293](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212143254293.png)

关于每个中断线对应的功能

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/interrupt_20240809_233101.jpeg)

我们可知PA0 的中断线就是 EXTI_0。

关于中断模式的可选选项和触发类型的可选选项

![image-20260212143503808](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260212143503808.png)

最终初始化中断线配置为中断模式，上升沿和下降沿均触发。

```C
/* 初始化中断线 */
exti_init(EXTI_0,EXTI_INTERRUPT,EXTI_TRIG_BOTH);
```

### 5.使能中断和清除中断标志位

配置好中断之后，就可以开启中断了。

`void exti_interrupt_enable(exti_line_enum linex);`

这个函数使能中断，有一个参数就是中断线。

配置如下：



```
/* 使能中断 */
exti_interrupt_enable(BSP_KEY_EXTI_LINE);
```

在使用中断的时候先清一下中断标志位，确保中断是有效的。

`void exti_interrupt_flag_clear(exti_line_enum linex);`

这个函数是清除中断标志位，有一个参数就是中断线。

配置如下：

```C
/* 清除中断标志位 */
exti_interrupt_flag_clear(EXTI_0);
```

### 1.1.6.编写中断服务函数

使能中断之后，如果有中断触发，就会跳转到中断处理函数里面执行。需要编写中断处理函数。首先是中断函数名， 这个是固定的，在 startup_gd32f450_470.s 启动文件中有定义

```C

;               /* external interrupts handler */
                DCD     WWDGT_IRQHandler                  ; 16:Window Watchdog Timer
                DCD     LVD_IRQHandler                    ; 17:LVD through EXTI Line detect
                DCD     TAMPER_STAMP_IRQHandler           ; 18:Tamper and TimeStamp through EXTI Line detect
                DCD     RTC_WKUP_IRQHandler               ; 19:RTC Wakeup through EXTI Line
                DCD     FMC_IRQHandler                    ; 20:FMC
                DCD     RCU_CTC_IRQHandler                ; 21:RCU and CTC
                DCD     EXTI0_IRQHandler                  ; 22:EXTI Line 0
                DCD     EXTI1_IRQHandler                  ; 23:EXTI Line 1
                DCD     EXTI2_IRQHandler                  ; 24:EXTI Line 2
                DCD     EXTI3_IRQHandler                  ; 25:EXTI Line 3
                DCD     EXTI4_IRQHandler                  ; 26:EXTI Line 4
                DCD     DMA0_Channel0_IRQHandler          ; 27:DMA0 Channel0
                DCD     DMA0_Channel1_IRQHandler          ; 28:DMA0 Channel1
                DCD     DMA0_Channel2_IRQHandler          ; 29:DMA0 Channel2
                DCD     DMA0_Channel3_IRQHandler          ; 30:DMA0 Channel3
                DCD     DMA0_Channel4_IRQHandler          ; 31:DMA0 Channel4
                DCD     DMA0_Channel5_IRQHandler          ; 32:DMA0 Channel5
                DCD     DMA0_Channel6_IRQHandler          ; 33:DMA0 Channel6
                DCD     ADC_IRQHandler                    ; 34:ADC
                DCD     CAN0_TX_IRQHandler                ; 35:CAN0 TX
                DCD     CAN0_RX0_IRQHandler               ; 36:CAN0 RX0
                DCD     CAN0_RX1_IRQHandler               ; 37:CAN0 RX1
                DCD     CAN0_EWMC_IRQHandler              ; 38:CAN0 EWMC
                DCD     EXTI5_9_IRQHandler                ; 39:EXTI5 to EXTI9
                DCD     TIMER0_BRK_TIMER8_IRQHandler      ; 40:TIMER0 Break and TIMER8
                DCD     TIMER0_UP_TIMER9_IRQHandler       ; 41:TIMER0 Update and TIMER9
                DCD     TIMER0_TRG_CMT_TIMER10_IRQHandler ; 42:TIMER0 Trigger and Commutation and TIMER10
                DCD     TIMER0_Channel_IRQHandler         ; 43:TIMER0 Capture Compare
                DCD     TIMER1_IRQHandler                 ; 44:TIMER1
                DCD     TIMER2_IRQHandler                 ; 45:TIMER2
                DCD     TIMER3_IRQHandler                 ; 46:TIMER3
                DCD     I2C0_EV_IRQHandler                ; 47:I2C0 Event
                DCD     I2C0_ER_IRQHandler                ; 48:I2C0 Error
                DCD     I2C1_EV_IRQHandler                ; 49:I2C1 Event
                DCD     I2C1_ER_IRQHandler                ; 50:I2C1 Error
                DCD     SPI0_IRQHandler                   ; 51:SPI0
                DCD     SPI1_IRQHandler                   ; 52:SPI1
                DCD     USART0_IRQHandler                 ; 53:USART0
                DCD     USART1_IRQHandler                 ; 54:USART1
                DCD     USART2_IRQHandler                 ; 55:USART2
                DCD     EXTI10_15_IRQHandler              ; 56:EXTI10 to EXTI15
                DCD     RTC_Alarm_IRQHandler              ; 57:RTC Alarm
                DCD     USBFS_WKUP_IRQHandler             ; 58:USBFS Wakeup
                DCD     TIMER7_BRK_TIMER11_IRQHandler     ; 59:TIMER7 Break and TIMER11
                DCD     TIMER7_UP_TIMER12_IRQHandler      ; 60:TIMER7 Update and TIMER12
                DCD     TIMER7_TRG_CMT_TIMER13_IRQHandler ; 61:TIMER7 Trigger and Commutation and TIMER13
                DCD     TIMER7_Channel_IRQHandler         ; 62:TIMER7 Channel Capture Compare
                DCD     DMA0_Channel7_IRQHandler          ; 63:DMA0 Channel7
                DCD     EXMC_IRQHandler                   ; 64:EXMC
                DCD     SDIO_IRQHandler                   ; 65:SDIO
                DCD     TIMER4_IRQHandler                 ; 66:TIMER4
                DCD     SPI2_IRQHandler                   ; 67:SPI2
                DCD     UART3_IRQHandler                  ; 68:UART3
                DCD     UART4_IRQHandler                  ; 69:UART4
                DCD     TIMER5_DAC_IRQHandler             ; 70:TIMER5 and DAC0 DAC1 Underrun error
                DCD     TIMER6_IRQHandler                 ; 71:TIMER6
                DCD     DMA1_Channel0_IRQHandler          ; 72:DMA1 Channel0
                DCD     DMA1_Channel1_IRQHandler          ; 73:DMA1 Channel1
                DCD     DMA1_Channel2_IRQHandler          ; 74:DMA1 Channel2
                DCD     DMA1_Channel3_IRQHandler          ; 75:DMA1 Channel3
                DCD     DMA1_Channel4_IRQHandler          ; 76:DMA1 Channel4
                DCD     ENET_IRQHandler                   ; 77:Ethernet
                DCD     ENET_WKUP_IRQHandler              ; 78:Ethernet Wakeup through EXTI Line
                DCD     CAN1_TX_IRQHandler                ; 79:CAN1 TX
                DCD     CAN1_RX0_IRQHandler               ; 80:CAN1 RX0
                DCD     CAN1_RX1_IRQHandler               ; 81:CAN1 RX1
                DCD     CAN1_EWMC_IRQHandler              ; 82:CAN1 EWMC
                DCD     USBFS_IRQHandler                  ; 83:USBFS
                DCD     DMA1_Channel5_IRQHandler          ; 84:DMA1 Channel5
                DCD     DMA1_Channel6_IRQHandler          ; 85:DMA1 Channel6
                DCD     DMA1_Channel7_IRQHandler          ; 86:DMA1 Channel7
                DCD     USART5_IRQHandler                 ; 87:USART5
                DCD     I2C2_EV_IRQHandler                ; 88:I2C2 Event
                DCD     I2C2_ER_IRQHandler                ; 89:I2C2 Error
                DCD     USBHS_EP1_Out_IRQHandler          ; 90:USBHS Endpoint 1 Out 
                DCD     USBHS_EP1_In_IRQHandler           ; 91:USBHS Endpoint 1 in
                DCD     USBHS_WKUP_IRQHandler             ; 92:USBHS Wakeup through EXTI Line
                DCD     USBHS_IRQHandler                  ; 93:USBHS
                DCD     DCI_IRQHandler                    ; 94:DCI
                DCD     0                                 ; 95:Reserved
                DCD     TRNG_IRQHandler                   ; 96:TRNG
                DCD     FPU_IRQHandler                    ; 97:FPU
                DCD     UART6_IRQHandler                  ; 98:UART6
                DCD     UART7_IRQHandler                  ; 99:UART7
                DCD     SPI3_IRQHandler                   ; 100:SPI3
                DCD     SPI4_IRQHandler                   ; 101:SPI4
                DCD     SPI5_IRQHandler                   ; 102:SPI5
                DCD     0                                 ; 103:Reserved
                DCD     TLI_IRQHandler                    ; 104:TLI
                DCD     TLI_ER_IRQHandler                 ; 105:TLI Error
                DCD     IPA_IRQHandler                    ; 106:IPA

__Vectors_End
```

在中断处理函数里需要检测中断标志位是否被置位。

`FlagStatus exti_interrupt_flag_get(exti_line_enum linex);`

这个函数是获取中断标志位。只有一个参数就是中断线。有一个返回值 FlagStatus，返回值的状态为 SET 和 RESET。需要注意的是每次中断执行完毕之后都需要清除一下中断标志位等待下一次中断发生。

中断服务函数编写代码格式实例：

```C
void EXTI0_IRQHandler () {
//中断代码
}
```

## EXTI相关固件库函数

GD32F4xx固件库提供了丰富的EXTI（外部中断/事件控制器）和NVIC（嵌套向量中断控制器）函数，用于配置和管理中断系统。以下是主要EXTI和NVIC函数的详细介绍，基于GD32F4xx_固件库使用指南_Rev1.2。

![image-20260221164208890](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260221164208890.png)

### 1. NVIC中断控制器函数

#### nvic_priority_group_set
**函数原型：**
```C
void nvic_priority_group_set(uint32_t nvic_prigroup);
```

**功能描述：**
设置NVIC中断优先级分组。

**参数：**
- `nvic_prigroup`: 优先级分组（NVIC_PRIGROUP_PRE0_SUB4 ~ NVIC_PRIGROUP_PRE4_SUB0）。

**返回值：** 无

**示例：**
```C
nvic_priority_group_set(NVIC_PRIGROUP_PRE2_SUB2); // 2位抢占优先级，2位子优先级
```

#### nvic_irq_enable
**函数原型：**
```C
void nvic_irq_enable(uint8_t nvic_irq, uint8_t nvic_irq_pre_priority, uint8_t nvic_irq_sub_priority);
```

**功能描述：**
使能指定中断并设置优先级。

**参数：**
- `nvic_irq`: 中断类型（EXTI0_IRQn, EXTI1_IRQn等）。
- `nvic_irq_pre_priority`: 抢占优先级。
- `nvic_irq_sub_priority`: 子优先级。

**返回值：** 无

**示例：**
```C
nvic_irq_enable(EXTI0_IRQn, 2, 1); // 使能EXTI0中断，抢占优先级2，子优先级1
```

#### nvic_irq_disable
**函数原型：**
```C
void nvic_irq_disable(uint8_t nvic_irq);
```

**功能描述：**
禁用指定中断。

**参数：**
- `nvic_irq`: 中断类型。

**返回值：** 无

**示例：**
```C
nvic_irq_disable(EXTI0_IRQn); // 禁用EXTI0中断
```

### 2. SYSCFG系统配置函数

#### syscfg_exti_line_config
**函数原型：**
```C
void syscfg_exti_line_config(uint8_t exti_port, uint8_t exti_pin);
```

**功能描述：**
将EXTI线连接到指定的GPIO引脚。

**参数：**
- `exti_port`: GPIO端口源（EXTI_SOURCE_GPIOA ~ EXTI_SOURCE_GPIOI）。
- `exti_pin`: 引脚源（EXTI_SOURCE_PIN0 ~ EXTI_SOURCE_PIN15）。

**返回值：** 无

**示例：**
```C
syscfg_exti_line_config(EXTI_SOURCE_GPIOA, EXTI_SOURCE_PIN0); // 将EXTI0连接到PA0
```

### 3. EXTI外部中断函数

#### exti_init
**函数原型：**
```C
void exti_init(exti_line_enum linex, exti_mode_enum mode, exti_trig_type_enum trig_type);
```

**功能描述：**
初始化EXTI线配置。

**参数：**
- `linex`: EXTI线（EXTI_0 ~ EXTI_22）。
- `mode`: 模式（EXTI_INTERRUPT: 中断模式, EXTI_EVENT: 事件模式）。
- `trig_type`: 触发类型（EXTI_TRIG_RISING: 上升沿, EXTI_TRIG_FALLING: 下降沿, EXTI_TRIG_BOTH: 双边沿）。

**返回值：** 无

**示例：**
```C
exti_init(EXTI_0, EXTI_INTERRUPT, EXTI_TRIG_RISING); // EXTI0上升沿中断
```

#### exti_interrupt_enable
**函数原型：**
```C
void exti_interrupt_enable(exti_line_enum linex);
```

**功能描述：**
使能EXTI中断。

**参数：**
- `linex`: EXTI线。

**返回值：** 无

**示例：**
```C
exti_interrupt_enable(EXTI_0); // 使能EXTI0中断
```

#### exti_interrupt_disable
**函数原型：**
```C
void exti_interrupt_disable(exti_line_enum linex);
```

**功能描述：**
禁用EXTI中断。

**参数：**
- `linex`: EXTI线。

**返回值：** 无

**示例：**
```C
exti_interrupt_disable(EXTI_0); // 禁用EXTI0中断
```

#### exti_interrupt_flag_get
**函数原型：**
```C
FlagStatus exti_interrupt_flag_get(exti_line_enum linex);
```

**功能描述：**
获取EXTI中断标志位状态。

**参数：**
- `linex`: EXTI线。

**返回值：** SET（置位）或RESET（复位）。

**示例：**
```C
if (exti_interrupt_flag_get(EXTI_0) == SET) {
    // 处理中断
}
```

#### exti_interrupt_flag_clear
**函数原型：**
```C
void exti_interrupt_flag_clear(exti_line_enum linex);
```

**功能描述：**
清除EXTI中断标志位。

**参数：**
- `linex`: EXTI线。

**返回值：** 无

**示例：**
```C
exti_interrupt_flag_clear(EXTI_0); // 清除EXTI0中断标志
```

#### exti_event_enable
**函数原型：**
```C
void exti_event_enable(exti_line_enum linex);
```

**功能描述：**
使能EXTI事件。

**参数：**
- `linex`: EXTI线。

**返回值：** 无

**示例：**
```C
exti_event_enable(EXTI_0); // 使能EXTI0事件
```

#### exti_event_disable
**函数原型：**
```C
void exti_event_disable(exti_line_enum linex);
```

**功能描述：**
禁用EXTI事件。

**参数：**
- `linex`: EXTI线。

**返回值：** 无

**示例：**
```C
exti_event_disable(EXTI_0); // 禁用EXTI0事件
```

#### exti_event_flag_get
**函数原型：**
```C
FlagStatus exti_event_flag_get(exti_line_enum linex);
```

**功能描述：**
获取EXTI事件标志位状态。

**参数：**
- `linex`: EXTI线。

**返回值：** SET或RESET。

**示例：**
```C
FlagStatus flag = exti_event_flag_get(EXTI_0);
```

#### exti_event_flag_clear
**函数原型：**
```C
void exti_event_flag_clear(exti_line_enum linex);
```

**功能描述：**
清除EXTI事件标志位。

**参数：**
- `linex`: EXTI线。

**返回值：** 无

**示例：**
```C
exti_event_flag_clear(EXTI_0);
```

### 4. 相关宏定义和枚举

- **NVIC优先级分组：** NVIC_PRIGROUP_PRE0_SUB4, NVIC_PRIGROUP_PRE1_SUB3, ..., NVIC_PRIGROUP_PRE4_SUB0
- **中断类型：** EXTI0_IRQn ~ EXTI15_IRQn, EXTI5_9_IRQn, EXTI10_15_IRQn等
- **EXTI线：** EXTI_0 ~ EXTI_22
- **EXTI模式：** EXTI_INTERRUPT, EXTI_EVENT
- **触发类型：** EXTI_TRIG_RISING, EXTI_TRIG_FALLING, EXTI_TRIG_BOTH
- **GPIO端口源：** EXTI_SOURCE_GPIOA ~ EXTI_SOURCE_GPIOI
- **引脚源：** EXTI_SOURCE_PIN0 ~ EXTI_SOURCE_PIN15

在使用EXTI中断时，需要先配置NVIC优先级分组，使能NVIC中断，然后配置SYSCFG连接EXTI线到GPIO，最后初始化EXTI并使能中断。所有函数都在gd32f4xx_exti.h和gd32f4xx_misc.h头文件中声明。

