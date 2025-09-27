---
title: HAL库函数
date: 2025-03-01 00:00:00
type: paper
photos:
excerpt: 本文详细介绍了STM32 HAL库中关于GPIO、UART及I2C的关键函数。内容涵盖了各模块的基础知识、主要参数配置，并列举了如HAL_GPIO_WritePin、HAL_UART_Transmit、HAL_I2C_Master_Transmit等核心API的使用方法，是STM32嵌入式开发的实用参考。
tags:
  - STM32
  - HAL
  - CubeMx
  - learn
---

# HAL库函数

## GPIO

### GPIO知识

- GPIO 的模式:

  - 输入模式 (Input Mode):

    - **GPIO_MODE_INPUT:** 浮空输入，引脚不连接到内部上拉或下拉电阻。
    - **GPIO_MODE_INPUT_PULLUP:** 上拉输入，引脚连接到内部上拉电阻。
    - **GPIO_MODE_INPUT_PULLDOWN:** 下拉输入，引脚连接到内部下拉电阻。

  - 输出模式 (Output Mode):

    - **GPIO_MODE_OUTPUT_PP:** 推挽输出，可以输出高电平或低电平。
    - **GPIO_MODE_OUTPUT_OD:** 开漏输出，需要外部上拉电阻才能输出高电平。

  - 复用功能模式 (Alternate Function Mode):

     

    将 GPIO 引脚配置为连接到片上外设，例如 UART、SPI、I2C 等。

    - **GPIO_MODE_AF_PP:** 推挽复用功能输出。
    - **GPIO_MODE_AF_OD:** 开漏复用功能输出。

  - 模拟模式 (Analog Mode):

     

    将 GPIO 引脚配置为模拟输入，用于连接 ADC 等模拟外设。

    - **GPIO_MODE_ANALOG:** 模拟输入。

- GPIO 的速度 (Speed):

   

  控制 GPIO 引脚的翻转速度，影响功耗和电磁干扰。

  - **GPIO_SPEED_FREQ_LOW:** 低速。
  - **GPIO_SPEED_FREQ_MEDIUM:** 中速。
  - **GPIO_SPEED_FREQ_HIGH:** 高速。
  - **GPIO_SPEED_FREQ_VERY_HIGH:** 非常高速。

- GPIO 的上下拉电阻 (Pull-up/Pull-down Resistors):

   

  用于在输入模式下稳定引脚的电平。

  - **GPIO_NOPULL:** 无上下拉电阻。
  - **GPIO_PULLUP:** 上拉电阻。
  - **GPIO_PULLDOWN:** 下拉电阻。

- GPIO 的中断 (Interrupt):

   

  配置 GPIO 引脚在电平变化时触发中断。

  - **EXTI (External Interrupt/Event Controller):** 外部中断/事件控制器，用于管理 GPIO 中断。
  - **中断触发方式：** 上升沿触发、下降沿触发、双边沿触发。

- **GPIO 的锁定 (Lock):** 防止意外修改 GPIO 的配置。

### **GPIO 相关的 HAL 库函数：**

1. **`HAL_GPIO_Init(GPIO_TypeDef \*GPIOx, GPIO_InitTypeDef \*GPIO_Init)`**: 初始化 GPIO 引脚。

   - **`GPIOx`**: GPIO 端口的基地址 (例如: `GPIOA`, `GPIOB`, `GPIOC` 等)。这是一个指向 `GPIO_TypeDef` 结构体的指针，定义了你想要配置的 GPIO 端口。
   - **`GPIO_Init`**: 指向 `GPIO_InitTypeDef` 结构体的指针，包含了 GPIO 引脚的配置信息。
     - **`Pin`**: 要配置的 GPIO 引脚，可以使用 `GPIO_PIN_x` (x 为 0-15) 或多个引脚的组合 (例如 `GPIO_PIN_0 | GPIO_PIN_1`)。
     - **`Mode`**: GPIO 的模式 (例如: `GPIO_MODE_INPUT`, `GPIO_MODE_OUTPUT_PP`, `GPIO_MODE_AF_PP`, `GPIO_MODE_ANALOG`)。
     - **`Pull`**: 上下拉电阻配置 (例如: `GPIO_NOPULL`, `GPIO_PULLUP`, `GPIO_PULLDOWN`)。
     - **`Speed`**: GPIO 的速度 (例如: `GPIO_SPEED_FREQ_LOW`, `GPIO_SPEED_FREQ_MEDIUM`, `GPIO_SPEED_FREQ_HIGH`)。
     - **`Alternate`**: 复用功能选择，仅在复用功能模式下有效 (例如: `GPIO_AF4_USART1`)。

2. <u>**`HAL_GPIO_WritePin(GPIO_TypeDef \*GPIOx, uint16_t GPIO_Pin, GPIO_PinState PinState)`: 设置 GPIO 引脚的输出电平。**</u>

   - **`GPIOx`**: GPIO 端口的基地址 (例如: `GPIOA`, `GPIOB`, `GPIOC` 等)。
   - **`GPIO_Pin`**: 要设置电平的 GPIO 引脚 (例如: `GPIO_PIN_0`)。
   - **`PinState`**: 要设置的电平状态 (例如: `GPIO_PIN_RESET` (低电平), `GPIO_PIN_SET` (高电平))。

3. <u>**`HAL_GPIO_ReadPin(GPIO_TypeDef \*GPIOx, uint16_t GPIO_Pin)`**: 读取 GPIO 引脚的输入电平。</u>

   - **`GPIOx`**: GPIO 端口的基地址 (例如: `GPIOA`, `GPIOB`, `GPIOC` 等)。
   - **`GPIO_Pin`**: 要读取电平的 GPIO 引脚 (例如: `GPIO_PIN_0`)。
   - **返回值**: `GPIO_PinState` 类型，表示引脚的电平状态 (`GPIO_PIN_RESET` (低电平) 或 `GPIO_PIN_SET` (高电平))。

4. <u>**`HAL_GPIO_TogglePin(GPIO_TypeDef \*GPIOx, uint16_t GPIO_Pin)`**: 翻转 GPIO 引脚的电平。</u>

   **功能：** 这个函数用于快速切换指定 GPIO 引脚的输出电平。如果引脚当前是高电平，则将其设置为低电平；如果引脚当前是低电平，则将其设置为高电平。

   - **`GPIOx`**: GPIO 端口的基地址 (例如: `GPIOA`, `GPIOB`, `GPIOC` 等)。
   - **`GPIO_Pin`**: 要翻转电平的 GPIO 引脚 (例如: `GPIO_PIN_0`)。

5. <u>**`HAL_GPIO_LockPin(GPIO_TypeDef \*GPIOx, uint16_t GPIO_Pin)`**: 锁定 GPIO 引脚的配置。</u>

   - **`GPIOx`**: GPIO 端口的基地址 (例如: `GPIOA`, `GPIOB`, `GPIOC` 等)。
   - **`GPIO_Pin`**: 要锁定的 GPIO 引脚 (例如: `GPIO_PIN_0`)。

6. <u>**`HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)`**: GPIO 外部中断回调函数。</u>

   - **`GPIO_Pin`**: 触发中断的 GPIO 引脚 (例如: `GPIO_PIN_0`)。这个函数通常在 `stm32xxx_it.c` 文件中定义和使用，用于处理 GPIO 外部中断事件。

## UAST

### UAST知识

- **UART 的概念:** UART 是一种通用的串行通信协议，用于在两个设备之间进行异步数据传输。 异步意味着通信双方不需要共享一个时钟信号。
- UART 的特点:
  - **异步通信:** 不需要时钟线，通过起始位、数据位、校验位和停止位来同步数据。
  - **串行通信:** 数据一位一位地传输，只需要两根信号线 (TX 和 RX)。
  - **全双工通信:** 可以同时进行发送和接收。
  - **可配置的参数:** 可以配置波特率、数据位长度、校验位类型和停止位长度。
- UART 的主要参数:
  - **波特率 (Baud Rate):** 每秒传输的比特数，决定了数据传输的速度。 常用的波特率有 9600, 115200 等。
  - **数据位 (Data Bits):** 每个数据帧中包含的数据位数，通常为 5, 6, 7 或 8 位。
  - **校验位 (Parity Bit):** 用于检测数据传输过程中是否发生错误，可以是奇校验、偶校验或无校验。
  - **停止位 (Stop Bits):** 用于分隔不同的数据帧，通常为 1 或 2 位。
- UART 的工作原理:
  1. 发送数据:
     - 发送器在空闲状态下保持高电平。
     - 发送器发送一个起始位 (低电平)，表示数据传输开始。
     - 发送器按照配置的数据位长度、校验位类型和停止位长度发送数据。
     - 发送器发送一个停止位 (高电平)，表示数据传输结束。
  2. 接收数据:
     - 接收器在空闲状态下监听 RX 线上是否有起始位。
     - 当接收器检测到起始位时，开始按照配置的参数接收数据。
     - 接收器对接收到的数据进行校验，并去除起始位和停止位。
     - 接收器将接收到的数据传递给应用程序。
- **DMA (Direct Memory Access) 和 UART:** 可以使用 DMA 来实现 UART 的数据收发，从而减轻 CPU 的负担，提高数据传输效率。

### **UART 相关的 HAL 库函数：**

1. **`HAL_UART_Init(UART_HandleTypeDef \*huart)`**: 初始化 UART。
   - **`huart`**: 指向 `UART_HandleTypeDef` 结构体的指针，包含了 UART 的配置信息。
     - **`Instance`**: UART 外设的基地址 (例如: `USART1`, `USART2`, `USART3` 等)。
     - **`Init.BaudRate`**: 波特率 (例如: `115200`)。
     - **`Init.WordLength`**: 数据位长度 (例如: `UART_WORDLENGTH_8B` (8 位), `UART_WORDLENGTH_9B` (9 位))。
     - **`Init.Parity`**: 校验位类型 (例如: `UART_PARITY_NONE` (无校验), `UART_PARITY_EVEN` (偶校验), `UART_PARITY_ODD` (奇校验))。
     - **`Init.StopBits`**: 停止位长度 (例如: `UART_STOPBITS_1` (1 位), `UART_STOPBITS_2` (2 位))。
     - **`Init.Mode`**: UART 的模式 (例如: `UART_MODE_TX_RX` (发送和接收), `UART_MODE_TX` (仅发送), `UART_MODE_RX` (仅接收))。
     - **`Init.HwFlowCtl`**: 硬件流控制 (例如: `UART_HWCONTROL_NONE` (无硬件流控制), `UART_HWCONTROL_RTS` (RTS 流控制), `UART_HWCONTROL_CTS` (CTS 流控制), `UART_HWCONTROL_RTS_CTS` (RTS/CTS 流控制))。
     - **`Init.OverSampling`**: 过采样 (例如: `UART_OVERSAMPLING_16` (16 倍过采样), `UART_OVERSAMPLING_8` (8 倍过采样))。
2. <u>**`HAL_UART_Transmit(UART_HandleTypeDef \*huart, uint8_t \*pData, uint16_t Size, uint32_t Timeout)`**: 发送数据。</u>
   - **`huart`**: 指向 `UART_HandleTypeDef` 结构体的指针。
   - **`pData`**: 指向要发送的数据的指针。
   - **`Size`**: 要发送的数据的字节数。
   - **`Timeout`**: 超时时间 (单位: 毫秒)。
3. <u>**`HAL_UART_Receive(UART_HandleTypeDef \*huart, uint8_t \*pData, uint16_t Size, uint32_t Timeout)`**: 接收数据。</u>
   - **`huart`**: 指向 `UART_HandleTypeDef` 结构体的指针。
   - **`pData`**: 指向用于存储接收到的数据的缓冲区指针。
   - **`Size`**: 要接收的数据的字节数。
   - **`Timeout`**: 超时时间 (单位: 毫秒)。
4. <u>**`HAL_UART_Transmit_IT(UART_HandleTypeDef \*huart, uint8_t \*pData, uint16_t Size)`**: 中断方式发送数据。</u>
   - **`huart`**: 指向 `UART_HandleTypeDef` 结构体的指针。
   - **`pData`**: 指向要发送的数据的指针。
   - **`Size`**: 要发送的数据的字节数。
5. <u>**`HAL_UART_Receive_IT(UART_HandleTypeDef \*huart, uint8_t \*pData, uint16_t Size)`**: 中断方式接收数据。</u>
   - **`huart`**: 指向 `UART_HandleTypeDef` 结构体的指针。
   - **`pData`**: 指向用于存储接收到的数据的缓冲区指针。
   - **`Size`**: 要接收的数据的字节数。
6. <u>**`HAL_UART_Transmit_DMA(UART_HandleTypeDef \*huart, uint8_t \*pData, uint16_t Size)`**: DMA 方式发送数据。</u>
   - **`huart`**: 指向 `UART_HandleTypeDef` 结构体的指针。
   - **`pData`**: 指向要发送的数据的指针。
   - **`Size`**: 要发送的数据的字节数。
7. <u>**`HAL_UART_Receive_DMA(UART_HandleTypeDef \*huart, uint8_t \*pData, uint16_t Size)`**: DMA 方式接收数据。</u>
   - **`huart`**: 指向 `UART_HandleTypeDef` 结构体的指针。
   - **`pData`**: 指向用于存储接收到的数据的缓冲区指针。
   - **`Size`**: 要接收的数据的字节数。
8. <u>**`HAL_UART_IRQHandler(UART_HandleTypeDef \*huart)`**: UART 中断处理函数。</u>
   - **`huart`**: 指向 `UART_HandleTypeDef` 结构体的指针。
9. <u>**`HAL_UART_TxCpltCallback(UART_HandleTypeDef \*huart)`**: UART 发送完成回调函数 (中断或 DMA 方式发送完成时调用)。</u>
   - **`huart`**: 指向 `UART_HandleTypeDef` 结构体的指针。
10. <u>**`HAL_UART_RxCpltCallback(UART_HandleTypeDef \*huart)`**: UART 接收完成回调函数 (中断或 DMA 方式接收完成时调用)。</u>
    - **`huart`**: 指向 `UART_HandleTypeDef` 结构体的指针。
11. <u>**`HAL_UART_ErrorCallback(UART_HandleTypeDef \*huart)`**: UART 错误回调函数。</u>
    - **`huart`**: 指向 `UART_HandleTypeDef` 结构体的指针。

## I2C

### I2C 的知识

- **I2C 的概念:** I2C (Inter-Integrated Circuit) 是一种串行通信协议，用于在微控制器和外围设备之间进行**短距离、低速**的数据传输。 它只需要两根信号线：SDA (Serial Data Line) 和 SCL (Serial Clock Line)。
- I2C 的特点:
  - **双线制:** 只需要两根信号线 (SDA 和 SCL)。
  - **多主机:** 总线上可以有多个主机，但同一时刻只能有一个主机控制总线。
  - **寻址:** 每个 I2C 设备都有一个唯一的地址，主机通过地址来选择要通信的设备。
  - **半双工通信:** 同一时刻只能进行发送或接收，不能同时进行。
  - **速率:** 支持标准模式 (100 kHz)、快速模式 (400 kHz) 和高速模式 (3.4 MHz)。
- I2C 的主要参数:
  - **设备地址 (Device Address):** 每个 I2C 设备都有一个唯一的 7 位或 10 位地址。
  - **通信速率 (Clock Speed):** I2C 总线的时钟频率，常用的有 100 kHz 和 400 kHz。
  - **寻址模式 (Addressing Mode):** 7 位寻址或 10 位寻址。
  - **主/从模式 (Master/Slave Mode):** 设备作为主机 (Master) 或从机 (Slave) 工作。
- I2C 的工作原理:
  1. **起始信号 (Start Condition):** SCL 保持高电平，SDA 从高电平变为低电平。
  2. **地址帧 (Address Frame):** 主机发送 7 位或 10 位设备地址，以及一个读/写位 (R/W)。
  3. **应答信号 (Acknowledge Condition):** 从机在接收到地址帧后，如果地址匹配，则发送一个应答信号 (SDA 拉低)。
  4. **数据传输 (Data Transfer):** 主机或从机按照 8 位为一个字节进行数据传输。
  5. **停止信号 (Stop Condition):** SCL 保持高电平，SDA 从低电平变为高电平。
- **DMA (Direct Memory Access) 和 I2C:** 可以使用 DMA 来实现 I2C 的数据收发，从而减轻 CPU 的负担，提高数据传输效率。

**I2C 相关的 HAL 库函数：**

1. **`HAL_I2C_Init(I2C_HandleTypeDef \*hi2c)`**: 初始化 I2C。

   - **`hi2c`**: 指向 `I2C_HandleTypeDef` 结构体的指针，包含了 I2C 的配置信息。
     - **`Instance`**: I2C 外设的基地址 (例如: `I2C1`, `I2C2`, `I2C3` 等)。
     - **`Init.ClockSpeed`**: 时钟频率 (例如: `100000` (100 kHz), `400000` (400 kHz))。
     - **`Init.DutyCycle`**: 占空比 (仅在快速模式下有效，例如: `I2C_DUTYCYCLE_2` (50% 占空比), `I2C_DUTYCYCLE_16_9` (约 56% 占空比))。
     - **`Init.OwnAddress1`**: 主机自己的设备地址 (7 位)。
     - **`Init.AddressingMode`**: 寻址模式 (例如: `I2C_ADDRESSINGMODE_7BIT`, `I2C_ADDRESSINGMODE_10BIT`)。
     - **`Init.DualAddressMode`**: 双地址模式使能 (例如: `I2C_DUALADDRESS_DISABLE`, `I2C_DUALADDRESS_ENABLE`)。
     - **`Init.OwnAddress2`**: 第二个设备地址 (如果使能了双地址模式)。
     - **`Init.GeneralCallMode`**: 通用呼叫模式使能 (例如: `I2C_GENERALCALL_DISABLE`, `I2C_GENERALCALL_ENABLE`)。
     - **`Init.NoStretchMode`**: 时钟延长模式使能 (例如: `I2C_NOSTRETCH_DISABLE`, `I2C_NOSTRETCH_ENABLE`)。
     - **`Init.dma_handle`**: DMA句柄

2. <u>**`HAL_I2C_Master_Transmit(I2C_HandleTypeDef \*hi2c, uint16_t DevAddress, uint8_t \*pData, uint16_t Size, uint32_t Timeout)`**: 主机发送数据。</u>

   - **`hi2c`**: 指向 `I2C_HandleTypeDef` 结构体的指针。
   - **`DevAddress`**: 从机设备地址 (7 位地址左移一位，例如: `0x68 << 1`)。 也可以包含 R/W 位，但通常 HAL 库会自动处理 R/W 位。
   - **`pData`**: 指向要发送的数据的指针。
   - **`Size`**: 要发送的数据的字节数。
   - **`Timeout`**: 超时时间 (单位: 毫秒)。

3. <u>**`HAL_I2C_Master_Receive(I2C_HandleTypeDef \*hi2c, uint16_t DevAddress, uint8_t \*pData, uint16_t Size, uint32_t Timeout)`**: 主机接收数据。</u>

   - **`hi2c`**: 指向 `I2C_HandleTypeDef` 结构体的指针。
   - **`DevAddress`**: 从机设备地址 (7 位地址左移一位，例如: `0x68 << 1`)。 也可以包含 R/W 位，但通常 HAL 库会自动处理 R/W 位。
   - **`pData`**: 指向用于存储接收到的数据的缓冲区指针。
   - **`Size`**: 要接收的数据的字节数。
   - **`Timeout`**: 超时时间 (单位: 毫秒)。

4. <u>**`HAL_I2C_Mem_Write(I2C_HandleTypeDef \*hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint8_t \*pData, uint16_t Size, uint32_t Timeout)`**: 主机向从机的指定内存地址写入数据。</u>

   - **`hi2c`**: 指向 `I2C_HandleTypeDef` 结构体的指针。
   - **`DevAddress`**: 从机设备地址 (7 位地址左移一位，例如: `0x68 << 1`)。
   - **`MemAddress`**: 从机的内存地址。
   - **`MemAddSize`**: 内存地址的大小 (例如: `I2C_MEMADD_SIZE_8BIT` (8 位), `I2C_MEMADD_SIZE_16BIT` (16 位))。
   - **`pData`**: 指向要发送的数据的指针。
   - **`Size`**: 要发送的数据的字节数。
   - **`Timeout`**: 超时时间 (单位: 毫秒)。

5. <u>**`HAL_I2C_Mem_Read(I2C_HandleTypeDef \*hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint8_t \*pData, uint16_t Size, uint32_t Timeout)`**: 主机从从机的指定内存地址读取数据。</u>

   - **`hi2c`**: 指向 `I2C_HandleTypeDef` 结构体的指针。
   - **`DevAddress`**: 从机设备地址 (7 位地址左移一位，例如: `0x68 << 1`)。
   - **`MemAddress`**: 从机的内存地址。
   - **`MemAddSize`**: 内存地址的大小 (例如: `I2C_MEMADD_SIZE_8BIT` (8 位), `I2C_MEMADD_SIZE_16BIT` (16 位))。
   - **`pData`**: 指向用于存储接收到的数据的缓冲区指针。
   - **`Size`**: 要接收的数据的字节数。
   - **`Timeout`**: 超时时间 (单位: 毫秒)。

6. **中断和DMA函数：** HAL 库还提供了一系列中断和 DMA 相关的函数，例如 `HAL_I2C_Master_Transmit_IT()`, `HAL_I2C_Master_Receive_IT()`, `HAL_I2C_Master_Transmit_DMA()`, `HAL_I2C_Master_Receive_DMA()`, `HAL_I2C_IRQHandler()`, `HAL_I2C_MemTxCpltCallback()`, `HAL_I2C_MemRxCpltCallback()`, `HAL_I2C_ErrorCallback()` 等，用于实现 I2C 的中断和 DMA 传输。 这些函数的使用方式与 UART 类似，需要配置中断优先级和 DMA 通道。

   ## 时钟

   

   **STM32F103 的时钟源：**

   STM32F103 有多个时钟源，包括：

   - **HSI (High-Speed Internal):** 内部高速 RC 振荡器，频率为 8 MHz。 启动速度快，但精度较低，受温度和电压影响较大。 通常作为系统复位后的默认时钟源。
   - **HSE (High-Speed External):** 外部高速晶体振荡器，频率通常为 4 MHz 到 16 MHz。 精度较高，受温度和电压影响较小，但启动速度较慢。
   - **LSI (Low-Speed Internal):** 内部低速 RC 振荡器，频率为 40 kHz。 主要用于独立看门狗 (IWDG) 和实时时钟 (RTC)。
   - **LSE (Low-Speed External):** 外部低速晶体振荡器，频率为 32.768 kHz。 主要用于 RTC，提供精确的时钟源。
   - **PLL (Phase-Locked Loop):** 锁相环，可以将 HSI 或 HSE 倍频，提供更高的系统时钟频率。

   **STM32F103 的时钟树：**

   STM32F103 的时钟树比较复杂，包括：

   - **SYSCLK (System Clock):** 系统时钟，是 CPU、存储器和大部分外设的时钟源。
   - **HCLK (AHB Clock):** AHB 总线时钟，是连接 CPU、存储器和 DMA 控制器的总线时钟。
   - **PCLK1 (APB1 Clock):** APB1 总线时钟，是连接低速外设 (例如：定时器、UART、I2C、USB) 的总线时钟。
   - **PCLK2 (APB2 Clock):** APB2 总线时钟，是连接高速外设 (例如：GPIO、ADC、SPI、TIM1) 的总线时钟。
   - **ADC 时钟:** ADC 的时钟源，可以从 PCLK2 分频得到。
   - **USB 时钟:** USB 的时钟源，需要精确的 48 MHz 时钟。

   **CubeMX 时钟系统配置步骤 (以 STM32F103 为例):**

   1. 选择时钟源:
      - 在 CubeMX 的 "Clock Configuration" 选项卡中，选择合适的时钟源作为 SYSCLK 的来源。 通常选择 HSE 作为时钟源，可以提供更高的精度和稳定性。 如果选择 HSE，需要配置外部晶振的频率。
   2. 配置 PLL (如果需要):
      - 如果需要更高的系统时钟频率，可以使用 PLL 将 HSE 或 HSI 倍频。 在 CubeMX 中，可以配置 PLL 的输入时钟源、倍频系数和分频系数。
      - 需要注意的是，STM32F103 的最大系统时钟频率为 72 MHz。
   3. 配置时钟分频系数:
      - 配置 AHB、APB1 和 APB2 总线的时钟分频系数。 可以选择 1、2、4、8 或 16 分频。
      - 需要注意的是，APB1 总线的时钟频率不能超过 36 MHz。
   4. 配置外设时钟:
      - 根据外设的需求，配置外设的时钟源和分频系数。 例如，ADC 的时钟源可以选择 PCLK2，并配置合适的分频系数。
      - USB 时钟需要精确的 48 MHz 时钟，可以通过配置 PLL 和 USB 预分频器得到。
   5. 使能时钟输出 (MCO):
      - 可以将某个时钟源输出到 MCO 引脚，用于外部测量或调试。 在 CubeMX 中，可以选择要输出的时钟源和分频系数。

   **CubeMX 时钟配置界面：**

   CubeMX 的时钟配置界面以图形化的方式展示了时钟树，可以直观地了解时钟的流向和频率。 在界面上可以：

   - 选择时钟源。

   - 配置 PLL 参数。

   - 配置时钟分频系数。

   - 查看各个时钟的频率。

   - 检查时钟配置是否正确。

     ### SPI

     ### SPI 的知识

     - **SPI 的概念:** SPI (Serial Peripheral Interface) 串行外设接口，是一种同步、高速、全双工的串行通信协议，用于在微控制器和外围设备之间进行数据传输。
     - SPI 的特点:
       - **同步通信:** 需要时钟线 (SCK)，通信双方在时钟信号的同步下进行数据传输。
       - **全双工通信:** 可以同时进行发送和接收。
       - **高速通信:** SPI 的传输速率通常比 I2C 和 UART 高。
       - **主从模式:** SPI 通信需要一个主机 (Master) 和一个或多个从机 (Slave)。
       - **四根信号线:** 通常需要四根信号线 (MOSI, MISO, SCK, NSS/CS)。
     - SPI 的主要信号线:
       - **MOSI (Master Output Slave Input):** 主机输出，从机输入，主机向从机发送数据。
       - **MISO (Master Input Slave Output):** 主机输入，从机输出，从机向主机发送数据。
       - **SCK (Serial Clock):** 时钟信号，由主机产生，用于同步数据传输。
       - **NSS/CS (Slave Select/Chip Select):** 从机选择信号，由主机控制，用于选择要通信的从机。
     - SPI 的工作模式:
       - SPI 有四种工作模式，由时钟极性 (CPOL) 和时钟相位 (CPHA) 决定。
         - **模式 0:** CPOL = 0, CPHA = 0 (SCK 空闲时为低电平，在 SCK 的上升沿采样数据)
         - **模式 1:** CPOL = 0, CPHA = 1 (SCK 空闲时为低电平，在 SCK 的下降沿采样数据)
         - **模式 2:** CPOL = 1, CPHA = 0 (SCK 空闲时为高电平，在 SCK 的下降沿采样数据)
         - **模式 3:** CPOL = 1, CPHA = 1 (SCK 空闲时为高电平，在 SCK 的上升沿采样数据)
       - 主机和从机必须使用相同的工作模式才能进行正常通信。
     - SPI 的数据帧格式:
       - SPI 的数据帧格式由主机配置，可以配置数据位的长度 (通常为 8 位或 16 位)。
       - 数据传输时，可以先发送最高有效位 (MSB) 或最低有效位 (LSB)。
     - **DMA (Direct Memory Access) 和 SPI:** 可以使用 DMA 来实现 SPI 的数据收发，从而减轻 CPU 的负担，提高数据传输效率。

     ### SPI 相关的 HAL 库函数

     1. **`HAL_SPI_Init(SPI_HandleTypeDef \*hspi)`**: 初始化 SPI。

        - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针，包含了 SPI 的配置信息。
          - **`Instance`**: SPI 外设的基地址 (例如: `SPI1`, `SPI2`, `SPI3` 等)。
          - **`Init.Mode`**: SPI 的模式 (例如: `SPI_MODE_MASTER` (主机), `SPI_MODE_SLAVE` (从机))。
          - **`Init.Direction`**: 数据传输方向 (例如: `SPI_DIRECTION_2LINES` (全双工), `SPI_DIRECTION_2LINES_RXONLY` (只接收), `SPI_DIRECTION_1LINE` (单线))。
          - **`Init.DataSize`**: 数据位长度 (例如: `SPI_DATASIZE_8BIT`, `SPI_DATASIZE_16BIT`)。
          - **`Init.CLKPolarity`**: 时钟极性 (例如: `SPI_POLARITY_LOW` (CPOL = 0), `SPI_POLARITY_HIGH` (CPOL = 1))。
          - **`Init.CLKPhase`**: 时钟相位 (例如: `SPI_PHASE_1EDGE` (CPHA = 0), `SPI_PHASE_2EDGE` (CPHA = 1))。
          - **`Init.NSS`**: NSS 信号管理 (例如: `SPI_NSS_HARD_OUTPUT` (硬件 NSS 输出), `SPI_NSS_HARD_INPUT` (硬件 NSS 输入), `SPI_NSS_SOFT` (软件 NSS 管理))。
          - **`Init.BaudRatePrescaler`**: 波特率预分频器 (例如: `SPI_BAUDRATEPRESCALER_2`, `SPI_BAUDRATEPRESCALER_4`, `SPI_BAUDRATEPRESCALER_8` 等)。
          - **`Init.FirstBit`**: 数据传输顺序 (例如: `SPI_FIRSTBIT_MSB` (MSB 先发送), `SPI_FIRSTBIT_LSB` (LSB 先发送))。
          - **`Init.TIMode`**: TI 模式使能 (例如: `SPI_TIMODE_DISABLE`, `SPI_TIMODE_ENABLE`)。
          - **`Init.CRCCalculation`**: CRC 校验使能 (例如: `SPI_CRCCALCULATION_DISABLE`, `SPI_CRCCALCULATION_ENABLE`)。
          - **`Init.CRCPolynomial`**: CRC 校验多项式。

     2. **`HAL_SPI_Transmit(SPI_HandleTypeDef \*hspi, uint8_t \*pData, uint16_t Size, uint32_t Timeout)`**: 发送数据。

        - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。
        - **`pData`**: 指向要发送的数据的指针。
        - **`Size`**: 要发送的数据的字节数。
        - **`Timeout`**: 超时时间 (单位: 毫秒)。

     3. **`HAL_SPI_Receive(SPI_HandleTypeDef \*hspi, uint8_t \*pData, uint16_t Size, uint32_t Timeout)`**: 接收数据。

        - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。
        - **`pData`**: 指向用于存储接收到的数据的缓冲区指针。
        - **`Size`**: 要接收的数据的字节数。
        - **`Timeout`**: 超时时间 (单位: 毫秒)。

     4. **`HAL_SPI_TransmitReceive(SPI_HandleTypeDef \*hspi, uint8_t \*pTxData, uint8_t \*pRxData, uint16_t Size, uint32_t Timeout)`**: 发送和接收数据。

        - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。
        - **`pTxData`**: 指向要发送的数据的指针。
        - **`pRxData`**: 指向用于存储接收到的数据的缓冲区指针。
        - **`Size`**: 要发送和接收的数据的字节数。
        - **`Timeout`**: 超时时间 (单位: 毫秒)。

     5. **`HAL_SPI_Transmit_IT(SPI_HandleTypeDef \*hspi, uint8_t \*pData, uint16_t Size)`**: 中断方式发送数据。

        - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。
        - **`pData`**: 指向要发送的数据的指针。
        - **`Size`**: 要发送的数据的字节数。

     6. **`HAL_SPI_Receive_IT(SPI_HandleTypeDef \*hspi, uint8_t \*pData, uint16_t Size)`**: 中断方式接收数据。

        - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。
        - **`pData`**: 指向用于存储接收到的数据的缓冲区指针。
        - **`Size`**: 要接收的数据的字节数。

     7. **`HAL_SPI_TransmitReceive_IT(SPI_HandleTypeDef \*hspi, uint8_t \*pTxData, uint8_t \*pRxData, uint16_t Size)`**: 中断方式发送和接收数据。

        - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。
        - **`pTxData`**: 指向要发送的数据的指针。
        - **`pRxData`**: 指向用于存储接收到的数据的缓冲区指针。
        - **`Size`**: 要发送和接收的数据的字节数。

     8. **`HAL_SPI_Transmit_DMA(SPI_HandleTypeDef \*hspi, uint8_t \*pData, uint16_t Size)`**: DMA 方式发送数据。

        - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。
        - **`pData`**: 指向要发送的数据的指针。
        - **`Size`**: 要发送的数据的字节数。

     9. **`HAL_SPI_Receive_DMA(SPI_HandleTypeDef \*hspi, uint8_t \*pData, uint16_t Size)`**: DMA 方式接收数据。

        - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。
        - **`pData`**: 指向用于存储接收到的数据的缓冲区指针。
        - **`Size`**: 要接收的数据的字节数。

     10. **`HAL_SPI_TransmitReceive_DMA(SPI_HandleTypeDef \*hspi, uint8_t \*pTxData, uint8_t \*pRxData, uint16_t Size)`**: DMA 方式发送和接收数据。

         - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。
         - **`pTxData`**: 指向要发送的数据的指针。
         - **`pRxData`**: 指向用于存储接收到的数据的缓冲区指针。
         - **`Size`**: 要发送和接收的数据的字节数。

     11. **`HAL_SPI_IRQHandler(SPI_HandleTypeDef \*hspi)`**: SPI 中断处理函数。

         - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。

     12. **`HAL_SPI_TxCpltCallback(SPI_HandleTypeDef \*hspi)`**: SPI 发送完成回调函数 (中断或 DMA 方式发送完成时调用)。

         - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。

     13. **`HAL_SPI_RxCpltCallback(SPI_HandleTypeDef \*hspi)`**: SPI 接收完成回调函数 (中断或 DMA 方式接收完成时调用)。

         - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。

     14. **`HAL_SPI_TxRxCpltCallback(SPI_HandleTypeDef \*hspi)`**: SPI 发送和接收完成回调函数 (中断或 DMA 方式发送和接收完成时调用)。

         - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。

     15. **`HAL_SPI_ErrorCallback(SPI_HandleTypeDef \*hspi)`**: SPI 错误回调函数。

         - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。

         ## 中断

         ### 中断知识点

         - **中断的概念:** 中断是一种允许外设或软件事件打断 CPU 正常执行流程的机制。 当中断发生时，CPU 会暂停当前正在执行的任务，转而执行中断服务例程 (ISR)，处理完中断事件后再返回到被打断的任务继续执行。
         - 中断的类型:
           - **外部中断 (External Interrupt):** 由外部设备触发的中断，例如 GPIO 引脚电平变化、外部传感器信号等。
           - **内部中断 (Internal Interrupt):** 由 STM32 内部外设触发的中断，例如定时器溢出、UART 接收完成、ADC 转换完成等。
           - **系统中断 (System Interrupt):** 由 Cortex-M3 内核提供的中断，例如 SysTick 定时器中断、PendSV 中断等。
         - 中断的优先级:
           - STM32 使用嵌套向量中断控制器 (NVIC) 来管理中断的优先级。
           - 每个中断都有一个优先级，优先级高的中断可以抢占优先级低的中断。
           - 可以配置中断的抢占优先级和子优先级，以实现更灵活的中断管理。
         - **NVIC (Nested Vectored Interrupt Controller):** 嵌套向量中断控制器，是 Cortex-M3 内核的一部分，负责管理中断的优先级和使能。
         - **中断向量表:** 存储中断服务例程地址的表格。 当中断发生时，CPU 会根据中断向量表找到对应的中断服务例程并执行。
         - **中断服务例程 (ISR):** 处理中断事件的函数。 ISR 应该尽可能短小精悍，避免长时间占用 CPU 资源。
         - 中断处理流程:
           1. 中断源产生中断请求。
           2. NVIC 检测到中断请求。
           3. 如果中断被使能且优先级高于当前正在执行的任务，则 CPU 暂停当前任务，跳转到中断向量表找到对应的 ISR。
           4. CPU 执行 ISR，处理中断事件。
           5. ISR 执行完毕后，CPU 返回到被打断的任务继续执行。

         ### **中断相关的 HAL 库函数：**

         1. **`HAL_NVIC_SetPriority(IRQn_Type IRQn, uint32_t PreemptPriority, uint32_t SubPriority)`**: 设置中断优先级。

            - **`IRQn`**: 中断号，例如 `USART1_IRQn`, `TIM2_IRQn`, `EXTI0_IRQn` 等。
            - **`PreemptPriority`**: 抢占优先级，范围为 0 到 15 (数值越小，优先级越高)。
            - **`SubPriority`**: 子优先级，范围为 0 到 15 (数值越小，优先级越高)。

         2. **`HAL_NVIC_EnableIRQ(IRQn_Type IRQn)`**: 使能中断。

            - **`IRQn`**: 中断号，例如 `USART1_IRQn`, `TIM2_IRQn`, `EXTI0_IRQn` 等。

         3. **`HAL_NVIC_DisableIRQ(IRQn_Type IRQn)`**: 禁用中断。

            - **`IRQn`**: 中断号，例如 `USART1_IRQn`, `TIM2_IRQn`, `EXTI0_IRQn` 等。

         4. **`HAL_GPIO_EXTI_IRQHandler(uint16_t GPIO_Pin)`**: GPIO 外部中断处理函数。

            - **`GPIO_Pin`**: 触发中断的 GPIO 引脚 (例如: `GPIO_PIN_0`)。

         5. **`HAL_UART_IRQHandler(UART_HandleTypeDef \*huart)`**: UART 中断处理函数。

            - **`huart`**: 指向 `UART_HandleTypeDef` 结构体的指针。

         6. **`HAL_SPI_IRQHandler(SPI_HandleTypeDef \*hspi)`**: SPI 中断处理函数。

            - **`hspi`**: 指向 `SPI_HandleTypeDef` 结构体的指针。

         7. **`HAL_I2C_EV_IRQHandler(I2C_HandleTypeDef \*hi2c)`**: I2C 事件中断处理函数。

            - **`hi2c`**: 指向 `I2C_HandleTypeDef` 结构体的指针。

         8. **`HAL_I2C_ER_IRQHandler(I2C_HandleTypeDef \*hi2c)`**: I2C 错误中断处理函数。

            - **`hi2c`**: 指向 `I2C_HandleTypeDef` 结构体的指针。

         9. **回调函数 (Callback Functions):**

            - HAL 库使用回调函数来处理中断事件。 当中断发生时，HAL 库会调用相应的回调函数，开发者需要在回调函数中编写中断处理代码。

            - 常用的回调函数包括：

              - `HAL_GPIO_EXTI_Callback()`: GPIO 外部中断回调函数。
              - `HAL_UART_TxCpltCallback()`: UART 发送完成回调函数。
              - `HAL_UART_RxCpltCallback()`: UART 接收完成回调函数。
              - `HAL_SPI_TxCpltCallback()`: SPI 发送完成回调函数。
              - `HAL_SPI_RxCpltCallback()`: SPI 接收完成回调函数。
              - `HAL_I2C_MemTxCpltCallback()`: I2C 内存写入完成回调函数。
              - `HAL_I2C_MemRxCpltCallback()`: I2C 内存读取完成回调函数。
              - `HAL_TIM_PeriodElapsedCallback()`: 定时器周期溢出回调函数。

              ## 定时器

              ### 定时器的知识

              - **定时器的概念:** 定时器是一种用于测量时间间隔或在特定时间执行操作的外设。 STM32 具有多种类型的定时器，包括基本定时器、通用定时器和高级定时器。
              - 定时器的类型:
                - **基本定时器 (Basic Timer):** 例如 TIM6 和 TIM7，主要用于生成简单的定时中断。
                - **通用定时器 (General Purpose Timer):** 例如 TIM2、TIM3、TIM4 和 TIM5，具有更多的功能，例如输入捕获、输出比较、PWM 生成等。
                - **高级定时器 (Advanced Timer):** 例如 TIM1 和 TIM8，具有最丰富的功能，例如互补 PWM 输出、死区时间控制、刹车输入等，适用于电机控制等应用。
              - 定时器的主要参数:
                - **预分频器 (Prescaler):** 用于对定时器的时钟进行分频，降低定时器的计数频率。
                - **计数模式 (Counter Mode):** 定时器的计数方式，包括向上计数、向下计数和中央对齐计数。
                - **自动重载值 (Auto-Reload Value):** 定时器计数器的最大值。 当计数器达到自动重载值时，会触发溢出中断，并重新从 0 开始计数。
                - **时钟源 (Clock Source):** 定时器的时钟源，通常来自内部时钟 (例如 PCLK1 或 PCLK2) 或外部时钟。
                - **中断使能 (Interrupt Enable):** 使能定时器的中断，例如更新中断 (Update Interrupt)、捕获中断 (Capture Interrupt)、比较中断 (Compare Interrupt) 等。
              - 定时器的主要功能:
                - **定时中断 (Time Base Generation):** 定时器周期性地产生中断，用于执行定时任务。
                - **输入捕获 (Input Capture):** 定时器记录外部信号的上升沿或下降沿的时间，用于测量脉冲宽度、频率等。
                - **输出比较 (Output Compare):** 当定时器的计数器值与比较寄存器的值相等时，定时器输出一个信号，用于生成 PWM 波形、控制外部设备等。
                - **PWM (Pulse Width Modulation) 生成:** 定时器生成 PWM 波形，用于控制 LED 亮度、电机速度等。
                - **单脉冲模式 (One-Pulse Mode):** 定时器只产生一个脉冲，用于触发外部事件。
                - **编码器接口 (Encoder Interface):** 定时器可以连接到增量式编码器，用于测量旋转物体的速度和方向。

              ### **定时器相关的 HAL 库函数：**

              1. **`HAL_TIM_Base_Init(TIM_HandleTypeDef \*htim)`**: 初始化定时器基本功能 (时基)。

                 - **`htim`**: 指向 `TIM_HandleTypeDef` 结构体的指针，包含了定时器的配置信息。
                   - **`Instance`**: 定时器的基地址 (例如: `TIM1`, `TIM2`, `TIM3` 等)。
                   - **`Init.Prescaler`**: 预分频器值 (范围为 0 到 65535)。
                   - **`Init.CounterMode`**: 计数模式 (例如: `TIM_COUNTERMODE_UP` (向上计数), `TIM_COUNTERMODE_DOWN` (向下计数), `TIM_COUNTERMODE_CENTERALIGNED1` (中央对齐模式 1), `TIM_COUNTERMODE_CENTERALIGNED2` (中央对齐模式 2), `TIM_COUNTERMODE_CENTERALIGNED3` (中央对齐模式 3))。
                   - **`Init.Period`**: 自动重载值 (范围为 0 到 65535)。
                   - **`Init.ClockDivision`**: 时钟分频 (例如: `TIM_CLOCKDIVISION_DIV1`, `TIM_CLOCKDIVISION_DIV2`, `TIM_CLOCKDIVISION_DIV4`)。
                   - **`Init.RepetitionCounter`**: 重复计数器 (仅适用于高级定时器)。
                   - **`Init.AutoReloadPreload`**: 自动重载预装载使能(例如：`TIM_AUTORELOAD_PRELOAD_DISABLE`, `TIM_AUTORELOAD_PRELOAD_ENABLE`)

              2. **`HAL_TIM_Base_Start(TIM_HandleTypeDef \*htim)`**: 启动定时器。

                 - **`htim`**: 指向 `TIM_HandleTypeDef` 结构体的指针。

              3. **`HAL_TIM_Base_Stop(TIM_HandleTypeDef \*htim)`**: 停止定时器。

                 - **`htim`**: 指向 `TIM_HandleTypeDef` 结构体的指针。

              4. **`HAL_TIM_Base_Start_IT(TIM_HandleTypeDef \*htim)`**: 启动定时器，并使能更新中断 (Update Interrupt)。

                 - **`htim`**: 指向 `TIM_HandleTypeDef` 结构体的指针。

              5. **`HAL_TIM_Base_Stop_IT(TIM_HandleTypeDef \*htim)`**: 停止定时器，并禁用更新中断。

                 - **`htim`**: 指向 `TIM_HandleTypeDef` 结构体的指针。

              6. **`HAL_TIM_IRQHandler(TIM_HandleTypeDef \*htim)`**: 定时器中断处理函数。

                 - **`htim`**: 指向 `TIM_HandleTypeDef` 结构体的指针。

              7. **`HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef \*htim)`**: 定时器周期溢出回调函数。

                 - **`htim`**: 指向 `TIM_HandleTypeDef` 结构体的指针。

              8. **PWM 相关函数:**

                 - `HAL_TIM_PWM_Init()`: 初始化 PWM 功能。
                 - `HAL_TIM_PWM_Start()`: 启动 PWM 输出。
                 - `HAL_TIM_PWM_Stop()`: 停止 PWM 输出。
                 - `HAL_TIM_PWM_Start_IT()`: 启动 PWM 输出，并使能中断。
                 - `HAL_TIM_PWM_Stop_IT()`: 停止 PWM 输出，并禁用中断。
                 - `HAL_TIM_PWM_ConfigChannel()`: 配置 PWM 通道。
                 - `HAL_TIM_OC_ConfigChannel()`: 配置输出比较通道
                 - `__HAL_TIM_SET_COMPARE()`: 设置比较寄存器的值，用于控制 PWM 的占空比。

              9. **输入捕获相关函数:**

                 - `HAL_TIM_IC_Init()`: 初始化输入捕获功能。
                 - `HAL_TIM_IC_Start()`: 启动输入捕获。
                 - `HAL_TIM_IC_Stop()`: 停止输入捕获。
                 - `HAL_TIM_IC_Start_IT()`: 启动输入捕获，并使能中断。
                 - `HAL_TIM_IC_Stop_IT()`: 停止输入捕获，并禁用中断。
                 - `HAL_TIM_IC_CaptureCallback()`: 输入捕获回调函数。
                 - `HAL_TIM_IC_ConfigChannel()`: 配置输入捕获通道。

                 ## ADC

                 ### ADC 的知识

                 - **ADC 的概念:** ADC (Analog-to-Digital Converter) 模数转换器，是一种将模拟信号转换为数字信号的器件。 STM32 具有多个 ADC，可以用于采集各种模拟信号，例如电压、电流、温度等。
                 - ADC 的主要参数:
                   - **分辨率 (Resolution):** ADC 可以输出的数字信号的位数，例如 12 位 ADC 可以输出 0 到 4095 的数字值。
                   - **转换时间 (Conversion Time):** ADC 完成一次转换所需的时间。
                   - **采样率 (Sampling Rate):** ADC 每秒钟可以完成的转换次数。
                   - **输入电压范围 (Input Voltage Range):** ADC 可以接受的模拟信号的电压范围。
                   - **参考电压 (Reference Voltage):** ADC 的参考电压，用于确定 ADC 的量程。
                   - **通道 (Channel):** ADC 可以采集的模拟信号的输入通道。
                 - ADC 的工作模式:
                   - **单次转换模式 (Single Conversion Mode):** ADC 只进行一次转换，然后停止。
                   - **连续转换模式 (Continuous Conversion Mode):** ADC 连续进行转换，直到停止。
                   - **扫描模式 (Scan Mode):** ADC 按照预定的顺序扫描多个通道。
                   - **间断模式 (Discontinuous Mode):** ADC 在扫描模式下，每次只转换一个或几个通道，然后停止，等待下一次触发。
                 - ADC 的触发源:
                   - **软件触发 (Software Trigger):** 通过软件指令启动 ADC 转换。
                   - **外部触发 (External Trigger):** 通过外部信号 (例如定时器输出) 启动 ADC 转换。
                 - **DMA (Direct Memory Access) 和 ADC:** 可以使用 DMA 来实现 ADC 的数据采集，从而减轻 CPU 的负担，提高数据采集效率。

                 ### **ADC 相关的 HAL 库函数：**

                 1. **`HAL_ADC_Init(ADC_HandleTypeDef \*hadc)`**: 初始化 ADC。
                    - **`hadc`**: 指向 `ADC_HandleTypeDef` 结构体的指针，包含了 ADC 的配置信息。
                      - **`Instance`**: ADC 的基地址 (例如: `ADC1`, `ADC2`, `ADC3` 等)。
                      - **`Init.DataAlign`**: 数据对齐方式 (例如: `ADC_DATAALIGN_RIGHT` (右对齐), `ADC_DATAALIGN_LEFT` (左对齐))。
                      - **`Init.ScanConvMode`**: 扫描模式使能 (例如: `ADC_SCAN_DISABLE`, `ADC_SCAN_ENABLE`)。
                      - **`Init.ContinuousConvMode`**: 连续转换模式使能 (例如: `ADC_CONTINUOUS_DISABLE`, `ADC_CONTINUOUS_ENABLE`)。
                      - **`Init.NbrOfConversion`**: 转换通道的数量 (仅在扫描模式下有效)。
                      - **`Init.DiscontinuousConvMode`**: 间断模式使能 (例如: `ADC_DISCONTINUOUS_DISABLE`, `ADC_DISCONTINUOUS_ENABLE`)。
                      - **`Init.NbrOfDiscConversion`**: 间断模式下转换的通道数量 (仅在间断模式下有效)。
                      - **`Init.ExternalTrigConv`**: 外部触发源 (例如: `ADC_EXTERNALTRIGCONV_T2_TRGO` (定时器 2 触发), `ADC_SOFTWARE_START` (软件触发))。
                      - **`Init.ExternalTrigConvEdge`**: 外部触发边沿 (例如: `ADC_EXTERNALTRIGCONVEDGE_NONE` (无触发), `ADC_EXTERNALTRIGCONVEDGE_RISING` (上升沿触发), `ADC_EXTERNALTRIGCONVEDGE_FALLING` (下降沿触发), `ADC_EXTERNALTRIGCONVEDGE_RISINGFALLING` (双边沿触发))。
                      - **`Init.DMAContinuousRequests`**: DMA 连续请求使能 (例如: `DISABLE`, `ENABLE`)。
                      - **`Init.EOCSelection`**: EOC (End of Conversion) 选择 (例如: `ADC_EOC_SINGLE`, `ADC_EOC_SEQ_CONV`)。
                 2. **`HAL_ADC_ConfigChannel(ADC_HandleTypeDef \*hadc, ADC_ChannelConfTypeDef \*sConfig)`**: 配置 ADC 通道。
                    - **`hadc`**: 指向 `ADC_HandleTypeDef` 结构体的指针。
                    - **`sConfig`**: 指向 `ADC_ChannelConfTypeDef` 结构体的指针，包含了 ADC 通道的配置信息。
                      - **`Channel`**: ADC 通道 (例如: `ADC_CHANNEL_0`, `ADC_CHANNEL_1`, `ADC_CHANNEL_2` 等)。
                      - **`Rank`**: 通道的转换顺序 (仅在扫描模式下有效)。
                      - **`SamplingTime`**: 采样时间 (例如: `ADC_SAMPLETIME_1CYCLE_5`, `ADC_SAMPLETIME_7CYCLES_5`, `ADC_SAMPLETIME_13CYCLES_5` 等)。
                 3. **`HAL_ADC_Start(ADC_HandleTypeDef \*hadc)`**: 启动 ADC 转换。
                    - **`hadc`**: 指向 `ADC_HandleTypeDef` 结构体的指针。
                 4. **`HAL_ADC_Stop(ADC_HandleTypeDef \*hadc)`**: 停止 ADC 转换。
                    - **`hadc`**: 指向 `ADC_HandleTypeDef` 结构体的指针。
                 5. **`HAL_ADC_GetValue(ADC_HandleTypeDef \*hadc)`**: 获取 ADC 转换结果。
                    - **`hadc`**: 指向 `ADC_HandleTypeDef` 结构体的指针。
                    - **返回值**: ADC 转换结果 (uint32_t 类型)。
                 6. **`HAL_ADC_Start_IT(ADC_HandleTypeDef \*hadc)`**: 启动 ADC 转换，并使能中断。
                    - **`hadc`**: 指向 `ADC_HandleTypeDef` 结构体的指针。
                 7. **`HAL_ADC_Stop_IT(ADC_HandleTypeDef \*hadc)`**: 停止 ADC 转换，并禁用中断。
                    - **`hadc`**: 指向 `ADC_HandleTypeDef` 结构体的指针。
                 8. **`HAL_ADC_IRQHandler(ADC_HandleTypeDef \*hadc)`**: ADC 中断处理函数。
                    - **`hadc`**: 指向 `ADC_HandleTypeDef` 结构体的指针。
                 9. **`HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef \*hadc)`**: ADC 转换完成回调函数。
                    - **`hadc`**: 指向 `ADC_HandleTypeDef` 结构体的指针。
                 10. **`HAL_ADC_ErrorCallback(ADC_HandleTypeDef \*hadc)`**: ADC 错误回调函数。
                     - **`hadc`**: 指向 `ADC_HandleTypeDef` 结构体的指针。
                 11. **`HAL_ADC_Start_DMA(ADC_HandleTypeDef \*hadc, uint32_t \*pData, uint32_t Length)`**: 启动 ADC 转换，并使用 DMA 传输数据。
                     - **`hadc`**: 指向 `ADC_HandleTypeDef` 结构体的指针。
                     - **`pData`**: 指向用于存储 ADC 转换结果的缓冲区的指针。
                     - **`Length`**: 要转换的通道数量。
                 12. **`HAL_ADC_Stop_DMA(ADC_HandleTypeDef \*hadc)`**: 停止 ADC 转换，并禁用 DMA 传输。
                     - **`hadc`**: 指向 `ADC_HandleTypeDef` 结构体的指针。