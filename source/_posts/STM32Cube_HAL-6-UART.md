---

title: STM32Cube_HAL库笔记（六）-UART
date: 2025-11-13 23:00:00
type: paper
category: HAL
photos: 
tags:
excerpt: 正在施工ing...
description: 
---

> 本系列主要讲解STM32CubeHAL的使用，详细的安装部署教程请见[【STM32】STM32 CubeMx使用教程一--安装教程-CSDN博客](https://blog.csdn.net/as480133937/article/details/98885316)

串口相关原理请移步标准库笔记

# UART

## 工程创建

### **1设置RCC**

- **设置高速外部时钟HSE 选择外部时钟源**
- ![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/87ce23c62d871c4374b2cfea778faa93.png)

### **2设置串口**

![image-20251114181948592](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/e08f22ab7da1e0253eaf9d708d07cdd2.png)

- 1点击USATR1  
- 2设置MODE为**异步通信(Asynchronous)**    
- **3**基础参数**：波特率为115200 Bits/s。传输数据长度为8 Bit。奇偶检验无，停止位1   接收和发送都使能** 
- 4GPIO引脚设置 USART1_RX/USART_TX
- 5 NVIC Settings 一栏使能接收中断

![image-20251114182020579](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251114182020579.png)

### **3设置时钟**

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251114181948592.png)

**我的是 外部晶振为8MHz** 

- 1选择外部时钟HSE 8MHz  
- 2PLL锁相环倍频72倍
- 3系统时钟来源选择为PLL
- 4设置APB1分频器为 /2

## 代码



### HAL库UART函数库介绍

#### UART_HandleTypeDef结构体

```C
/**
* @brief  UART handle Structure definition
*/
typedef struct {
    USART_TypeDef            *Instance;        /*!< 串口外设基地址   */
    UART_InitTypeDef         Init;             /*!< 串口初始化结构体 */
    UART_AdvFeatureInitTypeDef AdvancedInit;   /*!< 串口高级功能配置结构体 */
    uint8_t                  *pTxBuffPtr;      /*!< 发送数据存放的地址 */
    uint16_t                 TxXferSize;       /*!< 发送数据的大小 */
    __IO uint16_t            TxXferCount;      /*!< 发送数据的个数 */
    uint8_t                  *pRxBuffPtr;      /*!< 存放数据的地址 */
    uint16_t                 RxXferSize;       /*!< 接受数据的大小 */
    __IO uint16_t            RxXferCount;      /*!< 接受数据的个数 */
    uint16_t                 Mask;             /*!< 串口接受寄存器掩码          */
    DMA_HandleTypeDef        *hdmatx;          /*!< 串口发送使能DMA的参数配置结构体 */
    DMA_HandleTypeDef        *hdmarx;          /*!< 串口接受使能DMA的参数配置结构体 */
    HAL_LockTypeDef           Lock;            /*!< 锁资源 */
    __IO HAL_UART_StateTypeDef    gState;      /*!< 串口发送状态结构体以及 */
    __IO HAL_UART_StateTypeDef    RxState;     /*!< 串口接受状态结构体 */
    __IO uint32_t             ErrorCode;       /*!< 串口操作错误信息*/
} UART_HandleTypeDef;
```

1. Instance指针： 用于指向用户使用的串口寄存器基地址；
2. Init串口初始化结构体： 用于配置串口的通讯参数，如波特率、串口数据位数、停止位等等。详细参数说明，请看下面初始化结构体的分析；
3. AdvancedInit串口高级功能配置结构： 用于配置串口的高级功能，如自动波特率，MSB先行等等功能。本章节暂时用不到，所以不详细进行讲解；
4. pTxBuffPtr， TxXferSize，TxXferCount：分别是需要发送数据的地址指针，发送数据的大小以及需要发送的数据个数；
5. pRxBuffPtr， RxXferSize，RxXferCount：分别是指向存放数据的地址指针，接受数据的大小，接受数据的个数；
6. Mask： 串口接受寄存器的掩码，用于存放数据的校验位，与初始化结构体中的Parity参数有关；
7. hdmatx， hdmarx结构体：配置串口发送接受数据的DMA具体参数；
8. Lock：串口对象资源锁，该结构体主要负责分配锁资源，可选择HAL_UNLOCKED或者是HAL_LOCKED两个参数。如果gState的值等于HAL_UART_STATE_RESET， 则认为串口未被初始化，此时，分配锁资源，并且调用HAL_UART_MspInit函数来对串口的GPIO和时钟进行初始化，代码见“stm32h7xx_hal_uart.c文件”。 这部分的代码需要用户自己编写，用于实现串口底层配置的功能。在HAL库中，函数调用了一个UNUSED函数，该函数其实是宏定义，主要是为了防止编译提示警告。

```C
/**
* @brief Initialize the UART MSP.
* @param huart: UART handle.
* @retval None
*/
__weak void HAL_UART_MspInit(UART_HandleTypeDef *huart)
{
    /* Prevent unused argument(s) compilation warning */
    UNUSED(huart);
}
```

9. gState，RxState：分别是串口的发送状态、工作状态的结构体和串口接受状态的结构体。HAL_UART_StateTypeDef是一个枚举类型， 列出串口在工作过程中的状态值，有些值只适用于gState，如HAL_UART_STATE_BUSY；
10. ErrorCode：串口错误操作信息。主要用于存放串口操作的错误信息。

接下来，我们看一下UART_InitTypeDef这个结构体类型，该结构体用于配置串口的通讯方式，内嵌于UART_HandleTypeDef结构体中，具体说明如下：

UART_InitTypeDef初始化结构体（stm32h7xx_hal_uart.h文件）

```C
/**
* @brief UART Init Structure definition
*/
typedef struct {
    uint32_t BaudRate;         //波特率
    uint32_t WordLength;       //字长
    uint32_t StopBits;         //停止位
    uint32_t Parity;           //校验位
    uint32_t Mode;             //UART模式
    uint32_t HwFlowCtl;        //硬件流控制
    uint32_t OverSampling;     // 过采样设置，8倍或者16倍
    uint32_t OneBitSampling;   //采样值的位数
    uint32_t Prescaler;        //时钟分频因子
    uint32_t FIFOMode;         //FIFO模式
    uint32_t TXFIFOThreshold;  //发送FIFO的阈值
    uint32_t RXFIFOThreshold;  //接受FIFO的阈值
} UART_InitTypeDef;
```

1. BaudRate：波特率设置。 一般设置为2400、9600、19200、115200。标准库函数会根据设定值计算得到USARTDIV值，见公式 20‑1，并设置USART_BRR寄存器值。
2. WordLength：数据帧字长， 可选8位或9位。它设定USART_CR1寄存器的M位的值。如果没有使能奇偶校验控制，一般使用8数据位；如果使能了奇偶校验则一般设置为9数据位。
3. StopBits：停止位设置， 可选0.5个、1个、1.5个和2个停止位，它设定USART_CR2寄存器的STOP[1:0]位的值，一般我们选择1个停止位。
4. Parity：奇偶校验控制选择， 可选USART_Parity_No(无校验)、USART_Parity_Even(偶校验)以及USART_Parity_Odd(奇校验)，它设定USART_CR1寄存器的PCE位和PS位的值。
5. Mode：USART模式选择， 有USART_Mode_Rx和USART_Mode_Tx，允许使用逻辑或运算选择两个，它设定USART_CR1寄存器的RE位和TE位。
6. HwFlowCtl： 硬件流控制选择，只有在硬件流控制模式下才有效，可选有：使能RTS、使能CTS、同时使能RTS和CTS、不使能硬件流。
7. OverSampling ： 过采样选择，选择8倍过采样或者16过采样。
8. OneBitSampling： 一个采样位方法使能。可选择三个采样位方法或者一个采样位方法。
9. Prescaler： 串口时钟分频因子。默认选择不分频。
10. FIFOMode：FIFO模式。是否使用FIFO模式。
11. TXFIFOThreshold：发送FIFO的阈值。当达到设定的阈值时，将数据发送给TX移位寄存器。阈值的值可以为容量1/8，1/4，1/2，3/4，7/8，满。
12. RXFIFOThreshold：接受FIFO的阈值。当达到设定的阈值时，将数据给接受寄存器。阈值的值可以为容量1/8，1/4，1/2，3/4，7/8，满。



#### 串口发送/接收函数

- **HAL_UART_Transmit**();串口发送数据，使用超时管理机制 
- **HAL_UART_Receive**();串口接收数据，使用超时管理机制
- **HAL_UART_Transmit_IT**();串口中断模式发送 
- **HAL_UART_Receive_IT**();串口中断模式接收
- **HAL_UART_Transmit_DMA**();串口DMA模式发送
- **HAL_UART_Transmit_DMA**();串口DMA模式接收

这几个函数的参数基本都是一样的，我们挑两个讲解一下

**串口发送数据：**

```C
HAL_UART_Transmit(UART_HandleTypeDef *huart, uint8_t *pData, uint16_t Size, uint32_t Timeout)
```

功能：**串口****发送指定长度的数据。如果超时没发送完成，则不再发送，返回超时标志（HAL_TIMEOUT）。**

参数：

- UART_HandleTypeDef *huart   **UATR的别名**  如 :  UART_HandleTypeDef huart1;  别名就是huart1 
- *pData   **需要发送的数据** 
- Size  **发送的字节数**
- Timeout  **最大发送时间**，发送数据超过该时间退出发送  

**中断接收数据：**

```C
HAL_UART_Receive_IT(UART_HandleTypeDef *huart, uint8_t *pData, uint16_t Size)
```

功能：**串口中断接收，以中断方式接收指定长度数据。
大致过程是，设置数据存放位置，接收数据长度，然后使能串口接收中断。接收到数据时，会触发串口中断。
再然后，串口中断函数处理，直到接收到指定长度数据，而后关闭中断，进入中断接收回调函数，不再触发接收中断。(只触发一次中断)**

参数：

- UART_HandleTypeDef *huart   **UATR的别名**  如 :  UART_HandleTypeDef huart1;  别名就是huart1 
- *pData   **接收到的数据存放地址**
- Size  **接收的字节数**

#### 串口中断函数

 

- **HAL_UART_IRQHandler**(UART_HandleTypeDef *huart); //串口中断处理函数
- **HAL_UART_TxCpltCallback**(UART_HandleTypeDef *huart); //串口发送中断回调函数
- **HAL_UART_TxHalfCpltCallback**(UART_HandleTypeDef *huart); //串口发送一半中断回调函数（用的较少）
- **HAL_UART_RxCpltCallback**(UART_HandleTypeDef *huart); //串口接收中断回调函数
- **HAL_UART_RxHalfCpltCallback**(UART_HandleTypeDef *huart);//串口接收一半回调函数（用的较少）
- **HAL_UART_ErrorCallback**();串口接收错误函数

***\*串口接收中断回调函数：\****

```C
HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart);  
```

功能：HAL库的中断进行完之后，并不会直接退出，而是会进入中断回调函数中，用户可以在其中设置代码，

​      **串口中断接收完成之后，会进入该函数**，该函数为空函数，用户需自行修改，

参数：

- UART_HandleTypeDef *huart   **UATR的别名**  如 :  UART_HandleTypeDef huart1;  别名就是huart1 

**串口中断处理函数**

```C
HAL_UART_IRQHandler(UART_HandleTypeDef *huart);  
```

功能：对接收到的数据进行判断和处理 **判断是发送中断还是接收中断**，然后进行数据的发送和接收，在中断服务函数中使用

 

如果接收数据，则会进行接收中断处理函数

```C
 /* UART in mode Receiver ---------------------------------------------------*/
  if((tmp_flag != RESET) && (tmp_it_source != RESET))
  { 
    UART_Receive_IT(huart);
  }
```

如果发送数据，则会进行发送中断处理函数

```C
  /* UART in mode Transmitter ------------------------------------------------*/
  if (((isrflags & USART_SR_TXE) != RESET) && ((cr1its & USART_CR1_TXEIE) != RESET))
  {
    UART_Transmit_IT(huart);
    return;
  }
```

#### 串口查询函数

 **HAL_UART_GetState**(); 判断UART的接收是否结束，或者发送数据是否忙碌

 举例：   

```C
while(HAL_UART_GetState(&huart4) == HAL_UART_STATE_BUSY_TX)   //检测UART发送结束
```

### 重新定义printf函数

- **在 stm32f4xx_hal.c**中包含#include <stdio.h>

```cpp
#include "stm32f4xx_hal.h"
#include <stdio.h>
extern UART_HandleTypeDef huart1;   //声明串口
```

- **在 stm32f4xx_hal.c 中重写fget和fput函数**

- ```cpp
  /**
    * 函数功能: 重定向c库函数printf到DEBUG_USARTx
    * 输入参数: 无
    * 返 回 值: 无
    * 说    明：无
    */
  int fputc(int ch, FILE *f)
  {
    HAL_UART_Transmit(&huart1, (uint8_t *)&ch, 1, 0xffff);
    return ch;
  }
   
  /**
    * 函数功能: 重定向c库函数getchar,scanf到DEBUG_USARTx
    * 输入参数: 无
    * 返 回 值: 无
    * 说    明：无
    */
  int fgetc(FILE *f)
  {
    uint8_t ch = 0;
    HAL_UART_Receive(&huart1, &ch, 1, 0xffff);
    return ch;
  }
  ```

  在main.c中添加

```cpp
 #define RXBUFFERSIZE  256
char RxBuffer[RXBUFFERSIZE]; 
 
  while (1)
  {
    /* USER CODE END WHILE */
			printf("测试\n");
			HAL_Delay(1000);
    /* USER CODE BEGIN 3 */
  }
```

之后便可以使用Printf函数和Scanf，getchar函数

### UART接收中断

**因为中断接收函数只能触发一次接收中断，所以我们需要在中断回调函数中再调用一次中断接收函数**

**具体流程：**

1、初始化串口

2、在main中第一次调用接收中断函数

3、进入接收中断，接收完数据 进入中断回调函数

4、修改HAL_UART_RxCpltCallback中断回调函数，处理接收的数据，

5 **回调函数中要调用一次HAL_UART_Receive_IT函数，使得程序可以重新触发接收中断**

**函数流程图：**

HAL_UART_Receive_IT(**中断接收函数**)   **->** USART2_IRQHandler(void)(**中断服务函数**)  ->  HAL_UART_IRQHandler(UART_HandleTypeDef *huart)(**中断处理函数**)  ->  UART_Receive_IT(UART_HandleTypeDef *huart) (**接收函数**)  ->  HAL_UART_RxCpltCallback(huart);(**中断回调函数**)

HAL_UART_RxCpltCallback函数就是用户要重写在main.c里的回调函数。

**代码实现：**

  并在main.c中添加下列定义：

```C
#include <string.h>
 
#define RXBUFFERSIZE  256     //最大接收字节数
char RxBuffer[RXBUFFERSIZE];   //接收数据
uint8_t aRxBuffer;			//接收中断缓冲
uint8_t Uart1_Rx_Cnt = 0;		//接收缓冲计数
```

在main()主函数中，调用一次接收中断函数

```C
/* USER CODE BEGIN 2 */
	HAL_UART_Receive_IT(&huart1, (uint8_t *)&aRxBuffer, 1);
/* USER CODE END 2 */
```

在main.c下方添加中断回调函数

```C
/* USER CODE BEGIN 4 */
 
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
  /* Prevent unused argument(s) compilation warning */
  UNUSED(huart);
  /* NOTE: This function Should not be modified, when the callback is needed,
           the HAL_UART_TxCpltCallback could be implemented in the user file
   */
 
	if(Uart1_Rx_Cnt >= 255)  //溢出判断
	{
		Uart1_Rx_Cnt = 0;
		memset(RxBuffer,0x00,sizeof(RxBuffer));
		HAL_UART_Transmit(&huart1, (uint8_t *)"数据溢出", 10,0xFFFF); 	
        
	}
	else
	{
		RxBuffer[Uart1_Rx_Cnt++] = aRxBuffer;   //接收数据转存
	
		if((RxBuffer[Uart1_Rx_Cnt-1] == 0x0A)&&(RxBuffer[Uart1_Rx_Cnt-2] == 0x0D)) //判断结束位
		{
			HAL_UART_Transmit(&huart1, (uint8_t *)&RxBuffer, Uart1_Rx_Cnt,0xFFFF); //将收到的信息发送出去
            while(HAL_UART_GetState(&huart1) == HAL_UART_STATE_BUSY_TX);//检测UART发送结束
			Uart1_Rx_Cnt = 0;
			memset(RxBuffer,0x00,sizeof(RxBuffer)); //清空数组
		}
	}
	
	HAL_UART_Receive_IT(&huart1, (uint8_t *)&aRxBuffer, 1);   //再开启接收中断
}
/* USER CODE END 4 */
```

### **字符发送**

USB转串口硬件设计3 字符发送函数

```C
/*****************  发送字符串 **********************/
void Usart_SendString(uint8_t *str)
{
    unsigned int k=0;
    do {
        HAL_UART_Transmit( &UartHandle,(uint8_t *)(str + k) ,1,1000);
        k++;
    } while (*(str + k)!='\0');
}
```

Usart_SendString函数用来发送一个字符串，它实际是调用HAL_UART_Transmit函数（这是一个阻塞的发送函数，无需重复判断串口是否发送完成）发送每个字符， 直到遇到空字符才停止发送。最后使用循环检测发送完成的事件标志来实现保证数据发送完成后才退出函数。