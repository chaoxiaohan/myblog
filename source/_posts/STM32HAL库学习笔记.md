---
title: STM32HAL库学习笔记
date: 2025-03-24 00:00:00
type: paper
photos: https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/HAL1.png
excerpt: 本笔记详细记录了STM32 HAL库的工程配置过程，包括引脚分配和时钟配置。文中提供了设置LED的GPIO输出和配置系统时钟源的详细步骤，为嵌入式开发初学者提供了实用的参考。
tags:
  - STM32
  - HAL
  - learn
---

# STM32HAL库学习笔记

## 【GPIO】点灯（white）

#### 1、工程配置

- **分配引脚**：在Pinout&Configuration页面，将 PA6、PA7、PB0 配置为 GPIO_Output，并分别设置 User label 为 BLUE、GREEN、RED

  > **左键**点击对应的引脚，选择 GPIO_Output；
  >
  > **右键**点击对应的引脚，选择 User label，分别输入 BLUE、GREEN、RED

![gpio config](STM32HAL库学习笔记.assets/gpio config-b147238d74e1b4a90d7a6ce271df6719.png)

- **配置GPIO**：在Pinout&Configuration -> GPIO，点击对应的 PIN，可以在下方的 GPIO output level 中设置初始输出电平

  > 高电平点亮LED，低电平熄灭LED

![配置](STM32HAL库学习笔记.assets/配置-b0dda05778c3a7cac8e2b15d60776b12.png)

#### 2、代码

- 在main.c文件中编写HAL_GPIO_WritePin函数来改变GPIO的输出电平
- 这三行代码分别控制红、蓝、绿三个灯对应GPIO的输出电平

```c
HAL_GPIO_WritePin(RED_GPIO_Port, RED_Pin, GPIO_PIN_SET); //红色，点亮
HAL_GPIO_WritePin(BLUE_GPIO_Port, BLUE_Pin, GPIO_PIN_RESET); //蓝色，熄灭
HAL_GPIO_WritePin(GREEN_GPIO_Port, GREEN_Pin, GPIO_PIN_RESET); //绿色，熄灭
```



函数最后一个参数：`GPIO_PIN_SET`设置为高电平（点亮），`GPIO_PIN_RESET`设置为低电平（熄灭）

## 【GPIO】按键（read）

#### 1、工程配置

- **分配引脚**：在Pinout&Configuration页面，配置如下引脚

  - **输出引脚**：将 PA6、PA7、PB0 分别设置为 GPIO_Output，并分别设置 User label 为 BLUE、GREEN、RED

  - **输入引脚**：将 PB12、PB13、PB15 设置为 GPIO_Input，并分别设置 User label 为 KEY1、KEY2、KEY3

    > 左键点击对应的引脚，选择 GPIO_Output 或 GPIO_Input；
    >
    > 右键点击对应的引脚，选择 User label，分别输入 BLUE、GREEN、KEY1、KEY2

![gpio config](STM32HAL库学习笔记.assets/gpio config-a5bebe2cf288b9fc7146fcbd79f621a5.png)

- **配置GPIO**：在Pinout&Configuration -> GPIO，将 PB13、PB15 的 GPIO Pull-up/Pull-down 配置为 Pull-up

  > 学习板仅 KEY1 配置了外部上拉电阻，因此 KEY1 可以不配置 Pull-up。

![配置](STM32HAL库学习笔记.assets/配置-6778d5c04521ea13a7e89c52f44063ae.png)

#### 2、代码

通过 `HAL_GPIO_WritePin` 函数读取 GPIO 状态，如果是**低电平**，则说明按键被按下

- 如果读取到 KEY1 低电平，就点亮绿灯；否则，熄灭绿灯

```c
// 如果KEY1按下，就点亮绿灯
if(HAL_GPIO_ReadPin(KEY1_GPIO_Port, KEY1_Pin) == GPIO_PIN_RESET){
    HAL_GPIO_WritePin(GREEN_GPIO_Port, GREEN_Pin, GPIO_PIN_SET);
}
// 否则，就熄灭绿灯
else{
    HAL_GPIO_WritePin(GREEN_GPIO_Port, GREEN_Pin, GPIO_PIN_RESET);
}
```



- KEY2 按下，蓝灯亮/灭翻转一次，然后等待按键释放（否则会导致连续翻转）

  > **按键消抖**
  >
  > - 读取到 KEY2 是低电平时，先延时 50 ms，再次判断 KEY2 是否还是低电平
  > - 如果是，则说明 KEY2 确实被按下
  > - 否则，说明 KEY2 是抖动，不做任何操作

```c
// KEY2消抖
if (!HAL_GPIO_ReadPin(KEY2_GPIO_Port, KEY2_Pin)) {
    // 如果检测到KEY2低电平，先延时等待50ms
    HAL_Delay(50);
    // 再判断KEY2是否还处于低电平
    if (!HAL_GPIO_ReadPin(KEY2_GPIO_Port, KEY2_Pin)) {
        // 确认不是抖动，蓝灯亮灭翻转
        HAL_GPIO_TogglePin(BLUE_GPIO_Port, BLUE_Pin);
        // 等待KEY2松开，才能开始下一次检测
        while (!HAL_GPIO_ReadPin(KEY2_GPIO_Port, KEY2_Pin)) 
        {
        }
    }
}
```



- KEY3 按下，红灯亮/灭翻转一次，然后等待按键释放（否则会导致连续翻转）

  > **按键消抖**
  >
  > - 读取到 KEY3 是低电平时，先延时 50 ms，再次判断 KEY2 是否还是低电平
  > - 如果是，则说明 KEY3 确实被按下
  > - 否则，说明 KEY3 是抖动，不做任何操作

```c
// KEY3 编码器按键
if (!HAL_GPIO_ReadPin(KEY3_GPIO_Port, KEY3_Pin)) {
    // 如果检测到低电平，先延时等待50ms
    HAL_Delay(50);
    // 再判断KEY3是否还处于低电平
    if (!HAL_GPIO_ReadPin(KEY3_GPIO_Port, KEY3_Pin)) {
        // 确认不是抖动，蓝灯亮灭翻转
        HAL_GPIO_TogglePin(RED_GPIO_Port, RED_Pin);
        // 等待KEY3松开，才能开始下一次检测
        while (!HAL_GPIO_ReadPin(KEY3_GPIO_Port, KEY3_Pin)) 
        {
        }
    }
}
```

## 【GPIO】中断

#### 1、工程配置

- **分配引脚**：在Pinout&Configuration页面，配置如下引脚

  - **中断引脚**：将 PB12 设置为 GPIO_EXTI12，并设置 User label 为 KEY1

  - **输出引脚**：将 PA7 设置为 GPIO_Outpu，并分别设置 User label 为 GREEN

    > 左键点击对应的引脚，选择 GPIO_Output 或 GPIO_EXTI12；
    >
    > 右键点击对应的引脚，选择 User label，分别输入 GREEN、KEY1

![gpio config](STM32HAL库学习笔记.assets/gpio config-b4c9994e707171a1d8981a4c125dfdb5.png)

- **配置GPIO**：在Pinout&Configuration -> GPIO

  - 将 PB12 的 GPIO mode 配置为 External Interrupt Mode with Falling edge trigger detection，开启下降沿检测
  - 切换到NVIC选项卡，使能 EXTI line[15:10] Interrupts

  > **注意**：如果要在回调函数中使用HAL_Delay()，就必须配置中断优先级
  >
  > - System Core -> NVIC，将 Time base: System tick timer 的主要优先级调到比EXTI line高
  > - 否则 HAL_Delay() 函数无法在中断回调函数中执行，会导致程序卡在回调函数中

![配置](STM32HAL库学习笔记.assets/配置-7f3465dc33de0e3e4f4e23933d2c9da7.png)

#### 2、代码

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

## 【I²C】温湿度传感器AHT20

### 1、工程配置

- **打开I²C外设**：Pinout&Configuration -> Connectivity -> I2C1，将I2C模式选择为I2C

- **打开串口2外设**：Pinout&Configuration -> Connectivity -> USART2，将Mode选择为Asynchronous

- **配置工程**：在Project Manager -> Code Generator页面中，勾选Generate peripheral initialization as ... per peripheral

- **启用float打印**：在cubeIDE菜单栏中，Project Properties -> C/C++ Build -> Settings -> Tool Settings -> MCU Settings，勾选Use float with printf ... -nano

  提示

  默认情况下，sprintf函数不能打印小数。因此我们需要配置一下编译器，使其能够打印小数

### 2、代码

#### (1) 初始化过程

- **拷贝库文件**：将 **`aht20.c`** 文件拷贝到 `Core` -> `Src` 目录下，将 **`aht20.h`** 文件拷贝到 `Core` -> `Inc` 目录下。

- **在main.c中添加include**：`aht20.h`

- **引用头文件**：需要使用 sprintf 打印输出，在 main.c 引用头文件：

  ```c
  #include "stdio.h"
  #include "string.h"
  ```

  

- **初始化AHT20**：

  ```c
  // 初始化AHT20
  AHT20_Init();
  ```

  

#### (2) 读取数据

```c
AHT20_Read(float *Temperature, float *Humidity)
```



预先定义两个float类型的变量，将指针传入该函数，用于接收读取结果

提示

建议读取间隔大于500毫秒

## 【I²C】0.96OLED

### 1、工程配置

- **开启外部晶振**：在Pinout&Configuration -> System Core -> RCC 页面，将 High Speed Clock (HSE) 配置为 Crystal/Ceramic Resonator

![配置时钟源](STM32HAL库学习笔记.assets/配置时钟源-d967a2e4219ddd58666f730a79f7def4.png)

- **配置时钟频率**：在Clock Configuration 页面，将PLL Source 选择为 HSE，将System Clock Mux 选择为 PLLCLK，然后在HCLK (MHz) 输入72并回车，将HCLK频率配置为 72 MHz

![时钟配置](STM32HAL库学习笔记.assets/时钟配置-347ae32e413ed44e85f705a744e42478.png)

- **配置I²C1**：在 `I2C1` 配置页，将I2C模式选择为 **`I2C`**，并在下方 `Parameter Settings` 将 `I2C Speed Mode` 选择为 **`Fast Mode`**

![工程配置](STM32HAL库学习笔记.assets/Snipaste_2023-05-04_23-06-38-9b482e4f6ad9da35d13b6bde5d2e5afc.png)

- **配置生成单独.c/.h文件**：在Project Manager -> Code Generator页面中，勾选Generate peripheral initialization as ... per peripheral

### 2、代码

#### (1) 初始化过程

- **拷贝库文件**：将oled.c、font.c文件拷贝到Core -> Src目录下，将oled.h、font.h文件拷贝到Core -> Inc目录下。

- **在main.c中添加include**：

  ```c
  #include "string.h"
  #include "oled.h"
  #include "stdio.h"
  ```

  

- **初始化OLED**：

  ```c
  HAL_Delay(20); // 单片机启动比OLED上电快,需要延迟等待一下
  OLED_Init(); // 初始化OLED
  ```

  

#### (2) 显示函数

- **将缓存内容更新到屏幕显示**：

  ```c
  OLED_ShowFrame();
  ```

  

  提示

  任何操作都需要调用此函数才能显示到屏幕上，否则只是改变显示缓冲区

- **新建空白缓冲区**：

  ```c
  OLED_NewFrame();
  ```

  

  提示

  只存在一个Frame，NewFrame后之前的内容将被清空

- **显示一个像素点**：

  - `uint8_t x` 横坐标

  - `uint8_t y` 纵坐标

  - ```
    OLED_ColorMode mode
    ```

     

    颜色模式

    - `OLED_COLOR_NORMAL` 正常
    - `OLED_COLOR_REVERSE` 反色

```c
void OLED_SetPixel(uint8_t x, uint8_t y, OLED_ColorMode color);
```



```c
// 示例
OLED_NewFrame(); // 新建一个空白缓冲区
OLED_SetPixel(0, 0, OLED_COLOR_NORMAL); // 在(0, 0)处显示一个黑色的像素点
OLED_ShowFrame(); // 将缓冲区内容显示到屏幕上
```



- 显示字符串
  - `uint8_t x` 纵坐标 [0, 127]
  - `uint8_t y` 纵坐标 [0, 63]
  - `char *str` 要显示的字符串
  - `const Font *font` 字体
  - `OLED_ColorMode color` 颜色模式

```c
void OLED_PrintString(uint8_t x, uint8_t y, char *str, const Font *font, OLED_ColorMode color);
```



```c
// 示例
OLED_NewFrame(); // 新建一个空白缓冲区
OLED_PrintString(0, 22, "B站-KEYSKING", &font16x16, OLED_COLOR_NORMAL); // 中文、英文、符号混合显示
OLED_ShowFrame(); // 将缓冲区内容显示到屏幕上
```



- 绘制直线

  ：

  - `uint8_t x1` 直线起点横坐标 [0, 127]
  - `uint8_t y1` 直线起点纵坐标 [0, 63]
  - `uint8_t x2` 直线终点横坐标 [0, 127]
  - `uint8_t y2` 直线终点纵坐标 [0, 63]
  - `OLED_ColorMode color` 颜色模式

```c
void OLED_DrawLine(uint8_t x1, uint8_t y1, uint8_t x2, uint8_t y2, OLED_ColorMode color);
```



```c
// 示例
OLED_NewFrame(); // 新建一个空白缓冲区
OLED_DrawLine(0, 0, 127, 63, OLED_COLOR_NORMAL); // 从左上角到右下角绘制一条直线
OLED_ShowFrame(); // 将缓冲区内容显示到屏幕上
```



- 绘制（空心）矩形

  ：

  - `uint8_t x` 起始点横坐标 [0, 127]
  - `uint8_t y` 起始点纵坐标 [0, 63]
  - `uint8_t w` 矩形宽度 [0, 127]
  - `uint8_t h` 矩形高度 [0, 63]
  - `OLED_ColorMode color` 颜色模式

```c
void OLED_DrawRectangle(uint8_t x, uint8_t y, uint8_t w, uint8_t h, OLED_ColorMode color);
```



```c
// 示例
OLED_NewFrame(); // 新建一个空白缓冲区
OLED_DrawRectangle(32, 16, 63, 31, OLED_COLOR_NORMAL); // 绘制一个空心矩形
OLED_ShowFrame(); // 将缓冲区内容显示到屏幕上
```



- 绘制（填充）矩形

  ：

  - `uint8_t x` 起始点横坐标 [0, 127]
  - `uint8_t y` 起始点纵坐标 [0, 63]
  - `uint8_t w` 矩形宽度 [0, 127]
  - `uint8_t h` 矩形高度 [0, 63]
  - `OLED_ColorMode color` 颜色模式

```c
void OLED_DrawFilledRectangle(uint8_t x, uint8_t y, uint8_t w, uint8_t h, OLED_ColorMode color);
```



```c
// 示例
OLED_NewFrame(); // 新建一个空白缓冲区
OLED_DrawFilledRectangle(32, 16, 63, 31, OLED_COLOR_NORMAL); // 绘制一个填充矩形
OLED_ShowFrame(); // 将缓冲区内容显示到屏幕上
```



- **绘制（空心）圆形**：

> 此函数使用Bresenham算法绘制圆

- `uint8_t x` 圆心横坐标 [0, 127]
- `uint8_t y` 圆心纵坐标 [0, 63]
- `uint8_t r` 圆的半径 [0, 63]
- `OLED_ColorMode color` 颜色模式

```c
void OLED_DrawCircle(uint8_t x, uint8_t y, uint8_t r, OLED_ColorMode color);
```



```c
// 示例
OLED_NewFrame(); // 新建一个空白缓冲区
OLED_DrawCircle(64, 32, 16, OLED_COLOR_NORMAL); // 绘制一个空心圆形
OLED_ShowFrame(); // 将缓冲区内容显示到屏幕上
```



- **绘制（填充）圆形**：

> 此函数使用Bresenham算法绘制圆

- `uint8_t x` 圆心横坐标 [0, 127]
- `uint8_t y` 圆心纵坐标 [0, 63]
- `uint8_t r` 圆的半径 [0, 63]
- `OLED_ColorMode color` 颜色模式

```c
void OLED_DrawFilledCircle(uint8_t x, uint8_t y, uint8_t r, OLED_ColorMode color);
```



```c
// 示例
OLED_NewFrame(); // 新建一个空白缓冲区
OLED_DrawFilledCircle(64, 32, 16, OLED_COLOR_NORMAL); // 绘制一个填充圆形
OLED_ShowFrame(); // 将缓冲区内容显示到屏幕上
```



- 绘制（空心）三角形

  ：

  - `uint8_t x1` 第一个点横坐标 [0, 127]
  - `uint8_t y1` 第一个点纵坐标 [0, 63]
  - `uint8_t x2` 第二个点横坐标 [0, 127]
  - `uint8_t y2` 第二个点纵坐标 [0, 63]
  - `uint8_t x3` 第三个点横坐标 [0, 127]
  - `uint8_t y3` 第三个点纵坐标 [0, 63]
  - `OLED_ColorMode color` 颜色模式

```c
void OLED_DrawTriangle(uint8_t x1, uint8_t y1, uint8_t x2, uint8_t y2, uint8_t x3, uint8_t y3, OLED_ColorMode color);
```



```c
// 示例
OLED_NewFrame(); // 新建一个空白缓冲区
OLED_DrawTriangle(64, 0, 0, 63, 127, 63, OLED_COLOR_NORMAL); // 在屏幕中心绘制一个空心三角形
OLED_ShowFrame(); // 将缓冲区内容显示到屏幕上
```



- 绘制（填充）三角形

  ：

  - `uint8_t x1` 第一个点横坐标 [0, 127]
  - `uint8_t y1` 第一个点纵坐标 [0, 63]
  - `uint8_t x2` 第二个点横坐标 [0, 127]
  - `uint8_t y2` 第二个点纵坐标 [0, 63]
  - `uint8_t x3` 第三个点横坐标 [0, 127]
  - `uint8_t y3` 第三个点纵坐标 [0, 63]
  - `OLED_ColorMode color` 颜色模式

```c
void OLED_DrawFilledTriangle(uint8_t x1, uint8_t y1, uint8_t x2, uint8_t y2, uint8_t x3, uint8_t y3, OLED_ColorMode color);
```



```c
// 示例
OLED_NewFrame(); // 新建一个空白缓冲区
OLED_DrawFilledTriangle(64, 0, 0, 63, 127, 63, OLED_COLOR_NORMAL); // 在屏幕中心绘制一个填充三角形
OLED_ShowFrame(); // 将缓冲区内容显示到屏幕上
```



- 绘制（空心）椭圆

  ：

  - `uint8_t x` 圆心横坐标 [0, 127]
  - `uint8_t y` 圆心纵坐标 [0, 63]
  - `uint8_t a` 长轴长度
  - `uint8_t b` 短轴长度
  - `OLED_ColorMode color` 颜色模式

```c
void OLED_DrawEllipse(uint8_t x, uint8_t y, uint8_t a, uint8_t b, OLED_ColorMode color)
```



```c
// 示例
OLED_NewFrame(); // 新建一个空白缓冲区
OLED_DrawEllipse(64, 32, 30, 15, OLED_COLOR_NORMAL); // 绘制一个空心椭圆
OLED_ShowFrame(); // 将缓冲区内容显示到屏幕上
```



- 显示BMP图像

  ：

  - `uint8_t x` 起始点横坐标 [0, 127]
  - `uint8_t y` 起始点纵坐标 [0, 63]
  - `const Image *img` 图像数据
  - `OLED_ColorMode color` 颜色模式

```c
void OLED_DrawImage(uint8_t x, uint8_t y, const Image *img, OLED_ColorMode color);
```



```c
// 示例
OLED_NewFrame(); // 新建一个空白缓冲区
OLED_DrawImage((128 - (bilibiliImg.w)) / 2, 0, &bilibiliImg, OLED_COLOR_NORMAL); // 显示名为bilibiliImg的BMP图像
OLED_ShowFrame(); // 将缓冲区内容显示到屏幕上
```



#### (3) 取字模

**文字**：分为两类：ASCII字符、中文字符。

- ASCII字符：font.c 库中已包含，可以直接调用

  - 包含 8、12、16、24 四种大小的字体
  - 每种字体均有95个可打印字符

  提示

  具体请参考 [波特律动 串口助手 (baud-dance.com)](https://serial.baud-dance.com/) 中的ASCII码表

- 中文字符：中文字符数量多，STM32内部Flash无法全部存储，因此需要根据使用的字符来取字模。

  - 在线取字模工具：https://led.baud-dance.com/
  - 使用方法
    - 输入所有需要用到的中文字符后，点击右下角复制按钮，复制字模
    - 将字模代码粘贴到font.c中，并在font.h中添加对应的声明
    - 使用OLED_PrintString函数, 传入对应的字体结构体即可显示中文字符

**图片**：支持BMP格式单色位图

- 在线取图模工具：https://led.baud-dance.com/

![取模助手](STM32HAL库学习笔记.assets/取模助手-6cad12174311f98bb95ea9a7f2ac4e72.png)

#### (4) 额外的内容

- 小恐龙游戏：https://led.baud-dance.com/

![小恐龙游戏](STM32HAL库学习笔记.assets/小恐龙游戏-1d3db5e54615fbbfda42f57e56943513.png)

- SSD1306驱动库：https://led.baud-dance.com/

![SSD1306驱动库](STM32HAL库学习笔记.assets/SSD1306驱动库-d211d937557ab3e2ea01301e2b52693c.png)

### 故障排除

#### 屏幕显示偏暗

- **不要在STM32程序启动时马上初始化OLED**

  刚上电时STM32比OLED启动快，立即对OLED进行初始化可能会失败。

  延时10-50毫秒再调用`OLED_Init()`函数即可。

#### cube重新生成代码后，中文出现乱码

- **cubeIDE对中文支持的问题，添加环境变量可以解决（仅Windows下）**

  - 点击开始菜单，输入“环境变量”搜索，进入系统属性设置

  ![搜索环境变量](STM32HAL库学习笔记.assets/搜索环境变量-1f90d6c95c21d89b203dd406704d63c0.png)

  - 点击系统属性下方的“环境变量”，进入环境变量配置页面。如图，点击新建，添加一个环境变量并保存即可。

    变量名：JAVA_TOOL_OPTIONS

    变量值：-Dfile.encoding=UTF-8

  ![添加环境变量](STM32HAL库学习笔记.assets/添加环境变量-113ba49049fc8e3ab51a1b563d216a30.png)

## 【SPI】SPI

SPI（Serial Peripheral Interface）是一种同步串行通信协议，主要用于嵌入式系统中，用于集成电路之间的短距离有线通信。

**典型应用场景有**：

- W25QXX 系列 Flash
- MPU6050 陀螺仪
- NRF24L01 无线模块等。

**一般情况下，SPI 通信有四根线**：

- SCLK：时钟线，由主机产生
- MOSI：主机输出从机输入，主机向从机发送数据
- MISO：主机输入从机输出，从机向主机发送数据
- CS：片选线，用于选择从机

**时钟相位和极性（CPOL、CPHA）**：

- CPOL：时钟极性，决定时钟信号在空闲时是高电平还是低电平
  - CPOL = 0 时，SCLK 空闲时为低电平
  - CPOL = 1 时，SCLK 空闲时为高电平
- CPHA：时钟相位，决定数据采样时机
  - CPHA = 0 时，数据在第一个时钟沿采样
  - CPHA = 1 时，数据在第二个时钟沿采样
- 例如：
  - CPOL = 0，CPHA = 0 时，SCLK 空闲时为低电平，数据在第一个时钟沿采样（上升沿采样）
  - CPOL = 1，CPHA = 0 时，SCLK 空闲时为高电平，数据在第一个时钟沿采样（下降沿采样）
  - CPOL = 0，CPHA = 1 时，SCLK 空闲时为低电平，数据在第二个时钟沿采样（下降沿采样）
  - CPOL = 1，CPHA = 1 时，SCLK 空闲时为高电平，数据在第二个时钟沿采样（上升沿采样）

> 时钟极性和相位的配置于目标芯片有关，需要根据目标芯片的 SPI 时序要求进行配置

**SPI 通信流程实例**：

- 这是一个典型的 SPI 通信流程，主机通过 SCLK 产生时钟信号，通过 MOSI 向从机发送数据，通过 MISO 从从机接收数据

  > 配置 CPOL = 0，CPHA = 0 ，可见 SCLK 空闲时为低电平，数据在第一个时钟沿采样（上升沿采样）

  > 通信波形文件包含在例程zip包中，可以使用【Saleae Logic 2】软件打开查看

![logic1](STM32HAL库学习笔记.assets/logic1-aedc9e0bf75a81da420816be579f2b1a.png)

## 【ADC】读取电位器电压

### 1、工程配置

- **打开ADC1**：在Pinout&Configuration页面，将PA5设置为ADC1_IN5

- **配置ADC**：在Pinout&Configuration -> Analog -> ADC1 -> Configuration中

  - ADC_Settings -> Continuous Conversion Mode设为Enable，使ADC转换持续进行，不需要每次获取之前手动触发转换
  - ADC_Regular_ConversionMode -> Rank -> Sampling Time设为239.5 Cycles，最长采样时间，可以获得更稳定的转换结果

- **打开串口2外设**：Pinout&Configuration -> Connectivity -> USART2，将Mode选择为Asynchronous

- **启用float打印**：在cubeIDE菜单栏中，Project Properties -> C/C++ Build -> Settings -> Tool Settings -> MCU Settings，勾选Use float with printf ... -nano

  > 默认情况下，sprintf函数不能打印小数。因此我们需要配置一下编译器，使其能够打印小数

### 2、代码

#### (1) 初始化过程

- **引用头文件**：需要使用 sprintf 打印输出，以及数学函数，在 main.c 引用头文件：

```c
#include "stdio.h"
#include "string.h"
#include "math.h"
```



- **启动连续ADC转换**

```c
// 启动连续ADC转换
HAL_ADC_Start(&hadc1);
// 等待ADC稳定
HAL_Delay(500);
```



#### (2) 读取ADC结果

```c
// 获取ADC值
result = HAL_ADC_GetValue(&hadc1);
// 计算电压值：电压 = ADC结果 × 3.3V ÷ 4095
voltage = result * 3.3f / 4095;
// 将变量打印为字符串
sprintf(send_buf, "原始值: %d，电压值: %.3f V\r\n", result, voltage);
// 通过串口2发送
HAL_UART_Transmit(&huart2, (uint8_t*) send_buf, strlen(send_buf), 20);
```

## 【Timer】旋转编码器

### 1、工程配置

- **分配引脚**：在Pinout&Configuration页面，将PA8、PA9分别配置为TIM1_CH1、TIM1_CH2

![配置PINOUT](STM32HAL库学习笔记.assets/配置PINOUT-06626ba36adb01b3f788d32483f95555.png)

- **配置TIM1**：在Pinout&Configuration -> Timers -> TIM1
  - Mode -> Combined Channels设为Encoder Mode，使TIM1进入“编码器模式”
  - Configuration -> Encoder -> Input Filter 设为 15，最大程度滤波，可以获得更稳定的效果

![配置TIM1](STM32HAL库学习笔记.assets/配置TIM1-f26aa0b1f9330fdb673b47611f4f3541.png)

- **打开串口2外设**：Pinout&Configuration -> Connectivity -> USART2，将Mode选择为Asynchronous

### 2、代码

#### (1) 初始化过程

```c
// 启动编码器
HAL_TIM_Encoder_Start(&htim1, TIM_CHANNEL_ALL);
// 给TIM1的CNT赋初值1000
htim1.Instance->CNT = 1000;
```



> 赋初值1000是为了方便观察，实际应用中可以根据需求赋初值

#### (2) 获得脉冲计数

- **通过函数获取TIM1的CNT值**

  - `__HAL_TIM_GET_COUNTER(&htim1)`
  - `return` 返回uint16_t整数型变量，即当前的计数值

  ```c
  cnt_encoder = __HAL_TIM_GET_COUNTER(&htim1);
  ```

  

- **通过脉冲计算角度**

  - 每个脉冲代表18°，因此将脉冲数乘以18°即可

  ```c
  angle = cnt_encoder * 18;
  ```

## 【Timer】超声波测距

### 1、工程配置

- **开启外部晶振**：在Pinout&Configuration -> System Core -> RCC 页面，将 High Speed Clock (HSE) 配置为 Crystal/Ceramic Resonator

![配置时钟源](STM32HAL库学习笔记.assets/配置时钟源-d967a2e4219ddd58666f730a79f7def4-1755341749687-35.png)

- **配置时钟频率**：在Clock Configuration 页面，将PLL Source 选择为 HSE，将System Clock Mux 选择为 PLLCLK，然后在HCLK (MHz) 输入72并回车，将HCLK频率配置为 72 MHz

![时钟配置](STM32HAL库学习笔记.assets/时钟配置-347ae32e413ed44e85f705a744e42478-1755341752755-38.png)

- **分配引脚**：在Pinout&Configuration页面，将PA11、PA10分别配置为GPIO_Output、TIM1_CH3，并将PA11命名为TRIG
- **配置TIM1**：在Pinout&Configuration -> Timers -> TIM1
  - Mode -> Clock Source 设为 Internal Clock，Channel3 设为 Input Capture direct mode，即**输入捕获**
  - Configuration -> Parameter Settings -> Counter Settings -> Prescaler 设为 72-1，使定时器计数周期刚好为 **1 us**
  - （可选）开启输入滤波，以提高稳定性：Configuration -> Parameter Settings -> Input Capture Channel 3 -> Input Filter，填写范围0 - 15，数值越大，**滤波效果越强**
  - Configuration -> NVIC Settings -> 勾选TIM1 capture compare interrupt，开启**捕获中断**

![TIM1配置](STM32HAL库学习笔记.assets/TIM1配置-817696ebb9da5a74e153636cb53bfb53.png)

- **打开串口2外设**：Pinout&Configuration -> Connectivity -> USART2，将Mode选择为Asynchronous
- **启用float打印**：在cubeIDE菜单栏中，Project Properties -> C/C++ Build -> Settings -> Tool Settings -> MCU Settings，勾选Use float with printf ... -nano

> 默认情况下，sprintf函数不能打印小数。因此我们需要配置一下编译器，使其能够打印小数

### 2、代码

- **引用头文件**

  - 因为需要打印输出变量，所以应该引用几个头文件：

  ```c
  #include "stdio.h"
  #include "string.h"
  ```

  

- **触发测量**

  - 将TRIG引脚拉高至少10us后拉低，触发测量

  ```c
  // 触发
  HAL_GPIO_WritePin(TRIG_GPIO_Port, TRIG_Pin, 1);
  HAL_Delay(5);
  HAL_GPIO_WritePin(TRIG_GPIO_Port, TRIG_Pin, 0);
  ```

  

- **打开脉冲捕获**

  - 先清零变量
  - `__HAL_TIM_SET_CAPTUREPOLARITY `配置为上升沿捕获
  - `HAL_TIM_IC_Start_IT(&htim1, TIM_CHANNEL_3)` 开始捕获

  ```c
  // 清零
  rising_cnt = 0;
  falling_cnt = 0;
  echo_flag = 0;
  __HAL_TIM_SET_COUNTER(&htim1, 0);
  // 开始捕获
  __HAL_TIM_SET_CAPTUREPOLARITY(&htim1, TIM_CHANNEL_3, TIM_INPUTCHANNELPOLARITY_RISING);
  HAL_TIM_IC_Start_IT(&htim1, TIM_CHANNEL_3);
  ```

  

- **重定义输入捕获中断函数**

  - 捕获到边沿时，Timer会自动记录当前的计数值，通过`__HAL_TIM_SET_CAPTUREPOLARITY`函数即可获取
  - 捕获到上升沿时，立即配置成下降沿捕获，以捕获下降沿
  - 将上升沿、下降沿的值分别保存到变量`rising_cnt`、`falling_cnt`

  ```c
  void HAL_TIM_IC_CaptureCallback(TIM_HandleTypeDef *htim)
  {
    if (htim == &htim1 && htim->Channel == HAL_TIM_ACTIVE_CHANNEL_3)
    {
      // 捕获到上升沿
      if (!echo_flag)
      {
        rising_cnt = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_3);
        echo_flag = 1;
        __HAL_TIM_SET_CAPTUREPOLARITY(htim, TIM_CHANNEL_3, TIM_INPUTCHANNELPOLARITY_FALLING);
      }
      // 捕获到下降沿
      else
      {
        falling_cnt = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_3);
        echo_flag = 0;
        __HAL_TIM_SET_CAPTUREPOLARITY(htim, TIM_CHANNEL_3, TIM_INPUTCHANNELPOLARITY_RISING);
      }
    }
  }
  ```

  

- **计算距离**

  - 当`rising_cnt`、`falling_cnt`都捕获完成时，计算距离，并通过串口发送结果

  ```c
  if (rising_cnt != 0 && falling_cnt != 0)
  {
      // 计算距离
      // 定时器每1us计数1次，因此 距离=计数*0.34/2（毫米）
      float distance = (falling_cnt - rising_cnt) * 0.017;
      // 发送到串口
      char buf[32];
      sprintf(buf, "Distance: %.2f cm\r\n", distance);
      HAL_UART_Transmit(&huart2, (uint8_t *)buf, strlen(buf), 1000);
      break;
  }
  ```

## 【PWM】呼吸灯

### 1、工程配置

- **开启外部晶振**：在Pinout&Configuration -> System Core -> RCC 页面，将 High Speed Clock (HSE) 配置为 Crystal/Ceramic Resonator

![配置时钟源](STM32HAL库学习笔记.assets/配置时钟源-d967a2e4219ddd58666f730a79f7def4-1755341761583-43.png)

- **配置时钟频率**：在Clock Configuration 页面，将PLL Source 选择为 HSE，将System Clock Mux 选择为 PLLCLK，然后在HCLK (MHz) 输入72并回车，将HCLK频率配置为 72 MHz

![时钟配置](STM32HAL库学习笔记.assets/时钟配置-347ae32e413ed44e85f705a744e42478-1755341763773-46.png)

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

## 【PWM】舵机控制

### SG-90 舵机简介

- 舵机最早是应用于**遥控模型**的小型执行器，因此也称为RC舵机。它有一个输出轴，可以连接摇臂，通过输入信号就能**控制摇臂的运动**。

- 与电机不同的是，它可以准确的控制摇臂旋转到某一个**指定位置**，并且自动抵抗外力，维持位置。

- 除了RC模型，舵机可以用于双足机器人、机械臂、自动化执行器（阀门、门窗等等）

  > 注意：舵机内部是塑料减速齿轮，不可大力掰摇臂，避免损坏齿轮

- 舵机的输入信号为 **50Hz** 的PWM波，其占空比范围 **2.5%~12.5%**，分别对应 **0°~180°**位置。因此，调整PWM占空比即可控制舵机的角度。

### 1、工程配置

- **开启外部晶振**：在Pinout&Configuration -> System Core -> RCC 页面，将 High Speed Clock (HSE) 配置为 Crystal/Ceramic Resonator

![配置时钟源](STM32HAL库学习笔记.assets/配置时钟源-d967a2e4219ddd58666f730a79f7def4-1755341767155-49.png)

- **配置时钟频率**：在Clock Configuration 页面，将PLL Source 选择为 HSE，将System Clock Mux 选择为 PLLCLK，然后在HCLK (MHz) 输入72并回车，将HCLK频率配置为 72 MHz

![时钟配置](STM32HAL库学习笔记.assets/时钟配置-347ae32e413ed44e85f705a744e42478-1755341769050-52.png)

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

  ![配置时钟源](STM32HAL库学习笔记.assets/配置时钟源-d967a2e4219ddd58666f730a79f7def4-1755341772241-55.png)

  - **配置时钟频率**：在Clock Configuration 页面，将PLL Source 选择为 HSE，将System Clock Mux 选择为 PLLCLK，然后在HCLK (MHz) 输入72并回车，将HCLK频率配置为 72 MHz

  ![时钟配置](STM32HAL库学习笔记.assets/时钟配置-347ae32e413ed44e85f705a744e42478-1755341773945-58.png)

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

## 【PWM】直流电机（DRV8833 电机）

### 1、工程配置

- **开启外部晶振**：在Pinout&Configuration -> System Core -> RCC 页面，将 High Speed Clock (HSE) 配置为 Crystal/Ceramic Resonator

![配置时钟源](STM32HAL库学习笔记.assets/配置时钟源-d967a2e4219ddd58666f730a79f7def4-1755341777398-61.png)

- **配置时钟频率**：在Clock Configuration 页面，将PLL Source 选择为 HSE，将System Clock Mux 选择为 PLLCLK，然后在HCLK (MHz) 输入72并回车，将HCLK频率配置为 72 MHz

![时钟配置](STM32HAL库学习笔记.assets/时钟配置-347ae32e413ed44e85f705a744e42478-1755341779254-64.png)

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

## 【UART】命令点灯

### 1、工程配置

1️⃣ **分配引脚**：如图，将 `PA6`、`PA7`、`PB0` 配置为 `GPIO_Output`，并分别设置 User label 为 `BLUE`、`GREEN`、`RED`

提示

**左键**点击对应的引脚，选择 GPIO_Output； **右键**点击对应的引脚，选择 User label，分别输入 BLUE、GREEN、RED

![gpio config](STM32HAL库学习笔记.assets/gpio config-b147238d74e1b4a90d7a6ce271df6719-1755341782022-67.png)

2️⃣ **打开串口2外设**：`Pinout&Configuration` -> `Connectivity` -> `USART2`，将 `Mode` 选择为 `Asynchronous`

![uart config](STM32HAL库学习笔记.assets/configUART-627416204c717e0c7e61c6228a19ca6a.png)

### 2、代码

1️⃣ 定义串口接收缓冲区，数组大小为2

```c
// 串口接收缓冲区
uint8_t rx_data[2];
```



2️⃣ 在while循环中，使用HAL_UART_Receive函数接收串口数据

信息

`HAL_MAX_DELAY` 表示阻塞等待，直到接收到 2 个字节为止

```c
// 开始接收数据，阻塞等待，直到接收到 2 个字节
HAL_UART_Receive(&huart2, rx_data, 2, HAL_MAX_DELAY);
```



3️⃣ 在while循环中，使用if语句判断接收到的数据，并控制LED

信息

`rx_data[0]` 第一个字符为颜色（R：红色，G：绿色，B：蓝色）

`rx_data[1]` 第二个字符为状态（0：灭，1：亮）

```c
// 根据接收到的数据控制 LED
GPIO_PinState state = GPIO_PIN_SET;
if (rx_data[1] == '0')
{
    state = GPIO_PIN_RESET;
}
if (rx_data[0] == 'R')
{
    HAL_GPIO_WritePin(RED_GPIO_Port, RED_Pin, state); 
}
else if (rx_data[0] == 'G')
{
    HAL_GPIO_WritePin(GREEN_GPIO_Port, GREEN_Pin, state); 
}
else if (rx_data[0] == 'B')
{
    HAL_GPIO_WritePin(BLUE_GPIO_Port, BLUE_Pin, state);
}
```



4️⃣ 在while循环最后，使用HAL_UART_Transmit函数返回收到的数据

信息

`HAL_MAX_DELAY` 表示阻塞等待，直到 2 个字节全部发送成功

```c
// 将收到的数据返回
HAL_UART_Transmit(&huart2, rx_data, 2, HAL_MAX_DELAY);
```



## 为什么返回数据发生颠倒？

例如发送 R1 返回却变成 1R

**原因**：`HAL_UART_Receive` 固定接收2字节。发送非2字节数据（如1或3字节）会使剩余字节留在缓冲区，下次读取时导致数据错乱。

**解决方法**：可以在 while 循环最上面添加一行代码，清空缓冲区

```c
while (1)
{
    // 先清空一下缓冲区
    HAL_UART_Receive(&huart2, rx_data, 1, 0);
    // 然后开始接收数据...
    // 控制 LED...
    // 将收到的数据返回...
}

```

## 【UART】命令中断

### 1、工程配置

- **分配引脚**：在Pinout&Configuration页面，将 PA6、PA7、PB0 配置为 GPIO_Output，并分别设置 User label 为 BLUE、GREEN、RED

  > 1、**左键**点击对应的引脚，选择 GPIO_Output；
  >
  > 2、**右键**点击对应的引脚，选择 User label，分别输入 BLUE、GREEN、RED

![gpio config](STM32HAL库学习笔记.assets/gpio config-b147238d74e1b4a90d7a6ce271df6719-1755341787471-72.png)

- **打开串口2外设**：Pinout&Configuration -> Connectivity -> USART2，将Mode选择为Asynchronous
- **使能串口中断**：在 USART2 -> Configuration -> NVIC Settings 标签卡中，勾选 USART2 global interrupt 的 Enable

![IT config](STM32HAL库学习笔记.assets/enableIT-d2f4f193f635a77d9ad8f514e943ca78.png)

### 2、代码

- 定义全局变量 `rx_data` 作为串口接收缓冲区。

  ```c
  // 串口接收缓冲区
  uint8_t rx_data[2];
  ```

  

- 在 main 函数中，使用 `HAL_UART_Receive_IT` 函数开启串口接收中断

  > 只需要开启一次，接收到数据后会自动进入中断函数

  ```c
  // 开启串口中断接收
  HAL_UART_Receive_IT(&huart2, rx_data, 2);
  ```

  

- 在串口中断函数 `HAL_UART_RxCpltCallback` 中，处理接收到的数据，并控制LED

  > **所有的串口接收和发送操作都在中断函数中进行，不会阻塞主程序**

  > **因此，while 循环中可以自由的处理其他任务**

  ```c
  // 串口接收完成（收到2个字节）中断回调函数
  void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
  {
  if (huart->Instance == USART2)
  {
      // 根据接收到的数据控制 LED
      GPIO_PinState state = GPIO_PIN_SET;
      if (rx_data[1] == '0')
      {
      state = GPIO_PIN_RESET;
      }
      if (rx_data[0] == 'R')
      {
      HAL_GPIO_WritePin(RED_GPIO_Port, RED_Pin, state);
      }
      else if (rx_data[0] == 'G')
      {
      HAL_GPIO_WritePin(GREEN_GPIO_Port, GREEN_Pin, state);
      }
      else if (rx_data[0] == 'B')
      {
      HAL_GPIO_WritePin(BLUE_GPIO_Port, BLUE_Pin, state);
      }
      // 将收到的数据返回（中断发送）
      HAL_UART_Transmit_IT(&huart2, rx_data, 2);
      // 重新开启中断接收
      HAL_UART_Receive_IT(&huart2, rx_data, 2);
  }
  }
  ```

  

### 3、返回数据发生颠倒

例如发送 R1 返回却变成 1R

- **原因**：`HAL_UART_Receive_IT` 固定接收2字节。发送非2字节数据（如1或3字节）会使剩余字节留在缓冲区，下次读取时导致数据错乱。

## 【UART】任意数据收发

### 1、工程配置

- **打开串口2外设**：Pinout&Configuration -> Connectivity -> USART2，将Mode选择为Asynchronous
- **添加DMA通道**：在 USART2 -> Configuration -> DMA Settings 标签卡中，点击 Add 按钮，分别添加 USART2_RX 和 USART2_TX 的 DMA 通道

![DMA config](STM32HAL库学习笔记.assets/configDMA-603ec3152ac06c417d674213cb08935c.png)

- **使能串口中断**：在 USART2 -> Configuration -> NVIC Settings 标签卡中，勾选 USART2 global interrupt 的 Enable

![IT config](https://docs.keysking.com/assets/images/enableIT-32fe6591bbdd18442d40013910f42fde.png)

### 2、代码

- 定义全局变量 `rx_data` 作为串口接收缓冲区

  > 由于是不定长数据的接收，因此缓冲区大小可以根据实际需求调整，**只能大不能小，否则可能会丢失数据**

  ```c
  // 串口接收缓冲区
  uint8_t rx_data[256] = {0};
  ```

  

- 在 main 函数中，使用 `HAL_UARTEx_ReceiveToIdle_DMA` 函数开启不定长数据DMA接收

  > **注意：需要关闭DMA传输过半中断，我们只需要接收完成中断**

  > **此函数是以空闲中断作为接收完成的标志，而不是接收长度，因此可以接收任意长度的数据**

  ```c
  // 使用Ex函数，接收不定长数据
  HAL_UARTEx_ReceiveToIdle_DMA(&huart2, rx_data, sizeof(rx_data));
  // 关闭DMA传输过半中断（HAL库默认开启，但我们只需要接收完成中断）
  __HAL_DMA_DISABLE_IT(huart2.hdmarx, DMA_IT_HT);
  ```

  

- 在中断函数 `HAL_UARTEx_RxEventCallback` 中，处理接收到的数据

  > **所有的串口接收和发送操作都在中断函数中进行，不会阻塞主程序**

  ```c
  // 不定长数据接收完成回调函数
  void HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size)
  {
      if (huart->Instance == USART2)
      {
          // 使用DMA将接收到的数据发送回去
          HAL_UART_Transmit_DMA(&huart2, rx_data, Size);
          // 重新启动接收，使用Ex函数，接收不定长数据
          HAL_UARTEx_ReceiveToIdle_DMA(&huart2, rx_data, sizeof(rx_data));
          // 关闭DMA传输过半中断（HAL库默认开启，但我们只需要接收完成中断）
          __HAL_DMA_DISABLE_IT(huart2.hdmarx, DMA_IT_HT);
      }
  }
  ```

## 【蓝牙】蓝牙透传通信

### 1、工程配置

- **打开串口3外设**：Pinout&Configuration -> Connectivity -> USART3，将Mode选择为Asynchronous

  > DX-BT24 模块连接到学习板的 USART3

- **更改波特率**：在 USART3 -> Configuration -> Parameter Settings 标签卡中，将 Baud Rate 更改为 9600

  > DX-BT24 模块默认波特率为 9600

![configBaud](STM32HAL库学习笔记.assets/configBaud-a22b2ba06f58483550d0dfed5d5d243d.png)

- **添加DMA通道**：在 USART3 -> Configuration -> DMA Settings 标签卡中，点击 Add 按钮，分别添加 USART3_RX 和 USART3_TX 的 DMA 通道

![DMA config](STM32HAL库学习笔记.assets/configDMA-51811dd271ee6795aed167294dff42be.png)

- **使能串口中断**：在 USART3 -> Configuration -> NVIC Settings 标签卡中，勾选 USART3 global interrupt 的 Enable

![IT config](STM32HAL库学习笔记.assets/enableIT-8ef64087528b33979137745d47dde231.png)

### 2、代码

- 定义全局变量 `rx_data` 作为串口接收缓冲区

  > 由于是不定长数据的接收，因此缓冲区大小可以根据实际需求调整，**只能大不能小，否则可能会丢失数据**

  ```c
  // 串口接收缓冲区
  uint8_t rx_data[256] = {0};
  ```

  

- 在 main 函数中，使用 `HAL_UARTEx_ReceiveToIdle_DMA` 函数开启不定长数据DMA接收

  > **注意：需要关闭DMA传输过半中断，我们只需要接收完成中断**

  > **此函数是以空闲中断作为接收完成的标志，而不是接收长度，因此可以接收任意长度的数据**

  ```c
  // 使用Ex函数，接收不定长数据
  HAL_UARTEx_ReceiveToIdle_DMA(&huart3, rx_data, sizeof(rx_data));
  // 关闭DMA传输过半中断（HAL库默认开启，但我们只需要接收完成中断）
  __HAL_DMA_DISABLE_IT(huart3.hdmarx, DMA_IT_HT);
  ```

  

- 在中断函数 `HAL_UARTEx_RxEventCallback` 中，处理接收到的数据

  > **所有的串口接收和发送操作都在中断函数中进行，不会阻塞主程序**

  ```c
  // 不定长数据接收完成回调函数
  void HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size)
  {
      if (huart->Instance == USART3)
      {
          // 使用DMA将接收到的数据发送回去
          HAL_UART_Transmit_DMA(&huart3, rx_data, Size);
          // 重新启动接收，使用Ex函数，接收不定长数据
          HAL_UARTEx_ReceiveToIdle_DMA(&huart3, rx_data, sizeof(rx_data));
          // 关闭DMA传输过半中断（HAL库默认开启，但我们只需要接收完成中断）
          __HAL_DMA_DISABLE_IT(huart3.hdmarx, DMA_IT_HT);
      }
  }
  ```