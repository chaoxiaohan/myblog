---
title: STM32Cube_HAL库笔记（三）-DMA
date: 2025-10-09 00:00:00
type: paper
photos: 
tags:
  - DMA
  - STM32
  - HAL
  - UART
  - Serial
  - Interrupt
excerpt: 详细讲解STM32 HAL库中DMA的使用方法，包括串口DMA数据传输、IDLE空闲中断接收等高级功能实现。
description: 
---

> 本系列主要讲解STM32CubeHAL的使用，详细的安装部署教程请见[【STM32】STM32 CubeMx使用教程一--安装教程-CSDN博客](https://blog.csdn.net/as480133937/article/details/98885316)



# 工程配置

### **1设置RCC**

![image-20251113215547522](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113220402805.png)

设置高速外部时钟HSE 选择外部时钟源

### **2设置串口**

![image-20251113215654280](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113215654280.png)



1点击USATR1
2设置MODE为异步通信(Asynchronous)
3基础参数：波特率为115200 Bits/s。传输数据长度为8 Bit。奇偶检验无，停止位1 接收和发送都使能
4GPIO引脚自动设置 USART1_RX/USART_TX
5 NVIC Settings 一栏使能接收中断

### **3DMA设置**

![image-20251113215853242](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113215547522.png)

根据DMA通道预览可以知道，我们用的USART1 的TX RX 分别对应DMA1 的通道4和通道5

点击DMASettings 点击 Add 添加通道
选择USART_RX USART_TX 传输速率设置为中速
DMA传输模式为正常模式
DMA内存地址自增，每次增加一个Byte(字节)



**1DMA基础设置**

右侧点击System Core 点击DMA

**DMA Request** ： **DMA传输的对应外设**

注意： 如果你是在DMA设置界面添加DMA 而没有开启对应外设的话 ，默认为MENTOMEN

**Channel** **DMA传输通道设置**
DMA1 : DMA1 Channel 0~DMA1 Channel 7
DMA2: DMA2 Channel 1~DMA1 Channel 5

**Dirction ： DMA传输方向**
四种传输方向：

- 外设到内存 **Peripheral To Memory**
- 内存到外设 **Memory To Peripheral**
- 内存到内存 **Memory To Memory**
- 外设到外设 **Peripheral To Peripheral**

**Priority： 传输速度**

- 最高优先级 **Very Hight**
- 高优先级 **Hight**
- 中等优先级 **Medium**
- 低优先级；**Low**

**2DMA传输模式**

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/72aa08f192b98af8ce9407d3f221984f.png)

**Normal：正常模式**
当一次DMA数据传输完后，停止DMA传送 ，也就是只传输一次

**Circular： 循环模式**

传输完成后又重新开始继续传输，不断循环永不停止

**3DMA指针递增设置**

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/7dc8739d883460ec47d484b4f5ad7a89.png)

**Increment Address：地址指针递增。**

左侧Src Memory 表示外设地址寄存器

功能：**设置传输数据的时候外设地址是不变还是递增。如果设置 为递增，那么下一次传输的时候地址加 Data Width个字节，**

右侧Dst Memory 表示内存地址寄存器

功能：**设置传输数据时候内存地址是否递增。如果设置 为递增，那么下一次传输的时候地址加 Data Width个字节，**

这个Src Memory一样，只不过针对的是内存。


串口发送数据是将数据不断存进固定外设地址串口的发送数据寄存器(USARTx_TDR)。所以外设的地址是不递增。

而内存储器存储的是要发送的数据，所以地址指针要递增，保证数据**依次被发出**

**串口数据发送寄存器只能存储8bit,每次发送一个字节，所以数据长度选择Byte。**

就是要注意DMA的传输方向别弄错了，到底是PERIPHERIAL到MEMORY还是MEMORY到PERIPHERIAL或者说是Memory到Memory要配置正确。尤其是在用CubeMx配置时，这里有个默认配置是PERIPHERIAL到MEMORY。如果说你的真实意图根本不是从PERIPHERIAL到MEMORY，而你无意中使用了这个默认配置，结果可想而知，DMA传输根本没法正常运行。

### **4时钟源设置**

![image-20251113220402805](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251113215853242.png)

我的是 外部晶振为8MHz

- 1选择外部时钟HSE 8MHz
- 2PLL锁相环倍频9倍
- 3系统时钟来源选择为PLL
- 4设置APB1分频器为 /2
- 5 使能CSS监视时钟

# 代码

## ** 串口使用DMA发送数据**

```C
 /* USER CODE BEGIN Init */
	uint8_t Senbuff[] = "\r\n**** Serial Output Message by DMA ***\r\n   UART DMA Test \r\n   Zxiaoxuan";  //定义数据发送数组
  /* USER CODE END Init */

```

```C
  while (1)
  {
    /* USER CODE END WHILE */
			HAL_UART_Transmit_DMA(&huart1, (uint8_t *)Senbuff, sizeof(Senbuff));
	        HAL_Delay(1000);
    /* USER CODE BEGIN 3 */
  }

```

**注意：如果不开启串口中断，则程序只能发送一次数据,程序不能判断DMA传输是否完成，USART一直处于busy状态。**

**HAL库UARTDMA函数库介绍**

1、串口发送/接收函数

- **HAL_UART_Transmit()**;串口发送数据，使用超时管理机制
- **HAL_UART_Receive()**;串口接收数据，使用超时管理机制
- **HAL_UART_Transmit_IT()**;串口中断模式发送
- **HAL_UART_Receive_IT()**;串口中断模式接收
- **HAL_UART_Transmit_DMA()**;串口DMA模式发送
- **HAL_UART_Transmit_DMA()**;串口DMA模式接收
- **HAL_UART_DMAPause()** 暂停串口DMA
- **HAL_UART_DMAResume()**; 恢复串口DMA
- **HAL_UART_DMAStop()**; 结束串口DMA



**串口DMA发送数据**：

```C
 HAL_UART_Transmit_DMA(UART_HandleTypeDef *huart, uint8_t *pData, uint16_t Size)

```

功能：串口通过DMA发送指定长度的数据。

参数：

- UART_HandleTypeDef *huart UATR的别名 如 : UART_HandleTypeDef huart1; 别名就是huart1
- *pData 需要发送的数据
- Size 发送的字节数

**串口DMA接收数据**：

```C
HAL_UART_Receive_DMA(UART_HandleTypeDef *huart, uint8_t *pData, uint16_t Size)
```

功能：串口通过DMA接受指定长度的数据。

参数：

- UART_HandleTypeDef *huart UATR的别名 如 : UART_HandleTypeDef huart1; 别名就是huart1
- *pData 需要存放接收数据的数组
- Size 接受的字节数

##  **STM32 IDLE 接收空闲中断**

STM32的IDLE的中断产生条件：在串口无数据接收的情况下，不会产生，当清除IDLE标志位后，必须有接收到第一个数据后，才开始触发，一但接收的数据断流，没有接收到数据，即产生IDLE中断

**uart.c**

```C
volatile uint8_t rx_len = 0;  //接收一帧数据的长度
volatile uint8_t recv_end_flag = 0; //一帧数据接收完成标志
uint8_t rx_buffer[100]={0};  //接收数据缓存数组
void MX_USART1_UART_Init(void)
{

  huart1.Instance = USART1;
  huart1.Init.BaudRate = 115200;
  huart1.Init.WordLength = UART_WORDLENGTH_8B;
  huart1.Init.StopBits = UART_STOPBITS_1;
  huart1.Init.Parity = UART_PARITY_NONE;
  huart1.Init.Mode = UART_MODE_TX_RX;
  huart1.Init.HwFlowCtl = UART_HWCONTROL_NONE;
  huart1.Init.OverSampling = UART_OVERSAMPLING_16;
  if (HAL_UART_Init(&huart1) != HAL_OK)
  {
    Error_Handler();
  }
//下方为自己添加的代码
	__HAL_UART_ENABLE_IT(&huart1, UART_IT_IDLE); //使能IDLE中断

//DMA接收函数，此句一定要加，不加接收不到第一次传进来的实数据，是空的，且此时接收到的数据长度为缓存器的数据长度
	HAL_UART_Receive_DMA(&huart1,rx_buffer,BUFFER_SIZE);

	
}

```

**uart.h**

```C
extern UART_HandleTypeDef huart1;
extern DMA_HandleTypeDef hdma_usart1_rx;
extern DMA_HandleTypeDef hdma_usart1_tx;
/* USER CODE BEGIN Private defines */
 
 
#define BUFFER_SIZE  100  
extern  volatile uint8_t rx_len ;  //接收一帧数据的长度
extern volatile uint8_t recv_end_flag; //一帧数据接收完成标志
extern uint8_t rx_buffer[100];  //接收数据缓存数组

```

**main.c**

```C
/*
*********************************************************************************************************
* 函 数 名: DMA_Usart_Send
* 功能说明: 串口发送功能函数
* 形  参: buf，len
* 返 回 值: 无
*********************************************************************************************************
*/
void DMA_Usart_Send(uint8_t *buf,uint8_t len)//串口发送封装
{
 if(HAL_UART_Transmit_DMA(&huart1, buf,len)!= HAL_OK) //判断是否发送正常，如果出现异常则进入异常中断函数
  {
   Error_Handler();
  }

}



/*
*********************************************************************************************************
* 函 数 名: DMA_Usart1_Read
* 功能说明: 串口接收功能函数
* 形  参: Data,len
* 返 回 值: 无
*********************************************************************************************************
*/
void DMA_Usart1_Read(uint8_t *Data,uint8_t len)//串口接收封装
{
	HAL_UART_Receive_DMA(&huart1,Data,len);//重新打开DMA接收
}
 while (1)
  {
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
		 if(recv_end_flag == 1)  //接收完成标志
		{
			
			
			DMA_Usart_Send(rx_buffer, rx_len);
			rx_len = 0;//清除计数
			recv_end_flag = 0;//清除接收结束标志位
//			for(uint8_t i=0;i<rx_len;i++)
//				{
//					rx_buffer[i]=0;//清接收缓存
//				}
				memset(rx_buffer,0,rx_len);
  }
		HAL_UART_Receive_DMA(&huart1,rx_buffer,BUFFER_SIZE);//重新打开DMA接收
}

```

**stm32f1xx_it.c中**

```C
#include "usart.h"

void USART1_IRQHandler(void)
{
	uint32_t tmp_flag = 0;
	uint32_t temp;
	tmp_flag =__HAL_UART_GET_FLAG(&huart1,UART_FLAG_IDLE); //获取IDLE标志位
	if((tmp_flag != RESET))//idle标志被置位
	{ 
		__HAL_UART_CLEAR_IDLEFLAG(&huart1);//清除标志位
		//temp = huart1.Instance->SR;  //清除状态寄存器SR,读取SR寄存器可以实现清除SR寄存器的功能
		//temp = huart1.Instance->DR; //读取数据寄存器中的数据
		//这两句和上面那句等效
		HAL_UART_DMAStop(&huart1); //
		temp  =  __HAL_DMA_GET_COUNTER(&hdma_usart1_rx);// 获取DMA中未传输的数据个数   
		//temp  = hdma_usart1_rx.Instance->NDTR;//读取NDTR寄存器 获取DMA中未传输的数据个数，
		//这句和上面那句等效
		rx_len =  BUFFER_SIZE - temp; //总计数减去未传输的数据个数，得到已经接收的数据个数
		recv_end_flag = 1;	// 接受完成标志位置1	
	 }
  HAL_UART_IRQHandler(&huart1);

}

```

# 