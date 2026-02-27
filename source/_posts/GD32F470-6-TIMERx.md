---
title: GD32F470入门教程（六）定时器
date: 2026-02-21 00:00:00
type: paper
category: GD32F470xx
photos: 
tags:
  - GD32F470
  - Timer
  - PWM
excerpt: 深入探讨GD32F470的定时器（TIMER）功能，包含时钟源选择、基本定时中断配置以及固件库函数的使用示例。
description: 
---

# TIMER

## GD32F470定时器介绍

![image-20260221104850047](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260221104850047.png)

## 时钟设置

从数据手册中，我们可以找到时钟树

![image-20260221155541371](../../../../../../cache/typora_photo/image-20260221155541371.png)

这里我们可以清楚的看到TIMERx在APB1和APB2都被挂载，拿挂载到APB1上的定时器来说，从AHB总线来的频率经过APB1的分频器分频（60MHz max），之后到倍频器进行倍频（240MHz max），最终接到定时器，所以我们想要使用这部分定时器的话，我们需要配置RCC（Reset and Clock Control）来启用定时器的时钟。

在GD32F470的库函数中，我们使用`rcu_periph_clock_enable()`函数来启用外设时钟。对于定时器，例如TIMER0（挂载在APB1上），我们需要调用：

```c
rcu_periph_clock_enable(RCU_TIMER0);
```

类似地，对于其他定时器，根据其挂载的总线选择相应的RCU宏。

## 定时器中断使用示例

下面我们以一个简单的定时器中断为例，演示如何使用GD32F470的库函数来配置和使用定时器。我们将使用TIMER0，每隔1秒产生一次中断，并在中断中翻转一个LED。这个示例将一步一步详细说明整个过程。

### 步骤1：初始化定时器

首先，我们需要初始化定时器。这包括启用定时器的时钟、配置定时器参数、启用中断和配置NVIC。

```c
#include "gd32f4xx.h"
#include "gd32f4xx_timer.h"

// 定时器初始化函数
void timer_init_example(void) {
    timer_parameter_struct timer_initpara;
    
    // 启用TIMER0时钟
    rcu_periph_clock_enable(RCU_TIMER0);
    
    // 配置定时器参数
    timer_initpara.prescaler = 23999;  // 预分频器，系统时钟240MHz，分频到10kHz
    timer_initpara.alignedmode = TIMER_COUNTER_EDGE;
    timer_initpara.counterdirection = TIMER_COUNTER_UP;
    timer_initpara.period = 9999;  // 周期，10kHz下9999+1=10000个计数，即1秒
    timer_initpara.clockdivision = TIMER_CKDIV_DIV1;
    timer_initpara.repetitioncounter = 0;
    
    timer_init(TIMER0, &timer_initpara);
    
    // 启用定时器更新中断
    timer_interrupt_enable(TIMER0, TIMER_INT_UP);
    
    // 配置NVIC
    nvic_irq_enable(TIMER0_UP_TIMER9_IRQn, 0, 0);
    
    // 启动定时器
    timer_enable(TIMER0);
}
```

> 在这个步骤中：
> - `rcu_periph_clock_enable(RCU_TIMER0);`：启用TIMER0的外设时钟，这是使用任何外设的第一步。
> - 配置`timer_parameter_struct`结构体：设置预分频器（prescaler）来降低时钟频率，设置计数模式为向上计数，设置周期（period）来决定中断间隔。
> - `timer_init(TIMER0, &timer_initpara);`：使用配置的参数初始化定时器。
> - `timer_interrupt_enable(TIMER0, TIMER_INT_UP);`：启用定时器的更新中断，当计数器溢出时会触发中断。
> - `nvic_irq_enable(TIMER0_UP_TIMER9_IRQn, 0, 0);`：在NVIC中启用中断，设置优先级。
> - `timer_enable(TIMER0);`：启动定时器，开始计数。
>

### 步骤2：中断服务函数

当定时器计数到设定的周期时，会触发更新中断。我们需要在中断服务函数中处理这个中断。

```c
// 中断服务函数
void TIMER0_UP_TIMER9_IRQHandler(void) {
    if(timer_interrupt_flag_get(TIMER0, TIMER_INT_FLAG_UP) != RESET) {
        timer_interrupt_flag_clear(TIMER0, TIMER_INT_FLAG_UP);
        
        // 翻转LED
        gpio_bit_toggle(GPIOC, GPIO_PIN_13);  // 假设LED连接到PC13
    }
}
```

> 在这个函数中：
> - 首先检查中断标志位是否置位，以确认是更新中断。
> - 清除中断标志位，这是必须的，否则中断会一直触发。
> - 执行用户代码，这里是翻转LED的状态。
>

### 步骤3：在主函数中调用

在main函数中调用初始化函数：

```c
int main(void) {
    // 系统时钟初始化（这里省略，假设已经配置好240MHz）
    // ...
    
    // GPIO初始化（LED引脚）
    rcu_periph_clock_enable(RCU_GPIOC);
    gpio_mode_set(GPIOC, GPIO_MODE_OUTPUT, GPIO_PUPD_NONE, GPIO_PIN_13);
    gpio_output_options_set(GPIOC, GPIO_OTYPE_PP, GPIO_OSPEED_50MHZ, GPIO_PIN_13);
    
    // 定时器初始化
    timer_init_example();
    
    while(1) {
        // 主循环
    }
}
```

> 在这个步骤中：
> - 初始化系统时钟（通常在系统启动时完成）。
> - 配置GPIO：启用GPIOC时钟，设置PC13为输出模式，用于控制LED。
> - 调用`timer_init_example();`来初始化定时器。
> - 主循环中可以放置其他任务，定时器中断会独立运行。
>

## PWM输出使用示例

PWM（Pulse Width Modulation，脉冲宽度调制）是一种通过调节脉冲宽度来控制输出功率的技术。在GD32F470中，定时器可以生成PWM信号，用于控制LED亮度、电机速度等。这个示例将演示如何使用TIMER0的通道0生成PWM信号来控制LED的亮度，实现呼吸灯效果。

### PWM基本原理

PWM信号是一个周期性的方波，通过改变高电平持续时间（占空比）来控制平均输出功率。占空比 = (高电平时间 / 周期) * 100%。在定时器中，PWM是通过输出比较功能实现的：当计数器值小于比较值时，输出高电平；当大于时，输出低电平。

### 步骤1：初始化定时器和PWM通道

首先，我们需要初始化定时器并配置PWM输出通道。

```c
#include "gd32f4xx.h"
#include "gd32f4xx_timer.h"

// PWM初始化函数
void pwm_init_example(void) {
    timer_oc_parameter_struct timer_ocinitpara;
    timer_parameter_struct timer_initpara;
    
    // 启用TIMER0时钟
    rcu_periph_clock_enable(RCU_TIMER0);
    
    // 配置定时器参数
    timer_initpara.prescaler = 239;  // 预分频器，系统时钟240MHz，分频到1MHz
    timer_initpara.alignedmode = TIMER_COUNTER_EDGE;
    timer_initpara.counterdirection = TIMER_COUNTER_UP;
    timer_initpara.period = 999;  // 周期，1MHz下1000个计数，即1kHz PWM频率
    timer_initpara.clockdivision = TIMER_CKDIV_DIV1;
    timer_initpara.repetitioncounter = 0;
    
    timer_init(TIMER0, &timer_initpara);
    
    // 配置输出比较参数（PWM模式）
    timer_ocinitpara.outputstate = TIMER_CCX_ENABLE;
    timer_ocinitpara.outputnstate = TIMER_CCXN_DISABLE;
    timer_ocinitpara.ocpolarity = TIMER_OC_POLARITY_HIGH;
    timer_ocinitpara.ocnpolarity = TIMER_OCN_POLARITY_HIGH;
    timer_ocinitpara.ocidlestate = TIMER_OC_IDLE_STATE_LOW;
    timer_ocinitpara.ocnidlestate = TIMER_OCN_IDLE_STATE_LOW;
    
    // 设置PWM模式1（在向上计数时，CNT < CCR时输出高电平）
    timer_channel_output_mode_config(TIMER0, TIMER_CH_0, TIMER_OC_MODE_PWM1);
    timer_channel_output_config(TIMER0, TIMER_CH_0, &timer_ocinitpara);
    
    // 设置初始占空比为50% (500/1000)
    timer_channel_output_pulse_value_config(TIMER0, TIMER_CH_0, 500);
    
    // 启用TIMER0的CH0输出
    timer_channel_output_state_config(TIMER0, TIMER_CH_0, TIMER_CCX_ENABLE);
    
    // 启用TIMER0的主输出
    timer_primary_output_config(TIMER0, ENABLE);
    
    // 启动定时器
    timer_enable(TIMER0);
}
```

> 在这个步骤中：
> - `rcu_periph_clock_enable(RCU_TIMER0);`：启用TIMER0的外设时钟。
> - 配置`timer_parameter_struct`：设置预分频器和周期来确定PWM频率。这里设置为1kHz。
> - 配置`timer_oc_parameter_struct`：设置输出比较参数，包括输出状态、极性等。
> - `timer_channel_output_mode_config(TIMER0, TIMER_CH_0, TIMER_OC_MODE_PWM1);`：将通道0设置为PWM模式1。
> - `timer_channel_output_config(TIMER0, TIMER_CH_0, &timer_ocinitpara);`：应用输出比较配置。
> - `timer_channel_output_pulse_value_config(TIMER0, TIMER_CH_0, 500);`：设置比较值，决定占空比。
> - 启用通道输出和主输出，然后启动定时器。
>

### 步骤2：配置GPIO引脚

PWM信号需要通过特定的GPIO引脚输出，我们需要将GPIO配置为复用功能。

```c
// GPIO配置函数
void gpio_config_example(void) {
    // 启用GPIOA时钟
    rcu_periph_clock_enable(RCU_GPIOA);
    
    // 配置PA8为复用功能（TIMER0_CH0）
    gpio_mode_set(GPIOA, GPIO_MODE_AF, GPIO_PUPD_NONE, GPIO_PIN_8);
    gpio_output_options_set(GPIOA, GPIO_OTYPE_PP, GPIO_OSPEED_50MHZ, GPIO_PIN_8);
    
    // 设置PA8的复用功能为TIMER0
    gpio_af_set(GPIOA, GPIO_AF_1, GPIO_PIN_8);
}
```

> 在这个步骤中：
> - `rcu_periph_clock_enable(RCU_GPIOA);`：启用GPIOA时钟。
> - `gpio_mode_set(GPIOA, GPIO_MODE_AF, GPIO_PUPD_NONE, GPIO_PIN_8);`：将PA8设置为复用功能模式。
> - `gpio_output_options_set(GPIOA, GPIO_OTYPE_PP, GPIO_OSPEED_50MHZ, GPIO_PIN_8);`：设置输出选项。
> - `gpio_af_set(GPIOA, GPIO_AF_1, GPIO_PIN_8);`：将PA8的复用功能设置为TIMER0（AF1）。
>

### 步骤3：在主函数中使用PWM

在main函数中初始化PWM和GPIO，并演示如何动态改变占空比。

```c
#include "gd32f4xx.h"
#include <stdint.h>

int main(void) {
    uint16_t duty_cycle = 0;
    int8_t direction = 1;
    
    // 系统时钟初始化（这里省略，假设已经配置好240MHz）
    // ...
    
    // 配置GPIO
    gpio_config_example();
    
    // 初始化PWM
    pwm_init_example();
    
    while(1) {
        // 改变占空比，实现呼吸灯效果
        timer_channel_output_pulse_value_config(TIMER0, TIMER_CH_0, duty_cycle);
        
        // 更新占空比
        if(direction == 1) {
            duty_cycle += 10;
            if(duty_cycle >= 1000) {
                direction = -1;
            }
        } else {
            duty_cycle -= 10;
            if(duty_cycle <= 0) {
                direction = 1;
            }
        }
        
        // 延时一段时间
        for(volatile uint32_t i = 0; i < 100000; i++);
    }
}
```

> 在这个步骤中：
> - 初始化系统时钟（通常在系统启动时完成）。
> - 调用`gpio_config_example();`配置GPIO引脚。
> - 调用`pwm_init_example();`初始化PWM。
> - 在主循环中，通过`timer_channel_output_pulse_value_config()`动态改变占空比，实现LED亮度渐变（呼吸灯效果）。
> - 使用简单的延时循环来控制变化速度。
>

通过这个示例，你可以学习到如何在GD32F470上使用定时器生成PWM信号。PWM在嵌入式系统中有着广泛的应用，如LED调光、电机控制、音频输出等。你可以根据实际需求调整PWM频率和占空比。



## TIMER相关库函数

![image-20260221165304897](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260221165304897.png)

### 1. TIMER 相关参数结构体

库函数中定义了多个结构体，用于在初始化时一次性配置多个参数。

#### timer_parameter_struct（基本配置）
```C
typedef struct {
    uint16_t prescaler;          // 预分频值 (0 ~ 65535)
    uint16_t alignedmode;        // 对齐模式 (边缘对齐、中心对齐模式 0/1/2)
    uint16_t counterdirection;   // 计数方向 (向上计数、向下计数)
    uint32_t period;             // 自动重装载值 (周期值)
    uint16_t clockdivision;      // 时钟分频因数 (用于死区时间和滤波器)
    uint8_t  repetitioncounter;  // 重复计数器值 (仅高级定时器)
} timer_parameter_struct;
```

#### timer_oc_parameter_struct（输出比较）
```C
typedef struct {
    uint16_t outputstate;        // 输出状态 (使能/禁用)
    uint16_t outputnstate;       // 互补输出状态 (仅高级定时器)
    uint16_t ocpolarity;         // 输出极性 (高电平有效/低电平有效)
    uint16_t ocnpolarity;        // 互补输出极性 (仅高级定时器)
    uint16_t ocidlestate;        // 空闲状态下通道输出电平
    uint16_t ocnidlestate;       // 空闲状态下互补通道输出电平
} timer_oc_parameter_struct;
```

#### timer_ic_parameter_struct（输入捕获）
```C
typedef struct {
    uint16_t icpolarity;         // 输入捕获极性 (上升沿、下降沿、双边沿)
    uint16_t icselection;        // 输入捕获源选择 (直连、非直连、TRC)
    uint16_t icprescaler;        // 输入捕获分频器
    uint16_t icfilter;           // 输入捕获滤波器 (0x0 ~ 0xF)
} timer_ic_parameter_struct;
```

#### timer_break_parameter_struct（刹车/死区）
```C
typedef struct {
    uint16_t runoffstate;        // 运行模式下关闭状态使能/禁用
    uint16_t idlestate;          // 空闲模式下关闭状态使能/禁用
    uint16_t deadtime;           // 死区时间配置 (0 ~ 255)
    uint16_t breakpolarity;      // 刹车信号极性
    uint16_t breakstate;         // 刹车功能使能/禁用
    uint16_t outauto;            // 自动输出使能/禁用
} timer_break_parameter_struct;
```

### 2. TIMER 重要枚举与宏定义

以下宏定义常用于配置函数的参数选择：

- **对齐模式**：`TIMER_COUNTER_EDGE` (边缘), `TIMER_COUNTER_CENTER0/1/2` (中心对齐 0/1/2)
- **计数方向**：`TIMER_COUNTER_UP` (向上计数), `TIMER_COUNTER_DOWN` (向下计数)
- **时钟分频系数**：`TIMER_CKDIV_DIV1/2/4`
- **输出比较模式**：`TIMER_OC_MODE_PWM0/1`, `TIMER_OC_MODE_TOGGLE`, `TIMER_OC_MODE_ACTIVE` 等
- **通道选择**：`TIMER_CH_0` ~ `TIMER_CH_3`
- **中断源**：`TIMER_INT_UP` (更新), `TIMER_INT_CH0/1/2/3` (通道), `TIMER_INT_BRK` (刹车), `TIMER_INT_TRG` (触发)
- **DMA触发源**：`TIMER_DMA_UPD`, `TIMER_DMA_CH0/1/2/3` 等

---

### 3. 定时器基础配置函数

#### timer_deinit
**函数原型：**
```C
void timer_deinit(uint32_t timer_periph);
```

**功能描述：**
将指定的TIMER重置为默认状态，所有寄存器恢复到复位值。

**参数：**
- `timer_periph`: TIMER外设（TIMER0, TIMER1等）。

**返回值：** 无

**示例：**
```C
timer_deinit(TIMER0); // 重置TIMER0
```

#### timer_init
**函数原型：**
```C
void timer_init(uint32_t timer_periph, timer_parameter_struct* initpara);
```

**功能描述：**
根据指定的参数结构体初始化定时器，包括预分频器、计数模式、周期等基本配置。

**参数：**
- `timer_periph`: TIMER外设。
- `initpara`: 指向timer_parameter_struct结构体的指针，包含初始化参数。

**返回值：** 无

**示例：**
```C
timer_init(TIMER0, &timer_initpara); // 使用配置参数初始化TIMER0
```

#### timer_struct_para_init
**函数原型：**
```C
void timer_struct_para_init(timer_parameter_struct* initpara);
```

**功能描述：**
将timer_parameter_struct结构体初始化为默认值（通常在配置前调用）。

**参数：**
- `initpara`: 指向timer_parameter_struct结构体的指针。

**返回值：** 无

**示例：**
```C
timer_parameter_struct timer_initpara;
timer_struct_para_init(&timer_initpara); // 初始化结构体
```

#### timer_enable / timer_disable
**函数原型：**
```C
void timer_enable(uint32_t timer_periph);
void timer_disable(uint32_t timer_periph);
```

**功能描述：**
启用或禁用指定的定时器计数功能。启用后定时器开始计数，禁用后停止计数。

**参数：**
- `timer_periph`: TIMER外设。

**返回值：** 无

**示例：**
```C
timer_enable(TIMER0); // 启动定时器0
```

#### timer_counter_value_config
**函数原型：**
```C
void timer_counter_value_config(uint32_t timer_periph, uint32_t value);
```

**功能描述：**
手动设置计数器（CNT）的当前值，可用于重新开始计数或同步。

**参数：**
- `timer_periph`: TIMER外设。
- `value`: 要设置的计数器值（0 ~ period）。

**返回值：** 无

**示例：**
```C
timer_counter_value_config(TIMER0, 0); // 重置计数器为0
```

#### timer_counter_read
**函数原型：**
```C
uint32_t timer_counter_read(uint32_t timer_periph);
```

**功能描述：**
读取当前计数器的值。

**参数：**
- `timer_periph`: TIMER外设。

**返回值：** 当前计数器值（uint32_t）。

**示例：**
```C
uint32_t current_count = timer_counter_read(TIMER0);
```

#### timer_prescaler_config
**函数原型：**
```C
void timer_prescaler_config(uint32_t timer_periph, uint16_t prescaler, uint8_t pscreload);
```

**功能描述：**
配置预分频器值，用于降低时钟频率。pscreload参数控制是否立即更新或等到下一次更新事件。

**参数：**
- `timer_periph`: TIMER外设。
- `prescaler`: 预分频值（0 ~ 65535）。
- `pscreload`: 预分频器重载模式（TIMER_PSC_RELOAD_NOW: 立即更新, TIMER_PSC_RELOAD_UPDATE: 更新事件时更新）。

**返回值：** 无

**示例：**
```C
timer_prescaler_config(TIMER0, 23999, TIMER_PSC_RELOAD_NOW); // 设置预分频并立即生效
```

#### timer_auto_reload_shadow_enable / timer_auto_reload_shadow_disable
**函数原型：**
```C
void timer_auto_reload_shadow_enable(uint32_t timer_periph);
void timer_auto_reload_shadow_disable(uint32_t timer_periph);
```

**功能描述：**
使能或禁用自动重装载寄存器（ARR）的阴影寄存器。阴影寄存器提供缓冲，避免参数更新时的毛刺。

**参数：**
- `timer_periph`: TIMER外设。

**返回值：** 无

**示例：**
```C
timer_auto_reload_shadow_enable(TIMER0); // 使能ARR阴影寄存器
```

#### timer_update_event_enable / timer_update_event_disable
**函数原型：**
```C
void timer_update_event_enable(uint32_t timer_periph);
void timer_update_event_disable(uint32_t timer_periph);
```

**功能描述：**
允许或禁止产生更新事件（UEV）。禁用时可避免在配置期间产生不必要的更新中断。

**参数：**
- `timer_periph`: TIMER外设。

**返回值：** 无

**示例：**
```C
timer_update_event_disable(TIMER0); // 禁用更新事件
```

#### timer_single_pulse_mode_config
**函数原型：**
```C
void timer_single_pulse_mode_config(uint32_t timer_periph, uint32_t state);
```

**功能描述：**
配置单脉冲模式。启用后，定时器在产生一次更新事件后自动停止计数。

**参数：**
- `timer_periph`: TIMER外设。
- `state`: 状态（ENABLE: 启用单脉冲模式, DISABLE: 禁用）。

**返回值：** 无

**示例：**
```C
timer_single_pulse_mode_config(TIMER0, ENABLE); // 启用单脉冲模式
```

---

### 4. 中断、状态位与 DMA 管理

#### timer_interrupt_enable / timer_interrupt_disable
**函数原型：**
```C
void timer_interrupt_enable(uint32_t timer_periph, uint32_t interrupt);
void timer_interrupt_disable(uint32_t timer_periph, uint32_t interrupt);
```

**功能描述：**
使能或禁用指定的中断源，如更新中断、通道捕获/比较中断等。

**参数：**
- `timer_periph`: TIMER外设。
- `interrupt`: 中断源（如 TIMER_INT_UP: 更新中断, TIMER_INT_CH0: 通道0中断）。

**返回值：** 无

**示例：**
```C
timer_interrupt_enable(TIMER0, TIMER_INT_UP); // 使能更新中断
```

#### timer_interrupt_flag_get / timer_interrupt_flag_clear
**函数原型：**
```C
FlagStatus timer_interrupt_flag_get(uint32_t timer_periph, uint32_t interrupt);
FlagStatus timer_interrupt_flag_clear(uint32_t timer_periph, uint32_t interrupt);
```

**功能描述：**
检查或清除指定的中断标志位。在中断服务函数中必须清除标志位。

**参数：**
- `timer_periph`: TIMER外设。
- `interrupt`: 中断标志（如 TIMER_INT_FLAG_UP）。

**返回值：** FlagStatus (SET 或 RESET)。

**示例：**
```C
if(SET == timer_interrupt_flag_get(TIMER0, TIMER_INT_FLAG_UP)) {
    timer_interrupt_flag_clear(TIMER0, TIMER_INT_FLAG_UP);
    // 处理中断
}
```

#### timer_flag_get / timer_flag_clear
**函数原型：**
```C
FlagStatus timer_flag_get(uint32_t timer_periph, uint32_t flag);
void timer_flag_clear(uint32_t timer_periph, uint32_t flag);
```

**功能描述：**
检查和清除硬件状态标志位。

**参数：**
- `timer_periph`: TIMER外设。
- `flag`: 状态标志（如 TIMER_FLAG_UP）。

**返回值：** FlagStatus (SET 或 RESET)。

**示例：**
```C
if(SET == timer_flag_get(TIMER0, TIMER_FLAG_UP)) {
    timer_flag_clear(TIMER0, TIMER_FLAG_UP);
}
```

#### timer_dma_enable / timer_dma_disable
**函数原型：**
```C
void timer_dma_enable(uint32_t timer_periph, uint16_t dma);
void timer_dma_disable(uint32_t timer_periph, uint16_t dma);
```

**功能描述：**
使能或禁用定时器触发DMA请求，用于高速数据传输。

**参数：**
- `timer_periph`: TIMER外设。
- `dma`: DMA请求源（如 TIMER_DMA_UPD: 更新DMA, TIMER_DMA_CH0: 通道0 DMA）。

**返回值：** 无

**示例：**
```C
timer_dma_enable(TIMER0, TIMER_DMA_UPD); // 使能更新DMA
```

---

### 5. 输出比较 (OC) 与 PWM 相关函数

#### timer_channel_output_config
**函数原型：**
```C
void timer_channel_output_config(uint32_t timer_periph, uint16_t channel, timer_oc_parameter_struct* ocpara);
```

**功能描述：**
配置输出比较通道的参数，包括输出状态、极性等。

**参数：**
- `timer_periph`: TIMER外设。
- `channel`: 通道选择（TIMER_CH_0 ~ TIMER_CH_3）。
- `ocpara`: 指向timer_oc_parameter_struct结构体的指针。

**返回值：** 无

**示例：**
```C
timer_channel_output_config(TIMER0, TIMER_CH_0, &timer_ocinitpara);
```

#### timer_channel_output_mode_config
**函数原型：**
```C
void timer_channel_output_mode_config(uint32_t timer_periph, uint16_t channel, uint16_t ocmode);
```

**功能描述：**
设置通道的输出模式，如PWM模式、翻转模式等。

**参数：**
- `timer_periph`: TIMER外设。
- `channel`: 通道选择。
- `ocmode`: 输出模式（如 TIMER_OC_MODE_PWM1, TIMER_OC_MODE_TOGGLE）。

**返回值：** 无

**示例：**
```C
timer_channel_output_mode_config(TIMER0, TIMER_CH_0, TIMER_OC_MODE_PWM1);
```

#### timer_channel_output_pulse_value_config
**函数原型：**
```C
void timer_channel_output_pulse_value_config(uint32_t timer_periph, uint16_t channel, uint32_t pulse);
```

**功能描述：**
设置通道的比较值（CCR），用于控制PWM占空比或输出比较时刻。

**参数：**
- `timer_periph`: TIMER外设。
- `channel`: 通道选择。
- `pulse`: 比较值（0 ~ period）。

**返回值：** 无

**示例：**
```C
timer_channel_output_pulse_value_config(TIMER0, TIMER_CH_0, 500); // 设置占空比50%
```

#### timer_channel_output_shadow_config
**函数原型：**
```C
void timer_channel_output_shadow_config(uint32_t timer_periph, uint16_t channel, uint16_t shadow);
```

**功能描述：**
配置通道输出比较的预装载（阴影）功能。

**参数：**
- `timer_periph`: TIMER外设。
- `channel`: 通道选择。
- `shadow`: 阴影配置（ENABLE 或 DISABLE）。

**返回值：** 无

**示例：**
```C
timer_channel_output_shadow_config(TIMER0, TIMER_CH_0, ENABLE);
```

#### timer_channel_output_fast_config
**函数原型：**
```C
void timer_channel_output_fast_config(uint32_t timer_periph, uint16_t channel, uint16_t fast);
```

**功能描述：**
配置输出通道的快速模式，用于在触发事件时快速响应。

**参数：**
- `timer_periph`: TIMER外设。
- `channel`: 通道选择。
- `fast`: 快速模式（ENABLE 或 DISABLE）。

**返回值：** 无

**示例：**
```C
timer_channel_output_fast_config(TIMER0, TIMER_CH_0, ENABLE);
```

#### timer_channel_output_polarity_config
**函数原型：**
```C
void timer_channel_output_polarity_config(uint32_t timer_periph, uint16_t channel, uint16_t polarity);
```

**功能描述：**
配置通道输出极性（高电平有效或低电平有效）。

**参数：**
- `timer_periph`: TIMER外设。
- `channel`: 通道选择。
- `polarity`: 极性（TIMER_OC_POLARITY_HIGH 或 TIMER_OC_POLARITY_LOW）。

**返回值：** 无

**示例：**
```C
timer_channel_output_polarity_config(TIMER0, TIMER_CH_0, TIMER_OC_POLARITY_HIGH);
```

#### timer_channel_output_state_config
**函数原型：**
```C
void timer_channel_output_state_config(uint32_t timer_periph, uint16_t channel, uint16_t state);
```

**功能描述：**
使能或禁用通道输出。

**参数：**
- `timer_periph`: TIMER外设。
- `channel`: 通道选择。
- `state`: 状态（ENABLE 或 DISABLE）。

**返回值：** 无

**示例：**
```C
timer_channel_output_state_config(TIMER0, TIMER_CH_0, ENABLE);
```

#### timer_primary_output_config
**函数原型：**
```C
void timer_primary_output_config(uint32_t timer_periph, ControlStatus state);
```

**功能描述：**
使能或禁用高级定时器的主输出功能。PWM输出必须启用此项。

**参数：**
- `timer_periph`: TIMER外设（仅高级定时器）。
- `state`: 状态（ENABLE 或 DISABLE）。

**返回值：** 无

**示例：**
```C
timer_primary_output_config(TIMER0, ENABLE); // 启用主输出
```

---

### 6. 输入捕获 (IC) 相关函数

#### timer_input_capture_config
**函数原型：**
```C
void timer_input_capture_config(uint32_t timer_periph, uint16_t channel, timer_ic_parameter_struct* icpara);
```

**功能描述：**
配置输入捕获通道的参数，包括极性、滤波器、分频等。

**参数：**
- `timer_periph`: TIMER外设。
- `channel`: 通道选择。
- `icpara`: 指向timer_ic_parameter_struct结构体的指针。

**返回值：** 无

**示例：**
```C
timer_input_capture_config(TIMER0, TIMER_CH_0, &timer_icinitpara);
```

#### timer_input_pwm_capture_config
**函数原型：**
```C
void timer_input_pwm_capture_config(uint32_t timer_periph, uint16_t channel, timer_ic_parameter_struct* icpara);
```

**功能描述：**
配置专用PWM输入捕获模式，可同时测量周期和占空比。

**参数：**
- `timer_periph`: TIMER外设。
- `channel`: 通道选择（通常使用两个连续通道）。
- `icpara`: 指向timer_ic_parameter_struct结构体的指针。

**返回值：** 无

**示例：**
```C
timer_input_pwm_capture_config(TIMER0, TIMER_CH_0, &timer_icinitpara);
```

#### timer_channel_input_capture_prescaler_config
**函数原型：**
```C
void timer_channel_input_capture_prescaler_config(uint32_t timer_periph, uint16_t channel, uint32_t prescaler);
```

**功能描述：**
设置输入捕获通道的分频器，用于降低捕获频率。

**参数：**
- `timer_periph`: TIMER外设。
- `channel`: 通道选择。
- `prescaler`: 分频值（TIMER_IC_PSC_DIV1 ~ TIMER_IC_PSC_DIV8）。

**返回值：** 无

**示例：**
```C
timer_channel_input_capture_prescaler_config(TIMER0, TIMER_CH_0, TIMER_IC_PSC_DIV1);
```

---

### 7. 高级功能、主从模式与事件生成

#### timer_break_config
**函数原型：**
```C
void timer_break_config(uint32_t timer_periph, timer_break_parameter_struct* break_para);
```

**功能描述：**
配置刹车功能和死区时间，常用于电机控制中的安全保护。

**参数：**
- `timer_periph`: TIMER外设（仅高级定时器）。
- `break_para`: 指向timer_break_parameter_struct结构体的指针。

**返回值：** 无

**示例：**
```C
timer_break_config(TIMER0, &timer_breakpara);
```

#### timer_automatic_output_enable
**函数原型：**
```C
void timer_automatic_output_enable(uint32_t timer_periph);
```

**功能描述：**
开启自动输出功能，允许在特定条件下自动控制输出状态。

**参数：**
- `timer_periph`: TIMER外设。

**返回值：** 无

**示例：**
```C
timer_automatic_output_enable(TIMER0);
```

#### timer_master_slave_mode_config
**函数原型：**
```C
void timer_master_slave_mode_config(uint32_t timer_periph, uint32_t mode);
```

**功能描述：**
配置定时器的主从同步模式。

**参数：**
- `timer_periph`: TIMER外设。
- `mode`: 模式（TIMER_MASTER_SLAVE_MODE_ENABLE 或 DISABLE）。

**返回值：** 无

**示例：**
```C
timer_master_slave_mode_config(TIMER0, TIMER_MASTER_SLAVE_MODE_ENABLE);
```

#### timer_slave_mode_select
**函数原型：**
```C
void timer_slave_mode_select(uint32_t timer_periph, uint32_t slave_mode);
```

**功能描述：**
选择从模式的具体类型，如复位模式、门控模式等。

**参数：**
- `timer_periph`: TIMER外设。
- `slave_mode`: 从模式（TIMER_SLAVE_MODE_RESET, TIMER_SLAVE_MODE_GATED 等）。

**返回值：** 无

**示例：**
```C
timer_slave_mode_select(TIMER0, TIMER_SLAVE_MODE_RESET);
```

#### timer_input_trigger_source_select
**函数原型：**
```C
void timer_input_trigger_source_select(uint32_t timer_periph, uint32_t intrigger);
```

**功能描述：**
选择触发输入源，用于主从同步。

**参数：**
- `timer_periph`: TIMER外设。
- `intrigger`: 触发源（TIMER_TS_ITI0 ~ TIMER_TS_ITI3, TIMER_TS_CI0F_ED 等）。

**返回值：** 无

**示例：**
```C
timer_input_trigger_source_select(TIMER0, TIMER_TS_ITI0);
```

#### timer_external_trigger_as_external_clock_config
**函数原型：**
```C
void timer_external_trigger_as_external_clock_config(uint32_t timer_periph, uint32_t extrigger, uint32_t exextpolarity, uint32_t exextfilter);
```

**功能描述：**
配置外部触发作为外部时钟源。

**参数：**
- `timer_periph`: TIMER外设。
- `extrigger`: 外部触发源。
- `exextpolarity`: 外部触发极性。
- `exextfilter`: 外部触发滤波器。

**返回值：** 无

**示例：**
```C
timer_external_trigger_as_external_clock_config(TIMER0, TIMER_EXTRIGGER_CI0F_ED, TIMER_EXTRIGGER_POLARITY_RISING, 0x0);
```

#### timer_external_clock_mode0_config
**函数原型：**
```C
void timer_external_clock_mode0_config(uint32_t timer_periph, uint32_t extrigger, uint32_t exextpolarity, uint32_t exextfilter);
```

**功能描述：**
配置外部时钟模式0。

**参数：**
- `timer_periph`: TIMER外设。
- `extrigger`: 外部触发源。
- `exextpolarity`: 外部触发极性。
- `exextfilter`: 外部触发滤波器。

**返回值：** 无

**示例：**
```C
timer_external_clock_mode0_config(TIMER0, TIMER_EXTRIGGER_CI0F_ED, TIMER_EXTRIGGER_POLARITY_RISING, 0x0);
```

#### timer_external_clock_mode1_config
**函数原型：**
```C
void timer_external_clock_mode1_config(uint32_t timer_periph, uint32_t extrigger, uint32_t exextpolarity, uint32_t exextfilter);
```

**功能描述：**
配置外部时钟模式1。

**参数：**
- `timer_periph`: TIMER外设。
- `extrigger`: 外部触发源。
- `exextpolarity`: 外部触发极性。
- `exextfilter`: 外部触发滤波器。

**返回值：** 无

**示例：**
```C
timer_external_clock_mode1_config(TIMER0, TIMER_EXTRIGGER_CI0F_ED, TIMER_EXTRIGGER_POLARITY_RISING, 0x0);
```

#### timer_dma_transfer_config
**函数原型：**
```C
void timer_dma_transfer_config(uint32_t timer_periph, uint32_t dma_baseaddr, uint32_t dma_lenth);
```

**功能描述：**
配置定时器的DMA猝发传输模式，用于批量数据传输。

**参数：**
- `timer_periph`: TIMER外设。
- `dma_baseaddr`: DMA基地址。
- `dma_lenth`: DMA传输长度。

**返回值：** 无

**示例：**
```C
timer_dma_transfer_config(TIMER0, (uint32_t)&TIMER_CH0CV(TIMER0), 4);
```

#### timer_channel_complementary_output_state_config
**函数原型：**
```C
void timer_channel_complementary_output_state_config(uint32_t timer_periph, uint16_t channel, uint16_t state);
```

**功能描述：**
使能或禁用高级定时器的互补通道输出。

**参数：**
- `timer_periph`: TIMER外设（仅高级定时器）。
- `channel`: 通道选择。
- `state`: 状态（ENABLE 或 DISABLE）。

**返回值：** 无

**示例：**
```C
timer_channel_complementary_output_state_config(TIMER0, TIMER_CH_0, ENABLE);
```

#### timer_event_software_generate
**函数原型：**
```C
void timer_event_software_generate(uint32_t timer_periph, uint32_t event);
```

**功能描述：**
通过软件产生事件，如手动触发更新事件来同步寄存器。

**参数：**
- `timer_periph`: TIMER外设。
- `event`: 事件类型（TIMER_EVENT_SRC_UP: 更新事件等）。

**返回值：** 无

**示例：**
```C
timer_event_software_generate(TIMER0, TIMER_EVENT_SRC_UP);
```