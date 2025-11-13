---
title: STM32Cube_HAL库笔记（二）-PWM
date: 2025-10-08 00:00:00
type: paper
photos: 
tags:
  - PWM
  - STM32
  - HAL
  - Timer
  - Motor
  - Servo
  - Buzzer
excerpt: 介绍STM32 HAL库中PWM功能的详细使用，包括定时器配置、呼吸灯实现、舵机控制、蜂鸣器驱动和直流电机控制等应用实例。
description: 
---

> 本系列主要讲解STM32CubeHAL的使用，详细的安装部署教程请见[【STM32】STM32 CubeMx使用教程一--安装教程-CSDN博客](https://blog.csdn.net/as480133937/article/details/98885316)

PWM原理详情请见标准库笔记

# 工程创建

### 1**设置RCC**

**设置高速外部时钟HSE 选择外部时钟源**

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/e08f22ab7da1e0253eaf9d708d07cdd2.png)

### **2设置定时器**

### ![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/配置时钟源-d967a2e4219ddd58666f730a79f7def4-1763047197510-22.png)

- **1.选择TIM3** 
- **2.设置定时器时钟源为内部时钟源**
- **设置定时器CH1为PWM模式**
- **3.对应管脚自动设置为复用模式**
- **4.可自行选择是否开启定时器中断**

Channel1~4 就是设置定时器通道的功能   (**输入捕获、输出比较、PWM输出、单脉冲模式**)

 

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/时钟配置-347ae32e413ed44e85f705a744e42478-1763047196325-19.png)

- **Mode**  选择PWM模式1
- **Pulse(占空比值)** 先给0
- **Fast Mode**  PWM脉冲快速模式  ： 和我们配置无关，不使能
- **PWM 极性：**  设置为低电平    PS: **由于LED是低电平点亮，所以我们把极性设置为low**

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/401f5dac2c4c27b475e4f94f64e9054b.png)

在 Parameter Settings 页配置预分频系数为 71，计数周期(自动加载值)为 499，定时器溢出频率，即PWM的周期，就是 72MHz/(71+1)/(499+1) = 2kHz

**PWM频率：**

**Fpwm =Tclk / ((arr+1)\*(psc+1))(单位：Hz)**

- arr 是计数器值
- psc 是预分频值

**占空比：**

- **duty circle = TIM3->CCR1 / arr(单位：%)**
- TIM3->CCR1 用户设定值

比如 定时器频率**Tclk** = 72Mhz arr=499  psc=71   那么PWM频率就是720000/500/72= 2000Hz，即2KHz

arr=499,TIM3->CCR1=250   则pwm的占空比为50% 

**改CCR1可以修改占空比，修改arr可以修改频率**

### **3时钟源设置**

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/40ae1752a552913e9c7449e2b3b5850e.png)

- 1选择外部时钟HSE 8MHz  
- 2PLL锁相环倍频72倍
- 3系统时钟来源选择为PLL
- 4设置APB1分频器为 /2

# 呼吸灯

### 1、工程配置

- **开启外部晶振**：在Pinout&Configuration -> System Core -> RCC 页面，将 High Speed Clock (HSE) 配置为 Crystal/Ceramic Resonator

![配置时钟源](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/配置时钟源-d967a2e4219ddd58666f730a79f7def4-1763047190179-10.png)

- **配置时钟频率**：在Clock Configuration 页面，将PLL Source 选择为 HSE，将System Clock Mux 选择为 PLLCLK，然后在HCLK (MHz) 输入72并回车，将HCLK频率配置为 72 MHz

![时钟配置](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/b27beedd2847b3470efa18974d77475b.png)

- **分配引脚**：在Pinout&Configuration页面，将PA6、PA7、PB0分别配置为TIM3_CH1、TIM3_CH2、TIM3_CH3

- **配置TIM3**：在Pinout&Configuration -> Timers -> TIM3

  - 勾选 Internal Clock，开启 TIM3 的内部时钟源

  - Configuration -> Mode，将 Channel1、Channel2、Channel3 分别配置为 PWM Generation CH1、2、3

  - Configuration -> Parameter Settings -> Counter Settings，将 Prescaler 配置为 72-1，将 Counter Period 配置为 100-1，使PWM频率为10kHz

    > PWM频率 = 72MHz ÷ 72 ÷ 100 = 10 kHz

### 2、代码

- **启动PWM输出**

  ```c
  //启动3个通道的PWM输出
  HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_1);
  HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_2);
  HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_3);
  ```

  

- **在while循环中逐渐改变占空比**

  - `__HAL_TIM_SET_COMPARE` 可以设置PWM的占空比，**范围 0 - 99**

    > 注意：占空比**必须小于**前面配置的**Counter Period**，例程中配置为100-1，即占空比**可调范围是 0 - 99**

  - 先从0逐渐增加到99，亮度逐渐提高

  - 再从99逐渐减小到0，亮度逐渐降低

  ```c
  while (1) {
      // PWM通道CH1-3分别对应三个颜色，下面示例三个颜色一起呼吸灯
      // 0-99为占空比，0为最小亮度，99为最大亮度
      // 每7ms调整一次占空比，从0逐渐增加到99
      for (int period = 0; period < 100; period++) {
          __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, period);
          __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_2, period);
          __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_3, period);
          HAL_Delay(7);
      }
      // 从99逐渐减小到0
      for (int period = 99; period >= 0; period--) {
          __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, period);
          __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_2, period);
          __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_3, period);
          HAL_Delay(7);
      }
      HAL_Delay(100); 
  }
  ```

# 舵机控制

### SG-90 舵机简介

- 舵机最早是应用于**遥控模型**的小型执行器，因此也称为RC舵机。它有一个输出轴，可以连接摇臂，通过输入信号就能**控制摇臂的运动**。

- 与电机不同的是，它可以准确的控制摇臂旋转到某一个**指定位置**，并且自动抵抗外力，维持位置。

- 除了RC模型，舵机可以用于双足机器人、机械臂、自动化执行器（阀门、门窗等等）

  > 注意：舵机内部是塑料减速齿轮，不可大力掰摇臂，避免损坏齿轮

- 舵机的输入信号为 **50Hz** 的PWM波，其占空比范围 **2.5%~12.5%**，分别对应 **0°~180°**位置。因此，调整PWM占空比即可控制舵机的角度。

### 1、工程配置

- **开启外部晶振**：在Pinout&Configuration -> System Core -> RCC 页面，将 High Speed Clock (HSE) 配置为 Crystal/Ceramic Resonator

![配置时钟源](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/配置时钟源-d967a2e4219ddd58666f730a79f7def4-1763047193620-16.png)

- **配置时钟频率**：在Clock Configuration 页面，将PLL Source 选择为 HSE，将System Clock Mux 选择为 PLLCLK，然后在HCLK (MHz) 输入72并回车，将HCLK频率配置为 72 MHz

![时钟配置](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/时钟配置-347ae32e413ed44e85f705a744e42478-1763047188119-7.png)

- **分配引脚**：在Pinout&Configuration页面，将PB8配置为TIM4_CH3

- **配置TIM4**：在Pinout&Configuration -> Timers -> TIM4

  - Configuration -> Mode，勾选Internal Clock，开启 TIM4 的内部时钟源

  - Configuration -> Mode，将 Channel3 配置为 PWM Generation CH3

  - Configuration -> Parameter Settings -> Counter Settings，将 Prescaler 配置为 720-1，将Counter Period 配置为 2000-1，此时PWM频率为 50 Hz

    > PWM频率 = 72 MHz ÷ 720 ÷ 2000 = 50 Hz

### 2、代码

- **启动PWM输出**：`HAL_TIM_PWM_Start(&htim4, TIM_CHANNEL_3)` 启动PWM输出

- **舵机控制**：

  - 舵机角度受占空比控制，占空比 2.5%~12.5% 代表 0°~180°

  - 占空比通过`__HAL_TIM_SET_COMPARE` 调节，参数范围 50~250

    > 占空比 = Compare寄存器值 ÷ Counter Period计数周期
    >
    > 因此，`__HAL_TIM_SET_COMPARE` 填入的值 = 占空比 * Counter Period
    >
    > 例如，设置占空比为2.5%、12.5%时，2.5% * 2000 = 50，2.5% * 2000 = 250

  ```c
  while (1)
  {
      // 舵机控制占空比范围2.5% ~ 12.5%
      // Counter Period设置的是2000，因此占空比设置范围是50 ~ 250
  
      // 中点，占空比7.5%，即2000 * 7.5% = 150
      __HAL_TIM_SET_COMPARE(&htim4, TIM_CHANNEL_3, 150);
      HAL_Delay(1000);
  
      // 向左转，占空比2.5%，即2000 * 2.5% = 50
      __HAL_TIM_SET_COMPARE(&htim4, TIM_CHANNEL_3, 50);
      HAL_Delay(1000);
  
      // 向右转，占空比12.5%，即2000 * 12.5% = 250
      __HAL_TIM_SET_COMPARE(&htim4, TIM_CHANNEL_3, 250);
      HAL_Delay(1000);
  }
  ```

  ## 【PWM】无源蜂鸣器

  ### 1、工程配置

  - **开启外部晶振**：在Pinout&Configuration -> System Core -> RCC 页面，将 High Speed Clock (HSE) 配置为 Crystal/Ceramic Resonator

  ![配置时钟源](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/配置时钟源-d967a2e4219ddd58666f730a79f7def4-1763047185613-4.png)

  - **配置时钟频率**：在Clock Configuration 页面，将PLL Source 选择为 HSE，将System Clock Mux 选择为 PLLCLK，然后在HCLK (MHz) 输入72并回车，将HCLK频率配置为 72 MHz

  ![时钟配置](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/bf0e28a8a45652d24d1ffca5648346f5-1763047199029-25.png)

  - **分配引脚**：在Pinout&Configuration页面，配置如下引脚
    - 将PB9配置为TIM4_CH4，
    - 将PB12、PB13设置为GPIO_Input，并分别设置User Label为KEY1、KEY2
  - **配置GPIO**：在Pinout&Configuration -> GPIO，将PB13的GPIO Pull-up/Pull-down配置为Pull-up
  - **配置TIM4**：在Pinout&Configuration -> Timers -> TIM4
    - 勾选 Internal Clock，开启 TIM4 的内部时钟源
    - Configuration -> Mode，将 Channel4 配置为 PWM Generation CH4
    - Configuration -> Parameter Settings -> Counter Settings，将 Prescaler 配置为 72-1

  ### 2、代码

  - **启动PWM输出**

    ```c
    HAL_TIM_PWM_Start(&htim4, TIM_CHANNEL_4);
    ```

    

  - **在while循环中检测按键并输出相应的频率**

    - `htim4.Instance->ARR = 500` 可以将 TIM4 的 Counter Period 设置为 500

      > 此时，**PWM频率** = 72 MHz ÷ 72 ÷ 500 = 2 kHz

    - `__HAL_TIM_SET_COMPARE` 可以设置PWM的占空比，将占空比设为 20%，可以确保声音清脆明亮

      > 注意：占空比**必须小于**前面配置的**Counter Period**，例程中配置为100-1，即占空比**可调范围是 0 - 99**

    ```c
    while (1)
    {
        // KEY1按下: 输出2kHz声波
        if (!HAL_GPIO_ReadPin(KEY1_GPIO_Port, KEY1_Pin))
        {
            htim4.Instance->ARR = 500; // 2kHz = 72MHz / 72 / 500
            __HAL_TIM_SET_COMPARE(&htim4, TIM_CHANNEL_4, htim4.Instance->ARR / 5); // 20%占空比
        }
        // KEY2按下: 输出3kHz声波
        else if (!HAL_GPIO_ReadPin(KEY2_GPIO_Port, KEY2_Pin))
        {
            htim4.Instance->ARR = 334; // 3kHz = 72MHz / 72 / 334
            __HAL_TIM_SET_COMPARE(&htim4, TIM_CHANNEL_4, htim4.Instance->ARR / 5); // 20%占空比
        }
        // 否则: 关闭声波输出
        else
        {
            __HAL_TIM_SET_COMPARE(&htim4, TIM_CHANNEL_4, 0);
        }
        HAL_Delay(100);
    }
    ```

# 直流电机（DRV8833 电机）

### 1、工程配置

- **开启外部晶振**：在Pinout&Configuration -> System Core -> RCC 页面，将 High Speed Clock (HSE) 配置为 Crystal/Ceramic Resonator

![配置时钟源](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/时钟配置-347ae32e413ed44e85f705a744e42478-1763047192279-13.png)

- **配置时钟频率**：在Clock Configuration 页面，将PLL Source 选择为 HSE，将System Clock Mux 选择为 PLLCLK，然后在HCLK (MHz) 输入72并回车，将HCLK频率配置为 72 MHz

![时钟配置](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/时钟配置-347ae32e413ed44e85f705a744e42478-1763047182986-1.png)

- **分配引脚**：在Pinout&Configuration页面，配置如下引脚
  - 将PA0、PA1分别配置为TIM2_CH1、TIM2_CH2
  - 将PB12、PB13设置为GPIO_Input，并分别设置User Label为KEY1、KEY2
- **配置GPIO**：在Pinout&Configuration -> GPIO，将PB13的GPIO Pull-up/Pull-down配置为Pull-up
- **配置TIM2**：在Pinout&Configuration -> Timers -> TIM2
  - Configuration -> Mode -> Clock Source 选择 Internal Clock，开启 TIM2 的内部时钟源
  - Configuration -> Mode，将 Channel1、Channel2 分别配置为 PWM Generation CH1、2
  - Configuration -> Parameter Settings -> Counter Settings，将 Prescaler 配置为 72-1，将Counter Period 配置为 100-1，此时PWM频率为 10 kHz

### 2、代码

- **逻辑功能**：在while循环中检测按键并输出相应的占空比：

  - 按下KEY1，启动PWM输出，占空比配置为99%，风扇高速运转
  - 按下KEY2，启动PWM输出，占空比配置为85%，风扇中速运转
  - 没有按键按下，关闭PWM输出，风扇停止

- **转速控制**：

  - `__HAL_TIM_SET_COMPARE(&htim2, TIM_CHANNEL_1, 99)` 设置PWM的**占空比越高，转速越快**

  注意

  **占空比过低时，电机可能无法启动**。建议先从 99 占空比开始测试。

  提示

  由于我们配置的 Counter Period 为 100-1，因此占空比最高可以设置为 99，而非 100

- **正/反方向控制**：

  - 配置了CH1、CH2两路PWM输出，但每次只需要启动1路PWM输出，这代表了不同的旋转方向。
  - 例如，`HAL_TIM_PWM_Start(&htim2, TIM_CHANNEL_1)` 启动TIM2_CH1，电机正转；如果启动CH2，则电机反转
  - 当需要转换方向，或者需要停止时，可以调用`HAL_TIM_PWM_Stop(&htim2, TIM_CHANNEL_1)` 停止PWM输出

  ```c
  while (1)
  {
      // KEY1按下：占空比99% 高速正转
      if (HAL_GPIO_ReadPin(KEY1_GPIO_Port, KEY1_Pin) == GPIO_PIN_RESET)
      {
          // 启动PWM通道1输出（只能同时启动1个通道，两个通道对应正/反转）
          HAL_TIM_PWM_Start(&htim2, TIM_CHANNEL_1);
          // 配置通道1的占空比，影响电机转速（占空比过低可能导致电机无法启动）
          __HAL_TIM_SET_COMPARE(&htim2, TIM_CHANNEL_1, 99);
      }
      // KEY2按下：占空比85% 中速正转
      else if (HAL_GPIO_ReadPin(KEY2_GPIO_Port, KEY2_Pin) == GPIO_PIN_RESET)
      {
          // 启动PWM通道1输出（只能同时启动1个通道，两个通道对应正/反转）
          HAL_TIM_PWM_Start(&htim2, TIM_CHANNEL_1);
          // 配置通道1的占空比，影响电机转速（占空比过低可能导致电机无法启动）
          __HAL_TIM_SET_COMPARE(&htim2, TIM_CHANNEL_1, 85);
      }
      else
      {
          // 停止PWM通道1输出
          HAL_TIM_PWM_Stop(&htim2, TIM_CHANNEL_1);
      }
      HAL_Delay(100);
  }
  ```

