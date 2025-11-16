---
title: STM32Cube_HAL库笔记（七）-IIC
date: 2025-11-14 00:00:00
type: paper
category: HAL
photos: 
tags:
  - IIC
  - STM32
  - HAL
  - I2C
  - EEPROM
excerpt: 讲解STM32 HAL库中IIC通信的实现，包括硬件IIC读取AT24C02等应用。
description: 
---

> 本系列主要讲解STM32CubeHAL的使用，详细的安装部署教程请见[【STM32】STM32 CubeMx使用教程一--安装教程-CSDN博客](https://blog.csdn.net/as480133937/article/details/98885316)

IIC原理详见标准库笔记

# IIC

## 工程配置

**1设置RCC时钟**

**设置高速外部时钟HSE 选择外部时钟源**

![在这里插入图片描述](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/0cae65d86646b66df9f257ef4459000b.png)

**2 IIC设置**

![image-20251114193142806](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251114193142806.png)

**点击I2C1 设置为I2C** 因为我们的硬件IIC 芯片一般都是主设备，也就是一般情况设置主模式即可

- **Master  features  主模式特性**
- **I2C Speed Mode**： IIC模式设置 快速模式和标准模式。实际上也就是速率的选择。
- **I2C Clock Speed**：I2C传输速率，默认为100KHz
- **Slave  features  从模式特性**
- **Clock No Stretch Mode**： 时钟没有扩展模式
- - **IIC时钟拉伸(Clock stretching)**
    **clock stretching通过将SCL线拉低来暂停一个传输.直到释放SCL线为高电平,传输才继续进行.clock stretching是可选的**,实际上大多数从设备不包括SCL驱动,所以它们不能stretch时钟.
- **Primary Address Length selection：** **从设备地址长度** 设置从设备的地址是7bit还是10bit 大部分为7bit
  -**Dual Address Acknowledged：** 双地址确认
- **Primary slave address：**  从设备初始地址

**这里我们保持默认即可**

**5 时钟源设置**
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/cf0365a5f17a10ba50107a7db6911824.png)
我的是 外部晶振为8MHz

- 1选择外部时钟HSE 8MHz
- 2PLL锁相环倍频9倍
- 3系统时钟来源选择为PLL
- 4设置APB1分频器为 /2
- 5 使能CSS监视时钟

## IIC的HAL库函数

### **一、初始化与反初始化**

**1. `HAL_I2C_Init(I2C_HandleTypeDef *hi2c)`**

- 参数

  ：

  ```
  hi2c
  ```

  - 指向 I2C 句柄结构体的指针（

    ```
    I2C_HandleTypeDef
    ```

    ），包含 I2C 外设配置信息，如：

    - `Instance`：I2C 外设基地址（如`I2C1`、`I2C2`）；
    - `Init`：初始化参数（速率、地址模式、超时时间等）；
    - `State`：当前状态（内部维护，用户无需修改）。

**2. `HAL_I2C_DeInit(I2C_HandleTypeDef *hi2c)`**

- 参数

  ：

  ```
  hi2c
  ```

  - 同`HAL_I2C_Init`，指向需要反初始化的 I2C 句柄，用于释放外设资源。

### **二、阻塞式数据传输（轮询模式）**

**1. 主机发送：`HAL_I2C_Master_Transmit(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint8_t *pData, uint16_t Size, uint32_t Timeout)`**

- `hi2c`：I2C 句柄（如`&hi2c1`）；
- `DevAddress`：从设备地址（7 位或 10 位，需根据从机支持配置，HAL 会自动处理读写位）；
- `pData`：指向待发送数据的缓冲区指针；
- `Size`：发送数据的长度（字节数）；
- `Timeout`：超时时间（毫秒，超过此时间返回错误）。

**2. 主机接收：`HAL_I2C_Master_Receive(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint8_t *pData, uint16_t Size, uint32_t Timeout)`**

- 参数同`HAL_I2C_Master_Transmit`，区别：`pData`为接收数据的缓冲区指针。

**3. 从机发送：`HAL_I2C_Slave_Transmit(I2C_HandleTypeDef *hi2c, uint8_t *pData, uint16_t Size, uint32_t Timeout)`**

- `hi2c`：I2C 句柄；
- `pData`：指向待发送数据的缓冲区指针；
- `Size`：发送数据长度；
- `Timeout`：超时时间（等待主机读取的最大时长）。

**4. 从机接收：`HAL_I2C_Slave_Receive(I2C_HandleTypeDef *hi2c, uint8_t *pData, uint16_t Size, uint32_t Timeout)`**

- 参数同`HAL_I2C_Slave_Transmit`，区别：`pData`为接收主机数据的缓冲区指针。

**5. 主机写寄存器：`HAL_I2C_Mem_Write(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint8_t *pData, uint16_t Size, uint32_t Timeout)`**

- `hi2c`：I2C 句柄；
- `DevAddress`：从设备地址；
- `MemAddress`：从设备内部寄存器地址（如传感器的控制寄存器地址）；
- `MemAddSize`：寄存器地址长度（`I2C_MEMADD_SIZE_8BIT`或`I2C_MEMADD_SIZE_16BIT`）；
- `pData`：待写入寄存器的数据缓冲区；
- `Size`：写入数据长度；
- `Timeout`：超时时间。

**6. 主机读寄存器：`HAL_I2C_Mem_Read(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint8_t *pData, uint16_t Size, uint32_t Timeout)`**

- 参数同`HAL_I2C_Mem_Write`，区别：`pData`为从寄存器读取数据的缓冲区指针。

### **三、非阻塞式传输（中断模式）**

以主机发送为例（其他中断函数参数类似）：`HAL_I2C_Master_Transmit_IT(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint8_t *pData, uint16_t Size)`

- 参数与阻塞式

  ```
  HAL_I2C_Master_Transmit
  ```

  相比，

  无`Timeout`参数

  （中断模式无需轮询等待），其余参数含义相同：

  - `hi2c`、`DevAddress`、`pData`、`Size`：同阻塞式。

### **四、非阻塞式传输（DMA 模式）**

以主机接收为例（其他 DMA 函数参数类似）：`HAL_I2C_Master_Receive_DMA(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint8_t *pData, uint16_t Size)`

- 参数与中断模式一致，**无`Timeout`**，依赖 DMA 控制器完成数据传输，其余参数含义同阻塞式。

### **五、回调函数**

**1. 传输完成回调（以主机为例）：`HAL_I2C_MasterTxCpltCallback(I2C_HandleTypeDef *hi2c)`**

- `hi2c`：触发回调的 I2C 句柄，用于区分多个 I2C 外设（如同时使用 I2C1 和 I2C2 时）。

**2. 错误回调：`HAL_I2C_ErrorCallback(I2C_HandleTypeDef *hi2c)`**

- `hi2c`：发生错误的 I2C 句柄，可通过`HAL_I2C_GetError(hi2c)`获取具体错误码（如应答失败`HAL_I2C_ERROR_AF`）。

### **六、其他常用函数**

**1. `HAL_I2C_GetState(I2C_HandleTypeDef *hi2c)`**

- `hi2c`：I2C 句柄；
- 返回值：当前 I2C 状态（如`HAL_I2C_STATE_READY`（就绪）、`HAL_I2C_STATE_BUSY_TX`（发送中）等）。

**2. `HAL_I2C_GetError(I2C_HandleTypeDef *hi2c)`**

- `hi2c`：I2C 句柄；
- 返回值：错误代码（如`HAL_I2C_ERROR_NONE`（无错）、`HAL_I2C_ERROR_TIMEOUT`（超时）、`HAL_I2C_ERROR_AF`（应答失败）等）。

**3. `HAL_I2C_IsDeviceReady(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint32_t Trials, uint32_t Timeout)`**

- `hi2c`：I2C 句柄；
- `DevAddress`：从设备地址；
- `Trials`：重试次数（检测失败后重试的次数）；
- `Timeout`：单次检测的超时时间（毫秒）；
- 功能：检测从设备是否在线（发送地址并等待应答）。

**4. `HAL_I2C_Abort(I2C_HandleTypeDef *hi2c, uint32_t Timeout)`**

- `hi2c`：I2C 句柄；
- `Timeout`：超时时间；
- 功能：强制终止当前 I2C 传输，释放总线（用于异常处理，如死锁时）。

## 硬件IIC读取AT24C02

在**mian.c**文件前面声明，AT24C02 写地址和读地址 ，定义写数据数组，和读数据数组

```C
/* USER CODE BEGIN PV */
#include <string.h>

#define ADDR_24LCxx_Write 0xA0
#define ADDR_24LCxx_Read 0xA1
#define BufferSize 256
uint8_t WriteBuffer[BufferSize],ReadBuffer[BufferSize];
uint16_t i;
/* USER CODE END PV */

```

**重新定义printf函数**

在 **stm32f4xx_hal.c**中包含#include <stdio.h>

```C
#include "stm32f4xx_hal.h"
#include <stdio.h>
extern UART_HandleTypeDef huart1;   //声明串口

```

在 **stm32f4xx_hal.c** 中重写fget和fput函数

```C
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

在**main.c**中添加

```C
  /* USER CODE BEGIN 2 */
	for(i=0; i<256; i++)
    WriteBuffer[i]=i;    /* WriteBuffer init */


		printf("\r\n***************I2C Example Z小旋测试*******************************\r\n");
			for (int j=0; j<32; j++)
        {
                if(HAL_I2C_Mem_Write(&hi2c1, ADDR_24LCxx_Write, 8*j, I2C_MEMADD_SIZE_8BIT,WriteBuffer+8*j,8, 1000) == HAL_OK)
                {
                                printf("\r\n EEPROM 24C02 Write Test OK \r\n");
                        HAL_Delay(20);
                }
                else
                {
                         HAL_Delay(20);
                                printf("\r\n EEPROM 24C02 Write Test False \r\n");
                }
		}
		/*
		// wrinte date to EEPROM   如果要一次写一个字节，写256次，用这里的代码
		for(i=0;i<BufferSize;i++)
		{
		    HAL_I2C_Mem_Write(&hi2c1, ADDR_24LCxx_Write, i, I2C_MEMADD_SIZE_8BIT,&WriteBuffer[i],1，0xff);//使用I2C块读，出错。因此采用此种方式，逐个单字节写入
		  HAL_Delay(5);//此处延时必加，与AT24C02写时序有关
		}
		printf("\r\n EEPROM 24C02 Write Test OK \r\n");
		*/

		HAL_I2C_Mem_Read(&hi2c1, ADDR_24LCxx_Read, 0, I2C_MEMADD_SIZE_8BIT,ReadBuffer,BufferSize, 0xff);

		for(i=0; i<256; i++)
			printf("0x%02X  ",ReadBuffer[i]);
			
  /* USER CODE END 2 */

```

**注意事项：**

- **AT24C02的IIC每次写之后要延时一段时间才能继续写** 每次写之后要delay 5ms左右 **不管硬件IIC采用何种形式（DMA，IT），都要确保两次写入的间隔大于5ms;**
- 读写函数最后一个超时调整为1000以上 因为我们一次写8个字节，延时要久一点
- **AT24C02页写入只支持8个byte，所以需要分32次写入。这不是HAL库的bug，而是AT24C02的限制，其他的EEPROM可以支持更多byte的写入。**

