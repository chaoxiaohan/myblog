---
title: GD32F470入门教程（二）时钟系统
date: 2026-02-11 00:00:00
type: paper
category: GD32F470xx
photos: 
tags:
  - GD32F470
  - Clock
excerpt: GD32F470的时钟系统是其核心组成部分。本文解析了时钟树结构，包括外部晶振、内部RC振荡器、PLL倍频器及分频器，并详细说明了时钟分配到各模块的过程，确保系统高效运行。
description: 
---

# 时钟系统

我们根据数据手册，可以找到这款芯片的时钟树，时钟树是了解整个芯片时钟系统的核心

## 时钟树

![GD32F4xx 时钟树](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/GD32F4xxclocktree.png)

### 一、时钟源（根基）

#### 外部晶振：

HXTAL（高速）：接外部高频晶振（如常见 8MHz、24MHz ），为系统提供精准、稳定高频时钟，是高性能运算、高速外设（以太网、高速 ADC ）的优质时钟源，经 PLL 倍频可提升到内核所需高频率 。
LXTAL（低速）：接外部低频晶振（一般 32.768KHz ），专为 RTC（实时时钟）、低功耗应用设计，给系统提供长时稳定低速时钟，保障时间记录、低功耗模式下基础时序 。

#### 内部 RC 振荡器：

IRC16M：内部 16MHz RC 振荡，无需外接元件，启动快、成本低，系统启动初期或对精度要求不高时（如初始化阶段、简单 IO 控制 ），可快速提供时钟，作为过渡或备用 。
IRC32K：内部 32KHz RC 振荡，类似 LXTAL 功能，给 RTC、低功耗外设供时钟，可替代外部低速晶振，简化硬件设计，不过精度略逊于外部晶振 。
IRC48M：内部 48MHz RC 振荡，为 USB 等对时钟精度、频率有特定要求的外设服务（USB 需 48MHz 精准时钟 ），也可作为系统辅助高速时钟，灵活补充高频需求 。

### 二、时钟处理核心（PLL 与分频器）

#### PLL（锁相环）：

接收 HXTAL 或 IRC 等输入时钟，通过倍频（比如把 8MHz 倍到 168MHz、240MHz ），为内核、高速总线（AHB ）、高性能外设提供高频时钟，是提升系统运算速度、支撑高速数据处理的关键，让芯片发挥最大性能 。
可配置不同倍频系数，适配内核（如 240MHz ）、外设（如以太网需特定频率 ）的多样化需求，平衡性能与功耗（高倍频对应高性能、高功耗，低倍频反之 ）。

#### 分频器（Division）：

对 PLL 输出、原始时钟源分频，给不同总线（APB1、APB2 ）、外设分配合适频率。比如 APB1 总线时钟通常低于 AHB，通过分频降低频率，既满足外设时序要求（部分外设不支持高频 ），又降低总线、外设功耗，像定时器、串口等外设，用分频后的 APB 时钟就能稳定工作 。
灵活调整分频系数，适配不同外设特性，比如高速 SPI 用高频，低速 UART 用低频，让每个外设都在 “舒适区” 运行，保障兼容性、稳定性 。

### 三、时钟分配（到各模块）

#### 内核与总线：

AHB 总线：接收 PLL 高倍频时钟（或原始高频时钟 ），最高可达 240MHz，给 CPU 内核、高速存储（TCM_SRAM ）、高速外设（DMA、以太网 ）供时钟，保障系统核心运算、高速数据传输效率，是系统高性能运行的 “大动脉” 。
APB 总线（APB1、APB2 ）：经分频器从 AHB 取时钟，APB2 频率通常高于 APB1 ，分别给不同外设群供时钟。APB2 连高速外设（ADC、SPI 高速模式 ），APB1 接低速 - 中速外设（定时器、普通 UART ），通过分频差异化分配，让外设适配自身时序，同时降低整体功耗 。

#### 外设专属时钟：

部分外设（USB、RTC ）有独立时钟路径。USB 必须用 48MHz 精准时钟（来自 IRC48M 或 PLL 处理后的 HXTAL ），保障 USB 通信协议严格时序；RTC 用 LXTAL 或 IRC32K 供时钟，维持实时时间计数，即使系统休眠，也靠这些低速时钟保持运行，实现低功耗长时计时 。
定时器、串口等通用外设，从 APB 总线取时钟，经自身预分频、倍频，生成精准定时、通信时序，比如定时器通过内部分频 / 倍频，实现微秒级定时，串口依总线时钟配置波特率，保障数据收发正确 。



## 使用时钟

打开我们的工程模板找到并打开startup_gd32f450_470.s启动文件，在190行有`SystemInit`，我们在system_gd32f4xx.c文件内找到这个函数，在这个函数下面，找到`system_clock_config()`

![image-20260211215134361](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260211215134361.png)

继续跳转到system_clock_config函数所在的位置，我们可以下面这样一段的代码，里面通过预先定义的宏编译，选择真正的系统时钟配置函数`system_clock_240m_25m_hxtal()`

![image-20260211215424151](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260211215424151.png)

跳转到宏定义__SYSTEM_CLOCK_240M_PLL_25M_HXTAL地方，我们可以看到下图内容

![image-20260211220225171](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260211220225171.png)

> - 这些宏定义用于**选择系统主频和时钟源**，比如内部16MHz、外部晶振、PLL倍频等。
> - 你只能**取消一行的注释**，表示你要用哪种主频和时钟源，其它全部注释。
> - 例如：
>   - `#define __SYSTEM_CLOCK_240M_PLL_25M_HXTAL (uint32_t)(240000000)`
>     表示用25MHz外部晶振，经PLL倍频后，系统主频为240MHz。

## RCU标准固件库介绍

根据固件库文档，我们得知RCU的函数有如下

![image-20260211223146323](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260211223146323.png)

![image-20260211223204682](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260211223204682.png)

![image-20260211223217448](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260211223217448.png)

这里我们介绍几个比较常用的函数

### rcu_periph_clock_enable

**函数原型**：void rcu_periph_clock_enable(rcu_periph_enum periph);

**功能**：使能外设时钟

**输入参数：**rcu_periph_enum periph枚举

**输出**：无

rcu_periph_enum periph枚举：

```C
typedef enum
{
    /* AHB1 peripherals */
    RCU_GPIOA     = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 0U),                  /*!< GPIOA clock */
    RCU_GPIOB     = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 1U),                  /*!< GPIOB clock */
    RCU_GPIOC     = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 2U),                  /*!< GPIOC clock */
    RCU_GPIOD     = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 3U),                  /*!< GPIOD clock */
    RCU_GPIOE     = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 4U),                  /*!< GPIOE clock */
    RCU_GPIOF     = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 5U),                  /*!< GPIOF clock */
    RCU_GPIOG     = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 6U),                  /*!< GPIOG clock */
    RCU_GPIOH     = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 7U),                  /*!< GPIOH clock */
    RCU_GPIOI     = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 8U),                  /*!< GPIOI clock */
    RCU_CRC       = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 12U),                 /*!< CRC clock */
    RCU_BKPSRAM   = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 18U),                 /*!< BKPSRAM clock */
    RCU_TCMSRAM   = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 20U),                 /*!< TCMSRAM clock */
    RCU_DMA0      = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 21U),                 /*!< DMA0 clock */
    RCU_DMA1      = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 22U),                 /*!< DMA1 clock */
    RCU_IPA       = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 23U),                 /*!< IPA clock */
    RCU_ENET      = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 25U),                 /*!< ENET clock */
    RCU_ENETTX    = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 26U),                 /*!< ENETTX clock */
    RCU_ENETRX    = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 27U),                 /*!< ENETRX clock */
    RCU_ENETPTP   = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 28U),                 /*!< ENETPTP clock */
    RCU_USBHS     = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 29U),                 /*!< USBHS clock */
    RCU_USBHSULPI = RCU_REGIDX_BIT(AHB1EN_REG_OFFSET, 30U),                 /*!< USBHSULPI clock */
    /* AHB2 peripherals */
    RCU_DCI       = RCU_REGIDX_BIT(AHB2EN_REG_OFFSET, 0U),                  /*!< DCI clock */
    RCU_TRNG      = RCU_REGIDX_BIT(AHB2EN_REG_OFFSET, 6U),                  /*!< TRNG clock */
    RCU_USBFS     = RCU_REGIDX_BIT(AHB2EN_REG_OFFSET, 7U),                  /*!< USBFS clock */
    /* AHB3 peripherals */
    RCU_EXMC      = RCU_REGIDX_BIT(AHB3EN_REG_OFFSET, 0U),                  /*!< EXMC clock */
    /* APB1 peripherals */
    RCU_TIMER1    = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 0U),                  /*!< TIMER1 clock */
    RCU_TIMER2    = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 1U),                  /*!< TIMER2 clock */
    RCU_TIMER3    = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 2U),                  /*!< TIMER3 clock */
    RCU_TIMER4    = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 3U),                  /*!< TIMER4 clock */
    RCU_TIMER5    = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 4U),                  /*!< TIMER5 clock */
    RCU_TIMER6    = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 5U),                  /*!< TIMER6 clock */
    RCU_TIMER11   = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 6U),                  /*!< TIMER11 clock */
    RCU_TIMER12   = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 7U),                  /*!< TIMER12 clock */
    RCU_TIMER13   = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 8U),                  /*!< TIMER13 clock */   
    RCU_WWDGT     = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 11U),                 /*!< WWDGT clock */
    RCU_SPI1      = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 14U),                 /*!< SPI1 clock */
    RCU_SPI2      = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 15U),                 /*!< SPI2 clock */
    RCU_USART1    = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 17U),                 /*!< USART1 clock */
    RCU_USART2    = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 18U),                 /*!< USART2 clock */
    RCU_UART3     = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 19U),                 /*!< UART3 clock */
    RCU_UART4     = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 20U),                 /*!< UART4 clock */
    RCU_I2C0      = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 21U),                 /*!< I2C0 clock */
    RCU_I2C1      = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 22U),                 /*!< I2C1 clock */
    RCU_I2C2      = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 23U),                 /*!< I2C2 clock */   
    RCU_CAN0      = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 25U),                 /*!< CAN0 clock */
    RCU_CAN1      = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 26U),                 /*!< CAN1 clock */
    RCU_PMU       = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 28U),                 /*!< PMU clock */
    RCU_DAC       = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 29U),                 /*!< DAC clock */
    RCU_UART6     = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 30U),                 /*!< UART6 clock */
    RCU_UART7     = RCU_REGIDX_BIT(APB1EN_REG_OFFSET, 31U),                 /*!< UART7 clock */
    RCU_RTC       = RCU_REGIDX_BIT(BDCTL_REG_OFFSET, 15U),                  /*!< RTC clock */
    /* APB2 peripherals */
    RCU_TIMER0    = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 0U),                  /*!< TIMER0 clock */
    RCU_TIMER7    = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 1U),                  /*!< TIMER7 clock */
    RCU_USART0    = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 4U),                  /*!< USART0 clock */
    RCU_USART5    = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 5U),                  /*!< USART5 clock */
    RCU_ADC0      = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 8U),                  /*!< ADC0 clock */
    RCU_ADC1      = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 9U),                  /*!< ADC1 clock */
    RCU_ADC2      = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 10U),                 /*!< ADC2 clock */
    RCU_SDIO      = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 11U),                 /*!< SDIO clock */
    RCU_SPI0      = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 12U),                 /*!< SPI0 clock */
    RCU_SPI3      = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 13U),                 /*!< SPI3 clock */
    RCU_SYSCFG    = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 14U),                 /*!< SYSCFG clock */
    RCU_TIMER8    = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 16U),                 /*!< TIMER8 clock */
    RCU_TIMER9    = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 17U),                 /*!< TIMER9 clock */
    RCU_TIMER10   = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 18U),                 /*!< TIMER10 clock */
    RCU_SPI4      = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 20U),                 /*!< SPI4 clock */
    RCU_SPI5      = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 21U),                 /*!< SPI5 clock */
    RCU_TLI       = RCU_REGIDX_BIT(APB2EN_REG_OFFSET, 26U),                 /*!< TLI clock */
    /* APB1 additional peripherals */
    RCU_CTC       = RCU_REGIDX_BIT(ADD_APB1EN_REG_OFFSET, 27U),             /*!< CTC clock */
    RCU_IREF      = RCU_REGIDX_BIT(ADD_APB1EN_REG_OFFSET, 31U),             /*!< IREF clock */
}rcu_periph_enum;

```

### rcu_periph_clock_disable

**功能**：禁用外设时钟

**函数原型**：void rcu_periph_clock_disable(rcu_periph_enum periph);

**参数**：periph - 要禁用的外设时钟枚举值

**返回值**：无

**示例**：
```C
rcu_periph_clock_disable(RCU_GPIOA); // 禁用GPIOA时钟
```

## 时钟固件库函数

GD32F4xx固件库提供了丰富的RCU（Reset and Clock Unit）函数，用于配置和管理时钟系统。以下是主要时钟函数的详细介绍，基于GD32F4xx_固件库使用指南_Rev1.2。

### 1. 系统时钟配置函数

#### rcu_system_clock_source_config
**函数原型：**
```C
void rcu_system_clock_source_config(uint32_t ck_sys);
```

**功能描述：**
配置系统时钟源（SYSCLK）。

**参数：**
- `ck_sys`: 系统时钟源选择（RCU_CKSYSSRC_IRC16M, RCU_CKSYSSRC_HXTAL, RCU_CKSYSSRC_PLL）。

**返回值：** 无

**示例：**
```C
rcu_system_clock_source_config(RCU_CKSYSSRC_PLL); // 设置PLL作为系统时钟源
```

#### rcu_system_clock_source_get
**函数原型：**
```C
uint32_t rcu_system_clock_source_get(void);
```

**功能描述：**
获取当前系统时钟源。

**参数：** 无

**返回值：** 当前系统时钟源（RCU_SCSS_IRC16M, RCU_SCSS_HXTAL, RCU_SCSS_PLL）。

**示例：**
```C
uint32_t sys_src = rcu_system_clock_source_get();
```

### 2. PLL配置函数

#### rcu_pll_config
**函数原型：**
```C
ErrStatus rcu_pll_config(uint32_t pll_src, uint32_t pll_psc, uint32_t pll_n, uint32_t pll_p, uint32_t pll_range);
```

**功能描述：**
配置PLL参数。

**参数：**
- `pll_src`: PLL输入时钟源（RCU_PLLSRC_IRC16M, RCU_PLLSRC_HXTAL）。
- `pll_psc`: PLL预分频器（1-63）。
- `pll_n`: PLL倍频器（50-432）。
- `pll_p`: PLL主分频器（2,4,6,8）。
- `pll_range`: PLL频率范围（RCU_PLLVCO_RANGE1, RCU_PLLVCO_RANGE2）。

**返回值：** SUCCESS或ERROR。

**示例：**
```C
rcu_pll_config(RCU_PLLSRC_HXTAL, 8, 240, 2, RCU_PLLVCO_RANGE1); // HXTAL/8 * 240 / 2 = 120MHz
```

#### rcu_pll_enable
**函数原型：**
```C
void rcu_pll_enable(void);
```

**功能描述：**
使能PLL。

**参数：** 无

**返回值：** 无

**示例：**
```C
rcu_pll_enable();
```

#### rcu_pll_disable
**函数原型：**
```C
void rcu_pll_disable(void);
```

**功能描述：**
禁用PLL。

**参数：** 无

**返回值：** 无

**示例：**
```C
rcu_pll_disable();
```

### 3. 时钟分频配置函数

#### rcu_ahb_clock_config
**函数原型：**
```C
void rcu_ahb_clock_config(uint32_t ck_ahb);
```

**功能描述：**
配置AHB总线时钟分频。

**参数：**
- `ck_ahb`: AHB分频系数（RCU_AHB_CKSYS_DIV1 ~ RCU_AHB_CKSYS_DIV512）。

**返回值：** 无

**示例：**
```C
rcu_ahb_clock_config(RCU_AHB_CKSYS_DIV1); // AHB = SYSCLK
```

#### rcu_apb1_clock_config
**函数原型：**
```C
void rcu_apb1_clock_config(uint32_t ck_apb1);
```

**功能描述：**
配置APB1总线时钟分频。

**参数：**
- `ck_apb1`: APB1分频系数（RCU_APB1_CKAHB_DIV1 ~ RCU_APB1_CKAHB_DIV16）。

**返回值：** 无

**示例：**
```C
rcu_apb1_clock_config(RCU_APB1_CKAHB_DIV2); // APB1 = AHB/2
```

#### rcu_apb2_clock_config
**函数原型：**
```C
void rcu_apb2_clock_config(uint32_t ck_apb2);
```

**功能描述：**
配置APB2总线时钟分频。

**参数：**
- `ck_apb2`: APB2分频系数（RCU_APB2_CKAHB_DIV1 ~ RCU_APB2_CKAHB_DIV16）。

**返回值：** 无

**示例：**
```C
rcu_apb2_clock_config(RCU_APB2_CKAHB_DIV1); // APB2 = AHB
```

### 4. 振荡器控制函数

#### rcu_osci_on
**函数原型：**
```C
ErrStatus rcu_osci_on(rcu_osci_type_enum osci);
```

**功能描述：**
开启指定的振荡器。

**参数：**
- `osci`: 振荡器类型（RCU_HXTAL, RCU_LXTAL, RCU_IRC16M, RCU_IRC32K, RCU_IRC48M, RCU_PLL）。

**返回值：** SUCCESS或ERROR。

**示例：**
```C
rcu_osci_on(RCU_HXTAL); // 开启外部高速晶振
```

#### rcu_osci_off
**函数原型：**
```C
void rcu_osci_off(rcu_osci_type_enum osci);
```

**功能描述：**
关闭指定的振荡器。

**参数：**
- `osci`: 振荡器类型。

**返回值：** 无

**示例：**
```C
rcu_osci_off(RCU_IRC16M); // 关闭内部16MHz RC振荡器
```

#### rcu_osci_stab_wait
**函数原型：**
```C
void rcu_osci_stab_wait(rcu_osci_type_enum osci);
```

**功能描述：**
等待指定的振荡器稳定。

**参数：**
- `osci`: 振荡器类型。

**返回值：** 无

**示例：**
```C
rcu_osci_on(RCU_HXTAL);
rcu_osci_stab_wait(RCU_HXTAL); // 等待HXTAL稳定
```

### 5. 时钟频率获取函数

#### rcu_clock_freq_get
**函数原型：**
```C
uint32_t rcu_clock_freq_get(rcu_clock_freq_enum clock);
```

**功能描述：**
获取指定时钟的频率。

**参数：**
- `clock`: 时钟类型（CK_SYS, CK_AHB, CK_APB1, CK_APB2）。

**返回值：** 时钟频率（Hz）。

**示例：**
```C
uint32_t sys_freq = rcu_clock_freq_get(CK_SYS); // 获取系统时钟频率
```

### 6. 外设时钟控制函数

#### rcu_periph_clock_enable
**函数原型：**
```C
void rcu_periph_clock_enable(rcu_periph_enum periph);
```

**功能描述：**
使能外设时钟。

**参数：**
- `periph`: 外设时钟枚举值。

**返回值：** 无

**示例：**
```C
rcu_periph_clock_enable(RCU_GPIOA); // 使能GPIOA时钟
```

#### rcu_periph_clock_disable
**函数原型：**
```C
void rcu_periph_clock_disable(rcu_periph_enum periph);
```

**功能描述：**
禁用外设时钟。

**参数：**
- `periph`: 外设时钟枚举值。

**返回值：** 无

**示例：**
```C
rcu_periph_clock_disable(RCU_GPIOA); // 禁用GPIOA时钟
```

### 7. 其他函数

#### rcu_deinit
**函数原型：**
```C
void rcu_deinit(void);
```

**功能描述：**
将RCU重置为默认状态。

**参数：** 无

**返回值：** 无

**示例：**
```C
rcu_deinit(); // 重置时钟系统
```

#### rcu_step_mode_wakeup_disable
**函数原型：**
```C
void rcu_step_mode_wakeup_disable(void);
```

**功能描述：**
禁用步进模式唤醒。

**参数：** 无

**返回值：** 无

**示例：**
```C
rcu_step_mode_wakeup_disable();
```

### 8. 相关宏定义和枚举

- **系统时钟源：** RCU_CKSYSSRC_IRC16M, RCU_CKSYSSRC_HXTAL, RCU_CKSYSSRC_PLL
- **PLL源：** RCU_PLLSRC_IRC16M, RCU_PLLSRC_HXTAL
- **AHB分频：** RCU_AHB_CKSYS_DIV1 ~ RCU_AHB_CKSYS_DIV512
- **APB分频：** RCU_APB1_CKAHB_DIV1 ~ RCU_APB1_CKAHB_DIV16
- **振荡器类型：** RCU_HXTAL, RCU_LXTAL, RCU_IRC16M, RCU_IRC32K, RCU_IRC48M, RCU_PLL
- **时钟频率类型：** CK_SYS, CK_AHB, CK_APB1, CK_APB2

在使用这些函数时，需要按照时钟配置顺序：先开启振荡器，等待稳定，然后配置PLL，使能PLL，配置系统时钟源，最后配置各总线分频。所有函数都在gd32f4xx_rcu.h头文件中声明。

