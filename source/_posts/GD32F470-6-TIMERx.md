---
title: GD32F470入门教程（六）定时器
date: 2026-02-21 00:00:00
type: paper
category: GD32F470xx
photos: 
tags:
excerpt: 这是摘要
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

## 定时器使用示例

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

在这个函数中：
- 首先检查中断标志位是否置位，以确认是更新中断。
- 清除中断标志位，这是必须的，否则中断会一直触发。
- 执行用户代码，这里是翻转LED的状态。

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

在这个步骤中：
- 初始化系统时钟（通常在系统启动时完成）。
- 配置GPIO：启用GPIOC时钟，设置PC13为输出模式，用于控制LED。
- 调用`timer_init_example();`来初始化定时器。
- 主循环中可以放置其他任务，定时器中断会独立运行。



