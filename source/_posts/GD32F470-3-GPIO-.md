---
title: GD32F470入门教程（三）GPIO
date: 2026-02-11 23:00:00
type: paper
category: GD32F470xx
photos: 
tags:
excerpt: GPIO是单片机通用输入输出端口的简称。本文介绍了GD32F470的GPIO功能，包括引脚配置、输入输出模式、信号流向，并提供了标准库使用方法和固件库函数详解，帮助开发者快速上手GPIO编程。
description: 
---

# GPIO

GPIO(general porpose intput output):单片机通用输入输出端口的简称。可以通过单片机烧录的程序代码控制单片机引脚输出高电平或者低电平，也可以读取引脚电平信号为高电平还是低电平。

下面以GD32F470VET6的引脚图

![image-20260211221038992](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260211221038992.png)

最多可支持140 个通用I/O 引脚（GPIO）（具体引脚数量见芯片具体型号），分别为PA0 ~ PA15，PB0 ~ PB15，PC0 ~ PC15，PD0 ~ PD15，PE0 ~ PE15，PF0 ~ PF15，PG0 ~ PG15，PH0 ~ PH15 和PI0 ~ PI11，各片上设备用其来实现逻辑输入/输出功能。每个GPIO 端口有相关的控制和配置寄存器以满足特定应用的需求。GPIO 引脚上的外部中断在中断/事件控制器（EXTI）中有相关的控制和配置寄存器。

GPIO 端口和其他的备用功能（AFs）共用引脚，在特定的封装下获得最大的灵活性。GPIO 引脚通过配置相关的寄存器可以用作备用功能引脚，备用功能输入/输出都可以。每个GPIO 引脚可以由软件配置为输出（推挽或开漏）、输入、外设备用功能或者模拟模式。每个GPIO 引脚都可以配置为上拉、下拉或无上拉/下拉。**除模拟模式外，所有的GPIO 引脚都具备大电流驱动能力**。

## GPIO功能描述

每个通用 I/O 端口都可以通过 32 位控制寄存器（GPIOx_CTL）配置为 GPIO 输入，GPIO 输出，AF 功能或模拟模式。当选择 AF 功能时，引脚 AF 输入/输出是通过 AF 功能输出使能来选择。当端口配置为输出（GPIO 输出或 AFIO 输出）时，可以通过 GPIO 输出模式寄存器（GPIOx_OMODE）配置为推挽或开漏模式。输出端口的最大速度可以通过 GPIO 输出速度寄存器（GPIOx_OSPD）配置。每个端口可以通过 GPIO 上/下拉寄存器（GPIOx_PUD）配置为浮空（无上拉或下拉），上拉或下拉功能。

![image-20260211221442593](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260211221442593.png)

![image-20260211221457326](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260211221457326.png)

**GD32单片机GPIO输入输出信号流向**
如下图上半部分，就是一个GPIO推挽输出的信号流向：
输出数据寄存器输出一个高电平时，P-MOS 管导通，N-MOS 管截止，对外输出高电平（3.3V）。
输出数据寄存器输出一个低电平时，P-MOS 管截止，N-MOS 管导通，对外输出低电平（0V）。

如下图下半部分，就是一个GPIO输入的信号流向：
从单片机I/O引脚进来就连接到TTL施密特触发器就把电压信号转化为0、1的数字信号存储在输入数据寄存器。
施密特触发器，当输入电压高于正向阈值电压，输出为1，当输入电压低于负向阈值电压，输出为0，当输入在正负向阈值电压之间，输出不改变。

![image-20260211221650852](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20260211221650852.png)

## GPIO标准库使用

使用GPIO一般有如下流程

- 开启对应GPIO时钟
- 配置GPIO模式
- 配置GPIO输出

### 1.开启对应GPIO时钟

在`gd32f4xx_rcu.h`文件里有很详细的关于时钟的函数的声明，我们需要打开的时钟也在这里，我们找到rcu_periph_enum这个枚举，这里面可以看到里面定义了很多时钟，有 GPIO 时钟，DMA 时钟，定时器时钟等

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

其中RCU_GPIOA就是GPIOA的时钟

如果我们想要开启这个时钟，那对应的代码是

```C
rcu_periph_clock_enable(RCU_GPIOA);
```

### 2.配置 GPIO 模式

GPIO 的模式配置可分为两步，第一步就是通过调用库函数将 GPIO 配置为输入功能，输出功能，复用功能还是模拟功能。第二步就是通过调用库函数配置 GPIO 的上下拉模式或者浮空。

根据固件库手册，我们这里需要用到`gpio_mode_set`函数，他的函数原型是 `void gpio_mode_set(uint32_t gpio_periph, uint32_t mode, uint32_t pull_up_down, uint32_t pin);` 

它有四个参数，第一个参数是配置的端口。

```C
/* GPIOx(x=A,B,C,D,E,F,G,H,I) definitions */
#define GPIOA                      (GPIO_BASE + 0x00000000U)
#define GPIOB                      (GPIO_BASE + 0x00000400U)
#define GPIOC                      (GPIO_BASE + 0x00000800U)
#define GPIOD                      (GPIO_BASE + 0x00000C00U)
#define GPIOE                      (GPIO_BASE + 0x00001000U)
#define GPIOF                      (GPIO_BASE + 0x00001400U)
#define GPIOG                      (GPIO_BASE + 0x00001800U)
#define GPIOH                      (GPIO_BASE + 0x00001C00U)
#define GPIOI                      (GPIO_BASE + 0x00002000U)
```

第二个参数是配置的模式。

```C
/* output mode definitions */
#define CTL_CLTR(regval)           (BITS(0,1) & ((uint32_t)(regval) << 0))
#define GPIO_MODE_INPUT            CTL_CLTR(0)               /*!< input mode */
#define GPIO_MODE_OUTPUT           CTL_CLTR(1)               /*!< output mode */
#define GPIO_MODE_AF               CTL_CLTR(2)               /*!< alternate function mode */
#define GPIO_MODE_ANALOG           CTL_CLTR(3)               /*!< analog mode */

```

第三个参数是上下拉选择。

```C
/* pull-up/ pull-down definitions */
#define PUD_PUPD(regval)           (BITS(0,1) & ((uint32_t)(regval) << 0))
#define GPIO_PUPD_NONE             PUD_PUPD(0)               /*!< floating mode, no pull-up and pull-down resistors */
#define GPIO_PUPD_PULLUP           PUD_PUPD(1)               /*!< with pull-up resistor */
#define GPIO_PUPD_PULLDOWN         PUD_PUPD(2)               /*!< with pull-down resistor */

```

第四个参数是要配置的引脚。

```C
/* GPIO pin definitions */
#define GPIO_PIN_0                 BIT(0)                    /*!< GPIO pin 0 */
#define GPIO_PIN_1                 BIT(1)                    /*!< GPIO pin 1 */
#define GPIO_PIN_2                 BIT(2)                    /*!< GPIO pin 2 */
#define GPIO_PIN_3                 BIT(3)                    /*!< GPIO pin 3 */
#define GPIO_PIN_4                 BIT(4)                    /*!< GPIO pin 4 */
#define GPIO_PIN_5                 BIT(5)                    /*!< GPIO pin 5 */
#define GPIO_PIN_6                 BIT(6)                    /*!< GPIO pin 6 */
#define GPIO_PIN_7                 BIT(7)                    /*!< GPIO pin 7 */
#define GPIO_PIN_8                 BIT(8)                    /*!< GPIO pin 8 */
#define GPIO_PIN_9                 BIT(9)                    /*!< GPIO pin 9 */
#define GPIO_PIN_10                BIT(10)                   /*!< GPIO pin 10 */
#define GPIO_PIN_11                BIT(11)                   /*!< GPIO pin 11 */
#define GPIO_PIN_12                BIT(12)                   /*!< GPIO pin 12 */
#define GPIO_PIN_13                BIT(13)                   /*!< GPIO pin 13 */
#define GPIO_PIN_14                BIT(14)                   /*!< GPIO pin 14 */
#define GPIO_PIN_15                BIT(15)                   /*!< GPIO pin 15 */
#define GPIO_PIN_ALL               BITS(0,15)                /*!< GPIO pin all */

```

要配置 PA1 为输出模式，浮空模式，只需要传入对应的参数即可。转换为代码为

```C
gpio_mode_set(GPIOA, GPIO_MODE_OUTPUT, GPIO_PUPD_NONE, GPIO_PIN_1);
```

### 3.配置 GPIO 的输出

配置 GPIO 的输出也分为两步，第一步配置输出模式是推挽输出还是开漏输出，第二步配置 GPIO 输出的速度。这配置的也是关于 GPIO 的操作，要到 gd32f4xx_gpio.h 去查找对应的函数。经过查找，发现 void gpio_output_options_set(uint32_t gpio_periph, uint8_t otype, uint32_t speed, uint32_t pin);这个函数满足我们的功能。

它有四个参数，第一个参数是配置的端口，见上文。

第二个参数是输出的类型。

```c
/* GPIO output type */
#define GPIO_OTYPE_PP              ((uint8_t)(0x00U))        /*!< push pull mode */
#define GPIO_OTYPE_OD              ((uint8_t)(0x01U))        /*!< open drain mode */

```

第三个参数是 GPIO 的速度。

```C
/* GPIO output max speed value */
#define GPIO_OSPEED_2MHZ           GPIO_OSPEED_LEVEL0        /*!< output max speed 2MHz */
#define GPIO_OSPEED_25MHZ          GPIO_OSPEED_LEVEL1        /*!< output max speed 25MHz */
#define GPIO_OSPEED_50MHZ          GPIO_OSPEED_LEVEL2        /*!< output max speed 50MHz */
#define GPIO_OSPEED_MAX            GPIO_OSPEED_LEVEL3        /*!< GPIO very high output speed, max speed more than 50MHz */

```

第四个参数是要配置的引脚，见上文。

**若要配置GPIO为输入模式，函数可见下文固件库函数介绍**

### 4.配置GPIO为高电平

可使用`gpio_bit_write`函数，函数原型是：`void gpio_bit_write(uint32_t gpio_periph, uint32_t pin, bit_status bit_value);`

```C
gpio_bit_write(GPIOA,GPIO_PIN_1,0); //配置PA1引脚输出低电平
```

## GPIO固件库函数

GD32F4xx固件库提供了丰富的GPIO函数，用于配置、读写GPIO引脚。以下是主要GPIO函数的详细介绍，基于GD32F4xx_固件库使用指南_Rev1.2。

### 1. GPIO初始化和配置函数

#### gpio_deinit
**函数原型：**
```C
void gpio_deinit(uint32_t gpio_periph);
```

**功能描述：**
将指定的GPIO端口重置为默认状态（模拟输入模式，无上下拉）。

**参数：**
- `gpio_periph`: GPIO端口，如GPIOA、GPIOB等。

**返回值：** 无

**示例：**
```C
gpio_deinit(GPIOA); // 重置GPIOA端口
```

#### gpio_mode_set
**函数原型：**
```C
void gpio_mode_set(uint32_t gpio_periph, uint32_t mode, uint32_t pull_up_down, uint32_t pin);
```

**功能描述：**
设置GPIO引脚的模式（输入、输出、复用、模拟）和上下拉配置。

**参数：**
- `gpio_periph`: GPIO端口。
- `mode`: 模式选择（GPIO_MODE_INPUT, GPIO_MODE_OUTPUT, GPIO_MODE_AF, GPIO_MODE_ANALOG）。
- `pull_up_down`: 上下拉选择（GPIO_PUPD_NONE, GPIO_PUPD_PULLUP, GPIO_PUPD_PULLDOWN）。
- `pin`: 要配置的引脚（GPIO_PIN_0 ~ GPIO_PIN_15 或 GPIO_PIN_ALL）。

**返回值：** 无

**示例：**
```C
gpio_mode_set(GPIOA, GPIO_MODE_OUTPUT, GPIO_PUPD_NONE, GPIO_PIN_1); // PA1输出模式，无上下拉
```

#### gpio_output_options_set
**函数原型：**
```C
void gpio_output_options_set(uint32_t gpio_periph, uint8_t otype, uint32_t speed, uint32_t pin);
```

**功能描述：**
设置GPIO输出引脚的输出类型（推挽/开漏）和速度。

**参数：**
- `gpio_periph`: GPIO端口。
- `otype`: 输出类型（GPIO_OTYPE_PP: 推挽, GPIO_OTYPE_OD: 开漏）。
- `speed`: 输出速度（GPIO_OSPEED_2MHZ, GPIO_OSPEED_25MHZ, GPIO_OSPEED_50MHZ, GPIO_OSPEED_MAX）。
- `pin`: 要配置的引脚。

**返回值：** 无

**示例：**
```C
gpio_output_options_set(GPIOA, GPIO_OTYPE_PP, GPIO_OSPEED_50MHZ, GPIO_PIN_1); // PA1推挽输出，50MHz速度
```

#### gpio_af_set
**函数原型：**
```C
void gpio_af_set(uint32_t gpio_periph, uint32_t alt_func_num, uint32_t pin);
```

**功能描述：**
设置GPIO引脚的复用功能编号。

**参数：**
- `gpio_periph`: GPIO端口。
- `alt_func_num`: 复用功能编号（0-15）。
- `pin`: 要配置的引脚。

**返回值：** 无

**示例：**
```C
gpio_af_set(GPIOA, GPIO_AF_7, GPIO_PIN_9 | GPIO_PIN_10); // PA9/PA10设置为USART0复用
```

#### gpio_af_get
**函数原型：**
```C
uint32_t gpio_af_get(uint32_t gpio_periph, uint32_t pin);
```

**功能描述：**
获取GPIO引脚的当前复用功能编号。

**参数：**
- `gpio_periph`: GPIO端口。
- `pin`: 要查询的引脚。

**返回值：** 复用功能编号。

**示例：**
```C
uint32_t af = gpio_af_get(GPIOA, GPIO_PIN_9); // 获取PA9的复用功能
```

### 2. GPIO输出函数

#### gpio_bit_write
**函数原型：**
```C
void gpio_bit_write(uint32_t gpio_periph, uint32_t pin, bit_status bit_value);
```

**功能描述：**
设置GPIO引脚的输出电平。

**参数：**
- `gpio_periph`: GPIO端口。
- `pin`: 要设置的引脚。
- `bit_value`: 电平值（SET: 高电平, RESET: 低电平）。

**返回值：** 无

**示例：**
```C
gpio_bit_write(GPIOA, GPIO_PIN_1, SET); // PA1输出高电平
gpio_bit_write(GPIOA, GPIO_PIN_1, RESET); // PA1输出低电平
```

#### gpio_bit_set
**函数原型：**
```C
void gpio_bit_set(uint32_t gpio_periph, uint32_t pin);
```

**功能描述：**
设置GPIO引脚为高电平。

**参数：**
- `gpio_periph`: GPIO端口。
- `pin`: 要设置的引脚。

**返回值：** 无

**示例：**
```C
gpio_bit_set(GPIOA, GPIO_PIN_1); // PA1置高
```

#### gpio_bit_reset
**函数原型：**
```C
void gpio_bit_reset(uint32_t gpio_periph, uint32_t pin);
```

**功能描述：**
设置GPIO引脚为低电平。

**参数：**
- `gpio_periph`: GPIO端口。
- `pin`: 要设置的引脚。

**返回值：** 无

**示例：**
```C
gpio_bit_reset(GPIOA, GPIO_PIN_1); // PA1置低
```

#### gpio_bit_toggle
**函数原型：**
```C
void gpio_bit_toggle(uint32_t gpio_periph, uint32_t pin);
```

**功能描述：**
翻转GPIO引脚的输出电平。

**参数：**
- `gpio_periph`: GPIO端口。
- `pin`: 要翻转的引脚。

**返回值：** 无

**示例：**
```C
gpio_bit_toggle(GPIOA, GPIO_PIN_1); // PA1电平翻转
```

#### gpio_port_write
**函数原型：**
```C
void gpio_port_write(uint32_t gpio_periph, uint16_t data);
```

**功能描述：**
同时设置整个GPIO端口的输出值。

**参数：**
- `gpio_periph`: GPIO端口。
- `data`: 16位数据，位对应引脚0-15。

**返回值：** 无

**示例：**
```C
gpio_port_write(GPIOA, 0xFFFF); // GPIOA所有引脚输出高电平
```

### 3. GPIO输入函数

#### gpio_input_bit_get
**函数原型：**
```C
FlagStatus gpio_input_bit_get(uint32_t gpio_periph, uint32_t pin);
```

**功能描述：**
读取GPIO引脚的输入电平状态。

**参数：**
- `gpio_periph`: GPIO端口。
- `pin`: 要读取的引脚。

**返回值：** SET（高电平）或RESET（低电平）。

**示例：**
```C
FlagStatus status = gpio_input_bit_get(GPIOA, GPIO_PIN_1); // 读取PA1输入状态
if (status == SET) {
    // 高电平处理
}
```

#### gpio_input_port_get
**函数原型：**
```C
uint16_t gpio_input_port_get(uint32_t gpio_periph);
```

**功能描述：**
读取整个GPIO端口的输入值。

**参数：**
- `gpio_periph`: GPIO端口。

**返回值：** 16位输入数据。

**示例：**
```C
uint16_t port_value = gpio_input_port_get(GPIOA); // 读取GPIOA端口输入
```

### 4. GPIO锁定函数

#### gpio_pin_lock
**函数原型：**
```C
void gpio_pin_lock(uint32_t gpio_periph, uint32_t pin);
```

**功能描述：**
锁定GPIO引脚的配置，防止意外修改。

**参数：**
- `gpio_periph`: GPIO端口。
- `pin`: 要锁定的引脚。

**返回值：** 无

**注意：** 锁定后无法通过软件解锁，只能通过复位解除。

**示例：**
```C
gpio_pin_lock(GPIOA, GPIO_PIN_1); // 锁定PA1配置
```

#### gpio_pin_lock_config
**函数原型：**
```C
void gpio_pin_lock_config(uint32_t gpio_periph, uint32_t pin);
```

**功能描述：**
配置GPIO引脚锁定（内部使用，通常不直接调用）。

**参数：**
- `gpio_periph`: GPIO端口。
- `pin`: 要配置的引脚。

**返回值：** 无

### 5. 其他相关宏定义

- **GPIO端口定义：** GPIOA, GPIOB, ..., GPIOI
- **引脚定义：** GPIO_PIN_0 ~ GPIO_PIN_15, GPIO_PIN_ALL
- **模式定义：** GPIO_MODE_INPUT, GPIO_MODE_OUTPUT, GPIO_MODE_AF, GPIO_MODE_ANALOG
- **上下拉定义：** GPIO_PUPD_NONE, GPIO_PUPD_PULLUP, GPIO_PUPD_PULLDOWN
- **输出类型：** GPIO_OTYPE_PP, GPIO_OTYPE_OD
- **速度定义：** GPIO_OSPEED_2MHZ, GPIO_OSPEED_25MHZ, GPIO_OSPEED_50MHZ, GPIO_OSPEED_MAX
- **复用功能：** GPIO_AF_0 ~ GPIO_AF_15（具体编号见数据手册）

在使用这些函数前，确保已开启相应GPIO端口的时钟（使用rcu_periph_clock_enable()）。所有函数都在gd32f4xx_gpio.h头文件中声明。

