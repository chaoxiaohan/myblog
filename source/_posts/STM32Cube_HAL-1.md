---
title: STM32Cube_HAL库笔记（一）-GPIO、中断
date: 2025-10-07 00:00:00
type: paper
photos: 
tags:
  - C
  - STM32
  - HAL
excerpt: 本文介绍了HAL库的GPIO以及中断的使用
description: 
---

> 本系列主要讲解STM32CubeHAL的使用，详细的安装部署教程请见[【STM32】STM32 CubeMx使用教程一--安装教程-CSDN博客](https://blog.csdn.net/as480133937/article/details/98885316)

# 零、Cube MX的使用

## 0.1 Cube启动页介绍

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/e6aff15497e3d252b29f5e68ef36b358.png)

## 0.2 芯片选择页面介绍

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/264812adee6e8822645335c6d43c53a4.png)

## 0.3 输入自己的芯片型号

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/eaa35183b352ce66e5efbd643346b948.png)

## 0.4 芯片配置页码介绍

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/a49c0a1b1060c3907a1ed6a750760164.png)

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/49f87edebb1fad94f6f817bfaec3cc50.png)

## 0.5 芯片外设配置栏详细说明

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/e84a2d6598a4d8055afea61c34ec601c.png)

## 0.6 时钟树

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/7778f42d02a74c1a57bea962188422e8.png)

## 0.7 点击Priject Manager,进入工程配置页面

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/24a72d7540667ac20a4d3ca53e75152e.png)

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/ca150aca47d5e5952bf42aea4ce71195.png)

## 0.8配置前必做



将Debug改为`Serial Wire`

![image-20251006164723995](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251006164723995.png)



**每次配置前必做，本文不再提及此操作**

# 一、GPIO

## 1.1 GPIO输出配置

### 1.1.1 CubeMX配置

点击CUBEMX左侧你想要配置的引脚，以配置PA0为例，即可出现GPIO的配置界面，在此只介绍通用的GPIO配置，即模拟的GPIO，再简单来说只配置GPIO为输入或者输出，对应GPIO_Input和GPIO_Output。

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/680a700019594ee8085f756c5c6641f4.png)

若想要配置PA0为输出模式，则在上图界面中点击GPIO_Output即可配置引脚为输出，同时在界面上也会有相应的显示：
![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/ece7f255a0ce8700b4662dba7cc0e140.png)

此时只是仅仅配置了GPIO口为输出模式，STM32CUBEMX还提供许多其他参数以供配置。点击System Core下的GPIO选项，从右侧窗口找到PA0这个IO口并点击一下。

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/cda53287d8b4092e48728daca2a99188.png)
点击之后窗口界面会显示PA0的详细配置参数（输出)，如下图所示：

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/ba9404a37e9b28b436ad679585f44a62.png)

> GPIO output leve
> 表示上电的默认电平，可配置高或者低
> GPIO mode
> 表示输出模式，可配置为Output Push Pull（推挽输出）或Output Open Drain（开漏输出）
> GPIO Pull-up/Pull-down
> 表示是否上下拉，可配置为上拉或者下拉
> Maximum output speed
> 表示输出速度，对于高速接口需要配置为Very High
> User Label
> 可修改IO口名称，比如可写入LED，把IO口名称变为LED

对于驱动LED，一般配置IO口为推挽输出，上下拉非必要，IO速度低速即可。

### 1.1.2 GPIO输出函数

**1. HAL_GPIO_WritePin()****最常用的 GPIO 输出控制函数，直接设置指定引脚的输出电平。**

**函数原型**：

```c
void HAL_GPIO_WritePin(GPIO_TypeDef* GPIOx, uint16_t GPIO_Pin, GPIO_PinState PinState)
```

**参数说明**：

- **GPIOx**：GPIO 端口（如`GPIOA`、`GPIOB`等）。

- **GPIO_Pin**：引脚编号（如`GPIO_PIN_0`、`GPIO_PIN_5`，可通过`|`组合多个引脚，如`GPIO_PIN_0 | GPIO_PIN_1`）。

- PinState

  ：输出状态，可选值：

  - **GPIO_PIN_SET**：输出高电平。
  - **GPIO_PIN_RESET**：输出低电平。

**示例**：

```c
// 设置GPIOA的Pin0为高电平
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_0, GPIO_PIN_SET);

// 设置GPIOB的Pin5为低电平
HAL_GPIO_WritePin(GPIOB, GPIO_PIN_5, GPIO_PIN_RESET);

// 同时设置GPIOA的Pin2和Pin3为高电平
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_2 | GPIO_PIN_3, GPIO_PIN_SET);
```

**2. HAL_GPIO_TogglePin()****用于翻转指定引脚的输出电平（高→低或低→高）。**

**函数原型**：

```c
void HAL_GPIO_TogglePin(GPIO_TypeDef* GPIOx, uint16_t GPIO_Pin)
```

**参数说明**：

- **GPIOx**：GPIO 端口。
- **GPIO_Pin**：引脚编号（支持单个或多个引脚）。

**示例**：

```c
// 翻转GPIOA的Pin1电平（若当前为高则变低，反之亦然）
HAL_GPIO_TogglePin(GPIOA, GPIO_PIN_1);

// 同时翻转GPIOC的Pin4和Pin6电平
HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_4 | GPIO_PIN_6);
```

> 在 STM32 中设置了 User Label（用户标签，即通过 CubeMX 给引脚自定义的别名，如将 PA0 命名为 “LED”）后，**GPIO 输出函数的用法本质不变**，只是可以用自定义的标签替代原始的引脚宏定义，提高代码可读性。
>
> 例如：若将 PA0 的 User Label 设为 “LED”，则原本的`HAL_GPIO_WritePin(GPIOA, GPIO_PIN_0, GPIO_PIN_SET);`可改写为`HAL_GPIO_WritePin(LED_GPIO_Port, LED_Pin, GPIO_PIN_SET);`
>
> 其中，`LED_GPIO_Port`和`LED_Pin`是 CubeMX 根据 User Label 自动生成的宏定义（在`main.h`或`gpio.h`中），分别对应引脚的端口（如 GPIOA）和引脚编号（如 GPIO_PIN_0）。

## 1.2 GPIO输入配置

### 1.2.1 Cube MX配置

上述介绍了输出的一些功能配置以及调用的函数，下面介绍输入的配置即调用的函数。
以配置PA1为输入为例，现在右侧ui界面选中PA1并配置为输入模式：
![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/94555c61da2a5ff803949202a39ede5e.png)

点击System Core下的GPIO选项，从右侧窗口找到PA1这个IO口并点击一下，此时会出现关于这个IO口的更多的配置。但是当配置为输入时，可配置的参数相对于输出时少了不少，唯一的配置选项为配置上下拉，注意，最后一行User Label只是对GPIO命名，不少对IO进行寄存器配置。
![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/e865875e2fe597df5c490e17a7298bb8.png)

### 1.2.2 GPIO输入函数

**HAL_GPIO_ReadPin(GPIO_TypeDef* GPIOx, uint16_t GPIO_Pin)**

**功能**：读取指定 GPIO 引脚的输入电平状态（高电平或低电平）。

**参数说明**：

- **GPIOx**：GPIO 端口（如`GPIOA`、`GPIOB`等）。
- **GPIO_Pin**：引脚编号（如`GPIO_PIN_0`、`GPIO_PIN_5`）。

**返回值**：`GPIO_PinState`类型，可能的返回值为：

- **GPIO_PIN_SET**：表示引脚输入为高电平。
- **GPIO_PIN_RESET**：表示引脚输入为低电平。

## 【案例】按键点灯实验

### 1.3.1 CubeMX 操作步骤

①打开 STM32CubeMX，新建工程并选择目标芯片（如 STM32F103C8T6），进入配置界面。

②配置按键引脚：假设按键连接在 PA0 引脚（外部下拉，按下时接高电平），在引脚分布图中点击 PA0，选择 “GPIO_Input”；进入 PA0 的详细配置，将 “GPIO Pull-up/Pull-down” 设为 “Pull-down”（下拉模式，未按下时为低电平），其他保持默认。

③配置 LED 引脚：假设 LED 连接在 PA5 引脚（低电平点亮），点击 PA5 选择 “GPIO_Output”；进入 PA5 配置，“GPIO mode” 设为 “Push-Pull”，“GPIO Pull-up/Pull-down” 设为 “Pull-up”，“Maximum output speed” 设为 “Low”。

④配置时钟：点击 “Clock Configuration”，根据芯片型号设置系统时钟（如 STM32F103C8T6 可设为 72MHz），确保时钟树无红色报错。

⑤设置工程：点击 “Project Manager”，填写工程名和路径，选择 IDE（如 MDK-ARM V5）；在 “Code Generator” 中勾选 “Generate peripheral initialization as a pair of .c/.h files per peripheral”，生成代码并打开工程。

### 1.3.2 代码实现步骤

①在 “main ()” 函数的初始化部分（“/* USER CODE BEGIN 2 */” 下方），添加 LED 初始状态设置代码：

```c
/* USER CODE BEGIN 2 */
// 初始化LED为熄灭状态（低电平点亮，故初始置高）
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_SET);
/* USER CODE END 2 */
```

②在 “while (1)” 循环中（“/* USER CODE BEGIN 3 */” 下方），添加按键读取与 LED 控制代码：

```c
/* USER CODE BEGIN 3 */
// 读取按键状态（PA0），若按下（高电平）
if(HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_0) == GPIO_PIN_SET)
{
  HAL_Delay(20);  // 延时20ms消抖
  // 再次确认按键按下
  if(HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_0) == GPIO_PIN_SET)
  {
    HAL_GPIO_TogglePin(GPIOA, GPIO_PIN_5);  // 翻转LED（PA5）状态
    // 等待按键释放（避免一次按下多次触发）
    while(HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_0) == GPIO_PIN_SET);
  }
}
/* USER CODE END 3 */
```

③编译工程（F7）并下载到开发板（F8），按下 PA0 引脚连接的按键时，PA5 引脚连接的 LED 状态会翻转（亮→灭或灭→亮），实现按键控制 LED 的功能。

# 二、中断

## 2.1 认识NVIC界面

![image-20251006172117934](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251006172117934.png)

① **Priority Group**：用于划分抢占优先级和子优先级的位数分配，不同分组决定了系统中可配置的抢占优先级和子优先级的数量，对中断嵌套以及同抢占优先级中断的响应顺序起着关键作用。

② **Sort by Preemption Priority and Sub Priority**：能按抢占优先级和子优先级对中断进行排序，勾选后中断会按抢占优先级从低到高、同抢占优先级下子优先级从低到高的顺序排列，方便查看和管理不同优先级的中断。

③ **Sort by interrupts names**：可按中断名称对中断进行排序，勾选后中断按名称的字母顺序排列，便于通过名称快速定位特定中断。

④ **Search**：用于在众多中断里快速查找特定中断，输入关键词能过滤出匹配的中断项，提升配置效率。

⑤ **Show**：下拉菜单里的`available interrupts`表示显示所有可用的中断，通过该选项可控制列表中显示的中断范围，方便聚焦于需要配置的中断集合。

⑥ **Force DMA channels Interrupts**：勾选后强制使能 DMA 通道相关的中断，确保 DMA 操作过程中的中断（如传输完成、传输错误等）能被 NVIC 捕获和处理。

⑦ **NVIC Interrupt Table**：是页面核心区域，列出各类中断及配置项：

- 中断名称列：涵盖不可屏蔽中断、硬 fault 中断、内存管理 fault 中断、系统滴答定时器中断、外部中断线 0 中断等各类中断源。
- **Enabled**：勾选表示使能对应中断，允许中断发生时向 CPU 发请求；未勾选则禁用。
- **Preemption Priority**：抢占优先级，数值越小优先级越高，高优先级可打断低优先级中断执行。
- Sub Priority：子优先级，抢占优先级相同时，子优先级高（数值小）的中断先被响应。

⑧ 页面底部配置项：

- **Enabled**：单独设置选中中断是否使能。
- **Preemption Priority**：设置选中中断的抢占优先级。
- **Sub Priority**：设置选中中断的子优先级。

## 2.2 中断相关函数

### **UART**  

**常用函数**  

```c
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart);
```
**介绍**  
当调用 `HAL_UART_Receive_IT` 或 `HAL_UART_Receive_DMA` 后，接收到指定长度数据时触发。常用于接收单字节命令或协议帧。需在回调中重新调用 `HAL_UART_Receive_IT` 以持续监听。  

**示例：**
```c
uint8_t rx_data = 0;
HAL_UART_Receive_IT(&huart1, &rx_data, 1);

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    if (huart->Instance == USART1)
    {
        if (rx_data == 'T')
        {
            HAL_GPIO_TogglePin(LED_GPIO_Port, LED_Pin);
        }
        HAL_UART_Receive_IT(&huart1, &rx_data, 1); // 重新开启接收
    }
}
```

```c
void HAL_UART_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size);
```
**介绍**  
配合 `HAL_UART_Receive_DMA` 使用，当串口总线空闲（IDLE）时触发，`Size` 为实际接收到的字节数。适用于接收不定长数据包（如一帧传感器数据）。  

**示例：**
```c
uint8_t rx_buffer[64];
HAL_UART_Receive_DMA(&huart1, rx_buffer, 64);

void HAL_UART_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size)
{
    if (huart->Instance == USART1)
    {
        ProcessFrame(rx_buffer, Size);
        memset(rx_buffer, 0, 64);
        HAL_UART_Receive_DMA(&huart1, rx_buffer, 64); // 重启DMA
    }
}
```

**其他函数**  
```c
void HAL_UART_TxCpltCallback(UART_HandleTypeDef *huart); // 发送完成（IT/DMA）
void HAL_UART_TxHalfCpltCallback(UART_HandleTypeDef *huart); // 发送半完成（DMA）
void HAL_UART_RxHalfCpltCallback(UART_HandleTypeDef *huart); // 接收半完成（DMA）
void HAL_UART_ErrorCallback(UART_HandleTypeDef *huart); // 发生帧错误、溢出等
void HAL_UART_AbortCpltCallback(UART_HandleTypeDef *huart); // 传输中止完成
void HAL_UART_AbortTransmitCpltCallback(UART_HandleTypeDef *huart); // 发送中止完成
void HAL_UART_AbortReceiveCpltCallback(UART_HandleTypeDef *huart); // 接收中止完成
```

### **SPI**  

**常用函数**  

```c
void HAL_SPI_TxCpltCallback(SPI_HandleTypeDef *hspi);
void HAL_SPI_RxCpltCallback(SPI_HandleTypeDef *hspi);
void HAL_SPI_TxRxCpltCallback(SPI_HandleTypeDef *hspi);
```
**介绍**  
分别在SPI发送、接收或全双工传输完成后调用。适用于与SPI外设（如Flash、显示屏）通信。  

**示例（发送完成处理）：**
```c
uint8_t tx_buf[] = {0x01, 0x02, 0x03};
HAL_SPI_Transmit_IT(&hspi1, tx_buf, 3);

void HAL_SPI_TxCpltCallback(SPI_HandleTypeDef *hspi)
{
    if (hspi->Instance == SPI1)
    {
        HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_SET); // 拉高片选
    }
}
```

**其他函数**  
```c
void HAL_SPI_TxHalfCpltCallback(SPI_HandleTypeDef *hspi); // 发送半完成（DMA）
void HAL_SPI_RxHalfCpltCallback(SPI_HandleTypeDef *hspi); // 接收半完成（DMA）
void HAL_SPI_TxRxHalfCpltCallback(SPI_HandleTypeDef *hspi); // 全双工半完成
void HAL_SPI_ErrorCallback(SPI_HandleTypeDef *hspi); // SPI通信错误
void HAL_SPI_AbortCpltCallback(SPI_HandleTypeDef *hspi); // 传输中止完成
```

### **I2C**  

**常用函数**  

```c
void HAL_I2C_MasterTxCpltCallback(I2C_HandleTypeDef *hi2c);
void HAL_I2C_MasterRxCpltCallback(I2C_HandleTypeDef *hi2c);
```
**介绍**  
I2C主模式发送或接收完成回调。常用于读写EEPROM、传感器等。  

**示例（写后读）：**
```c
uint8_t write_addr = 0x00;
uint8_t read_buf[2];
HAL_I2C_Master_Transmit_IT(&hi2c1, DEV_ADDR << 1, &write_addr, 1);

void HAL_I2C_MasterTxCpltCallback(I2C_HandleTypeDef *hi2c)
{
    if (hi2c->Instance == I2C1)
    {
        HAL_I2C_Master_Receive_IT(&hi2c1, DEV_ADDR << 1, read_buf, 2);
    }
}

void HAL_I2C_MasterRxCpltCallback(I2C_HandleTypeDef *hi2c)
{
    if (hi2c->Instance == I2C1)
    {
        ProcessData(read_buf, 2);
    }
}
```

**其他函数**  
```c
void HAL_I2C_SlaveTxCpltCallback(I2C_HandleTypeDef *hi2c); // 从机发送完成
void HAL_I2C_SlaveRxCpltCallback(I2C_HandleTypeDef *hi2c); // 从机接收完成
void HAL_I2C_MemTxCpltCallback(I2C_HandleTypeDef *hi2c); // 写I2C存储器完成
void HAL_I2C_MemRxCpltCallback(I2C_HandleTypeDef *hi2c); // 读I2C存储器完成
void HAL_I2C_ErrorCallback(I2C_HandleTypeDef *hi2c); // I2C总线错误
void HAL_I2C_AbortCpltCallback(I2C_HandleTypeDef *hi2c); // 传输中止完成
void HAL_I2C_AddrCallback(I2C_HandleTypeDef *hi2c, uint8_t TransferDirection, uint16_t AddrMatchCode); // 地址匹配（从机）
void HAL_I2C_ListenCpltCallback(I2C_HandleTypeDef *hi2c); // 监听模式完成
```

### **ADC** 

**常用函数**  

```c
void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *hadc);
```
**介绍**  
ADC转换完成后调用。可用于单次转换或连续转换模式下获取结果。  

**示例：**
```c
HAL_ADC_Start_IT(&hadc1);

void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *hadc)
{
    if (hadc->Instance == ADC1)
    {
        uint32_t value = HAL_ADC_GetValue(&hadc1);
        float voltage = (value * 3.3f) / 4095.0f;
        SendVoltage(voltage);
    }
}
```

**其他函数**  
```c
void HAL_ADC_ConvHalfCpltCallback(ADC_HandleTypeDef *hadc); // 转换半完成（DMA）
void HAL_ADC_LevelOutOfWindowCallback(ADC_HandleTypeDef *hadc); // ADC值超出监控窗口
void HAL_ADC_ErrorCallback(ADC_HandleTypeDef *hadc); // ADC转换错误
```

### **TIM** 

**常用函数**  

```c
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim);
```
**介绍**  
定时器更新中断（溢出）时调用。常用于周期性任务，如LED闪烁、定时采样。  

**示例：**
```c
// TIM3配置为1Hz中断
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
    if (htim->Instance == TIM3)
    {
        HAL_GPIO_TogglePin(LED_GPIO_Port, LED_Pin);
    }
}
```

**其他函数**  
```c
void HAL_TIM_OC_DelayElapsedCallback(TIM_HandleTypeDef *htim); // 输出比较定时结束
void HAL_TIM_IC_CaptureCallback(TIM_HandleTypeDef *htim); // 输入捕获事件
void HAL_TIM_PWM_PulseFinishedCallback(TIM_HandleTypeDef *htim); // 单脉冲模式完成
void HAL_TIM_TriggerCallback(TIM_HandleTypeDef *htim); // 触发中断
void HAL_TIM_ErrorCallback(TIM_HandleTypeDef *htim); // 定时器错误
```

### **DMA**  

**常用函数**  

```c
void HAL_DMA_XferCpltCallback(DMA_HandleTypeDef *hdma);
```
**介绍**  
DMA传输完成时调用。常用于UART、SPI、ADC等外设的数据搬运完成通知。  

**示例：**
```c
uint8_t dma_tx[] = "Hello";
HAL_DMA_Start_IT(&hdma_usart1_tx, (uint32_t)dma_tx, (uint32_t)&huart1.Instance->TDR, 5);

void HAL_DMA_XferCpltCallback(DMA_HandleTypeDef *hdma)
{
    if (hdma == &hdma_usart1_tx)
    {
        // 传输完成，可发送完成标志
    }
}
```

**其他函数**  
```c
void HAL_DMA_XferHalfCpltCallback(DMA_HandleTypeDef *hdma); // 传输半完成
void HAL_DMA_XferErrorCallback(DMA_HandleTypeDef *hdma); // 传输错误
void HAL_DMA_XferAbortCallback(DMA_HandleTypeDef *hdma); // 传输中止完成
```

### **EXTI**  

**常用函数**  

```c
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin);
```
**介绍**  
外部中断触发时调用。用于响应按键、信号边沿等事件。  

**示例：**
```c
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
    if (GPIO_Pin == KEY_Pin)
    {
        HAL_GPIO_TogglePin(LED_GPIO_Port, LED_Pin);
        HAL_Delay(20); // 简单消抖（建议用定时器替代）
    }
}
```

**其他函数**  
*无*

### **CAN**  

**常用函数**  

```c
void HAL_CAN_TxCpltCallback(CAN_HandleTypeDef *hcan);
void HAL_CAN_RxCpltCallback(CAN_HandleTypeDef *hcan);
```
**介绍**  
CAN发送完成或接收FIFO有消息时调用。  

**示例：**
```c
void HAL_CAN_RxCpltCallback(CAN_HandleTypeDef *hcan, uint32_t RxFifo)
{
    CAN_RxHeaderTypeDef rxHeader;
    uint8_t rxData[8];
    HAL_CAN_GetRxMessage(hcan, RxFifo, &rxHeader, rxData);
    ProcessCANMessage(rxData, rxHeader.DLC);
}
```

**其他函数**  
```c
void HAL_CAN_ErrorCallback(CAN_HandleTypeDef *hcan); // CAN通信错误
```

### **USB**  

**常用函数**  

```c
void HAL_PCD_DataInStageCallback(PCD_HandleTypeDef *hpcd, uint8_t epnum);
void HAL_PCD_DataOutStageCallback(PCD_HandleTypeDef *hpcd, uint8_t epnum);
void HAL_PCD_SetupStageCallback(PCD_HandleTypeDef *hpcd);
```
**介绍**  
USB数据IN/OUT阶段完成或SETUP包到达时调用。用于处理控制传输和数据传输。  

**其他函数**  
```c
void HAL_PCD_ConnectCallback(PCD_HandleTypeDef *hpcd); // 设备连接
void HAL_PCD_DisconnectCallback(PCD_HandleTypeDef *hpcd); // 设备断开
void HAL_PCD_SuspendCallback(PCD_HandleTypeDef *hpcd); // 进入挂起
void HAL_PCD_ResumeCallback(PCD_HandleTypeDef *hpcd); // 从挂起恢复
void HAL_PCD_ISOOUTIncompleteCallback(PCD_HandleTypeDef *hpcd); // ISO OUT未完成
void HAL_PCD_ISOINIncompleteCallback(PCD_HandleTypeDef *hpcd); // ISO IN未完成
void HAL_PCD_LPMCallback(PCD_HandleTypeDef *hpcd, PCD_LPM_MsgTypeDef msg); // LPM事件
```

## 【案例】中断按键点灯

### 2.3.1工程配置

- **分配引脚**：在Pinout&Configuration页面，配置如下引脚

  - **中断引脚**：将 PB12 设置为 GPIO_EXTI12，并设置 User label 为 KEY1

  - **输出引脚**：将 PA7 设置为 GPIO_Output，并分别设置 User label 为 GREEN

    > 左键点击对应的引脚，选择 GPIO_Output 或 GPIO_EXTI12；
    >
    > 右键点击对应的引脚，选择 User label，分别输入 GREEN、KEY1

![gpio config](https://docs.keysking.com/assets/images/gpio%20config-b4c9994e707171a1d8981a4c125dfdb5.png)

- **配置GPIO**：在Pinout&Configuration -> GPIO

  - 将 PB12 的 GPIO mode 配置为 External Interrupt Mode with Falling edge trigger detection，开启下降沿检测
  - 切换到NVIC选项卡，使能 EXTI line[15:10] Interrupts

  > **注意**：如果要在回调函数中使用HAL_Delay()，就必须配置中断优先级
  >
  > - System Core -> NVIC，将 Time base: System tick timer 的主要优先级调到比EXTI line高
  > - 否则 HAL_Delay() 函数无法在中断回调函数中执行，会导致程序卡在回调函数中

![配置](https://docs.keysking.com/assets/images/配置-7f3465dc33de0e3e4f4e23933d2c9da7.png)

### 2.3.2 代码

- 在 stm32f1xx_it.c 中添加中断回调函数 void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)，当中断被触发时，该回调函数就会执行
- 在中断回调函数中实现绿灯的亮灭翻转

```c
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
  // 确认一下是否为KEY1按下
  if(HAL_GPIO_ReadPin(KEY1_GPIO_Port, KEY1_Pin) == 0){
	  // 翻转绿灯
	  HAL_GPIO_TogglePin(GREEN_GPIO_Port, GREEN_Pin);
	  // 等待KEY1松开
	  while(HAL_GPIO_ReadPin(KEY1_GPIO_Port, KEY1_Pin) == 0);
  }
}
```

