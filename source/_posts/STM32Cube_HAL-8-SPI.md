---
title: STM32Cube_HAL库笔记（八）-SPI
date: 2024-10-09 00:00:00
type: paper
category: HAL
photos: 
tags:
excerpt: 正在施工ing...
description: 
---

> 本系列主要讲解STM32CubeHAL的使用，详细的安装部署教程请见[【STM32】STM32 CubeMx使用教程一--安装教程-CSDN博客](https://blog.csdn.net/as480133937/article/details/98885316)

SPI相关原理请详见标准版笔记

# SPI

## 工程配置

**1设置RCC时钟**

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/2bb8b7f095c5c40f0476782c5ad715df.png)

设置高速外部时钟HSE 选择外部时钟源

**2 SPI设置**

**SPI2设置为全双工主模式，硬件NSS关闭**，如下图：

![image-20251115221157609](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/3cc70756568ee58f2dbb15a55b615f6e.png)

**模式设置:**

- 有主机模式全双工/半双工
- 从机模式全双工/半双工
- 只接收主机模式/只接收从机模式
- 只发送主机模式
- ![image-20251115221221780](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251115221221780.png)

STM32有硬件NSS(片选信号)，可以选择使能，也可以使用其他IO口接到芯片的NSS上进行代替

**其中SIP1的片选NSS ： SPI1_NSS（PA4）
其中SIP2的片选NSS ： SPI2_NSS（PB12）**

如果片选引脚没有连接 SPI1_NSS（PA4）或者SPI2_NSS（PB12），则需要选择软件片选

> **NSS管脚及我们熟知的片选信号**，作为主设备NSS管脚为高电平，从设备NSS管脚为低电平。当NSS管脚为低电平时，该spi设备被选中，可以和主设备进行通信。在stm32中，每个spi控制器的NSS信号引脚都具有两种功能，即输入和输出。所谓的输入就是NSS管脚的信号给自己。所谓的输出就是将NSS的信号送出去，给从机。
> 对于NSS的输入，又分为软件输入和硬件输入。
> 软件输入：
> NSS分为内部管脚和外部管脚，通过设置spi_cr1寄存器的ssm位和ssi位都为1可以设置NSS管脚为软件输入模式且内部管脚提供的电平为高电平，其中SSM位为使能软件输入位。SSI位为设置内部管脚电平位。同理通过设置SSM和SSI位1和0则此时的NSS管脚为软件输入模式但内部管脚提供的电平为0。若从设备是一个其他的带有spi接口的芯片，并不能选择NSS管脚的方式，则可以有两种办法，一种是将NSS管脚直接接低电平。另一种就是通过主设备的任何一个gpio口去输出低电平选中从设备。
> 硬件输入：
> 主机接高电平，从机接低电平。

左键对应的软件片选引脚，选择**GPIO_Output(输出模式)**,然后点击GPIO，设置一下备注。

> 我这里虽然PB12是SPI2的硬件片选NSS，但是我想用软件片选，所以关闭了硬件NSS

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1ac20ca9d45499d66e4c40112cc99b2b.png)

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/9ed4b95c606d8ec7370e613f5b6ee48c.png)

**SPI配置默认如下**：

SPI配置中设置数据长度为8bit,MSB先输出分频为64分频，则波特率为125KBits/s。其他为默认设置。
Motorla格式，CPOL设置为Low,CPHA设置为第一个边沿。不开启CRC检验，NSS为软件控制。

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/470f1c069356db7240b911edabd85c1d.png)



**时钟源设置**![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/f10ce33874cd17e95a4e060190d378ef.png)
我的是 外部晶振为8MHz

- 1**选择外部时钟HSE 8MHz**
- 2**PLL锁相环倍频9倍**
- 3**系统时钟来源选择为PLL**
- 4**设置APB1分频器为 /2**
- 5 **使能CSS监视时钟**



## SPI HAL库函数

1. **SPI 初始化函数**

`HAL_SPI_Init(SPI_HandleTypeDef *hspi)`

- **功能**：初始化 SPI 外设（配置模式、数据位宽、极性 / 相位、波特率等）

- 输入参数

  ：

  - ```
    hspi
    ```

    ：SPI 句柄指针（

    ```
    SPI_HandleTypeDef
    ```

    类型），需提前配置以下成员：

    - `Instance`：SPI 外设基地址（如`SPI1`、`SPI2`）
    - `Init.Mode`：工作模式（`SPI_MODE_MASTER`主机模式 / `SPI_MODE_SLAVE`从机模式）
    - `Init.Direction`：数据方向（`SPI_DIRECTION_2LINES`双线全双工 / `SPI_DIRECTION_2LINES_RXONLY`双线接收 - only / `SPI_DIRECTION_1LINE`单线半双工）
    - `Init.DataSize`：数据位宽（`SPI_DATASIZE_8BIT` / `SPI_DATASIZE_16BIT`）
    - `Init.CLKPolarity`：时钟极性（`SPI_POLARITY_LOW`低电平空闲 / `SPI_POLARITY_HIGH`高电平空闲）
    - `Init.CLKPhase`：时钟相位（`SPI_PHASE_1EDGE`第 1 个边沿采样 / `SPI_PHASE_2EDGE`第 2 个边沿采样）
    - `Init.NSS`：片选控制方式（`SPI_NSS_HARD_INPUT`硬件输入 / `SPI_NSS_HARD_OUTPUT`硬件输出 / `SPI_NSS_SOFT`软件控制）
    - `Init.BaudRatePrescaler`：波特率分频（如`SPI_BAUDRATEPRESCALER_2`、`SPI_BAUDRATEPRESCALER_4`等）
    - `Init.FirstBit`：数据传输顺序（`SPI_FIRSTBIT_MSB`高位在前 / `SPI_FIRSTBIT_LSB`低位在前）
    - `Init.TIMode`：TI 模式使能（`SPI_TIMODE_DISABLE` / `SPI_TIMODE_ENABLE`）
    - `Init.CRCCalculation`：CRC 计算使能（`SPI_CRCCALCULATION_DISABLE` / `SPI_CRCCALCULATION_ENABLE`）
    - `Init.CRCPolynomial`：CRC 多项式（仅当 CRC 使能时有效，如`7`、`0x1021`）

- **输出参数**：无

- **返回值**：`HAL_StatusTypeDef`（`HAL_OK`成功 / 其他错误码）

**2. SPI 反初始化函数**

`HAL_SPI_DeInit(SPI_HandleTypeDef *hspi)`

- **功能**：禁用 SPI 外设并释放相关资源（GPIO 引脚复位为默认状态）

- 输入参数

  ：

  - `hspi`：SPI 句柄指针（已初始化）

- **输出参数**：无

- **返回值**：`HAL_StatusTypeDef`（`HAL_OK`成功 / 其他错误码）

**3. 阻塞式发送函数**

`HAL_SPI_Transmit(SPI_HandleTypeDef *hspi, const uint8_t *pData, uint16_t Size, uint32_t Timeout)`

- **功能**：通过 SPI 发送数据（阻塞模式，直到发送完成或超时）

- 输入参数

  ：

  - `hspi`：SPI 句柄指针
  - `pData`：待发送数据的缓冲区指针（`uint8_t`或`uint16_t`类型，需与`DataSize`匹配）
  - `Size`：发送数据的长度（单位：个数据帧，与`DataSize`对应）
  - `Timeout`：超时时间（单位：ms，如`100`）

- **输出参数**：无（数据通过 SPI 总线发送）

- **返回值**：`HAL_StatusTypeDef`（`HAL_OK`成功 / `HAL_TIMEOUT`超时 / `HAL_ERROR`错误）

**4. 阻塞式接收函数**

`HAL_SPI_Receive(SPI_HandleTypeDef *hspi, uint8_t *pData, uint16_t Size, uint32_t Timeout)`

- **功能**：通过 SPI 接收数据（阻塞模式，直到接收完成或超时）

- 输入参数

  ：

  - `hspi`：SPI 句柄指针
  - `Size`：接收数据的长度（单位：个数据帧）
  - `Timeout`：超时时间（单位：ms）

- 输出参数

  ：

  - `pData`：接收数据的缓冲区指针（用于存储接收结果）

- **返回值**：`HAL_StatusTypeDef`（`HAL_OK`成功 / `HAL_TIMEOUT`超时 / `HAL_ERROR`错误）

**5. 阻塞式全双工收发函数**

`HAL_SPI_TransmitReceive(SPI_HandleTypeDef *hspi, const uint8_t *pTxData, uint8_t *pRxData, uint16_t Size, uint32_t Timeout)`

- **功能**：同时发送和接收数据（全双工模式，阻塞式）

- 输入参数

  ：

  - `hspi`：SPI 句柄指针
  - `pTxData`：待发送数据的缓冲区指针
  - `Size`：收发数据的长度（发送和接收长度相同）
  - `Timeout`：超时时间（单位：ms）

- 输出参数

  ：

  - `pRxData`：接收数据的缓冲区指针（存储接收结果）

- **返回值**：`HAL_StatusTypeDef`（`HAL_OK`成功 / `HAL_TIMEOUT`超时 / `HAL_ERROR`错误）

**6. 中断式发送函数**

`HAL_SPI_Transmit_IT(SPI_HandleTypeDef *hspi, const uint8_t *pData, uint16_t Size)`

- **功能**：通过 SPI 发送数据（中断模式，函数立即返回，发送完成后触发回调）

- 输入参数

  ：

  - `hspi`：SPI 句柄指针
  - `pData`：待发送数据的缓冲区指针
  - `Size`：发送数据的长度

- **输出参数**：无

- **返回值**：`HAL_StatusTypeDef`（`HAL_OK`启动成功 / 其他错误码）

- **回调函数**：发送完成后触发`HAL_SPI_TxCpltCallback(hspi)`

**7. 中断式接收函数**

`HAL_SPI_Receive_IT(SPI_HandleTypeDef *hspi, uint8_t *pData, uint16_t Size)`

- **功能**：通过 SPI 接收数据（中断模式，函数立即返回，接收完成后触发回调）

- 输入参数

  ：

  - `hspi`：SPI 句柄指针
  - `Size`：接收数据的长度

- 输出参数

  ：

  - `pData`：接收数据的缓冲区指针

- **返回值**：`HAL_StatusTypeDef`（`HAL_OK`启动成功 / 其他错误码）

- **回调函数**：接收完成后触发`HAL_SPI_RxCpltCallback(hspi)`

**8. 中断式全双工收发函数**

`HAL_SPI_TransmitReceive_IT(SPI_HandleTypeDef *hspi, const uint8_t *pTxData, uint8_t *pRxData, uint16_t Size)`

- **功能**：全双工收发数据（中断模式，完成后触发回调）

- 输入参数

  ：

  - `hspi`：SPI 句柄指针
  - `pTxData`：待发送数据的缓冲区指针
  - `Size`：收发数据的长度

- 输出参数

  ：

  - `pRxData`：接收数据的缓冲区指针

- **返回值**：`HAL_StatusTypeDef`（`HAL_OK`启动成功 / 其他错误码）

- **回调函数**：完成后触发`HAL_SPI_TxRxCpltCallback(hspi)`

**9. DMA 模式发送函数**

`HAL_SPI_Transmit_DMA(SPI_HandleTypeDef *hspi, const uint8_t *pData, uint16_t Size)`

- **功能**：通过 DMA 发送 SPI 数据（非阻塞，DMA 完成后触发回调）

- 输入参数

  ：

  - `hspi`：SPI 句柄指针（需提前配置 DMA 相关参数）
  - `pData`：待发送数据的缓冲区指针
  - `Size`：发送数据的长度

- **输出参数**：无

- **返回值**：`HAL_StatusTypeDef`（`HAL_OK`启动成功 / 其他错误码）

- **回调函数**：发送完成后触发`HAL_SPI_TxCpltCallback(hspi)`

**10. DMA 模式接收函数**

`HAL_SPI_Receive_DMA(SPI_HandleTypeDef *hspi, uint8_t *pData, uint16_t Size)`

- **功能**：通过 DMA 接收 SPI 数据（非阻塞，DMA 完成后触发回调）

- 输入参数

  ：

  - `hspi`：SPI 句柄指针（需配置 DMA）
  - `Size`：接收数据的长度

- 输出参数

  ：

  - `pData`：接收数据的缓冲区指针

- **返回值**：`HAL_StatusTypeDef`（`HAL_OK`启动成功 / 其他错误码）

- **回调函数**：接收完成后触发`HAL_SPI_RxCpltCallback(hspi)`

**11. 中止传输函数**

`HAL_SPI_Abort(SPI_HandleTypeDef *hspi)`

- **功能**：中止当前 SPI 传输（适用于阻塞模式）

- 输入参数

  ：

  - `hspi`：SPI 句柄指针

- **输出参数**：无

- **返回值**：`HAL_StatusTypeDef`（`HAL_OK`成功 / 其他错误码）

**12. 中止中断 / DMA 传输函数**

`HAL_SPI_Abort_IT(SPI_HandleTypeDef *hspi)`

- **功能**：中止当前中断或 DMA 模式下的 SPI 传输

- 输入参数

  ：

  - `hspi`：SPI 句柄指针

- **输出参数**：无

- **返回值**：`HAL_StatusTypeDef`（`HAL_OK`成功 / 其他错误码）

**说明**

- 函数中的`uint8_t *pData`参数：若 SPI 配置为 16 位数据（`SPI_DATASIZE_16BIT`），需强制转换为`uint16_t *`类型使用。
- 超时时间（`Timeout`）：阻塞模式下，超过该时间未完成操作则返回`HAL_TIMEOUT`。
- 回调函数：用户需在应用中重写（如`HAL_SPI_TxCpltCallback`），实现传输完成后的自定义逻辑。

## W25Q128例程

 **用到的相关指令**

| ***\*指令\**** | ***\*名称\****       | ***\*解释\****                               |
| -------------- | -------------------- | -------------------------------------------- |
| 02h            | Page Program         | 页编程，在一页上写字                         |
| 03h            | Read Data            | 读取数据                                     |
| 05h            | Read Status Register | 读取寄存器状态                               |
| 06h            | Write Enable         | 将状态寄存器中的写启用闩锁（WEL）位设置为1。 |
| 20h            | Sector Erase         | 扇区擦除                                     |
| C7h/60h        | Chip Erase           | 整个芯片擦除                                 |

​    **读取设备ID（举一个例子，其他指令对照芯片手册看即可）**

​    读取设备ID指令根据数据手册，发送0X90+24位地址之后，就可以接收到0XEF + ID，W25Q128的ID为0X17。read_W25Q128_ID()函数可以通过串口打印ID，或者通过单步调试Debug直接查看读到的ID值。

​    可以理解为MCU向W25Q128发送命令0x90 0x00 0x00 0x00 ，然后就可以接收到W25Q128的两个字节 0xEF 0x17

```C
// 读取 ID 测试 OK 0xEF 0X17
void read_W25Q128_ID()
{
	uint8_t _RxData[2]={0x00};
	W25Q128_Enable();
	
	//发送指令
    spi2_Transmit_one_byte(0x90);
	spi2_Transmit_one_byte(0x00);
	spi2_Transmit_one_byte(0x00);
	spi2_Transmit_one_byte(0x00);
	
	//接收数据
	_RxData[0] = spi2_Receive_one_byte();
	_RxData[1] = spi2_Receive_one_byte();
	
    W25Q128_Disable();
    
	printf("%s\r\n",_RxData);	//串口打印 ID
}
```

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251115221157609.png)

**读、写、擦除操作**

​    读、写、擦除操作的24位地址取值范围是0-16777216，因为读可以从指定地址一直读到最后，而写，一次最多写一页，擦除的最小单位为一个扇区4096个字即16页，当然也可以一不做二不休整个芯片擦除，这个擦除时间比较长十几秒，因为是自学，所以总得做点什么。比如：

​    1、写10个数，卡在第一页和第二页之间，即第一页写5个数第二页写5个数。

​    2、写10个数，卡在第一个扇区和第二个扇区之间，即第255页写5个数第256页写5个             数。

​    **问题点：**第一个问题，就要考虑翻页写的问题，第二个问题就要考虑擦除两个扇区和翻页写的问题。

​    **解决思路：**

​    1、通过地址定位到当页还剩下多少个字可以写，通过要写字的个数，分为几次写，写完当页后再翻页写到下一页，直到写完。相关函数：

Write_Page()    Write_Word()

​    2、因为要先进行擦除，然后再写数据，才能保证写入数据的准确性，可以直接擦除整个芯片，要想时间最快，擦除部分应该是最小的，所以选择擦除扇区。通过地址和要写字的个数，就可以判断，要写的地方在哪几个扇区，然后执行擦除即可。相关函数：

Erase_Write_data_Sector()    Erase_one_Sector()

**驱动代码**

**W25Q28.c文件**

```C
#include "W25Q128.h"
#include "spi.h"
#include "usart.h"
#include <stdio.h>
 
uint32_t FLASH_SIZE=16*1024*1024;	//FLASH 大小为16M字节
uint32_t Data_Address = 4090; //测试地址 250（地址在两页之间） 和 4090 （地址在两扇区并且两页之间）
 
//要写的数据
uint8_t Write_data[]={0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x41};
#define Write_data_SIZE sizeof(Write_data)
 
//要读的数据
uint8_t Read_data[100] = {0};
#define Read_data_SIZE sizeof(Read_data)
 
/* Nicky ******************************************************************* */
//器件使能
void W25Q128_Enable()
{
	HAL_GPIO_WritePin(SPI_CS_GPIO_Port, SPI_CS_Pin, RESET); // Chip select
}
 
/* Nicky ******************************************************************* */
//器件失能
void W25Q128_Disable()
{
	HAL_GPIO_WritePin(SPI_CS_GPIO_Port, SPI_CS_Pin, SET); // Chip disselect
}
 
/* Nicky ******************************************************************* */
//SPI2 发送 1 个字节数据
void spi2_Transmit_one_byte(uint8_t _dataTx)
{
	HAL_SPI_Transmit(&hspi2,(uint8_t*) &_dataTx,1,HAL_MAX_DELAY);
}
 
/* Nicky ******************************************************************* */
//SPI2 接收 1 个字节数据
uint8_t spi2_Receive_one_byte()
{
	uint16_t _dataRx;
	HAL_SPI_Receive(&hspi2,(uint8_t*) &_dataRx, 1, HAL_MAX_DELAY);
	return _dataRx;
}
 
/* Nicky ******************************************************************* */
//W25Q128写使能,将WEL置1 
void W25Q128_Write_Enable()   
{
	W25Q128_Enable();                            //使能器件   
    spi2_Transmit_one_byte(0x06); 
	W25Q128_Disable();                            //取消片选     	      
}
 
/* Nicky ******************************************************************* */
//W25Q128写失能,将WEL置0 
void W25Q128_Write_Disable()   
{
	W25Q128_Enable();                            //使能器件   
    spi2_Transmit_one_byte(0x04); 
	W25Q128_Disable();                            //取消片选     	      
}
 
/* Nicky ******************************************************************* */
//读取寄存器状态
uint8_t W25Q128_ReadSR(void)   
{  
	uint8_t byte=0;   
	W25Q128_Enable();                            //使能器件   
	spi2_Transmit_one_byte(0x05);    //发送读取状态寄存器命令
	byte=spi2_Receive_one_byte();             //读取一个字节
	W25Q128_Disable();                           //取消片选     
	return byte;   
} 
 
/* Nicky ******************************************************************* */
//等待空闲
void W25Q128_Wait_Busy()   
{   
	while((W25Q128_ReadSR()&0x01)==0x01);   // 等待BUSY位清空
}
 
/* Nicky ******************************************************************* */
//擦除地址所在的一个扇区
void Erase_one_Sector(uint32_t Address)
{
	W25Q128_Write_Enable();                  //SET WEL 	 
	W25Q128_Wait_Busy(); 		
	W25Q128_Enable();                            //使能器件 
	spi2_Transmit_one_byte(0x20);      //发送扇区擦除指令 
	spi2_Transmit_one_byte((uint8_t)((Address)>>16));  //发送24bit地址    
	spi2_Transmit_one_byte((uint8_t)((Address)>>8));   
	spi2_Transmit_one_byte((uint8_t)Address);  
	W25Q128_Disable();                            //取消片选     	      
	W25Q128_Wait_Busy(); 				   //等待擦除完成
}
 
 
/* Nicky ******************************************************************* */
//擦除地址所在的扇区
void Erase_Write_data_Sector(uint32_t Address,uint32_t Write_data_NUM)   
{
	//总共4096个扇区
	//计算 写入数据开始的地址 + 要写入数据个数的最后地址 所处的扇区	
	uint16_t Star_Sector,End_Sector,Num_Sector;
	Star_Sector = Address / 4096;						//数据写入开始的扇区
	End_Sector = (Address + Write_data_NUM) / 4096;		//数据写入结束的扇区
	Num_Sector = End_Sector - Star_Sector;  			//数据写入跨几个扇区
 
	//开始擦除扇区
	for(uint16_t i=0;i <= Num_Sector;i++)
	{
		Erase_one_Sector(Address);
		Address += 4095;
	}
 
}
 
/* Nicky ******************************************************************* */
//擦除整个芯片 等待时间超长... 10-20S
void Erase_W25Q128_Chip(void)   
{                                   
    W25Q128_Write_Enable();                  //SET WEL 
    W25Q128_Wait_Busy();   
  	W25Q128_Enable();                            //使能器件   
    spi2_Transmit_one_byte(0x60);        //发送片擦除命令  
	W25Q128_Disable();                            //取消片选     	      
	W25Q128_Wait_Busy();   				   //等待芯片擦除结束
} 
 
/* Nicky ******************************************************************* */
//读取W25Q128数据
void Read_W25Q128_data(uint8_t* pBuffer,uint32_t ReadAddr,uint16_t NumByteToRead)   
{ 
 	uint16_t i=0;   										    
	W25Q128_Enable();                     //使能器件   
    spi2_Transmit_one_byte(0x03);         //发送读取命令   
    spi2_Transmit_one_byte((uint8_t)((ReadAddr)>>16));  //发送24bit地址    
    spi2_Transmit_one_byte((uint8_t)((ReadAddr)>>8));   
    spi2_Transmit_one_byte((uint8_t)ReadAddr);   
    for(;i<NumByteToRead;i++)
	{ 
        pBuffer[i]=spi2_Receive_one_byte();   //循环读数  
    }
	W25Q128_Disable(); 				    	      
}
 
/* Nicky ******************************************************************* */
//写字，一次最多一页
void Write_Word(uint8_t* pBuffer, uint32_t WriteAddr, uint16_t NumByteToWrite)
{
 	uint16_t i; 
 
	W25Q128_Write_Enable();                  //SET WEL
	W25Q128_Enable();                            //使能器件
	spi2_Transmit_one_byte(0x02);
    spi2_Transmit_one_byte((uint8_t)((WriteAddr) >> 16)); //写入的目标地址   
    spi2_Transmit_one_byte((uint8_t)((WriteAddr) >> 8));   
    spi2_Transmit_one_byte((uint8_t)WriteAddr);   
    for (i = 0; i < NumByteToWrite; i++)
		spi2_Transmit_one_byte(pBuffer[i]);//循环写入字节数据  
	W25Q128_Disable();
	W25Q128_Wait_Busy();		//写完之后需要等待芯片操作完。
}
 
/* Nicky ******************************************************************* */
//定位到页
void Write_Page(uint8_t* pBuffer,uint32_t WriteAddr,uint16_t NumByteToWrite)   
{
	uint16_t Word_remain;
	Word_remain=256-WriteAddr%256; 	//定位页剩余的字数	
	
	if(NumByteToWrite <= Word_remain)
		Word_remain=NumByteToWrite;		//定位页能一次写完
	while(1)
	{
		Write_Word(pBuffer,WriteAddr,Word_remain);	
		if(NumByteToWrite==Word_remain)
		{
			break;	//判断写完就 break
		}	
	 	else //没写完，翻页了
		{
			pBuffer += Word_remain;		//直针后移当页已写字数
			WriteAddr += Word_remain;	
			NumByteToWrite -= Word_remain;	//减去已经写入了的字数
			if(NumByteToWrite>256)
				Word_remain=256; 		//一次可以写入256个字
			else 
				Word_remain=NumByteToWrite; 	//不够256个字了
		}
	}	    
} 
 
/* Nicky ******************************************************************* */
// 读取 ID 测试 OK 0xEF 0X17
void read_W25Q128_ID()
{
	uint8_t _RxData[2]={0x00};
	W25Q128_Enable();
	
	//发送指令
    spi2_Transmit_one_byte(0x90);
	spi2_Transmit_one_byte(0x00);
	spi2_Transmit_one_byte(0x00);
	spi2_Transmit_one_byte(0x00);
	
	//接收数据
	_RxData[0] = spi2_Receive_one_byte();
	_RxData[1] = spi2_Receive_one_byte();
	
    W25Q128_Disable();
    
	printf("%s\r\n",_RxData);	//串口打印 ID
}
 
/* Nicky ******************************************************************* */
//测试程序
void W25Q128_test()
{
	//读数据，看原始存在的数据
	Read_W25Q128_data(Read_data,Data_Address,Read_data_SIZE);	
	for(uint8_t i=0;i<Write_data_SIZE;i++)
			printf("%c",Read_data[i]);
		printf("\r\n");	
	
	//擦除需要写数据所在的扇区
 	Erase_Write_data_Sector(Data_Address,Write_data_SIZE);
	Read_W25Q128_data(Read_data,Data_Address,Read_data_SIZE);
	for(uint8_t i=0;i<Write_data_SIZE;i++)
			printf("%c",Read_data[i]);
		printf("\r\n");
			
	//写数据
	Write_Page(Write_data,Data_Address,Write_data_SIZE);
	Read_W25Q128_data(Read_data,Data_Address,Read_data_SIZE); 
		
	//串口打印数据
	for(uint8_t i=0;i<Write_data_SIZE;i++)
		printf("%c",Read_data[i]);
	printf("\r\n");
}
```

**W25Q28.h文件**

```C
#include "main.h"
 
void read_W25Q128_ID();
void W25Q128_test();
```

> 参考文献
> [【STM32】HAL库 STM32CubeMX教程十四---SPI_cubemx spi-CSDN博客](https://blog.csdn.net/as480133937/article/details/105849607?spm=1001.2014.3001.5502)
>
> [STM32 Cube IDE HAL库驱动 W25Q128 进行读、写、擦除操作_w25q128驱动程序-CSDN博客](https://blog.csdn.net/qq_30993593/article/details/125234940)
