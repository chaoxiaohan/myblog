---
title: STM32Cube_HAL库笔记（十）-TIM
date: 2024-11-23 00:00:00
type: paper
category: HAL
photos: 
tags:
    - TIM
    - STM32
    - HAL
    - Timer
    - PWM
excerpt: 详解STM32 HAL库中TIM定时器的原理、配置方法以及基础和通用定时器的应用示例。
description: 
---

> 本系列主要讲解STM32CubeHAL的使用，详细的安装部署教程请见[【STM32】STM32 CubeMx使用教程一--安装教程-CSDN博客](https://blog.csdn.net/as480133937/article/details/98885316)

# 一、基本定时器

## 基础定时器主要函数

表 9-2 是基础定时器的一些主要的 HAL 驱动函数，所有定时器具有定时功能，所以这些函数对于通用定时器、高级控制定时器也是适用的。

| 分组     | 函数名                  | 功能描述                                                     |
| -------- | ----------------------- | ------------------------------------------------------------ |
| 初始化   | `HAL_TIM_Base_Init()`   | 定时器初始化，设置各种参数和连续定时模式                     |
|          | `HAL_TIM_OnePulse_Init()` | 将定时器配置为单次定时模式，需要先执行 `HAL_TIM_Base_Init()` |
|          | `HAL_TIM_Base_MspInit()` | MSP 弱函数，在 `HAL_TIM_Base_Init()` 里被调用，重新实现的这个函数一般用于定时器时钟使能和中断设置 |
| 启动和停止 | `HAL_TIM_Base_Start()`  | 以轮询工作方式启动定时器，不会产生中断                       |
|          | `HAL_TIM_Base_Stop()`   | 停止轮询工作方式的定时器                                     |
|          | `HAL_TIM_Base_Start_IT()` | 以中断工作方式启动定时器，发生 UEV 事件时产生中断           |
|          | `HAL_TIM_Base_Stop_IT()` | 停止中断工作方式的定时器                                     |
|          | `HAL_TIM_Base_Start_DMA()` | 以 DMA 工作方式启动定时器                                   |
|          | `HAL_TIM_Base_Stop_DMA()` | 停止 DMA 工作方式的定时器                                   |
| 获取状态 | `HAL_TIM_Base_GetState()` | 获取基础定时器的当前状态                                     |

### 定时器初始化
函数 `HAL_TIM_Base_Init()` 对定时器的连续定时工作模式和参数进行初始化设置，其原型定义如下：
```c
HAL_StatusTypeDef HAL_TIM_Base_Init(TIM_HandleTypeDef *htim);
```
其中，参数 `htim` 是定时器外设对象指针，是 `TIM_HandleTypeDef` 结构体类型指针，这个结构体类型的定义在文件 `stm32f4xx_hal_tim.h` 中，其定义如下，各成员变量的意义见注释。
```c
typedef struct
{
    TIM_TypeDef           *Instance;      //定时器的寄存器基址
    TIM_Base_InitTypeDef  Init;           //定时器参数
    HAL_TIM_ActiveChannel Channel;        //当前通道
    DMA_HandleTypeDef     *hdma[7];       //DMA 处理相关数组
    HAL_LockTypeDef       Lock;           //是否锁定
    __IO HAL_TIM_StateTypeDef State;      //定时器的工作状态
} TIM_HandleTypeDef;
```
其中，`Instance` 是定时器的寄存器基址，用于表示具体是哪个定时器；`Init` 是定时器的各种参数，是一个结构体类型 `TIM_Base_InitTypeDef`，这个结构体的定义如下，各成员变量的意义见注释。
```c
typedef struct
{
    uint32_t Prescaler;         //预分频系数
    uint32_t CounterMode;       //计数模式，递增、递减、递增/递减
    uint32_t Period;            //计数周期
    uint32_t ClockDivision;     //内部时钟分频，基本定时器无此参数
    uint32_t RepetitionCounter; //重复计数值，用于 PWM 模式
    uint32_t AutoReloadPreload; //是否开启寄存器 TIMx_ARR 的缓存功能
} TIM_Base_InitTypeDef;
```
要初始化定时器，一般是先定义一个 `TIM_HandleTypeDef` 类型的变量表示定时器，对其各个成员变量赋值，然后调用函数 `HAL_TIM_Base_Init()` 进行初始化。定时器的初始化设置可以在 CubeMX 里可视化完成，从而自动生成初始化函数代码。

函数 `HAL_TIM_Base_Init()` 会调用 MSP 函数 `HAL_TIM_Base_MspInit()`，这是一个弱函数，在 CubeMX 生成的定时器初始化程序文件里会重新实现这个函数，用于开启定时器的时钟，设置定时器的中断优先级。

### 配置为单次定时模式

定时器默认工作于连续定时模式，如果要配置定时器工作于单次定时模式，在调用定时器初始化函数 `HAL_TIM_Base_Init()` 之后，还需要用函数 `HAL_TIM_OnePulse_Init()` 将定时器配置为单次模式。其原型定义如下：
```c
HAL_StatusTypeDef HAL_TIM_OnePulse_Init(TIM_HandleTypeDef *htim, uint32_t OnePulseMode)
```
其中，参数 `htim` 是定时器对象指针，参数 `OnePulseMode` 是产生脉冲的方式，有两种宏定义常量可作为该参数的取值。
- `TIM_OPMODE_SINGLE`，单次模式，就是将控制寄存器 `TIMx_CR1` 中的 `OPM` 位置 1。
- `TIM_OPMODE_REPETITIVE`，重复模式，就是将控制寄存器 `TIMx_CR1` 中的 `OPM` 位置 0。

函数 `HAL_TIM_OnePulse_Init()` 其实是用于定时器单脉冲模式的一个函数，单脉冲模式是定时器输出比较功能的一种特殊模式，在定时器的 HAL 驱动程序中，有一组以 “`HAL_TIM_OnePulse`” 为前缀的函数，它们是专门用于定时器输出比较的单脉冲模式的。

在配置定时器的定时工作模式时，只是为了使用函数 `HAL_TIM_OnePulse_Init()` 将控制寄存器 `TIMx_CR1` 中的 `OPM` 位置 1，从而将定时器配置为单次定时模式。

### 启动和停止定时器
定时器有 3 种启动和停止方式，对应于表 9-2 中的 3 组函数。
- 轮询方式。以函数 `HAL_TIM_Base_Start()` 启动定时器后，定时器会开始计数，计数溢出时会产生 `UEV` 事件标志，但是不会触发中断。用户程序需要不断地查询计数值或 `UEV` 事件标志来判断是否发生了计数溢出。
- 中断方式。以函数 `HAL_TIM_Base_Start_IT()` 启动定时器后，定时器会开始计数，计数溢出时会产生 `UEV` 事件，并触发中断。用户在中断 ISR 里进行处理即可，这是定时器最常用的处理方式。
- DMA 方式。以函数 `HAL_TIM_Base_Start_DMA()` 启动定时器后，定时器会开始计数，计数溢出时会产生 `UEV` 事件，并产生 DMA 请求。DMA 会在第 13 章专门介绍，DMA 一般用于需要进行高速数据传输的场合，定时器一般用不着 DMA 功能。

实际使用定时器的周期性连续定时功能时，一般使用中断方式。函数 `HAL_TIM_Base_Start_IT()` 的原型定义如下：
```c
HAL_StatusTypeDef HAL_TIM_Base_Start_IT(TIM_HandleTypeDef *htim);
```
其中，参数 `htim` 是定时器对象指针。其他几个启动和停止定时器的函数参数与此相同。

### 获取定时器运行状态
函数 `HAL_TIM_Base_GetState()` 用于获取定时器的运行状态，其原型定义如下：
```c
HAL_TIM_StateTypeDef HAL_TIM_Base_GetState(TIM_HandleTypeDef *htim);
```
函数返回值是枚举类型 `HAL_TIM_StateTypeDef`，表示定时器的当前状态。这个枚举类型的定义如下，各枚举常量的意义见注释。
```c
typedef enum
{
    HAL_TIM_STATE_RESET     = 0x00U,  /* 定时器还未被初始化，或被禁用了 */
    HAL_TIM_STATE_READY     = 0x01U,  /* 定时器已经初始化，可以使用了   */
    HAL_TIM_STATE_BUSY      = 0x02U,  /* 一个内部处理过程正在执行       */
    HAL_TIM_STATE_TIMEOUT   = 0x03U,  /* 定时到期（Timeout）状态        */
    HAL_TIM_STATE_ERROR     = 0x04U   /* 发生错误，Reception 过程正在运行 */
} HAL_TIM_StateTypeDef;
```

## 其他通用操作函数
文件 `stm32f4xx_hal_tim.h` 还定义了定时器操作的一些通用函数，这些函数都是宏函数，直接操作寄存器，所以主要用于在定时器运行时直接读取或修改某些寄存器的值，如修改定时周期、重新设置预分频系数等，如表 9-3 所示。表中寄存器名称用了前缀 “`TIMx_`”，其中的 “`x`” 可以用具体的定时器编号替换，例如，`TIMx_CR1` 表示 `TIM0_CR1`、`TIM7_CR1` 或 `TIM9_CR1` 等。

| 函数名宏定义                | 功能描述                                                     |
| --------------------------- | ------------------------------------------------------------ |
| `__HAL_TIM_ENABLE()`        | 启用某个定时器，就是将定时器控制寄存器 `TIMx_CR1` 的 `CEN` 位置 1 |
| `__HAL_TIM_DISABLE()`       | 禁用某个定时器                                               |
| `__HAL_TIM_GET_COUNTER()`   | 在运行时读取定时器的当前计数值，就是读取 `TIMx_CNT` 寄存器的值 |
| `__HAL_TIM_SET_COUNTER()`   | 在运行时设置定时器的计数值，就是设置 `TIMx_CNT` 寄存器的值   |
| `__HAL_TIM_GET_AUTORELOAD()` | 在运行时读取自重载寄存器 `TIMx_ARR` 的值                     |
| `__HAL_TIM_SET_AUTORELOAD()` | 在运行时设置自重载寄存器 `TIMx_ARR` 的值，并改变定时的周期   |
| `__HAL_TIM_SET_PRESCALER()` | 在运行时设置预分频系数，就是设置预分频寄存器 `TIMx_PSC` 的值 |

这些函数都需要一个定时器对象指针作为参数，例如，启用定时器的函数定义如下：
```c
#define __HAL_TIM_ENABLE(__HANDLE__)  ((__HANDLE__)->Instance->CR1|=(TIM_CR1_CEN))
```
其中，参数 `__HANDLE__` 是表示定时器对象的指针，即 `TIM_HandleTypeDef` 类型的指针。函数的功能就是将定时器的 `TIMx_CR1` 寄存器的 `CEN` 位置 1。这个函数的使用示意代码如下：
```c
TIM_HandleTypeDef htim6;      //定时器 TIM6 的外设对象变量
__HAL_TIM_ENABLE(&htim6);
```

读取寄存器的函数会返回一个数值，例如，读取当前计数值的函数定义如下：
```c
#define __HAL_TIM_GET_COUNTER(__HANDLE__)  ((__HANDLE__)->Instance->CNT)
```
其返回值就是寄存器 `TIMx_CNT` 的值。有的定时器是 32 位的，有的是 16 位的（见表 9-1），实际使用时用 `uint32_t` 类型的变量来存储函数返回值即可。

设置某个寄存器的值的函数有两个参数，例如，设置当前计数值的函数的定义如下：
```c
#define __HAL_TIM_SET_COUNTER(__HANDLE__, __COUNTER__)  ((__HANDLE__)->Instance->CNT = (__COUNTER__))
```
其中，参数 `__HANDLE__` 是定时器的指针，参数 `__COUNTER__` 是需要设置的值。

## 中断处理
定时器中断处理相关函数如表 9-4 所示，这些函数对所有定时器都适用。

| 函数名                     | 功能描述                                                     |
| -------------------------- | ------------------------------------------------------------ |
| `__HAL_TIM_ENABLE_IT()`    | 启用某个事件的中断，将中断使能寄存器 `TIMx_DIER` 中相应事件位置 1 |
| `__HAL_TIM_DISABLE_IT()`   | 禁用某个事件的中断，将中断使能寄存器 `TIMx_DIER` 中相应事件位置 0 |
| `__HAL_TIM_GET_FLAG()`     | 判断某个中断事件源的中断挂起标志位是否被置位，读取状态寄存器 `TIMx_SR` 中相应的中断事件位是否置 1，返回值为 `TRUE` 或 `FALSE` |
| `__HAL_TIM_CLEAR_FLAG()`   | 清除某个中断事件的中断挂起标志位，将状态寄存器 `TIMx_SR` 中相应的中断事件位置 0 |
| `__HAL_TIM_CLEAR_IT()`     | 与 `__HAL_TIM_CLEAR_FLAG()` 的代码和功能完全相同               |
| `__HAL_TIM_GET_IT_SOURCE()` | 查询是否允许某个中断事件源产生中断，检查中断使能寄存器 `TIMx_DIER` 中相应事件位是否置 1，返回值为 `SET` 或 `RESET` |
| `HAL_TIM_IRQHandler()`     | 定时器中断的 ISR 里调用的定时器中断通用处理函数               |
| `HAL_TIM_PeriodElapsedCallback()` | 弱函数，UEV 事件中断的回调函数，需用户重新实现         |

每个定时器都只有一个中断号，也就是只有一个 ISR。基础定时器只有一个中断事件源，即 UEV 事件，通用定时器和高级控制定时器有多个中断事件源（见第 10 章）。在定时器的 HAL 驱动程序中，每一种中断事件对应一个回调函数，HAL 驱动程序会自动判断中断事件源，清除中断事件挂起标志，然后调用相应的回调函数。

### 中断事件类型
文件 `stm32f4xx_hal_tim.h` 中定义了表示定时器中断事件类型的宏，定义如下：
```c
#define TIM_IT_UPDATE      TIM_DIER_UIE    //更新中断（Update interrupt）
#define TIM_IT_CC1         TIM_DIER_CC1IE  //捕获/比较1中断（Capture/Compare 1 interrupt）
#define TIM_IT_CC2         TIM_DIER_CC2IE  //捕获/比较2中断（Capture/Compare 2 interrupt）
#define TIM_IT_CC3         TIM_DIER_CC3IE  //捕获/比较3中断（Capture/Compare 3 interrupt）
#define TIM_IT_CC4         TIM_DIER_CC4IE  //捕获/比较4中断（Capture/Compare 4 interrupt）
#define TIM_IT_COM         TIM_DIER_COMIE  //触发中断（Trigger interrupt）
#define TIM_IT_TRIGGER     TIM_DIER_TIE    //触发中断（Trigger interrupt）
#define TIM_IT_BREAK       TIM_DIER_BIE    //断路中断（Break interrupt）
```
这些宏定义实际上是定时器的中断使能寄存器（`TIMx_DIER`）中相应位的掩码。基础定时器只有一个中断事件源，即 `TIM_IT_UPDATE`，其他中断事件源是通用定时器或高级控制定时器才有的。

宏函数 `__HAL_TIM_ENABLE_IT()` 的功能是开启某个中断事件源，定义如下：
```c
#define __HAL_TIM_ENABLE_IT(__HANDLE__, __INTERRUPT__)  ((__HANDLE__)->Instance->DIER |= (__INTERRUPT__))
```
其中，参数 `__HANDLE__` 是定时器对象指针，`__INTERRUPT__` 是某个中断类型的宏定义。该函数将中断使能寄存器（`TIMx_DIER`）中对应于中断事件 `__INTERRUPT__` 的位置 1，从而开启该中断事件源。

### 定时器中断处理流程
每个定时器都只有一个中断号，也就是只有一个 ISR。CubeMX 生成代码时，会在文件 `stm32f4xx_it.c` 中生成定时器中断 ISR 的代码框架。例如，TIM6 的 ISR 代码如下：
```c
void TIM6_DAC_IRQHandler(void)
{
    /* USER CODE BEGIN TIM6_DAC_IRQn 0 */
    /* USER CODE END TIM6_DAC_IRQn 0 */
    HAL_TIM_IRQHandler(&htim6);
    /* USER CODE BEGIN TIM6_DAC_IRQn 1 */
    /* USER CODE END TIM6_DAC_IRQn 1 */
}
```
所有定时器的 ISR 代码与此类似，都调用函数 `HAL_TIM_IRQHandler()`，只是传递了各自的定时器对象指针，这与第 7 章的 EXTI 中断的 ISR 处理方式类似。

函数 `HAL_TIM_IRQHandler()` 是定时器中断通用处理函数，其功能是判断中断事件源、清除中断挂起标志位、调用相应的回调函数。例如，判断是否是 UEV 事件的代码如下：
```c
/* TIM Update event */
if (__HAL_TIM_GET_FLAG(htim, TIM_FLAG_UPDATE) != RESET)  //事件的中断挂起标志位是否置位
{
    if (__HAL_TIM_GET_IT_SOURCE(htim, TIM_IT_UPDATE) != RESET)  //事件的中断是否已开启
    {
        __HAL_TIM_CLEAR_IT(htim, TIM_IT_UPDATE);        //清除中断挂起标志位
        HAL_TIM_PeriodElapsedCallback(htim);           //执行事件的中断回调函数
    }
}
```
它先调用函数 `__HAL_TIM_GET_FLAG()` 判断 UEV 事件的中断挂起标志位是否被置位，再调用函数 `__HAL_TIM_GET_IT_SOURCE()` 判断是否已开启了 UEV 事件源中断。如果这两个条件都成立，说明发生了 UEV 事件中断，就调用函数 `__HAL_TIM_CLEAR_IT()` 清除 UEV 事件的中断挂起标志位，再调用 UEV 事件中断对应的回调函数 `HAL_TIM_PeriodElapsedCallback()`。

用户需要重新实现回调函数 `HAL_TIM_PeriodElapsedCallback()`，在定时器发生 UEV 事件中断时做相应的处理。判断中断是否发生、清除中断挂起标志位等操作都由 HAL 库函数完成，这大大简化了中断处理的复杂度，特别是在一个中断号有多个中断事件源时。

基础定时器只有一个 UEV 中断事件源，只需重新实现回调函数 `HAL_TIM_PeriodElapsedCallback()`。通用定时器和高级控制定时器有多个中断事件源，对应不同的回调函数，详见第 10 章。

## 外设的中断处理概念小结
我们在第 7 章介绍了外部中断处理的相关函数和流程，在本章又介绍了基础定时器中断处理的相关函数和流程，从中可以发现一个外设的中断处理所涉及的一些概念、寄存器和常用的 HAL 函数。

每一种外设的 HAL 驱动程序头文件中都定义了一些以 “`HAL`” 开头的宏函数，这些宏函数直接操作寄存器，几乎每一种外设都有表 9-5 中的宏函数。这些函数分为 3 组，操作 3 个寄存器。一般的外设都有这样 3 个独立的寄存器，也有将功能合并的寄存器，所以，这里的 3 个寄存器是概念上的。在表 9-5 中，用 “×××” 表示某种外设。

| 寄存器       | 宏函数                | 功能描述                                                     | 示例函数                |
| ------------ | --------------------- | ------------------------------------------------------------ | ----------------------- |
| 外设控制寄存器 | `__HAL_×××_ENABLE()`  | 启用某个外设×××                                             | `__HAL_TIM_ENABLE()`    |
|              | `__HAL_×××_DISABLE()` | 禁用某个外设×××                                             | `__HAL_TIM_DISABLE()`   |
| 中断使能寄存器 | `__HAL_×××_ENABLE_IT()` | 允许某个事件触发硬件中断，将中断使能寄存器中对应的事件使能控制位置 1 | `__HAL_TIM_ENABLE_IT()` |
|              | `__HAL_×××_DISABLE_IT()` | 禁止某个事件触发硬件中断，将中断使能寄存器中对应的事件使能控制位置 0 | `__HAL_TIM_DISABLE_IT()` |
|              | `__HAL_×××_GET_IT_SOURCE()` | 判断某个事件的中断是否开启，检查中断使能寄存器中相应事件使能控制位是否置 1，返回值为 `SET` 或 `RESET` | `__HAL_TIM_GET_IT_SOURCE()` |
| 状态寄存器   | `__HAL_×××_GET_FLAG()` | 判断某个事件的挂起标志位是否被置位，返回值为 `TRUE` 或 `FALSE` | `__HAL_TIM_GET_FLAG()`  |
|              | `__HAL_×××_CLEAR_FLAG()` | 清除某个事件的挂起标志位                                     | `__HAL_TIM_CLEAR_FLAG()` |
|              | `__HAL_×××_CLEAR_IT()` | 与 `__HAL_×××_CLEAR_FLAG()` 的代码和功能相同                 | `__HAL_TIM_CLEAR_IT()`  |

### 外设控制寄存器
外设控制寄存器中有用于控制外设使能或禁用的位，通过函数 `__HAL_×××_ENABLE()` 启用外设，用函数 `__HAL_×××_DISABLE()` 禁用外设。一个外设被禁用后就停止工作了，也就不会产生中断了。例如，定时器 TIM6 的控制寄存器 `TIM6_CR1` 的 `CEN` 位就是控制 TIM6 定时器是否工作的位。通过函数 `__HAL_TIM_DISABLE()` 和 `__HAL_TIM_ENABLE()` 就可以操作这个位，从而停止或启用 TIM6。

###  外设全局中断管理
NVIC 管理硬件中断，一个外设一般有一个中断号，称为外设的全局中断。一个中断号对应一个 ISR，发生硬件中断时自动执行中断的 ISR。

NVIC 管理中断的相关函数见 7.1.3 节，主要功能包括启用或禁用硬件中断，设置中断优先级等。使用函数 `HAL_NVIC_EnableIRQ()` 启用一个硬件中断，启用外设的中断且启用外设后，发生中断事件时才会触发硬件中断。使用函数 `HAL_NVIC_DisableIRQ()` 禁用一个硬件中断，禁用中断后即使发生事件，也不会触发中断的 ISR。

###  中断使能寄存器
外设的一个硬件中断号可能有多个中断事件源，例如，通用定时器的硬件中断就有多个中断事件源。外设有一个中断使能控制寄存器，用于控制每个事件发生时是否触发硬件中断。一般情况下，每个中断事件源在中断使能寄存器中都有一个对应的事件中断使能控制位。

例如，定时器 TIM6 的中断使能寄存器 `TIM6_DIER` 的 `UIE` 位是 UEV 事件的中断使能控制位。如果 `UIE` 位被置 1，定时溢出时产生 UEV 事件会触发 TIM6 的硬件中断，执行硬件的 ISR。如果 `UIE` 位被置 0，定时溢出时仍然会产生 UEV 事件（也可通过寄存器配置是否产生 UEV 事件，这里假设配置为允许产生 UEV 事件），但是不会触发 TIM6 的硬件中断，也就不会执行 ISR。

对于每一种外设，HAL 驱动程序都为其中断使能寄存器中的事件中断使能控制位定义了宏，实际上就是这些位的掩码。例如，定时器的事件中断使能控制位宏定义如下：
```c
#define TIM_IT_UPDATE      TIM_DIER_UIE    //更新中断（Update interrupt）
#define TIM_IT_CC1         TIM_DIER_CC1IE  //捕获/比较1中断（Capture/Compare 1 interrupt）
#define TIM_IT_CC2         TIM_DIER_CC2IE  //捕获/比较2中断（Capture/Compare 2 interrupt）
#define TIM_IT_CC3         TIM_DIER_CC3IE  //捕获/比较3中断（Capture/Compare 3 interrupt）
#define TIM_IT_CC4         TIM_DIER_CC4IE  //捕获/比较4中断（Capture/Compare 4 interrupt）
#define TIM_IT_COM         TIM_DIER_COMIE  //触发中断（Trigger interrupt）
#define TIM_IT_TRIGGER     TIM_DIER_TIE    //触发中断（Trigger interrupt）
#define TIM_IT_BREAK       TIM_DIER_BIE    //断路中断（Break interrupt）
```
函数 `__HAL_×××_ENABLE_IT()` 和 `__HAL_×××_DISABLE_IT()` 用于将中断使能寄存器中的事件中断使能控制位置位或复位，从而允许或禁止某个事件源产生硬件中断。

函数 `__HAL_×××_GET_IT_SOURCE()` 用于判断中断使能寄存器中某个事件使能控制位是否被置位，也就是判断这个事件源是否被允许产生硬件中断。

当一个外设有多个中断事件源时，将外设的中断使能寄存器中的事件中断使能控制位的宏定义作为中断事件类型定义，例如，定时器的中断事件类型就是前面定义的宏 `TIM_IT_UPDATE`、`TIM_IT_CC1`、`TIM_IT_CC2` 等。这些宏可以作为 `__HAL_×××_ENABLE_IT(__HANDLE__, __INTERRUPT__)` 等宏函数中参数 `__INTERRUPT__` 的取值。

###  状态寄存器
状态寄存器中有表示事件是否发生的事件更新标志位，当事件发生时，标志位被硬件置 1，需要软件清零。例如，定时器 TIM6 的状态寄存器 `TIM6_SR` 中有一个 `UIF` 位，当定时溢出发生 UEV 事件时，`UIF` 位被硬件置 1。

注意，即使外设的中断使能寄存器中某个事件的中断使能控制位被置 0，事件发生时也会使状态寄存器中的事件更新标志位置 1，只是不会产生硬件中断。例如，用函数 `HAL_TIM_Base_Start()` 以轮询方式启动定时器 TIM6 之后，发生 UEV 事件时状态寄存器 `TIM6_SR` 中的 `UIF` 位会被硬件置 1，但是不会产生硬件中断，用户程序需要不断地查询状态寄存器 `TIM6_SR` 中的 `UIF` 位是否被置 1。

如果在中断使能寄存器中某个事件的中断使能控制位置 1，事件发生时，状态寄存器中的事件更新标志位会被硬件置 1，并且触发硬件中断，系统会执行硬件中断的 ISR。所以，一般将状态寄存器中的事件更新标志位称为事件中断标志位（interrupt flag）。在响应完事件中断后，用户需要用软件将事件中断标志位清零。例如，用函数 `HAL_TIM_Base_Start_IT()` 以中断方式启动定时器 TIM6 之后，发生 UEV 事件时，状态寄存器 `TIM6_SR` 中的 `UIF` 位会被硬件置 1，并触发硬件中断，执行 TIM6 硬件中断的 ISR。在 ISR 里处理完中断后，用户需要调用函数 `__HAL_TIM_CLEAR_IT()` 将 UEV 事件中断标志位清零。

一般情况下，一个中断事件类型对应一个事件中断标志位，但也有一个事件类型对应多个事件中断标志位的情况。例如，下面是定时器的事件中断标志位宏定义，它们可以作为宏函数 `__HAL_TIM_CLEAR_FLAG(__HANDLE__, __FLAG__)` 中参数 `__FLAG__` 的取值。
```c
#define TIM_FLAG_UPDATE      TIM_SR_UIF    /*!< Update interrupt flag */
#define TIM_FLAG_CC1         TIM_SR_CC1IF  /*!< Capture/Compare 1 interrupt flag */
#define TIM_FLAG_CC2         TIM_SR_CC2IF  /*!< Capture/Compare 2 interrupt flag */
#define TIM_FLAG_CC3         TIM_SR_CC3IF  /*!< Capture/Compare 3 interrupt flag */
#define TIM_FLAG_CC4         TIM_SR_CC4IF  /*!< Capture/Compare 4 interrupt flag */
#define TIM_FLAG_COM         TIM_SR_COMIF  /*!< Comutation interrupt flag */
#define TIM_FLAG_TRIGGER     TIM_SR_TIF    /*!< Trigger interrupt flag */
#define TIM_FLAG_BREAK       TIM_SR_BIF    /*!< Break interrupt flag */
#define TIM_FLAG_CC1OF       TIM_SR_CC1OF  /*!< Capture 1 overcapture flag */
#define TIM_FLAG_CC2OF       TIM_SR_CC2OF  /*!< Capture 2 overcapture flag */
#define TIM_FLAG_CC3OF       TIM_SR_CC3OF  /*!< Capture 3 overcapture flag */
#define TIM_FLAG_CC4OF       TIM_SR_CC4OF  /*!< Capture 4 overcapture flag */
```
当一个硬件中断有多个中断事件源时，在中断响应 ISR 中，用户需要先判断具体是哪个事件引发了中断，再调用相应的回调函数进行处理。一般用函数 `__HAL_×××_GET_FLAG()` 判断某个事件中断标志位是否被置位，调用完事件处理回调函数之后要调用函数 `__HAL_×××_CLEAR_FLAG()` 清除中断标志位，这样硬件才能响应下次的中断。

###  中断事件对应的回调函数
在 STM32Cube 编程方式中，CubeMX 为每个启用的硬件中断生成 ISR 代码框架，ISR 里调用 HAL 库外设的中断处理通用函数，例如，定时器的中断处理通用函数是 `HAL_TIM_IRQHandler()`。

在中断处理通用函数里，再判断引发中断的事件源、清除事件的中断标志位、调用事件处理回调函数。例如，函数 `HAL_TIM_IRQHandler()` 中判断是否由 UEV 事件（中断事件类型宏 `TIM_IT_UPDATE`，事件中断标志位宏 `TIM_FLAG_UPDATE`）引发中断并进行处理的代码如下：
```c
void HAL_TIM_IRQHandler(TIM_HandleTypeDef *htim)
{
    /* 省略其他代码 */
    if (__HAL_TIM_GET_FLAG(htim, TIM_FLAG_UPDATE) != RESET)  //事件的中断标志位是否置位
    {
        if (__HAL_TIM_GET_IT_SOURCE(htim, TIM_IT_UPDATE) != RESET)  //是否允许该事件中断
        {
            __HAL_TIM_CLEAR_IT(htim, TIM_IT_UPDATE);        //清除中断标志位
            HAL_TIM_PeriodElapsedCallback(htim);           //执行事件的中断回调函数
        }
    }
    /* 省略其他代码 */
}
```
当一个外设的硬件中断有多个中断事件源时，主要的中断事件源一般对应一个中断处理回调函数。用户要对某个中断事件进行处理，只需重新实现对应的回调函数就可以了。在后面介绍各种外设时，我们会具体介绍外设的中断事件源和对应的回调函数。

但要注意，不一定外设的所有中断事件都有对应的回调函数，例如，USART 接口的某些中断事件就没有对应的回调函数。另外，HAL 库中的回调函数也不全部是用于中断处理的，也有一些其他用途的回调函数。

## 基础定时器使用示例
###  示例功能和CubeMX项目配置
本节将设计一个示例项目（Demo9_1TIM_LED），演示基础定时器TIM6和TIM7的使用。示例的主要功能和操作流程如下：
- TIM6设置为连续定时模式，定时周期为500ms，以中断方式启动TIM6，在UEV事件中断回调函数里使LED1输出翻转。
- TIM7设置为单次定时模式，定时周期为2000ms，按下KeyRight键之后使LED2点亮，并以中断方式启动TIM7，在UEV事件中断回调函数里使LED2输出翻转。

**1. 项目创建和基础设置**

本示例要用到按键、LED和LCD，可利用模板项目文件创建。从CubeMX模板文件M4_LCD_KeyLED.ioc创建本项目文件Demo9_1TIM_LED.ioc，使用复用项目导入的方式，也可在时钟上设置HSE为8MHz，将HCLK设置为100MHz，APB1和APB2定时器时钟信号频率都设为50MHz（见定时器时钟树）。

**2. 定时器TIM6的设置**

定时器TIM6的模式和参数设置如下：
- `Prescaler`（预分频器值）：设置为49999，实际分频系数是50000。
- `Counter Mode`（计数模式）：基础定时器只有递增模式（Up）。
- `Counter Period`（计数周期）：设置为500，即自动重载寄存器的值。
- `Auto-reload preload`（自动重载预加载）：对基础定时器无实质影响。
- `Trigger Event Selection`（触发事件选择）：设置TIM6的UEV事件信号作为TRGO输出。
- 

因为APB1定时器时钟频率为50MHz，预分频器值为49999，所以进入计数器的时钟频率为1000Hz，计数周期设置为500，所以TIM6定时器每500ms产生一次计数溢出，也就是产生一次UEV事件。若启用事件的中断使能控制位1，且TIM6的全局中断已打开，则TIM6每500ms就会产生一次硬件中断。

**3. 定时器TIM7的设置**

TIM7采用单次定时模式，定时周期为2000ms，其他参数与TIM6一样。在模式设置部分勾选`One Pulse Mode`复选框，使TIM7工作于单次定时模式，参数`Counter Period`设置为2000。



**4. 定时器的中断设置**

启用TIM6和TIM7的中断，在NVIC组件的配置界面设置两个定时器的抢占优先级都为1。

### 程序功能实现
**1. 主程序**

在CubeIDE中打开项目，添加用户代码后，文件main.c的代码如下：
```c
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "tim.h"
#include "gpio.h"
/* USER CODE BEGIN Includes */
#include "keyled.h"
#include "tftlcd.h"
/* USER CODE END Includes */

int main(void)
{
    HAL_Init();
    SystemClock_Config();
    /* Initialize all configured peripherals */
    MX_GPIO_Init();
    MX_FSMC_Init();
    MX_TIM6_Init();
    MX_TIM7_Init();
    /* USER CODE BEGIN 2 */
    TFTLCD_Init(); //TFT LCD软件初始化
    LCD_ShowStr(10,10, (uint8_t *)"Demo9-1:Basic Timer");
    LCD_ShowStr(10,LCD_CurY+LCD_SP15, (uint8_t *)"TIM6 work in continuous mode");
    LCD_ShowStr(10,LCD_CurY+LCD_SP15, (uint8_t *)"Toggle LED1 by TIM6 each 500ms");
    LCD_ShowStr(10,LCD_CurY+2*LCD_SP15, (uint8_t *)"TIM7 work in one pulse mode");
    LCD_ShowStr(10,LCD_CurY+LCD_SP15, (uint8_t *)"Press KeyRight to start TIM7");
    LCD_ShowStr(10,LCD_CurY+LCD_SP15, (uint8_t *)"Toggle LED2 by TIM7 after 2sec");
    LED1_OFF();    //熄灭LED1
    LED2_OFF();    //熄灭LED2
    HAL_TIM_Base_Start_IT(&htim6); //以中断方式启动TIM6
    /* USER CODE END 2 */

    /* Infinite loop */
    while (1)
    {
        KEYS curKey=ScanPressedKey(KEY_WAIT_ALWAYS);
        if (curKey==KEY_RIGHT)
        {
            LED2_ON();     //点亮LED2
            HAL_TIM_Base_Start_IT(&htim7); //以中断方式启动TIM7
            HAL_Delay(300); //消除按键抖动的影响
        }
    }
}
```

外设初始化部分执行了CubeMX自动生成的4个外设初始化函数。在`/* USER CODE BEGIN/END 2 */`代码段内添加了用户代码，执行LCD和外设初始化函数`TFTLCD_Init()`，在LCD上显示项目提示信息，然后以中断方式启动TIM6。在while循环中一直检测按键输入，若KeyRight键按下就点亮LED2，并以中断方式启动TIM7。

**2. 定时器初始化**

文件tim.h和tim.c是CubeMX自动生成的文件，包含TIM6和TIM7的初始化函数，部分代码如下：
```c
/* 文件：tim.h */
#include "main.h"
extern TIM_HandleTypeDef htim6; //表示定时器TIM6的外设对象变量
extern TIM_HandleTypeDef htim7; //表示定时器TIM7的外设对象变量
void MX_TIM6_Init(void);
void MX_TIM7_Init(void);

/* 文件：tim.c */
TIM_HandleTypeDef htim6; //表示定时器TIM6的外设对象变量
TIM_HandleTypeDef htim7; //表示定时器TIM7的外设对象变量

void MX_TIM6_Init(void)
{
    TIM_MasterCtrlSignalConfigTypeDef sMasterConfig;
    htim6.Instance = TIM6;
    htim6.Init.Prescaler = 49999;
    htim6.Init.CounterMode = TIM_COUNTERMODE_UP;
    htim6.Init.Period = 500;
    htim6.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
    if (HAL_TIM_Base_Init(&htim6) != HAL_OK)
        Error_Handler();
    sMasterConfig.MasterCtrlSignal = TIM_MASTERCTRLsignal_RESET;
    sMasterConfig.MasterCtrlSignalConfig = TIM_MASTERCTRLMODE_RESET;
    if (HAL_TIMEx_MasterCtrlSignalConfigSynchronization(&htim6, &sMasterConfig) != HAL_OK)
        Error_Handler();
}

void MX_TIM7_Init(void)
{
    TIM_MasterCtrlSignalConfigTypeDef sMasterConfig;
    htim7.Instance = TIM7;
    htim7.Init.Prescaler = 49999;
    htim7.Init.CounterMode = TIM_COUNTERMODE_UP;
    htim7.Init.Period = 2000;
    htim7.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
    if (HAL_TIM_Base_Init(&htim7) != HAL_OK)
        Error_Handler();
    if (HAL_TIM_OnePulse_Init(&htim7, TIM_OPMODE_SINGLE) != HAL_OK)
        Error_Handler();
    sMasterConfig.MasterCtrlSignal = TIM_MASTERCTRLsignal_RESET;
    sMasterConfig.MasterCtrlSignalConfig = TIM_MASTERCTRLMODE_RESET;
    if (HAL_TIMEx_MasterCtrlSignalConfigSynchronization(&htim7, &sMasterConfig) != HAL_OK)
        Error_Handler();
}

void HAL_TIM_Base_MspInit(TIM_HandleTypeDef* tim_baseHandle)
{
    if(tim_baseHandle->Instance==TIM6)
    {
        __HAL_RCC_TIM6_CLK_ENABLE(); //TIM6时钟使能
        HAL_NVIC_SetPriority(TIM6_DAC_IRQn, 1, 0); //设置中断优先级
        HAL_NVIC_EnableIRQ(TIM6_DAC_IRQn); //开启TIM6中断
    }
    else if(tim_baseHandle->Instance==TIM7)
    {
        __HAL_RCC_TIM7_CLK_ENABLE(); //TIM7时钟使能
        HAL_NVIC_SetPriority(TIM7_IRQn, 1, 0); //设置中断优先级
        HAL_NVIC_EnableIRQ(TIM7_IRQn); //开启TIM7中断
    }
}
```

通过观察代码可知：
- 定义外设对象变量`htim6`和`htim7`，分别表示定时器TIM6和TIM7。
- 函数`MX_TIM6_Init()`对TIM6进行初始化，设置预分频、计数模式、计数周期等参数。
- 函数`MX_TIM7_Init()`对TIM7进行初始化，因TIM7是单次定时模式，调用`HAL_TIM_OnePulse_Init()`进行单脉冲模式设置。
- 函数`HAL_TIM_Base_MspInit()`用于时钟使能和中断优先级设置。

**3. 定时器中断处理**

在文件stm32f4xx_it.c中，自动生成了定时器TIM6和TIM7的硬件中断ISR的代码框架：
```c
void TIM6_DAC_IRQHandler(void)
{
    HAL_TIM_IRQHandler(&htim6);
}

void TIM7_IRQHandler(void)
{
    HAL_TIM_IRQHandler(&htim7);
}
```

这两个ISR都调用了定时器中断通用处理函数`HAL_TIM_IRQHandler()`。基础定时器的中断事件源只有一个（UEV事件），对应回调函数`HAL_TIM_PeriodElapsedCallback()`，用户需重新实现该函数：
```c
/* USER CODE BEGIN 1 */
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
    if (htim->Instance==TIM6) //TIM6周期500ms，使LED1翻转
        HAL_GPIO_TogglePin(LED1_GPIO_Port, LED1_Pin);
    else if (htim->Instance==TIM7) //TIM7周期2000ms，使LED2翻转
        HAL_GPIO_TogglePin(LED2_GPIO_Port, LED2_Pin);
}
/* USER CODE END 1 */
```

函数的传入参数`htim`是定时器指针，通过`htim->Instance`可判断具体是哪个定时器。中断回调函数是可重入的，即使TIM6和TIM7的中断同时发生，它们的中断事件也会被执行。

构建项目无误后，下载到开发板上测试，运行时会发现LED1周期性闪烁（周期500ms），按下KeyRight键后LED2点亮，2000ms后LED2翻转熄灭（因TIM7是单次定时模式，只中断一次）。

# 二、通用定时器

> 本部分部分内容在[STM32Cube_HAL库笔记（二）-PWM | 超小韓の个人博客](https://blog.chaoxiaohan.cyou/2025/10/08/STM32Cube_HAL-2-PWM/)

## 经典功能原理以及HAL库函数

###  生成 PWM 波
#### **生成 PWM 波的原理**

PWM（Pulse Width Modulation）即脉冲宽度调制，是对模拟信号电平进行数字编码的方式。PWM 波是具有一定占空比的方波信号，通过定时器设置可控制其频率和占空比，从而对模拟电压进行数字编码。理论上，只要带宽足够（PWM 波频率足够高），任何模拟值都可通过 PWM 编码。使用递增计数定时器、边沿对齐方式生成 PWM 波的工作原理如下：
- 设置自动重载寄存器 ARR 的值，该值决定 PWM 波一个周期的长度，例如 PWM 一个周期为 100ms。
- 设置捕获/比较寄存器 CCR 的值，在一个 ARR 计数周期内，当计数值 CNT < CCR 时，OCxREF 为高电平；当 CNT ≥ CCR 时，OCxREF 为低电平，并可产生 CC（捕获/比较）事件。CCR 的值决定占空比，例如某 PWM 波周期内高电平时长为 70ms，则占空比为 70%。
- 当计数器的值达到 ARR 值时，产生 UEV 事件。CCR 具有预装载功能，修改的 CCR 值需在下一个 UEV 事件时才生效。

通用定时器都具有生成 PWM 波的功能，PWM 波可输出到定时器的通道引脚，也可不输出到引脚。某些定时器输出 PWM 波还具有中心对齐模式。

![image-20251123223632831](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251123223632831.png)

#### **与生成 PWM 波相关的 HAL 函数**
与生成 PWM 波相关的 HAL 函数如下表所示：

| 函数名                          | 功能描述                                                                 |
|---------------------------------|----------------------------------------------------------------------|
| HAL_TIM_PWM_Init()              | 生成 PWM 波的配置初始化，需先执行 HAL_TIM_Base_Init() 进行定时器初始化                |
| HAL_TIM_PWM_ConfigChannel()     | 配置 PWM 输出通道                                                         |
| HAL_TIM_PWM_Start()             | 启动生成 PWM 波，需要先执行 HAL_TIM_Base_Start() 启动定时器                         |
| HAL_TIM_PWM_Stop()              | 停止生成 PWM 波                                                           |
| HAL_TIM_PWM_Start_IT()          | 以中断方式启动生成 PWM 波，需要先执行 HAL_TIM_Base_Start_IT() 启动定时器              |
| HAL_TIM_PWM_Stop_IT()           | 停止生成 PWM 波                                                           |
| HAL_TIM_PWM_GetState()          | 返回定时器状态，与 HAL_TIM_Base_GetState() 功能相同                             |
| __HAL_TIM_ENABLE_OCxPRELOAD()   | 使能 CCR 的预装载功能，为 CCR 设置的新值要等到下个 UEV 事件发生时才更新到 CCR              |
| __HAL_TIM_DISABLE_OCxPRELOAD()  | 禁止 CCR 的预装载功能，为 CCR 设置的新值会立刻更新到 CCR                            |
| __HAL_TIM_ENABLE_OCxFAST()      | 启用一个通道的快速模式                                                       |
| __HAL_TIM_DISABLE_OCxFAST()     | 禁用一个通道的快速模式                                                       |
| HAL_TIM_PWM_PulseFinishedCallback() | 当计数器的值等于 CCR 的值时，产生输出比较事件，这是对应的回调函数                        |


### 输出比较
####  输出比较的原理
输出比较（output compare）用于控制输出波形，或指示经过了某一段时间。其工作原理是：用捕获/比较寄存器的值 CCR 与计数值 CNT 比较，若两个寄存器的值匹配，产生输出比较结果 OCyREF，该值由比较模式和输出极性决定，比较结果可输出到通道的引脚。比较匹配时，可产生中断或 DMA 请求，输出引脚会发生以下几种变化：
- 冻结（Frozen），即保持其电平。
- 有效电平（Active level），有效电平由设置的通道极性决定。
- 无效电平（Inactive Level）。
- 翻转（Toggle）。

若将捕获/比较模式寄存器 TIMx_CCMR1 或 TIMx_CCMR2 中的 OCyPE（输出比较预装载使能）位设置为 0，则捕获/比较寄存器 TIMx_CCRy 无预装载功能，对 TIMx_CCRy 寄存器的修改立刻生效；若设置 OCyPE 位为 1，对 TIMx_CCRy 寄存器的修改需在下一个 UEV 事件时才生效。

![image-20251123223723201](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251123223723201.png)


####  输出比较相关的 HAL 函数
输出比较相关的 HAL 函数如下表所示：

| 函数名                          | 功能描述                                                                 |
|---------------------------------|----------------------------------------------------------------------|
| HAL_TIM_OC_Init()               | 输出比较初始化，需先执行 HAL_TIM_Base_Init() 进行定时器初始化                      |
| HAL_TIM_OC_ConfigChannel()      | 输出比较通道配置                                                         |
| HAL_TIM_OC_Start()              | 启动输出比较，需要先执行 HAL_TIM_Base_Start() 启动定时器                          |
| HAL_TIM_OC_Stop()               | 停止输出比较                                                             |
| HAL_TIM_OC_Start_IT()           | 以中断方式启动输出比较，需要先执行 HAL_TIM_Base_Start_IT() 启动定时器               |
| HAL_TIM_OC_Stop_IT()            | 停止输出比较                                                             |
| HAL_TIM_OC_GetState()           | 返回定时器状态，与 HAL_TIM_Base_GetState() 功能相同                             |
| __HAL_TIM_ENABLE_OCxPRELOAD()   | 使能 CCR 的预装载功能，为 CCR 设置的新值在下个 UEV 事件发生时才更新到 CCR 寄存器           |
| __HAL_TIM_DISABLE_OCxPRELOAD()  | 禁止 CCR 的预装载功能，为 CCR 设置的新值立刻更新到 CCR 寄存器                        |
| __HAL_TIM_SET_COMPARE()         | 设置比较寄存器 CCR 的值                                                    |
| __HAL_TIM_GET_COMPARE()         | 读取比较寄存器 CCR 的值                                                    |
| HAL_TIM_OC_DelayElapsedCallback() | 产生输出比较事件时的回调函数                                                   |


### 输入捕获
#### 输入捕获的原理
输入捕获（input capture）是检测输入通道输入方波信号的跳变沿，并将发生跳变时的计数器的值锁存到 CCR。使用输入捕获功能可检测方波信号周期，从而计算方波信号的频率，也可检测方波信号的占空比。

使用输入捕获功能检测方波信号周期的工作原理如下（假设输入方波的脉冲宽度小于定时器的周期，捕获极性为上跳沿，定时器在 ARR 控制下周期性计数）：
- 在一个上跳沿时，状态寄存器 TIMx_SR 中的捕获比较标志位 CCyIF 会被置 1，表示发生了捕获事件，会产生相应的中断。计数器的值自动锁存到 CCR，假设锁存的值为 CCR1。可在程序里读取出 CCR 的值，并清除 CCyIF 标志位。
- 在下一个上跳沿时，计数器的值也会锁存到 CCR，假设锁存的值为 CCR2。如果在第一次发生捕获事件后，CCR 的值没有及时读出，则 CCyIF 位依然为 1，且 TIMx_SR 中的重复捕获标志位 CCyOF 会被置 1。

如果两个上跳沿的捕获发生在定时器的一个计数周期内，两个计数值分别为 CCR1 和 CCR2，则方波的周期为 CCR2 - CCR1 个计数周期。根据定时器的时钟周期就可以计算出方波周期和频率。

如果方波周期超过定时器的计数周期，或两次捕获发生在相邻两个定时周期里，则只需将计数器的计数周期和 UEV 事件发生次数考虑进去即可。

输入捕获还可以对输入设置滤波，滤波系数 f 为 0~15，用于输入抖动的处理。输入捕获还可以设置分频系数 N，数值可选的 N 值为 1、2、4 或 8，表示发生 N 个事件时才执行一次捕获。

![image-20251123223735693](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251123223735693.png)




#### 输入捕获相关的 HAL 函数
输入捕获相关的 HAL 函数如下表所示：

| 函数名                          | 功能描述                                                                 |
|---------------------------------|----------------------------------------------------------------------|
| HAL_TIM_IC_Init()               | 输入捕获初始化，需先执行 HAL_TIM_Base_Init() 进行定时器初始化                      |
| HAL_TIM_IC_ConfigChannel()      | 输入捕获通道配置                                                         |
| HAL_TIM_IC_Start()              | 启动输入捕获，需要先执行 HAL_TIM_Base_Start() 启动定时器                          |
| HAL_TIM_IC_Stop()               | 停止输入捕获                                                             |
| HAL_TIM_IC_Start_IT()           | 以中断方式启动输入捕获，需要先执行 HAL_TIM_Base_Start_IT() 启动定时器               |
| HAL_TIM_IC_Stop_IT()            | 停止输入捕获                                                             |
| HAL_TIM_IC_GetState()           | 返回定时器状态，与 HAL_TIM_Base_GetState() 功能相同                             |
| __HAL_TIM_SET_CAPTUREPOLARITY() | 设置捕获输入极性，上跳沿、下跳沿或双边捕获                                         |
| __HAL_TIM_SET_COMPARE()         | 设置比较寄存器 CCR 的值                                                    |
| __HAL_TIM_GET_COMPARE()         | 读取比较寄存器 CCR 的值                                                    |
| HAL_TIM_IC_CaptureCallback()    | 产生输入捕获事件时的回调函数                                                   |


### PWM 输入模式
#### 测量 PWM 波参数的原理
PWM 输入模式是输入捕获模式的一个特例，可用于测量 PWM 输入信号的周期和占空比。
- 将两个输入捕获信号 IC1 和 IC2 映射到同一个 TI1 输入上。
- 设置这两个捕获信号 IC1 和 IC2 在边沿处有效，但是极性相反。
- 选择 TI1FP 或 TI2FP 信号之一作为触发输入，并将从模式控制器配置为复位模式。

例如，图 10-9 是测量 TI1（输入通道 CH1 上的输入 PWM 波）的周期和占空比的示意图，其初始配置和工作原理描述如下。
- 将 TIMx_CCR1 和 TIMx_CCR2 的输入都设置为 TI1（即通道 TIMx_CH1）。
- 设置 TIMx_CCR1 的极性为上跳沿有效，设置 TIMx_CCR2 的极性为下跳沿有效。
- 选择 TI1FP1 为有效触发输入。
- 将从模式控制器设置为复位模式。
- 同时使能 TIMx_CCR1 和 TIMx_CCR2 输入捕获。
- 在图 10-9 中，在第 1 个上跳沿处，TIMx_CCR1 锁存计数器的值，并且使计数器复位；在接下来的下跳沿处，TIMx_CCR2 锁存计数器的值（为 0002），这个值就是 PWM 的高电平宽度；在下一个上跳沿处，TIMx_CCR1 锁存计数器的值（为 0004），这个值就是 PWM 的周期。
- ![image-20251123223803974](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251123223803974.png)


####  测量 PWM 波参数的相关 HAL 函数
PWM 输入模式就是输入捕获模式的一个特例，使用的就是表 10-3 中输入捕获相关的 HAL 函数。我们将在后面的示例 3 里介绍测量 PWM 波周期和脉宽的原理。

例程详见[STM32Cube_HAL库笔记（二）-PWM | 超小韓の个人博客](https://blog.chaoxiaohan.cyou/2025/10/08/STM32Cube_HAL-2-PWM/)


###  定时器同步
两个或多个定时器可以内部连接，实现定时器同步或串联。某个工作于主模式的定时器，可以对另一个工作于从模式的定时器执行复位、启动、停止操作，或为其提供时钟。定时器之间的连接可以实现如下一些功能。
- 将一个定时器用作另一个定时器的预分频器。
- 使用一个定时器使能另外一个定时器。
- 使用一个定时器启动另外一个定时器。
- 使用一个外部触发信号同步启动两个定时器。

TIM1 和 TIM2 串联工作的示意图如图 10-10 所示。TIM1 工作于主模式，TIM2 工作于从模式，TIM1 作为 TIM2 的预分频器，其各种设置和工作原理如下。
- 设置 TIM1 工作于主模式，其触发输出（trigger output）信号 TRGO1 的事件源选择 UEV 事件，则每次 UEV 事件时 TRGO1 输出一个上升沿的脉冲信号。
- 将 TIM2 从模式设置为外部时钟模式，触发信号源选择 ITR0，这样 TIM1 的触发输出信号 TRGO1 就成了 TIM2 的时钟信号，相当于 TIM1 作为 TIM2 的预分频器。
- 启动 TIM1 和 TIM2，这两个定时器就开始串联工作。
- ![image-20251123223832898](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251123223832898.png)

####  通用定时器中断事件和回调函数

所有定时器的中断 ISR 里调用一个相同的函数 `HAL_TIM_IRQHandler()`，这是定时器中断处理通用函数。在这个函数里，程序会判断中断事件类型，并调用相应的回调函数。

文件 `stm32f4xx_hal_tim.h` 定义了定时器所有中断事件类型的宏，定义如下：
```c
#define TIM_IT_UPDATE  TIM_DIER_UIE   //更新中断（Update interrupt）
#define TIM_IT_CC1     TIM_DIER_CC1IE //捕获/比较1中断（Capture/Compare 1 interrupt）
#define TIM_IT_CC2     TIM_DIER_CC2IE //捕获/比较2中断（Capture/Compare 2 interrupt）
#define TIM_IT_CC3     TIM_DIER_CC3IE //捕获/比较3中断（Capture/Compare 3 interrupt）
#define TIM_IT_CC4     TIM_DIER_CC4IE //捕获/比较4中断（Capture/Compare 4 interrupt）
#define TIM_IT_COM     TIM_DIER_COMIE //换相中断（Commutation interrupt）
#define TIM_IT_TRIGGER TIM_DIER_TIE   //触发中断（Trigger interrupt）
#define TIM_IT_BREAK   TIM_DIER_BIE   //断路中断（Break interrupt）
```

函数 `HAL_TIM_IRQHandler()` 会根据中断事件标志位和中断事件使能标志位，判断具体发生了哪个中断事件，从而调用相应的回调函数。

表 10-4 是函数 `HAL_TIM_IRQHandler()` 处理的中断事件类型与对应的回调函数：

| 中断事件类型   | 事件名称               | 回调函数                                  |
|----------------|------------------------|-------------------------------------------|
| TIM_IT_CC1     | CC1 通道输入捕获       | HAL_TIM_IC_CaptureCallback()              |
|                | CC1 通道输出比较       | HAL_TIM_OC_DelayElapsedCallback() <br> HAL_TIM_PWM_PulseFinishedCallback() |
| TIM_IT_CC2     | CC2 通道输入捕获       | HAL_TIM_IC_CaptureCallback()              |
|                | CC2 通道输出比较       | HAL_TIM_OC_DelayElapsedCallback() <br> HAL_TIM_PWM_PulseFinishedCallback() |
| TIM_IT_CC3     | CC3 通道输入捕获       | HAL_TIM_IC_CaptureCallback()              |
|                | CC3 通道输出比较       | HAL_TIM_OC_DelayElapsedCallback() <br> HAL_TIM_PWM_PulseFinishedCallback() |
| TIM_IT_CC4     | CC4 通道输入捕获       | HAL_TIM_IC_CaptureCallback()              |
|                | CC4 通道输出比较       | HAL_TIM_OC_DelayElapsedCallback() <br> HAL_TIM_PWM_PulseFinishedCallback() |
| TIM_IT_UPDATE  | 更新事件（UEV）| HAL_TIM_PeriodElapsedCallback()           |
| TIM_IT_TRIGGER | TRGI 触发事件          | HAL_TIM_TriggerCallback()                 |
| TIM_IT_BREAK   | 断路输入事件           | HAL_TIMEx_BreakCallback()                 |
| TIM_IT_COM     | 换相事件               | HAL_TIMEx_CommutCallback()                |


对于输入捕获通道，输入和捕获使用一个中断事件类型，如 `TIM_IT_CC1` 表示通道 CC1 的输入或捕获事件，程序会根据捕获/比较模式寄存器 `TIMx_CCMR1` 的内容判断到底是输入捕获，还是输出比较。如果是输出比较，会连续调用两个回调函数，这两个函数只是意义不同，根据使用场景实现其中一个即可。

函数 `HAL_TIM_IRQHandler()` 中判断 `TIM_IT_CC1` 中断事件源和调用回调函数的代码如下（删除了条件编译不成立部分的代码）：
```c
void HAL_TIM_IRQHandler(TIM_HandleTypeDef *htim)
{
  /* 省略代码段 */

  /* Capture compare 1 event */
  if (__HAL_TIM_GET_FLAG(htim, TIM_FLAG_CC1) != RESET)
  {
    if (__HAL_TIM_GET_IT_SOURCE(htim, TIM_IT_CC1) != RESET)
    {
      __HAL_TIM_CLEAR_IT(htim, TIM_IT_CC1);
      htim->Channel = HAL_TIM_ACTIVE_CHANNEL_1;
      /* Input capture event */
      if ((htim->Instance->CCMR1 & TIM_CCMR1_CC1S) != 0x000)
      {
        HAL_TIM_IC_CaptureCallback(htim);
      }
      /* Output compare event */
      else
      {
        HAL_TIM_OC_DelayElapsedCallback(htim);
        HAL_TIM_PWM_PulseFinishedCallback(htim);
      }
      htim->Channel = HAL_TIM_ACTIVE_CHANNEL_CLEARED;
    }
  }

  /* 省略代码段 */
  /* 省略代码段 */
}
```

表 10-4 中的回调函数都是在 HAL 库中定义的弱函数，且函数代码为空，用户需要处理某个中断事件时，需要重新实现对应的回调函数。搞清楚这些中断事件的来源和对应的回调函数后，在编程时要做的就是确定要实现的功能需要用到哪个中断事件，然后重新实现对应的回调函数，在回调函数里编写用户功能代码即可。