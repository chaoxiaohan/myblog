---
title: STM32标准库笔记（二）-PWM、ADC、DMA
date: 2025-10-03 00:00:00
type: paper
photos: 
tags:
  - C
  - STM32
  - Standard
excerpt: 笔记包含PWM、ADC、DMA相关知识及其对应应用代码
description: 
---

# 一、PWM

## 1.1 TIM输出比较

### 1.1.1 简介

**【输出比较功能】**

- OC (Output Compare)输出比较，重要，主要用来输出PWM波形的，常用驱动电机。
- 输出比较可以通过比较CNT与CCR寄存器值的关系，来对输出电平进行置1、置0或翻转的操作，用于输出一定频率和占空比的PWM波形
- 每个高级定时器和**通用定时器**都拥有4个输出比较通道**（课程主要讨论通用定时器的输出比较功能）**
- 高级定时器的前3个通道额外拥有死区生成和互补输出的功能

**【PWM简介】**

- PWM (Pulse Width Modulation)脉冲宽度调制
- 在具有**惯性的系统**中，可以通过对一系列脉冲的宽度进行调制，来等效地获得所需要的模拟参量，常应用于电机控速等领域
- **PWM参数：**`频率=1/ Ts`、`占空比= Ton/ Ts`、`分辨率=占空比变化步距`

![image-20251003183747933](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183752782.png)

波形也是有高低电平组成的，通过快速切换，产生。

### 1.1.2 输出比较通道（通用）

![image-20251003183752782](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183747933.png)

通用定时器通道1和高级定时器的第四个通道基本是一样的。

**主要流程说明：**ETRF输入是定时器的一个小功能，一般不用，不需要了解/**CNT和CCR1**比较产生信号——传入**输出模式控制器**——改变OC1REF的高低电平——映射到主模式的控制器/主要是通往TIMx_CCER(极性选择，高低电平是否翻转)——输出使能，选择通道——通道输出

**【输出模式控制器】：**八中模式

![image-20251003183758079](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183815622.png)

冻结模式：设置后输出停止，高低电平不变。

有效电平和无效电平通常用于高级定时器的说法关断、刹车功能配合表述的，可当成高低电平控制看待。

电平翻转：比如设置CCR=0时候，每次CNT更新清0就会产生一次CNT=CCR的事件，这就会导致输出电平翻转一次，每更新两次，输出为一个周期，占空比始终为50%；改变定时器频率时候，输出波形频率也会随之改变。`输出波形的频率=更新频率/2`

强制有效/无效电平：想暂停输出，并保存高电平或者低电平。

PWM模式1：频率和占空比都可调

PWM模式2：频率和占空比都可调，二者互为REF电平取反情况。比较灵活。

### 1.1.3 输出比较通道（高级）

![image-20251003183804303](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183804303.png)

OC1和OC1N是互补输出。死区发生器是防止两个输出同时打开，发热损耗。

感兴趣自行了解一下。



### 1.1.4 PWM产生

**本节最重要内容：**

![image-20251003183810505](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183810505.png)

【运行控制+时基单元】左边的时钟源选择，进入到时基单元后进行相关配置，配置好后CNT计数器就可以不断的自增运行了——往下进入输出比较单元

**【输出比较单元】**一共有4路。最开始是进入CCR捕获/比较寄存器**（****上图CCR比较的值****为30的红色线，可以通过更改值来改变占空比）**——输出模式控制（图中假设选择了PWM1模式），输出REF电平——IO输出

**【PWM参数计算】**

- PWM频率：`**Freq= CK_ PSC/(PSC+ 1)/ (ARR+ 1)**`，PWM的频率=更新周期
- PWM占空比：`**Duty= CCR/ (ARR+ 1)**`，CCR的变化范围取决于ARR的值
- PWM分辨率：`**Reso= 1/(ARR+1)**`

### 【案例】PWM产生

**①使能相关外设时钟**

PWM 输出需要用到 **定时器时钟** 和 **GPIO 时钟**，以及 GPIO 复用功能的时钟（AFIO）。

- TIM3 属于 APB1 总线外设，时钟由 APB1 提供；
- GPIOA 属于 APB2 总线外设，时钟由 APB2 提供；
- 复用功能需要使能 AFIO 时钟（部分型号可不显式使能，但建议加上）。

```c
// 使能GPIOA、AFIO、TIM3的时钟
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA | RCC_APB2Periph_AFIO, ENABLE);
RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
```

**②配置 PWM 输出引脚（GPIO）**

PWM 输出引脚需配置为 **复用推挽输出**（因为引脚功能由定时器控制，而非普通 GPIO）。以 TIM3_CH1 对应的 PA6 为例：

```c
GPIO_InitTypeDef GPIO_InitStructure;

// 配置PA6为复用推挽输出
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_6;          // 选择PA6引脚
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;    // 复用推挽输出（定时器控制）
GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;  // 输出速度50MHz
GPIO_Init(GPIOA, &GPIO_InitStructure);             // 初始化GPIOA
```

**③配置定时器时基参数（确定 PWM 周期）**

定时器时基参数决定 PWM 的周期，核心参数包括：

- **预分频系数（PSC）**：降低定时器计数频率；
- **自动重装载值（ARR）**：计数器计数到该值后复位，决定周期；
- **计数模式**：通常用向上计数（从 0 到 ARR 循环）。

**周期计算公式**：`PWM周期 = (ARR + 1) * (PSC + 1) / 定时器时钟频率`（STM32F103 中，TIM3 时钟默认 72MHz，因 APB1 预分频为 2 时，定时器时钟 = APB1 时钟 ×2=36MHz×2=72MHz）

示例：配置 1kHz 的 PWM（周期 1ms）：`72MHz / (PSC+1) = 1MHz`（计数频率 1MHz，即 1μs 计数一次），则`PSC=71`（72MHz/(71+1)=1MHz）；`ARR=999`（计数从 0 到 999，共 1000 次，每次 1μs，总周期 1000μs=1ms）。

```c
TIM_TimeBaseInitTypeDef TIM_TimeBaseStructure;

// 配置时基参数
TIM_TimeBaseStructure.TIM_Period = 999;               // ARR值：决定周期（1000个计数单位）
TIM_TimeBaseStructure.TIM_Prescaler = 71;             // PSC值：分频后计数频率1MHz
TIM_TimeBaseStructure.TIM_ClockDivision = 0;          // 时钟不分频（TIM_CKD_DIV1）
TIM_TimeBaseStructure.TIM_CounterMode = TIM_CounterMode_Up; // 向上计数模式
TIM_TimeBaseInit(TIM3, &TIM_TimeBaseStructure);       // 初始化TIM3时基
```

**④配置 PWM 通道参数（确定占空比）**

每个定时器有多个通道（如 TIM3 有 CH1~CH4），需为对应通道配置 PWM 模式、输出使能、比较值（CCR，决定占空比）等。

核心参数：

- **PWM 模式**：模式 1（CNT < CCR 时输出有效电平）或模式 2（相反）；
- **比较值（CCR）**：占空比 = (CCR / ARR) × 100%（示例中 ARR=999，CCR=500 对应 50% 占空比）；
- **输出极性**：有效电平为高或低（默认高电平）。

```c
TIM_OCInitTypeDef TIM_OCInitStructure;

// 配置PWM模式（通道1）
TIM_OCInitStructure.TIM_OCMode = TIM_OCMode_PWM1;     // PWM模式1
TIM_OCInitStructure.TIM_OutputState = TIM_OutputState_Enable; // 使能通道输出
TIM_OCInitStructure.TIM_Pulse = 0;                    // 初始CCR值（占空比0%，可后续修改）
TIM_OCInitStructure.TIM_OCPolarity = TIM_OCPolarity_High; // 有效电平为高电平
TIM_OC1Init(TIM3, &TIM_OCInitStructure);              // 初始化TIM3通道1
```

**⑤使能预装载寄存器（确保参数生效）**

定时器的 ARR（自动重装载值）和 CCR（比较值）通常需要通过预装载寄存器生效，需手动使能：

```c
// 使能通道1的CCR预装载（修改CCR后立即生效）
TIM_OC1PreloadConfig(TIM3, TIM_OCPreload_Enable);
// 使能ARR预装载（修改ARR后下次计数周期生效）
TIM_ARRPreloadConfig(TIM3, ENABLE);
```

**⑥启动定时器，输出 PWM**

最后使能定时器计数，PWM 波形即可从配置的引脚输出：

```c
TIM_Cmd(TIM3, ENABLE); // 启动TIM3计数器
```

**⑦动态修改占空比（可选）**

通过修改 CCR 值可实时调整占空比，使用库函数`TIM_SetComparex`（x 为通道号）：

```c
// 修改TIM3通道1的占空比（参数为新的CCR值）
void TIM3_SetDuty(u16 ccr) {
    TIM_SetCompare1(TIM3, ccr); // 通道1用TIM_SetCompare1，通道2用TIM_SetCompare2，以此类推
}
```

**完整初始化函数整合**

将上述步骤整合为一个初始化函数，方便调用：

```c
#include "stm32f10x.h"

// 初始化TIM3_CH1（PA6）输出PWM，参数：arr=自动重装载值，psc=预分频系数
void TIM3_PWM_Init(u16 arr, u16 psc) {
    // 步骤1：使能时钟
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA | RCC_APB2Periph_AFIO, ENABLE);
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);

    // 步骤2：配置GPIO
    GPIO_InitTypeDef GPIO_InitStructure;
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_6;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOA, &GPIO_InitStructure);

    // 步骤3：配置定时器时基
    TIM_TimeBaseInitTypeDef TIM_TimeBaseStructure;
    TIM_TimeBaseStructure.TIM_Period = arr;
    TIM_TimeBaseStructure.TIM_Prescaler = psc;
    TIM_TimeBaseStructure.TIM_ClockDivision = 0;
    TIM_TimeBaseStructure.TIM_CounterMode = TIM_CounterMode_Up;
    TIM_TimeBaseInit(TIM3, &TIM_TimeBaseStructure);

    // 步骤4：配置PWM通道
    TIM_OCInitTypeDef TIM_OCInitStructure;
    TIM_OCInitStructure.TIM_OCMode = TIM_OCMode_PWM1;
    TIM_OCInitStructure.TIM_OutputState = TIM_OutputState_Enable;
    TIM_OCInitStructure.TIM_Pulse = 0;
    TIM_OCInitStructure.TIM_OCPolarity = TIM_OCPolarity_High;
    TIM_OC1Init(TIM3, &TIM_OCInitStructure);

    // 步骤5：使能预装载
    TIM_OC1PreloadConfig(TIM3, TIM_OCPreload_Enable);
    TIM_ARRPreloadConfig(TIM3, ENABLE);

    // 步骤6：启动定时器
    TIM_Cmd(TIM3, ENABLE);
}

// 修改占空比（通道1）
void TIM3_SetDuty(u16 ccr) {
    TIM_SetCompare1(TIM3, ccr);
}
```

## 1.2 TIM输入捕获

### 1.2.1 简介

- IC (Input Capture)输入捕获
- 输入捕获模式下，当通道输入引脚出现**指定电平跳变**时（跳变方向可配置，总的类似外部中断），当前CNT的值将被锁存到CCR中，可用于**测量PWM波形的频率、占空比、脉冲间隔、电平持续时间等参数**
- 每个高级定时器和通用定时器都拥有4个输入捕获通道
- 可配置为**PWMI模式**，同时测量频率和占空比
- 可配合**主从触发模式**，实现硬件全自动测量

![image-20251003183815622](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183840240.png)



### 1.2.2 频率测量

![image-20251003183821346](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183846016.png)

- **测频法：**在闸门时间T内，对上升沿计次，得到N，则频率![image-20251003183833927](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183821346.png)。闸门时间内，N越小误差越大，因此适合高频信号。
- **测周法：**两个上升沿内，以标准频率f。定时器计次，得到N，则频率![image-20251003183840240](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183758079.png)，N计次多可以减小误差，因此适合低频信号。
- **中界频率：**测频法与测周法（都有±1误差，N越大误差越小）误差相等的频率点![image-20251003183846016](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183853363.png)。**待测信号频率<中界频率时，使用测周法；待测信号频率>中界频率时，选用测频法。**



定时器如何实现测周法？上升沿用于触发捕获，两上升沿间，时钟源fc产生的**CNT**值作为N，用于计数计时，使用共享求得fx，清零CNT。

### 1.2.3 主从出发模式

**主模式：**可以将定时器内部的信号，映射到TRGO引脚，**用于触发别的外设**

**从模式：**接受其他外设或者自身的信号，即**被别的信号控制**。其触发源选择就是选择从模式的出发信号源，信号源选择TRGI去触发从模式，从模式可以在列表中选择一项操作来**自动**执行。（详情查看手册）

![image-20251003183853363](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183858459.png)

### 1.2.4 **输入捕获基本结构**

TI1FP1带来触发信号，首先转运CNT的值到CCR里去，再触发Reset从模式给CNT清零。CCR1的值始终是最新一个周期的计数值N。因此，想要计算频率，只需要读取CCR1的值，在计算fc/N即可。纯硬件自动。

![image-20251003183858459](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183912103.png)

**注：**这里的CNT是有计数上限的，ARR一般设置为最大65535。如果信号频率太低，CNT计完就溢出了。另外从模式清零只有TI1FP1，TI2FP2，通道3、4只能开启捕获中断，在中断里手动清理，会消耗软件资源。

### 1.2.5 PWMI基本结构

这个PWMI模式，使用了两个通道同时捕获一个引脚。如图中波形，**上升沿、下降沿都捕获**，CCR1值上升沿开始的是整个周期，而在其中CCR2下降沿触发，只有半个周期（高电平）值。**此时二者一除便是占空比。**

![image-20251003183903453](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183903453.png)

### 【案例】 输入捕获模式测频率

① **使能相关时钟**：需开启定时器、GPIO 及复用功能（AFIO）的时钟。以 TIM2_CH1（PA0）为例，TIM2 属于 APB1 总线，GPIOA 属于 APB2 总线，代码如下：

```c
RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE); // 使能TIM2时钟
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA | RCC_APB2Periph_AFIO, ENABLE); // 使能GPIOA和AFIO时钟
```

② **配置 GPIO 为输入模式**：输入捕获引脚需设为浮空输入（或上拉 / 下拉，根据信号特性）。PA0 作为 TIM2_CH1 输入，配置如下：

```c
GPIO_InitTypeDef GPIO_InitStructure;
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0; // 选择PA0
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING; // 浮空输入
GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
GPIO_Init(GPIOA, &GPIO_InitStructure);
```

③ **配置定时器时基参数**：设置计数频率和最大计数范围。例如，TIM2 时钟为 72MHz，预分频系数（PSC）设为 71，计数频率为 1MHz（1μs / 次）；自动重装载值（ARR）设为 0xFFFF（最大范围，减少溢出）：

```c
TIM_TimeBaseInitTypeDef TIM_TimeBaseStructure;
TIM_TimeBaseStructure.TIM_Period = 0xFFFF; // ARR=65535
TIM_TimeBaseStructure.TIM_Prescaler = 71; // 72MHz/(71+1)=1MHz
TIM_TimeBaseStructure.TIM_ClockDivision = 0; // 不分频
TIM_TimeBaseStructure.TIM_CounterMode = TIM_CounterMode_Up; // 向上计数
TIM_TimeBaseInit(TIM2, &TIM_TimeBaseStructure);
```

④ **配置输入捕获模式**：设置通道、捕获边沿、滤波等参数。以通道 1 为例，捕获上升沿，启用滤波减少噪声：

```c
TIM_ICInitTypeDef TIM_ICInitStructure;
TIM_ICInitStructure.TIM_Channel = TIM_Channel_1; // 通道1
TIM_ICInitStructure.TIM_ICPolarity = TIM_ICPolarity_Rising; // 上升沿捕获
TIM_ICInitStructure.TIM_ICSelection = TIM_ICSelection_DirectTI; // 直接映射到CH1
TIM_ICInitStructure.TIM_ICPrescaler = TIM_ICPSC_DIV1; // 每个边沿都捕获
TIM_ICInitStructure.TIM_ICFilter = 0x0F; // 8个采样点滤波
TIM_ICInit(TIM2, &TIM_ICInitStructure);
```

⑤ **使能捕获中断与 NVIC**：需开启定时器更新中断（处理溢出）和捕获中断，并配置中断优先级：

```c
// 使能中断
TIM_ITConfig(TIM2, TIM_IT_Update | TIM_IT_CC1, ENABLE);

// 配置NVIC
NVIC_InitTypeDef NVIC_InitStructure;
NVIC_InitStructure.NVIC_IRQChannel = TIM2_IRQn; // TIM2中断通道
NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1; // 抢占优先级1
NVIC_InitStructure.NVIC_IRQChannelSubPriority = 1; // 子优先级1
NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
NVIC_Init(&NVIC_InitStructure);
```

⑥ **启动定时器**：使能定时器开始计数，等待捕获信号：

```c
TIM_Cmd(TIM2, ENABLE); // 启动TIM2
```

⑦ **定义全局变量存储捕获数据**：用于记录捕获次数、计数值、溢出次数和频率：

```c
u16 capture_cnt = 0; // 捕获次数（0：未捕获，1：第一次，2：第二次）
u32 capture_val[2] = {0}; // 两次捕获的计数值
u32 overflow_cnt = 0; // 溢出次数
float freq = 0.0f; // 测量频率
```

⑧ **编写中断服务函数处理捕获逻辑**：在中断中记录两次捕获值，计算周期和频率，处理溢出：

```c
void TIM2_IRQHandler(void) {
    // 处理溢出中断
    if (TIM_GetITStatus(TIM2, TIM_IT_Update) != RESET) {
        TIM_ClearITPendingBit(TIM2, TIM_IT_Update);
        overflow_cnt++; // 溢出次数+1
    }

    // 处理捕获中断
    if (TIM_GetITStatus(TIM2, TIM_IT_CC1) != RESET) {
        TIM_ClearITPendingBit(TIM2, TIM_IT_CC1);

        if (capture_cnt == 0) {
            // 第一次捕获：记录计数值，重置溢出
            capture_val[0] = TIM_GetCapture1(TIM2);
            overflow_cnt = 0;
            capture_cnt = 1;
        } else if (capture_cnt == 1) {
            // 第二次捕获：计算频率
            capture_val[1] = TIM_GetCapture1(TIM2);
            u32 total_cnt = (overflow_cnt * 0xFFFF) + (capture_val[1] - capture_val[0]);
            float period = total_cnt * 1e-6f; // 周期（单位：秒）
            if (period > 0) freq = 1.0f / period; // 频率=1/周期
            capture_cnt = 0; // 重置状态
        }
    }
}
```

⑨ **在 main 函数中初始化并使用**：调用初始化函数后，通过`freq`变量获取测量到的频率：

```c
int main(void) {
    TIM2_IC_Init(); // 初始化输入捕获
    while (1) {
        // 可通过freq变量读取频率（单位：Hz）
    }
}
```

### 【案例】 PWMI模式测频率占空比

① **使能相关时钟**：开启定时器、对应 GPIO 及复用功能（AFIO）时钟。以 TIM3_CH1（PA6）和 CH2（PA7）为例（PWMI 模式需两个通道），TIM3 属于 APB1 总线，GPIOA 属于 APB2 总线：

```c
RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE); // 使能TIM3时钟
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA | RCC_APB2Periph_AFIO, ENABLE); // 使能GPIOA和AFIO时钟
```

② **配置 GPIO 为复用输入模式**：PWMI 模式的两个通道引脚需配置为浮空输入（或上拉 / 下拉），且复用为定时器功能。PA6（TIM3_CH1）和 PA7（TIM3_CH2）配置如下：

```c
GPIO_InitTypeDef GPIO_InitStructure;
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_6 | GPIO_Pin_7; // 选择PA6和PA7
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING; // 浮空输入（捕获PWM信号）
GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
GPIO_Init(GPIOA, &GPIO_InitStructure);
```

③ **配置定时器时基参数**：设置计数频率和最大计数范围，决定测量精度。例如，TIM3 时钟为 72MHz，预分频系数（PSC）设为 71，计数频率为 1MHz（1μs / 次）；自动重装载值（ARR）设为 0xFFFF（最大范围）：

```c
TIM_TimeBaseInitTypeDef TIM_TimeBaseStructure;
TIM_TimeBaseStructure.TIM_Period = 0xFFFF; // ARR=65535（最大计数）
TIM_TimeBaseStructure.TIM_Prescaler = 71; // 72MHz/(71+1)=1MHz（1μs计数一次）
TIM_TimeBaseStructure.TIM_ClockDivision = 0; // 不分频
TIM_TimeBaseStructure.TIM_CounterMode = TIM_CounterMode_Up; // 向上计数
TIM_TimeBaseInit(TIM3, &TIM_TimeBaseStructure);
```

④ **配置 PWMI 模式**：以 CH1 为参考通道（捕获上升沿），CH2 自动配置为捕获下降沿，无需手动设置 CH2 参数（库函数自动关联）：

```c
TIM_ICInitTypeDef TIM_ICInitStructure;
// 配置参考通道（CH1）：上升沿捕获
TIM_ICInitStructure.TIM_Channel = TIM_Channel_1; // 参考通道为CH1
TIM_ICInitStructure.TIM_ICPolarity = TIM_ICPolarity_Rising; // 上升沿触发
TIM_ICInitStructure.TIM_ICSelection = TIM_ICSelection_DirectTI; // 直接映射到CH1
TIM_ICInitStructure.TIM_ICPrescaler = TIM_ICPSC_DIV1; // 每个边沿都捕获
TIM_ICInitStructure.TIM_ICFilter = 0x0F; // 8个采样点滤波（抗噪声）
TIM_PWMIConfig(TIM3, &TIM_ICInitStructure); // 初始化PWMI模式（CH2自动配置为下降沿）
```

⑤ **设置从模式触发**：让定时器在参考通道（CH1）捕获时复位计数器，确保周期测量准确（计数器从 0 开始计数，避免溢出计算复杂）：

```c
TIM_SelectInputTrigger(TIM3, TIM_TS_TI1FP1); // 选择CH1的捕获信号作为触发源
TIM_SelectSlaveMode(TIM3, TIM_SlaveMode_Reset); // 触发时复位计数器
TIM_SelectMasterSlaveMode(TIM3, TIM_MasterSlaveMode_Enable); // 使能从模式
```

⑥ **使能中断与配置 NVIC**：开启 CH1 捕获中断（周期测量）和 CH2 捕获中断（占空比测量），并配置中断优先级：

```c
// 使能CH1和CH2捕获中断
TIM_ITConfig(TIM3, TIM_IT_CC1 | TIM_IT_CC2, ENABLE);

// 配置NVIC
NVIC_InitTypeDef NVIC_InitStructure;
NVIC_InitStructure.NVIC_IRQChannel = TIM3_IRQn; // TIM3中断通道
NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1; // 抢占优先级1
NVIC_InitStructure.NVIC_IRQChannelSubPriority = 1; // 子优先级1
NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
NVIC_Init(&NVIC_InitStructure);
```

⑦ **启动定时器**：使能定时器开始计数，等待捕获 PWM 信号：

```c
TIM_Cmd(TIM3, ENABLE); // 启动TIM3
```

⑧ **定义全局变量存储测量数据**：记录周期、高电平时间、频率和占空比：

```c
u32 period_cnt = 0; // 周期对应的计数次数（CH1两次上升沿的间隔）
u32 high_cnt = 0; // 高电平对应的计数次数（CH1上升沿到CH2下降沿的间隔）
float freq = 0.0f; // 频率（Hz）
float duty = 0.0f; // 占空比（%）
```

⑨ **编写中断服务函数处理测量逻辑**：CH1 捕获上升沿时记录周期，CH2 捕获下降沿时记录高电平时间，计算频率和占空比：

```c
void TIM3_IRQHandler(void) {
    // 处理CH1捕获中断（上升沿，周期测量）
    if (TIM_GetITStatus(TIM3, TIM_IT_CC1) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_CC1);
        period_cnt = TIM_GetCapture1(TIM3); // 读取CH1捕获值（周期计数）
        // 频率 = 计数频率 / 周期计数（计数频率为1MHz）
        if (period_cnt > 0) {
            freq = 1e6f / period_cnt; // 1MHz / 周期计数 = 频率（Hz）
        }
    }

    // 处理CH2捕获中断（下降沿，高电平时间测量）
    if (TIM_GetITStatus(TIM3, TIM_IT_CC2) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_CC2);
        high_cnt = TIM_GetCapture2(TIM3); // 读取CH2捕获值（高电平计数）
        // 占空比 = 高电平计数 / 周期计数 × 100%
        if (period_cnt > 0) {
            duty = (float)high_cnt / period_cnt * 100.0f;
        }
    }
}
```

⑩ **在 main 函数中初始化并使用**：调用初始化函数后，通过`freq`和`duty`变量获取频率和占空比：

```c
int main(void) {
    // 初始化PWMI模式
    // （将步骤①~⑦的代码封装为函数TIM3_PWMI_Init()并调用）
    TIM3_PWMI_Init();

    while (1) {
        // 可通过freq获取频率（Hz），duty获取占空比（%）
    }
}
```

## 1.3 编码器

- Encoder Interface 编码器接口
- 编码器接口可接收增量**(正交)编码器**的信号，根据编码器旋转产生的正交信号脉冲，**自动控制CNT自增或自减（带方向的计次，****只需要获取CNT的值即可****），**从而指示编码器的位置、旋转方向和旋转速度
- 每个高级定时器和通用定时器都拥有**1个**编码器接口（一般有硬件资源的时候优先使用硬件资源）
- 两个输入引脚借用了输入捕获的通道1和通道2

### 1.3.1 正交编码器

当旋转编码器转起来时候，会产生两路方波。方波频率代表速度，二者相位比较即可得到方向。通过列表发现二者状态相反，因此首先把A、B相的所有边沿作为计数器的计数时钟，出现边沿信号时候，就计数器自增或者自减，而这个增减由另一项的状态来确定。

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183944428.png)





### 1.3.2 定时器编码器框图

高级定时器和通用定时器都拥有**1个**编码器接口，普通定时器没有。

![image-20251003183926532](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183940065.png)

可以看到编码器的两个**输入引脚**借用了输入捕获单元的前**两个通道CH1/CH2**。输入部分滤波和边缘检测编码器都有使用（可参考下图）。

编码器输出部分相当于从模式控制器，去控制CNT的计数时钟和计数方向，即如果出现边沿信号，并且另一相的状态为正转，CNT自增，否则自减。此时触发控制处于编码器接口托管的状态，72M计数时钟和时基单元计数方向并不会被使用。

### 1.3.3 编码器接口基本结构

![image-20251003183935007](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183950460.png)

可以通过设置ARR的数值为65535，通过补码的特性，很容易得到负数。

### 1.3.4 工作模式

A相——TI1FP1；B相——TI2FP2；

![image-20251003183940065](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183935007.png)

**【实例】**

![image-20251003183944428](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183954948.png)	

![image-20251003183950460](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183926532.png)

**抗噪声：**毛刺当中，即出现一个脚不动，另一个脚来回跳变的情况，计数器就会加减加减来回摆动，最终计数值不变，不受影响。

![image-20251003183954948](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184000802.png)

**反相：**即框图中，本来极性选择是上升沿有效还是下降沿有效，但在编码器中都有效，因此此时的极性选择变成了高低电平的极性选择。**如果选择上升沿的参数，信号直通过来，高低电平极性不翻转。如果选择下降沿参数，信号就通过一个非门过来，高低电平极性反转。**

因此，根据波形查表的时候，**需要将反相TI1的波形取反，**再查表才能得到正确的计数器状态。

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184008877.png)

可以灵活运用控制编码器计数方向和增减。

### 【案例】 编码器接口测速

① **编码器接口原理**：STM32 定时器的编码器接口可直接连接正交编码器（A、B 相输出），通过捕获 A、B 相的脉冲边沿变化，自动计数并反映电机旋转方向和速度。正交编码器的 A、B 相脉冲相差 90°，通过相位差判断方向，通过脉冲数计算转速。

② **使能相关时钟**：开启定时器、编码器 A/B 相连接的 GPIO 及复用功能时钟。以 TIM4（常用作编码器接口）为例，CH1 接 PB6（A 相），CH2 接 PB7（B 相），TIM4 属于 APB1 总线，GPIOB 属于 APB2 总线：

```c
RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM4, ENABLE); // 使能TIM4时钟
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB | RCC_APB2Periph_AFIO, ENABLE); // 使能GPIOB和AFIO时钟
```

③ **配置 GPIO 为复用推挽输入**：编码器 A、B 相引脚需复用为定时器输入，配置为上拉输入（确保无信号时电平稳定）：

```c
GPIO_InitTypeDef GPIO_InitStructure;
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_6 | GPIO_Pin_7; // PB6（TIM4_CH1）、PB7（TIM4_CH2）
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IPU; // 上拉输入
GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
GPIO_Init(GPIOB, &GPIO_InitStructure);
```

④ **配置定时器编码器模式**：设置 TIM4 为编码器接口模式，同时捕获 A、B 相的上升沿和下降沿（4 倍频，提高精度）：

```c
TIM_TimeBaseInitTypeDef TIM_TimeBaseStructure;
TIM_ICInitTypeDef TIM_ICInitStructure;

// 时基参数：ARR设为最大值（65535），计数范围最大
TIM_TimeBaseStructure.TIM_Period = 0xFFFF; // 自动重装载值
TIM_TimeBaseStructure.TIM_Prescaler = 0; // 不分频（编码器脉冲直接计数）
TIM_TimeBaseStructure.TIM_ClockDivision = 0;
TIM_TimeBaseStructure.TIM_CounterMode = TIM_CounterMode_Up; // 向上计数（方向由编码器决定）
TIM_TimeBaseInit(TIM4, &TIM_TimeBaseStructure);

// 配置编码器模式：同时响应A、B相的边沿（4倍频）
TIM_ICInitStructure.TIM_Channel = TIM_Channel_1; // 通道1（A相）
TIM_ICInitStructure.TIM_ICPolarity = TIM_ICPolarity_Rising; // 上升沿触发
TIM_ICInitStructure.TIM_ICSelection = TIM_ICSelection_DirectTI;
TIM_ICInitStructure.TIM_ICPrescaler = TIM_ICPSC_DIV1; // 不分频
TIM_ICInitStructure.TIM_ICFilter = 0x0F; // 滤波（减少噪声）
TIM_ICInit(TIM4, &TIM_ICInitStructure);

TIM_ICInitStructure.TIM_Channel = TIM_Channel_2; // 通道2（B相）
TIM_ICInitStructure.TIM_ICPolarity = TIM_ICPolarity_Rising; // 上升沿触发
TIM_ICInit(TIM4, &TIM_ICInitStructure);

// 使能编码器模式：计数方向由A、B相相位差决定
TIM_EncoderInterfaceConfig(TIM4, TIM_EncoderMode_TI12, TIM_ICPolarity_Rising, TIM_ICPolarity_Rising);
```

⑤ **配置定时器更新中断（可选）**：若需处理计数器溢出（如长时间测速），可开启更新中断：

```c
// 使能更新中断
TIM_ITConfig(TIM4, TIM_IT_Update, ENABLE);

// 配置NVIC
NVIC_InitTypeDef NVIC_InitStructure;
NVIC_InitStructure.NVIC_IRQChannel = TIM4_IRQn;
NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 2;
NVIC_InitStructure.NVIC_IRQChannelSubPriority = 2;
NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
NVIC_Init(&NVIC_InitStructure);
```

⑥ **启动定时器**：使能计数器开始计数，编码器转动时 TIM4 的 CNT 值会自动增减（正转增，反转减）：

```c
TIM_SetCounter(TIM4, 0); // 初始计数清零
TIM_Cmd(TIM4, ENABLE); // 启动TIM4
```

⑦ **定义全局变量存储测速数据**：记录脉冲数、方向和转速：

```c
int16_t encoder_cnt = 0; // 累计脉冲数（带符号，正为正转，负为反转）
float speed = 0.0f; // 转速（单位：r/s 或 r/min，需根据编码器参数换算）
uint8_t dir = 0; // 方向：0-正转，1-反转
```

⑧ **定时读取脉冲数并计算转速**：通过定时器（如 SysTick）定时（如 10ms）读取 CNT 值，计算单位时间内的脉冲数，再换算为转速。示例：

```c
// 假设编码器每转脉冲数为PPR（如1000），定时时间为t秒（如0.01s）
#define PPR 1000 // 编码器每转脉冲数
#define SAMPLE_TIME 0.01f // 采样时间（秒）

void Get_Speed(void) {
    // 读取当前计数器值（带符号，反映方向和脉冲数）
    int16_t current_cnt = (int16_t)TIM_GetCounter(TIM4);
    // 清零计数器，准备下次计数
    TIM_SetCounter(TIM4, 0);
    
    encoder_cnt = current_cnt; // 保存本次采样脉冲数
    // 判断方向（正转cnt为正，反转为负）
    dir = (current_cnt > 0) ? 0 : 1;
    
    // 计算转速：转速（r/s）= 脉冲数 / (PPR * 4) / 采样时间（4倍频需除以4）
    speed = (float)abs(current_cnt) / (PPR * 4.0f) / SAMPLE_TIME;
    // 若需r/min，乘以60：speed *= 60;
}
```

⑨ **编写中断服务函数处理溢出（可选）**：若计数器溢出，通过中断修正累计脉冲数：

```c
int32_t total_cnt = 0; // 累计总脉冲数（处理溢出）
void TIM4_IRQHandler(void) {
    if (TIM_GetITStatus(TIM4, TIM_IT_Update) != RESET) {
        TIM_ClearITPendingBit(TIM4, TIM_IT_Update);
        // 溢出时根据方向修正总脉冲数（上溢加65536，下溢减65536）
        total_cnt += (dir == 0) ? 0x10000 : -0x10000;
    }
}
```

⑩ **在 main 函数中初始化并定时测速**：

```c
int main(void) {
    // 初始化编码器接口（封装步骤②~⑥为函数TIM4_Encoder_Init()）
    TIM4_Encoder_Init();
    // 初始化SysTick定时（如10ms触发一次Get_Speed()）
    SysTick_Init(); 

    while (1) {
        // 循环中可通过speed和dir获取转速和方向
    }
}
```

# 二、ADC

## 2.1 简介

- ADC (Analog-Digital Converter)模拟-数字转换器
- ADC可以将引脚上连续变化的模拟电压转换为内存中存储的数字变量，建立模拟电路到数字电路的桥梁
- **12位（分辨率）**逐次逼近型ADC，**1us**（1MHz）转换时间
- 输入电压范围**：0~3.3**V，对应**转换结果范围：0~4095（0~2^12-1）**
- 18个输入通道，可 测量16个外部和2个内部信号源
- **规则组**（常规事件）和**注入组**（突发事件）两个转换单元
- 模拟看门狗自动监测输入电压范围
- STM32F103C8T6 ADC资源：ADC1、ADC2， 10个外部输入通道

一般读取引脚我们只能获取高电平或者低电平，但是使用ADC之后，就可以把高低电平之间的任意电压进行量化，最终用一个变量表示，读取这个变量，就可以知道计算得知具体电压。

## 2.2 ADC原理结构

### 2.2.1 逐次逼近型ADC学习

以前单片机性能不强的时候，需要外挂一块ADC芯片才能进行AD转换，，下图中的通道选择开关表示一个可以通过模拟信号的数据选择器，有多少ADC的通道数即多少的开关，STM32内部的ADC有18个输入通道。

![image-20251003184008877](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003183833927.png)

那么如何知道通道输入的电压是多少呢？通过比较器进行逐次的比较，即从高位到低位依次判断是1还是0的过程。（8位判断8次，12位判断12次，具体可以参考C51教程）一遍遍的比较至**近似相等**。

**VREF参考电压：**用于DAC输出电压比较值，也可以说是整个ADC的参考电压。一般情况下ADC的输入范围和供电是一致的。（不一样的，比如音频的ADC）

### 2.2.2 ADC框图

非常重要，反复观看。

![image](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184106803.png)

|      | **内部18个通道：**16个IO口+1个温度传感器+VREFINT内部参考电压进入到**模拟多路开关**再进入到**模数转换器**，即逐次比较的过程。转换的**12位**数据结果会放置到**16位数据寄存器**里，**读取即可获得转换值。**注意转换可以**多通道进行**，并且分成了**规则/注入两个通道组**。ps:主要是讨论规则组使用，注入组自行查看手册。 |
| ---- | ------------------------------------------------------------ |
|      |                                                              |

- **触发ADC转换的信号：**①软件触发，在程序中调用一条代码，就可以启动转换了。②硬件触发，就是这里的这些触发源（EXTI_11/EXTI15开始连接的两控制器）。
- **参考电压：**芯片的VDDA和VSSA在电路中默认接了VREF，因此没有VREF±引脚。同电源0~3.3V
- **ADCCLK：**来源于外设总线预分频器，最大14MHz，因此把时钟源分频时候不能弄超了。
- **数据寄存器：**存数据

- DMA数据搬运功能：下节讲解

- **模拟看门狗：**可以存一个阈值高限和一个阈值低限。启动并指定了看门的通道，一旦数据超过限制范围，就会乱叫，即申请一个中断AWD。
- **通道组完成信号：**转换完成之后，也会有一个信号，EOC是规则组的完成信号，JEOC注入组完成信号。这些信号可以渠道NVIC申请中断

### 2.2.3 ADC基本结构

使能ADC：选择输入通道——开关选择——进入转换器（分两组）——接收触发和时钟信号，开始转换，发送转换完成信号，输出数据保存到寄存器（不同组寄存器个数不同）——申请中断——....![image-20251003184055889](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184055889.png)![image-20251003184106803](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image.png)

手册引脚中只有IN0~9共10个通道，其他地方就没有了。因此芯片只有10个外部输入通道。下图中ADC12_IN0的意思是ADC1和ADC2的IN0都是在PA0上的，即引脚全都是相同的。因此ADC1和ADC2可以同时运行，即双ADC模式。比如可以配合组成同步或者**交叉运行（对着一个通道交叉的采样，增大采样的频率）**。

![image-20251003184118478](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184118478.png)

本芯片没有ADC3。

### 2.2.4 规则组的四种转换模式

参数：单次/连续、扫描/非扫描

**【单次转换，非扫描模式】**

![image (1)](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image (1).png)

|      | 再非扫描模式下，**只有序列1的位置有效，**这时候同时选中一组的方式就简化为选中一个的方式。但这**一个位置可以选择不同的通道**，然后触发转换一次。EOC标志位置1，整个转换过程结束。如果想再次转换，只能再次触发。如果想换通道，那就触发转换之前将其通道更改。**（****没有用到菜单列表****）** |
| ---- | ------------------------------------------------------------ |
|      |                                                              |

**【连续转换，非扫描模式】**

![image (2)](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image (3).png)

|      | 仍然是非扫描模式，菜单列表**只用第一个**。区别是一次转换完成标志位置1结束后，还会继续触发转换（**不需要等待时间**），一旦开始，一直持续。想要数据就一直从寄存器去就是了。（但有可能功耗会上升） |
| ---- | ------------------------------------------------------------ |
|      |                                                              |

**【单次转换，扫描模式】**

![image (3)](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image (2).png)

|      | 到这里，就很好理解这些参数了。**扫描模式**，每触发一次，转换结束后就会停下来。不过会把菜单列表的通道都转换了。（**列表通道可以任意指定，可以重复指定**）因此，还需要有一个**通道数目**参数。对指定数目进行一次转换，存放到数据寄存器中（**为了防止数据被覆盖，需要及时使用DMA将数据搬运走**）。 |
| ---- | ------------------------------------------------------------ |
|      |                                                              |

**ps:** 至于有提问，**EOC 标志位是不是应该每个通道转换后出现**？这是要分情况说明的，关于这个问题可以在 ADC 实践视频中有补充讲解。暂时只需要注意**防止数据被覆盖**的问题**，**往下学或者仔细看手册问题会迎刃而解即可。（2024.08.12记录下问题，大家多多实践。）

①估计是内容划分裁剪导致的，补充看视频ADC代码的实践章节可以解惑。在代码实践部分老师有纠正补充**提到“EOC是规则和注入组都会产生的，推荐以寄存器说明为主”**，并且说明了**“规则组扫描模式存在数据覆盖问题，最好使用DMA来配合”**，这时候又没讲到DMA所以内容后放了。最后明确讲了扫描模式的过程，以及防**覆盖的**解决方法。

②“**规则组扫描模式多通道后产生EOC，因为过程中数据会被覆盖，需要DMA配合实现“**。理论入门了解到这就够了，其它问题需要在实践中在结合说明。**虽然困扰，但应该不影响往下学。**

③这个问题要能理解，我觉得是需要规则/注入组+通道+转换模式+扫描模式+中断+DMA这些概念结合寄存器说明，一起来看才好理解。**都要求一个视频里一下子讲完是听不下去的。先把主要的****数据覆盖问题****抓好了，往后这个EOC出现问题就不难理解了**。因为记得CubeMx里面还有一个End Of Conversion Selection（转换结束选择），就是用来配置选择 每个通道/整个序列 的。实践细究下去问题多得是，但那是我们的问题了。

**“知识不全是线性的，大部分是网状的，知识点之间不一定有绝对的先后关系；前面内容看不懂，跳过去，并不影响学后面的；后面的学会了，有时候更容易看懂前面的。”——雷军**

**【连续转换，扫描模式】**

![image (4)](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image (4).png)

|      | 同样的，连续扫描模式，一旦开始，不会停止转换，全部通道扫描。 |
| ---- | ------------------------------------------------------------ |
|      |                                                              |

**注：**再扫描模式中仍然可以暂停，即间断模式，暂时不用理会....

## 2.3 AD转换过程补充

### 2.3.1 触发控制

通过设置EXTSEL寄存器来选择控制源。

![image-20251003184225599](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184225599.png)

### 2.3.2 数据对齐

数据寄存器是16位的，ADC是12位的，因此存在一个数据对齐的问题，以便正确获取数据。**一般使用右对齐，直接得到转换结果。**

![image-20251003184229858](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184229858.png)

数据对齐常用于控制精度，如果后面的四位不要了，可以左对齐后只取高八位。但感觉比较鸡肋。

### 2.3.3 转换时间

**A****D转换的步骤：**采样，保持；量化，编码

**STM32 ADC的总转换时间为：**`**T****CONV****=采样时间+ 12.5个ADC周期**`

需要采样保持的原因是，电压是波动的，因此想要在转换过程中，保持稳定。就需要这个采样保持电路。整个过程耗费时间即为**采样时间**（越大越能防止毛刺信号，不过转换时间也会延长）。

12位的ADC需要12个转换周期，另外0.5个周期不知道干嘛。

**例如：**当ADCCLK= 14MHz，采样时间为1.5个ADC周期`TCONV= 1.5 + 12.5 = 14个ADC周期= 1μs`

这就是最快时间了，再快需要ADCCLK超频，稳定性堪忧。

### 2.3.4 校准

- ADC有一个内置**自校准模式**。校准可大幅减小因内部电容器组的变化而造成的准精度误差。校准期间，在每个电容器上都会计算出一个误差修正码(数字值)，这个码用于消除在随后的转换中每个电容器上产生的误差
- 建议在每次上电后执行一次校准
- 启动校准前，ADC必须处于关电状态超过至少两个ADC时钟周期

**校准过程是固定的，只需要注意调用即可。**

### 2.3.5 硬件电路

ADC外围电路设计：方便信号接入。

![image-20251003184235201](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184235201.png)

①电位器产生可调电压（滑动变阻器），注意**阻值不要太小**。

②传感器产生输出电压电路，其光敏电阻、热敏电阻、红外接收管、麦克风等都可以**等效为一个可变电阻**。因为电阻阻值没法直接测量，就需要串联一个电阻分压（**阻值近似传感器阻值**），来得到一个反应电阻值电压的电路。

③电压转换电路，同样的需要电阻进行分压。根据分压公式计算PA2电压范围。`PA2=VIN/50K*33K`。如果电压高于5V不建议使用该电路，比较危险。高电压采集最好需要一些专用的采集芯片，比如隔离放大器。

### 【案例】ADC单通道采集

① **使能 ADC 和 GPIO 时钟**：ADC 属于 APB2 总线外设，需开启对应 ADC 时钟和采样引脚的 GPIO 时钟。以 ADC1 的通道 1（PA1）为例：

```c
RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC1 | RCC_APB2Periph_GPIOA, ENABLE); // 使能ADC1和GPIOA时钟
```

② **配置 GPIO 为模拟输入模式**：ADC 采样引脚需设置为模拟输入（无上下拉，不接外部电路时为高阻态），PA1 配置如下：

```c
GPIO_InitTypeDef GPIO_InitStructure;
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_1; // 选择PA1（ADC1_CH1）
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AIN; // 模拟输入模式
GPIO_Init(GPIOA, &GPIO_InitStructure);
```

③ **配置 ADC 时钟分频**：ADC 时钟由 APB2 时钟（72MHz）分频得到，最大不超过 14MHz，通常分频为 6（72MHz/6=12MHz）：

```c
RCC_ADCCLKConfig(RCC_PCLK2_Div6); // ADC时钟=72MHz/6=12MHz
```

④ **初始化 ADC 基本参数**：设置工作模式（独立模式）、扫描模式（单通道关闭扫描）、数据对齐（右对齐）、通道数（1 个）：

```c
ADC_InitTypeDef ADC_InitStructure;
ADC_InitStructure.ADC_Mode = ADC_Mode_Independent; // 独立模式（仅ADC1工作）
ADC_InitStructure.ADC_ScanConvMode = DISABLE; // 关闭扫描模式（单通道无需扫描）
ADC_InitStructure.ADC_ContinuousConvMode = DISABLE; // 单次转换模式（触发一次转换一次）
ADC_InitStructure.ADC_ExternalTrigConv = ADC_ExternalTrigConv_None; // 无外部触发，软件触发
ADC_InitStructure.ADC_DataAlign = ADC_DataAlign_Right; // 数据右对齐
ADC_InitStructure.ADC_NbrOfChannel = 1; // 转换通道数为1
ADC_Init(ADC1, &ADC_InitStructure);
```

⑤ **配置 ADC 通道采样顺序和时间**：单通道需设置采样顺序为 1，采样时间根据信号特性选择（如 55.5 周期，精度更高）：

```c
// 配置通道1：采样顺序1，采样时间55.5周期
ADC_RegularChannelConfig(ADC1, ADC_Channel_1, 1, ADC_SampleTime_55Cycles5);
```

⑥ **使能 ADC 并校准**：ADC 上电后需进行校准（提高精度），包括复位校准和正式校准：

```c
ADC_Cmd(ADC1, ENABLE); // 使能ADC1

// 复位校准
ADC_ResetCalibration(ADC1);
while (ADC_GetResetCalibrationStatus(ADC1)); // 等待复位校准完成

// 正式校准
ADC_StartCalibration(ADC1);
while (ADC_GetCalibrationStatus(ADC1)); // 等待校准完成
```

⑦ **编写 ADC 读取函数**：通过软件触发转换，等待转换完成后读取数据（12 位 ADC，范围 0~4095）：

```c
uint16_t ADC_Read(void) {
    ADC_SoftwareStartConvCmd(ADC1, ENABLE); // 软件触发转换
    while (!ADC_GetFlagStatus(ADC1, ADC_FLAG_EOC)); // 等待转换结束（EOC标志置位）
    return ADC_GetConversionValue(ADC1); // 返回转换结果（0~4095）
}
```

⑧ **电压换算（可选）**：若需将 ADC 值转换为实际电压（假设参考电压为 3.3V）：

```c
float ADC_GetVoltage(void) {
    uint16_t adc_val = ADC_Read();
    return (float)adc_val * 3.3f / 4095.0f; // 电压=ADC值×3.3V/4095
}
```

⑨ **在 main 函数中使用**：初始化后调用读取函数获取 ADC 值或电压：

```c
int main(void) {
    // 初始化ADC（封装步骤①~⑥为函数ADC1_Init()）
    ADC1_Init();
    
    while (1) {
        uint16_t adc_data = ADC_Read(); // 读取ADC原始值
        float voltage = ADC_GetVoltage(); // 换算为电压
        // 延时一段时间再采样（如100ms）
        delay_ms(100);
    }
}
```

### 【案例】ADC多通道采集

① **使能 ADC 和 GPIO 时钟**：开启 ADC 及多个采样引脚的 GPIO 时钟。以 ADC1 为例，采集 PA0（CH0）、PA1（CH1）、PA2（CH2）三个通道：

```c
RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC1 | RCC_APB2Periph_GPIOA, ENABLE); // 使能ADC1和GPIOA时钟
```

② **配置多个 GPIO 为模拟输入**：将所有采样引脚设为模拟输入模式：

```c
GPIO_InitTypeDef GPIO_InitStructure;
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0 | GPIO_Pin_1 | GPIO_Pin_2; // PA0、PA1、PA2
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AIN; // 模拟输入
GPIO_Init(GPIOA, &GPIO_InitStructure);
```

③ **配置 ADC 时钟分频**：ADC 时钟不超过 14MHz，仍采用 72MHz/6=12MHz：

```c
RCC_ADCCLKConfig(RCC_PCLK2_Div6); // ADC时钟=12MHz
```

④ **初始化 ADC 参数（开启扫描模式）**：多通道需开启扫描模式，设置连续 / 单次转换，此处以单次扫描为例：

```c
ADC_InitTypeDef ADC_InitStructure;
ADC_InitStructure.ADC_Mode = ADC_Mode_Independent; // 独立模式
ADC_InitStructure.ADC_ScanConvMode = ENABLE; // 开启扫描模式（多通道需要）
ADC_InitStructure.ADC_ContinuousConvMode = DISABLE; // 单次转换（扫描完所有通道后停止）
ADC_InitStructure.ADC_ExternalTrigConv = ADC_ExternalTrigConv_None; // 软件触发
ADC_InitStructure.ADC_DataAlign = ADC_DataAlign_Right; // 右对齐
ADC_InitStructure.ADC_NbrOfChannel = 3; // 通道总数为3
ADC_Init(ADC1, &ADC_InitStructure);
```

⑤ **配置多通道采样顺序和时间**：按顺序设置每个通道的采样顺序（1~3）和采样时间，顺序决定扫描先后：

```c
// 通道0：顺序1，采样时间55.5周期
ADC_RegularChannelConfig(ADC1, ADC_Channel_0, 1, ADC_SampleTime_55Cycles5);
// 通道1：顺序2，采样时间55.5周期
ADC_RegularChannelConfig(ADC1, ADC_Channel_1, 2, ADC_SampleTime_55Cycles5);
// 通道2：顺序3，采样时间55.5周期
ADC_RegularChannelConfig(ADC1, ADC_Channel_2, 3, ADC_SampleTime_55Cycles5);
```

⑥ **使能 ADC 并校准**：同单通道，需执行复位校准和正式校准：

```c
ADC_Cmd(ADC1, ENABLE); // 使能ADC1

// 复位校准
ADC_ResetCalibration(ADC1);
while (ADC_GetResetCalibrationStatus(ADC1));

// 正式校准
ADC_StartCalibration(ADC1);
while (ADC_GetCalibrationStatus(ADC1));
```

⑦ **编写多通道读取函数**：触发一次扫描后，按顺序读取所有通道的转换结果（扫描完成后 EOC 标志置位）：

```c
// 定义数组存储3个通道的ADC值
uint16_t adc_val[3];

void ADC_MultiRead(void) {
    ADC_SoftwareStartConvCmd(ADC1, ENABLE); // 软件触发扫描
    // 等待所有通道扫描完成（EOC标志）
    while (!ADC_GetFlagStatus(ADC1, ADC_FLAG_EOC));
    // 按顺序读取结果（扫描顺序与配置顺序一致）
    adc_val[0] = ADC_GetConversionValue(ADC1); // 通道0结果
    adc_val[1] = ADC_GetConversionValue(ADC1); // 通道1结果
    adc_val[2] = ADC_GetConversionValue(ADC1); // 通道2结果
}
```

⑧ **电压换算（可选）**：将每个通道的 ADC 值转换为实际电压：

```c
float adc_voltage[3];
void ADC_ConvertVoltage(void) {
    for (uint8_t i = 0; i < 3; i++) {
        adc_voltage[i] = (float)adc_val[i] * 3.3f / 4095.0f; // 3.3V参考电压
    }
}
```

⑨ **在 main 函数中使用**：初始化后定时读取多通道数据：

```c
int main(void) {
    // 初始化多通道ADC（封装步骤①~⑥为函数ADC1_MultiInit()）
    ADC1_MultiInit();
    
    while (1) {
        ADC_MultiRead(); // 读取3个通道的原始值
        ADC_ConvertVoltage(); // 转换为电压
        // 延时100ms后再次采样
        delay_ms(100);
    }
}
```

# 三、DMA

## 3.1 简介

- DMA (Direct Memory Access)直 接存储器存取
- DMA可以提供**外设和存储器**或者**存储器和存储器之间**的高速数据传输，无须CPU干预，节省了CPU的资源
- 12个独立可配置的通道: DMA1 (7个通道)，DMA2 (5个通道)，每个通道都支持**软件触发（**存储器间的**）**和特定的**硬件触发（**外设到存储器间**）。**

STM32F103C8T6 DMA资源：DMA1 (7个通道)

**存储器映像**

![image-20251003184239980](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184239980.png)

- **计算机组成部分：**运算器，控制器，存储器，输入输出设备
- CPU：运算器，控制器
- 存储器：主要是存储器的**内容和地址**
- ROM：只读存储器，掉电不丢失数据
- RAM：随机存储器，掉电丢失数据

其中系统存储器数据为厂家固定的启动加载程序，不修改。选项字节，在下载的时候可以不刷新其内容，保持不变，主要存的是flash读写保护、看门狗等配置。

## 3.2 原理

### 3.2.1 DMA框图

看成CPU+存储器两大部分

![image-20251003184247487](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184247487.png)

**寄存器：**是一种特殊存储器，一方面可以和存储器一样读写内容，另一方面，寄存器每一位背后都连接了一根导线，可以用于控制外设的状态。因此**寄存器是连接软件和硬件的桥梁**。软件读写寄存器从而控制硬件执行。即**外设是寄存器，寄存器就是存储器**。

如上图可看到DMA有三个，以太网DMA是自带的不用理会，剩下的DMA1和DMA2只要配置转移数据的源地址和目标地址就可以各自独立的工作了。其中有个**仲裁器**，这是因为虽然多个通道可以独立转运数据，但是DMA总线只有一条，因此只能分时复用这一条DMA总线，如果产生了冲突会使用仲裁器。另外再总线矩阵里也有一个仲裁器，如果DMA和CPU同时访问目标，**那么DMA就会暂停CPU的访问，**防止冲突，**此时仲裁器执行循环调度，以保证CPU至少可以得到一般的系统总线（存储器或外设）带宽**。

**AHB从设备：**DMA作为外设的寄存器，其连接在AHB总线上。所以DMA即是总线矩阵的主动单元，可以读写各种存储器，也是AHB总线上的被动单元，CPU通过这一条路线，就可以对DMA进行**参数配置**了。

**DMA请求：**由触发源（外设）发起，即**DMA的硬件触发源**。收到请求后之后DMA就可以进行数据转运了。

其中Flash是ROM，只读存储器的一种，如果通过CPU或者DMA都是**只能读取，不能写入**，因此不能用作DMA目的地址。想要写入需要配置这个Flash接口控制器，对Flash进行写入，流程比较麻烦。SRAM可以随意读写，外设寄存器需要参考手册描述，一般数据寄存器可以正常读写。



### 3.2.2 DMA基本结构

![image-20251003184255926](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image (5).png)

外设存储器地址可以是别的，也可以是自身相对的地址。

当传输计数器等于0时，且没有启动重装时，无论是否触发，DMA是不会运转的。此时只能先关闭DMA（**必须**），再对传输计数器写入一个大于0的值。

### 3.2.3 DMA请求

即DMA出发部分![image (5)](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184255926.png)

![image-20251003184326376](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184326376.png)

图中EN位表示通道是否工作；M2M位=1时候选择软件触发。

软件触发是任意的，而**每个通道的硬件触发源不同**，需要注意。

### 3.2.4 数据宽度与对齐

**作用：**每个数据转运的站点都有数据宽度的参数描述，如果宽度一样，就正常处理，如果不一样就会使用到如下表格。

![image-20251003184334418](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184342831.png)

即，当数据宽度不统一时候，（小转大）可以在高位补0/（大转小）把多出来的高位舍弃掉不写入。传输数目是搬了4个数据，B1、B2等是数据，其/前面的是地址。

### 3.2.5 数据转运操作描述

**传输方向：**存储器——存储器

| ![image-20251003184342831](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184349410.png) | 转运规定的次数7后，传输计数器自减到0，DMA停止，转运完成。转运是**复制转运**，DataA[x]的数据并不会消失，会一直有数据。 |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
|                                                              |                                                              |

**传输方向：**外设——存储器

![image-20251003184349410](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251003184334418.png)

触发一次AD，7个通道依次进行转换，再每个通道转换完成后，进行一次DMA数据转运，并且目的地址自行自增，这样就不会覆盖了。

即**DMA配置：**外设地址写ADC_DR寄存器地址，不自增；存储器地址可以自行创建数组来使用（**注意数据寄存器的宽度**，设置为一致），并且设置**自增**。转运计数器为7，**代表转运次数**。

计数器是否重装，可以看ADC配置，**如果是单次扫描，DMA的传输计数器可以不自动重装；如果是连续扫描，那DMA就可以使用自动重装，**在ADC启动下一轮转换的时候，DMA也启动下一轮转运。

ADC_DR的值是在ADC单个通道转换完成后才会有效，因此DMA转运时机，需要和ADC单个通道转换完成同步。所以DMA的触发选择要选**ADC的硬件触发**。

因为ADC转换完成后没有任何标志位，也不会触发中断，所以不好判断某个通道转换完成的时机。根据视频老师的实践，虽然**单个ADC通道**转换完成后不产生标志位和中断，**但是应该会产生DMA请求去触发DMA搬运**。ADC+DMA弥补了ADC数据覆盖的缺陷，天作之合。



## 3.3使用

### 【案例】DMA转运ADC

① **DMA 简介**：DMA（直接存储器访问）可在不占用 CPU 的情况下，实现存储器与外设、存储器与存储器之间的数据直接传输，常用于 ADC、SPI、UART 等外设的数据批量转运。以下以 “ADC 多通道采集 + DMA 转运” 为例，说明标准库配置步骤。

② **使能相关时钟**：开启 ADC、GPIO、DMA 时钟（DMA1 属于 AHB 总线）。以 ADC1+DMA1_Channel1 为例：

```c
RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC1 | RCC_APB2Periph_GPIOA, ENABLE); // ADC1和GPIOA时钟
RCC_AHBPeriphClockCmd(RCC_AHBPeriph_DMA1, ENABLE); // DMA1时钟
```

③ **配置 GPIO 为模拟输入**：同多通道 ADC，如 PA0（CH0）、PA1（CH1）：

```c
GPIO_InitTypeDef GPIO_InitStructure;
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0 | GPIO_Pin_1; // 两个通道
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AIN; // 模拟输入
GPIO_Init(GPIOA, &GPIO_InitStructure);
```

④ **配置 ADC 时钟和基本参数**：开启扫描 + 连续模式（配合 DMA 自动转运）：

```c
// ADC时钟分频（12MHz）
RCC_ADCCLKConfig(RCC_PCLK2_Div6);

ADC_InitTypeDef ADC_InitStructure;
ADC_InitStructure.ADC_Mode = ADC_Mode_Independent;
ADC_InitStructure.ADC_ScanConvMode = ENABLE; // 扫描多通道
ADC_InitStructure.ADC_ContinuousConvMode = ENABLE; // 连续转换（自动循环）
ADC_InitStructure.ADC_ExternalTrigConv = ADC_ExternalTrigConv_None; // 软件触发
ADC_InitStructure.ADC_DataAlign = ADC_DataAlign_Right;
ADC_InitStructure.ADC_NbrOfChannel = 2; // 2个通道
ADC_Init(ADC1, &ADC_InitStructure);
```

⑤ **配置 ADC 通道顺序**：设置两个通道的采样顺序和时间：

```c
ADC_RegularChannelConfig(ADC1, ADC_Channel_0, 1, ADC_SampleTime_55Cycles5); // 通道0
ADC_RegularChannelConfig(ADC1, ADC_Channel_1, 2, ADC_SampleTime_55Cycles5); // 通道1
```

⑥ **配置 DMA 参数**：ADC1 对应 DMA1_Channel1，设置数据方向、缓冲区地址、转运次数等：

```c
DMA_InitTypeDef DMA_InitStructure;
// 选择DMA通道（ADC1对应DMA1_Channel1）
DMA_InitStructure.DMA_Channel = DMA_Channel_1;
// 外设地址（ADC1数据寄存器地址）
DMA_InitStructure.DMA_PeripheralBaseAddr = (uint32_t)&ADC1->DR;
// 存储器地址（自定义数组，用于存放ADC数据）
DMA_InitStructure.DMA_MemoryBaseAddr = (uint32_t)adc_dma_buf;
// 数据方向：外设→存储器
DMA_InitStructure.DMA_DIR = DMA_DIR_PeripheralSRC;
// 转运次数（每次转运2个通道数据，循环采集）
DMA_InitStructure.DMA_BufferSize = 2;
// 外设地址固定
DMA_InitStructure.DMA_PeripheralInc = DMA_PeripheralInc_Disable;
// 存储器地址自增（每次转运后地址+2，适配uint16_t）
DMA_InitStructure.DMA_MemoryInc = DMA_MemoryInc_Enable;
// 数据宽度：16位（ADC结果为12位，用16位存储）
DMA_InitStructure.DMA_PeripheralDataSize = DMA_PeripheralDataSize_HalfWord;
DMA_InitStructure.DMA_MemoryDataSize = DMA_MemoryDataSize_HalfWord;
// 循环模式（采集完成后自动重新开始）
DMA_InitStructure.DMA_Mode = DMA_Mode_Circular;
// 软件触发
DMA_InitStructure.DMA_Priority = DMA_Priority_Medium;
// 不使用存储器到存储器模式
DMA_InitStructure.DMA_M2M = DMA_M2M_Disable;
DMA_Init(DMA1_Channel1, &DMA_InitStructure);
```

⑦ **使能 DMA 和 ADC，启动转换**：关联 ADC 与 DMA，开启转运：

```c
// 定义全局数组存放DMA转运的数据（2个通道）
uint16_t adc_dma_buf[2];

// 使能ADC的DMA请求（ADC转换完成后自动触发DMA转运）
ADC_DMACmd(ADC1, ENABLE);

// 使能DMA通道
DMA_Cmd(DMA1_Channel1, ENABLE);

// 使能ADC并校准
ADC_Cmd(ADC1, ENABLE);
ADC_ResetCalibration(ADC1);
while (ADC_GetResetCalibrationStatus(ADC1));
ADC_StartCalibration(ADC1);
while (ADC_GetCalibrationStatus(ADC1));

// 软件触发ADC开始转换（连续模式下会自动循环）
ADC_SoftwareStartConvCmd(ADC1, ENABLE);
```

⑧ **数据使用**：DMA 会自动将 ADC 转换结果按顺序存入`adc_dma_buf`，CPU 可直接读取数组使用：

```c
// 读取通道0和通道1的ADC值（DMA自动更新）
uint16_t ch0_val = adc_dma_buf[0];
uint16_t ch1_val = adc_dma_buf[1];
```

### 【案例】DMA转运USART

① **DMA 简介**：DMA（直接存储器访问）可实现外设与存储器之间存储器之间的无 CPU 干预数据传输，以下以 USART1（串口 1）为例，分别说明 “DMA 发送” 和 “DMA 接收” 的配置步骤（基于 STM32 标准库）。

② **使能相关时钟**：开启 USART1、GPIO（串口引脚）、DMA 时钟。USART1 属于 APB2 总线，GPIOA（TX=PA9，RX=PA10）属于 APB2 总线，DMA1 属于 AHB 总线：

```c
RCC_APB2PeriphClockCmd(RCC_APB2Periph_USART1 | RCC_APB2Periph_GPIOA | RCC_APB2Periph_AFIO, ENABLE);
RCC_AHBPeriphClockCmd(RCC_AHBPeriph_DMA1, ENABLE); // 使能DMA1时钟
```

③ **配置串口 GPIO**：PA9（TX）为复用推挽输出，PA10（RX）为浮空输入：

```c
GPIO_InitTypeDef GPIO_InitStructure;
// 配置TX引脚（PA9）
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_9;
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP; // 复用推挽输出
GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
GPIO_Init(GPIOA, &GPIO_InitStructure);
// 配置RX引脚（PA10）
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_10;
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING; // 浮空输入
GPIO_Init(GPIOA, &GPIO_InitStructure);
```

④ **初始化 USART1 基本参数**：设置波特率、数据位、停止位等（以 115200-8-N-1 为例）：

```c
USART_InitTypeDef USART_InitStructure;
USART_InitStructure.USART_BaudRate = 115200; // 波特率115200
USART_InitStructure.USART_WordLength = USART_WordLength_8b; // 8位数据
USART_InitStructure.USART_StopBits = USART_StopBits_1; // 1个停止位
USART_InitStructure.USART_Parity = USART_Parity_No; // 无校验
USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None; // 无硬件流控
USART_InitStructure.USART_Mode = USART_Mode_Tx | USART_Mode_Rx; // 收发模式
USART_Init(USART1, &USART_InitStructure);
USART_Cmd(USART1, ENABLE); // 使能USART1
```

⑤ **配置 DMA 发送通道**：USART1 发送对应 DMA1_Channel4，设置数据从存储器到外设：

```c
DMA_InitTypeDef DMA_InitStructure;
// 发送通道：USART1_TX对应DMA1_Channel4
DMA_InitStructure.DMA_Channel = DMA_Channel_4;
// 外设地址：USART1数据寄存器（DR）地址
DMA_InitStructure.DMA_PeripheralBaseAddr = (uint32_t)&USART1->DR;
// 存储器地址：发送缓冲区（自定义数组）
DMA_InitStructure.DMA_MemoryBaseAddr = (uint32_t)tx_buf;
// 数据方向：存储器→外设（发送）
DMA_InitStructure.DMA_DIR = DMA_DIR_PeripheralDST;
// 发送数据长度（字节数）
DMA_InitStructure.DMA_BufferSize = TX_LEN;
// 外设地址固定（始终是USART1->DR）
DMA_InitStructure.DMA_PeripheralInc = DMA_PeripheralInc_Disable;
// 存储器地址自增（发送下一个字节）
DMA_InitStructure.DMA_MemoryInc = DMA_MemoryInc_Enable;
// 数据宽度：8位（串口数据为8位）
DMA_InitStructure.DMA_PeripheralDataSize = DMA_PeripheralDataSize_Byte;
DMA_InitStructure.DMA_MemoryDataSize = DMA_MemoryDataSize_Byte;
// 普通模式（一次发送完成后停止，需手动重启）
DMA_InitStructure.DMA_Mode = DMA_Mode_Normal;
// 优先级：中等
DMA_InitStructure.DMA_Priority = DMA_Priority_Medium;
// 不使用存储器到存储器模式
DMA_InitStructure.DMA_M2M = DMA_M2M_Disable;
DMA_Init(DMA1_Channel4, &DMA_InitStructure);
```

⑥ **使能 USART1 的 DMA 发送请求**：

```c
USART_DMACmd(USART1, USART_DMAReq_Tx, ENABLE); // 允许串口发送触发DMA
```

⑦ **编写 DMA 发送函数**：启动 DMA 传输，等待发送完成：

```c
uint8_t tx_buf[100]; // 发送缓冲区
uint16_t TX_LEN = 0; // 实际发送长度

void USART1_DMA_Send(uint8_t *data, uint16_t len) {
    // 复制数据到发送缓冲区
    memcpy(tx_buf, data, len);
    TX_LEN = len;
    
    // 重置DMA发送计数器（每次发送前需重新设置长度）
    DMA_SetCurrDataCounter(DMA1_Channel4, TX_LEN);
    // 使能DMA通道，开始发送
    DMA_Cmd(DMA1_Channel4, ENABLE);
    
    // 等待发送完成（可选，根据需求决定是否阻塞）
    while (DMA_GetFlagStatus(DMA1_FLAG_TC4) == RESET);
    DMA_ClearFlag(DMA1_FLAG_TC4); // 清除完成标志
    DMA_Cmd(DMA1_Channel4, DISABLE); // 关闭DMA通道
}
```

⑧ **配置 DMA 接收通道**：USART1 接收对应 DMA1_Channel5，设置数据从外设到存储器：

```c
// 接收通道：USART1_RX对应DMA1_Channel5
DMA_InitStructure.DMA_Channel = DMA_Channel_5;
// 外设地址：USART1数据寄存器（DR）地址
DMA_InitStructure.DMA_PeripheralBaseAddr = (uint32_t)&USART1->DR;
// 存储器地址：接收缓冲区
DMA_InitStructure.DMA_MemoryBaseAddr = (uint32_t)rx_buf;
// 数据方向：外设→存储器（接收）
DMA_InitStructure.DMA_DIR = DMA_DIR_PeripheralSRC;
// 接收缓冲区大小（最大接收字节数）
DMA_InitStructure.DMA_BufferSize = RX_BUF_SIZE;
// 外设地址固定
DMA_InitStructure.DMA_PeripheralInc = DMA_PeripheralInc_Disable;
// 存储器地址自增（接收下一个字节）
DMA_InitStructure.DMA_MemoryInc = DMA_MemoryInc_Enable;
// 数据宽度：8位
DMA_InitStructure.DMA_PeripheralDataSize = DMA_PeripheralDataSize_Byte;
DMA_InitStructure.DMA_MemoryDataSize = DMA_MemoryDataSize_Byte;
// 循环模式（缓冲区满后自动从头覆盖）
DMA_InitStructure.DMA_Mode = DMA_Mode_Circular;
// 优先级：中等
DMA_InitStructure.DMA_Priority = DMA_Priority_Medium;
DMA_InitStructure.DMA_M2M = DMA_M2M_Disable;
DMA_Init(DMA1_Channel5, &DMA_InitStructure);
```

⑨ **使能 USART1 的 DMA 接收请求并启动接收**：

```c
#define RX_BUF_SIZE 100 // 接收缓冲区大小
uint8_t rx_buf[RX_BUF_SIZE]; // 接收缓冲区

// 使能串口接收触发DMA
USART_DMACmd(USART1, USART_DMAReq_Rx, ENABLE);
// 启动DMA接收（循环模式下无需重复启动）
DMA_Cmd(DMA1_Channel5, ENABLE);
```

⑩ **读取接收数据**：通过 DMA 当前计数器计算已接收字节数：

```c
uint16_t USART1_DMA_GetRxLen(void) {
    // 已接收长度 = 缓冲区大小 - 当前剩余计数
    return RX_BUF_SIZE - DMA_GetCurrDataCounter(DMA1_Channel5);
}

// 示例：处理接收数据
void USART1_ProcessRxData(void) {
    uint16_t len = USART1_DMA_GetRxLen();
    if (len > 0) {
        // 处理rx_buf中的数据（前len个字节）
        // ...
        
        // 清除接收（重置计数器，从头开始接收）
        DMA_Cmd(DMA1_Channel5, DISABLE);
        DMA_SetCurrDataCounter(DMA1_Channel5, RX_BUF_SIZE);
        DMA_Cmd(DMA1_Channel5, ENABLE);
    }
}
```
> 笔记部分引用菜工啊潜
>

>  STM32标准库系列文章
>
>  [STM32标准库笔记（一）-准备、GPIO、中断 | 超小韓の个人博客](https://blog.chaoxiaohan.cyou/2025/10/01/STM32_Standard_Peripheral_Libraries-1/)
>
>  [STM32标准库笔记（二）-PWM、ADC、DMA | 超小韓の个人博客](https://blog.chaoxiaohan.cyou/2025/10/01/STM32_Standard_Peripheral_Libraries-2/)
>
>  [STM32标准库笔记（三）-USART、I2C、SPI | 超小韓の个人博客](https://blog.chaoxiaohan.cyou/2025/10/05/STM32_Standard_Peripheral_Libraries-3/)
>
>  [STM32标准库笔记（四）-BKP、RTC、PWR、WDG、FLASH | 超小韓の个人博客](https://blog.chaoxiaohan.cyou/2025/10/06/STM32_Standard_Peripheral_Libraries-4/)
