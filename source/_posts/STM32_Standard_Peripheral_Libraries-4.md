---
title: STM32标准库笔记（四）-BKP、RTC、PWR、WDG、FLASH
date: 2025-10-06 00:00:00
type: paper
photos: 
tags:
  - C
  - STM32
  - Standard
excerpt: 本文探讨STM32备份寄存器、实时时钟、电源控制、看门狗和闪存模块。介绍BKP数据存储、RTC时间管理、PWR低功耗模式、IWDG/WWDG监控机制、FLASH读写编程等高级功能
description: 
---

# 一、BKP备份&RTC实时时钟

RTC是一个独立的定时器。BKP并不能完全掉电不丢失，其可以完成一些主电源掉电时，保存少量数据的任务。而RTC在主电源掉电的时候保证掉电不丢失的关键就是BKP，因此二者关联程度比较高，教程放在一起讲。

## 1.1 Unix时间戳

### 1.1.1 简介

- Unix时间戳(UnixTimestamp)定义为从**UTC/GMT**的1970年1月1日0时0分0秒开始所经过的**秒数****（只用秒来计数，永不进位）**，不考虑闰秒**（****时间戳是一个计数器数值，****计算机领域知识点，别的地方也通用）**
- 时间戳存储在一个秒计数器中，秒计数器为**32位/64位的整型变量（32位2038年到头，如果是无符号就2106年，有生之年吧，但现在64位使用就高枕无忧了）**
- 世界上**所有时区的秒计数器相同**，不同时区通过**添加偏移**来得到当地时间

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713770569626-c8034aea-e2aa-43a3-aeaf-5d0df60683eb.png)

对于计算器来说一个永不进位的数据，无论是存储还是计算，都是非常方便的，因此在计算程序的底层，应用非常广泛。需要给人类观看时候，就转换成年月日时分秒这个的格式就行了。

**【使用好处】：**

①简化硬件电路：在设计RTC硬件电路的时候，直接弄一个很大的秒寄存器就行了，不需要考虑年月日进位大小月平年论润，非常友好。

②进行时间间隔的计算非常方便。

③存储方便，只需要一个很大的变量表示秒数。

**【使用一点坏处】：**

比较占用软件资源，在每次进行秒计数器和日期转换时，都需要经过复杂计算。但好在计算的步骤都是固定的，因此**C语言已经帮我们写好了（Time.h）**，我们只需要调用即可。

### 1.1.2 GMT/UTC

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713770119324-3586dd99-64a7-4135-98fe-5ee739737429.png)

### 1.1.3 时间戳转换

【在线工具推荐】https://tool.lu/timestamp/

C语言的**time.h模块**提供了时间获取和时间戳转换的相关函数，可以方便地进行秒计数器、日期时间和字符串之间的转换

![time.h主要函数列表](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713773302531-a8697431-d803-4c82-9787-59de63ebc304.png)![函数的作用是在各种数据类型之间转换](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713774869510-2f991fb2-b853-4141-b524-c7c54c24becb.png)

秒计数器数据类型time_t：本身的int64位的数据类型

日期时间数据类型struct tm：

字符串数据类型char *：

【要不，自己敲？】

## 1.2 BKP外设

### 1.2.1 BKP简介

- BKP(Backup Registers)备份寄存器（**知道是什么，会读写这些数据寄存器即可**）
- BKP可用于存储用户应用程序数据。当VDD(2.0~3.6V)电源被切断，他们仍然由VBAT(1.8~3.6V)维持供电。当系统在待机模式下被唤醒，或系统复位或电源复位时，他们也不会被复位
- TAMPER引脚产生的侵入事件将所有备份寄存器内容清除
- RTC引脚输出**RTC校准时钟**、RTC闹钟脉冲或者秒脉冲
- 存储RTC时钟校准寄存器
- 用户数据存储容量：**20字节(中容量和小容量)**/84字节(大容量和互联型

### 1.2.2 BKP基本结构

橙色的是后背区域，除了BKP还有RTC电路。STM32后备区的**特性**就是的那个VDD主电源掉电时，后备区仍然可以由VBAT的备用电池供电。当VDD主电源上电时候，后背区域会由VBAT切换到VDD，可以节省电池电量。

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713770295009-c4a78b46-d023-4f88-81f3-9a80e13343d9.png)

## 1.3 RTC外设

### 1.3.1 简介

- RTC(Real Time Clock)实时时钟
- RTC是一个独立的定时器，可为系统**提供时钟和日历**的功能
- RTC和时钟配置系统处于后备区域，**系统复位时数据不清零，**VDD(2.0~3.6V)断电后可借助VBAT(1.8~3.6V)供电继续走时
- 32位的可编程计数器，可对应**Unix时间戳的秒计数器****（只有一个秒寄存器，了解时间戳概念后很好理解）**
- 20位的可编程预分频器，可适配不同频率的输入时钟（确保给到计数器的是1Hz的频率）
- **可选择三种RTC时钟源：****（LSE主要就是供RTC的，只有这一路时钟可以通过VBAT备用电池供电，上下两路用于特殊情况备选）**

- HSE时钟除以128(通常为8MHz/128)
- LSE振荡器时钟(通常为32.768KHz)**——计算比较方便2^15=32768****（设计一个15位计数器，即可1秒自然溢出一次，目前RTC实时时钟常用该晶振）**
- LSI振荡器时钟(40KHz)

（压力不会消失，只会转移，能吃苦就有吃不完的苦）

### 1.3.2 RTC框图

![灰色部分都属于后备区](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713774421446-a518492e-f2a5-4014-8cd0-774c34800ad4.png)

重看重看~

### 1.3.3 RTC基本结构

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713772769609-3f3f982a-22c6-431c-899f-bf484be0ff8b.png)

 略

### 1.3.4 硬件电路

为了配合RCT外部还是需要一些电烤炉的，在最小系统板电路上，要加两部分，一电池，二外部低速晶振。

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713833962379-4fc9d3aa-20c3-4bfa-a1ca-a248a5a84938.png)![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713833161485-5b08347a-618a-4eae-865d-fa0dc4d078f4.png)

### 1.3.5 手册操作注意事项

- **执行以下操作将使能对BKP和RTC的访问：**

- 设置RCC APB1ENR的PWREN和BKPEN，使能PWR和BKP时钟**（同时开启）**
- 设置PWR CR的DBP，使能对BKP和RTC的访问

- 若在读取RTC寄存器时，RTC的APB1接口曾经处于禁止状态，则软件首先必须等待RTC_CRL寄存器中的RSF位(寄存器同步标志)被硬件置1**（即调用一个****RTC等待同步函数****，等一下RTCCLK）**
- **必须设置RTC_CRL寄存器中的CNF位**，使RTC进入配置模式后，才能写入RTC PRL、RTC CNT、RTC ALR寄存器
- 对RTC任何寄存器的写操作，都必须在前一次**写操作结束后**进行可以通过查询RTC CR寄存器中的RTOFF状态位，判断RTC寄存器是否处于更新中。**仅当RTOFF状态位是1时，才可以写入RTC寄存器**

手册，略~

### 【案例】读写备份寄存器

① 使能 RTC 和备份区域时钟：RTC 属于 APB1 总线，备份区域（BKP）需开启 PWR 时钟以解锁：

```c
#include "stm32f10x.h"

void RTC_BKP_Init(void) {
    // 使能PWR和BKP时钟
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_PWR | RCC_APB1Periph_BKP, ENABLE);
    
    // 解锁备份区域（默认锁定，需解锁才能访问）
    PWR_BackupAccessCmd(ENABLE);
```

② 初始化 RTC（若仅需读写备份寄存器，可简化 RTC 配置）：

```c
    // 使能外部低速时钟（LSE，32.768kHz，RTC时钟源）
    RCC_LSEConfig(RCC_LSE_ON);
    while (RCC_GetFlagStatus(RCC_FLAG_LSERDY) == RESET); // 等待LSE稳定
    
    // 选择RTC时钟源为LSE
    RCC_RTCCLKConfig(RCC_RTCCLKSource_LSE);
    
    // 使能RTC时钟
    RCC_RTCCLKCmd(ENABLE);
    
    // 等待RTC寄存器同步
    RTC_WaitForSynchro();
    
    // 配置RTC预分频（LSE=32768Hz，分频后1Hz计数）
    RTC_SetPrescaler(32767); // 32768 = 32767 + 1
    while (RTC_GetFlagStatus(RTC_FLAG_RTOFF) == RESET); // 等待配置完成
}
```

③ 写入备份寄存器（BKP 有 10 个备份寄存器：BKP_DR1~BKP_DR10）：

```c
// 向备份寄存器dr（1~10）写入数据data
void BKP_WriteData(uint8_t dr, uint16_t data) {
    // 检查寄存器编号合法性
    if (dr < 1 || dr > 10) return;
    
    // 写入数据（不同寄存器对应不同函数）
    switch (dr) {
        case 1: BKP_WriteBackupRegister(BKP_DR1, data); break;
        case 2: BKP_WriteBackupRegister(BKP_DR2, data); break;
        case 3: BKP_WriteBackupRegister(BKP_DR3, data); break;
        case 4: BKP_WriteBackupRegister(BKP_DR4, data); break;
        case 5: BKP_WriteBackupRegister(BKP_DR5, data); break;
        case 6: BKP_WriteBackupRegister(BKP_DR6, data); break;
        case 7: BKP_WriteBackupRegister(BKP_DR7, data); break;
        case 8: BKP_WriteBackupRegister(BKP_DR8, data); break;
        case 9: BKP_WriteBackupRegister(BKP_DR9, data); break;
        case 10: BKP_WriteBackupRegister(BKP_DR10, data); break;
    }
}
```

④ 读取备份寄存器：

```c
// 从备份寄存器dr（1~10）读取数据
uint16_t BKP_ReadData(uint8_t dr) {
    if (dr < 1 || dr > 10) return 0;
    
    // 读取数据
    switch (dr) {
        case 1: return BKP_ReadBackupRegister(BKP_DR1);
        case 2: return BKP_ReadBackupRegister(BKP_DR2);
        case 3: return BKP_ReadBackupRegister(BKP_DR3);
        case 4: return BKP_ReadBackupRegister(BKP_DR4);
        case 5: return BKP_ReadBackupRegister(BKP_DR5);
        case 6: return BKP_ReadBackupRegister(BKP_DR6);
        case 7: return BKP_ReadBackupRegister(BKP_DR7);
        case 8: return BKP_ReadBackupRegister(BKP_DR8);
        case 9: return BKP_ReadBackupRegister(BKP_DR9);
        case 10: return BKP_ReadBackupRegister(BKP_DR10);
        default: return 0;
    }
}
```

⑤ 主函数使用示例：写入并读取备份寄存器数据：

```c
int main(void) {
    uint16_t write_data = 0x1234;
    uint16_t read_data;
    
    RTC_BKP_Init(); // 初始化RTC和备份区域
    
    // 向BKP_DR1写入数据
    BKP_WriteData(1, write_data);
    
    // 从BKP_DR1读取数据
    read_data = BKP_ReadData(1);
    
    while (1) {
        // 备份寄存器数据在VDD掉电（VBAT供电）时不丢失
    }
}
```

### 【案例】实时时钟

① 使能相关时钟并解锁备份区域：RTC 依赖 LSE（外部低速时钟），需开启 PWR、BKP 时钟并解锁备份区域：



```c
#include "stm32f10x.h"

// 定义时间结构体
typedef struct {
    uint8_t hour;   // 时（0-23）
    uint8_t min;    // 分（0-59）
    uint8_t sec;    // 秒（0-59）
    uint8_t week;   // 星期（1-7）
    uint8_t day;    // 日（1-31）
    uint8_t month;  // 月（1-12）
    uint16_t year;  // 年（如2024）
} RTC_TimeTypeDef;

void RTC_Init(void) {
    // 使能PWR和BKP时钟
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_PWR | RCC_APB1Periph_BKP, ENABLE);
    
    // 解锁备份区域
    PWR_BackupAccessCmd(ENABLE);
```

② 配置 RTC 时钟源（LSE，32.768kHz）：

```c
    // 检查是否首次配置（通过备份寄存器标记）
    if (BKP_ReadBackupRegister(BKP_DR1) != 0x5A5A) {
        // 首次配置：初始化LSE和RTC
        
        // 关闭LSE（若已开启）
        RCC_LSEConfig(RCC_LSE_OFF);
        while (RCC_GetFlagStatus(RCC_FLAG_LSESTB) != RESET);
        
        // 使能LSE
        RCC_LSEConfig(RCC_LSE_ON);
        while (RCC_GetFlagStatus(RCC_FLAG_LSERDY) == RESET); // 等待LSE稳定
        
        // 选择RTC时钟源为LSE
        RCC_RTCCLKConfig(RCC_RTCCLKSource_LSE);
        
        // 使能RTC时钟
        RCC_RTCCLKCmd(ENABLE);
        
        // 等待RTC寄存器同步
        RTC_WaitForSynchro();
        
        // 允许RTC配置
        RTC_EnterConfigMode();
        
        // 设置预分频：32768Hz → 1Hz（秒计数）
        RTC_SetPrescaler(32767); // 32768 = 32767 + 1
        
        // 退出配置模式
        RTC_ExitConfigMode();
        
        // 写入标记表示已初始化
        BKP_WriteBackupRegister(BKP_DR1, 0x5A5A);
    } else {
        // 非首次配置：仅等待同步
        RTC_WaitForSynchro();
    }
}
```

③ 实现 RTC 时间设置函数（将结构体时间写入 RTC 计数器）：

```c
// 计算从2000年1月1日到目标日期的总秒数
uint32_t RTC_CalcSec(RTC_TimeTypeDef *time) {
    uint32_t sec = 0;
    uint16_t year = time->year;
    uint8_t month = time->month;
    uint8_t day = time->day;
    
    // 累加年的秒数（考虑闰年）
    for (uint16_t y = 2000; y < year; y++) {
        sec += (y % 4 == 0) ? 31622400 : 31536000; // 闰年366天，平年365天
    }
    
    // 累加月的秒数
    uint8_t month_days[12] = {31,28,31,30,31,30,31,31,30,31,30,31};
    for (uint8_t m = 1; m < month; m++) {
        sec += month_days[m-1] * 86400; // 每月秒数=天数×86400
        // 闰年2月加1天
        if (m == 2 && year % 4 == 0) sec += 86400;
    }
    
    // 累加日、时、分、秒的秒数
    sec += (day - 1) * 86400;
    sec += time->hour * 3600;
    sec += time->min * 60;
    sec += time->sec;
    
    return sec;
}

// 设置RTC时间
void RTC_SetTime(RTC_TimeTypeDef *time) {
    uint32_t sec = RTC_CalcSec(time);
    
    // 进入配置模式
    RTC_EnterConfigMode();
    
    // 设置RTC计数器值（总秒数）
    RTC_SetCounter(sec);
    
    // 退出配置模式
    RTC_ExitConfigMode();
}
```

④ 实现 RTC 时间读取函数（从 RTC 计数器解析为结构体时间）：

```c
// 将总秒数解析为时间结构体
void RTC_CalcTime(uint32_t sec, RTC_TimeTypeDef *time) {
    uint32_t temp = sec;
    uint16_t year = 2000;
    
    // 解析年
    while (1) {
        uint32_t year_sec = (year % 4 == 0) ? 31622400 : 31536000;
        if (temp < year_sec) break;
        temp -= year_sec;
        year++;
    }
    time->year = year;
    
    // 解析月
    uint8_t month = 1;
    uint8_t month_days[12] = {31,28,31,30,31,30,31,31,30,31,30,31};
    if (year % 4 == 0) month_days[1] = 29; // 闰年2月29天
    
    while (1) {
        uint32_t month_sec = month_days[month-1] * 86400;
        if (temp < month_sec) break;
        temp -= month_sec;
        month++;
    }
    time->month = month;
    
    // 解析日
    time->day = temp / 86400 + 1;
    temp %= 86400;
    
    // 解析时
    time->hour = temp / 3600;
    temp %= 3600;
    
    // 解析分
    time->min = temp / 60;
    
    // 解析秒
    time->sec = temp % 60;
    
    // 计算星期（2000年1月1日是星期六，记为6）
    uint32_t total_days = sec / 86400;
    time->week = (total_days + 6) % 7;
    if (time->week == 0) time->week = 7; // 0→7（星期日）
}

// 读取RTC时间
void RTC_GetTime(RTC_TimeTypeDef *time) {
    uint32_t sec = RTC_GetCounter();
    RTC_CalcTime(sec, time);
}
```

⑤ 主函数使用示例：初始化 RTC，设置时间后循环读取：

```c
int main(void) {
    RTC_TimeTypeDef rtc_time;
    
    RTC_Init(); // 初始化RTC
    
    // 首次上电设置时间（2024年10月5日 12:30:00 星期六）
    if (BKP_ReadBackupRegister(BKP_DR1) == 0x5A5A) { // 已初始化过
        // 若需重新设置时间，取消注释下方代码
        /*
        rtc_time.year = 2024;
        rtc_time.month = 10;
        rtc_time.day = 5;
        rtc_time.hour = 12;
        rtc_time.min = 30;
        rtc_time.sec = 0;
        RTC_SetTime(&rtc_time);
        */
    }
    
    while (1) {
        RTC_GetTime(&rtc_time); // 读取当前时间
        // 此处可使用rtc_time中的时/分/秒/日期等信息
        delay_ms(1000); // 每秒更新一次
    }
}
```

⑥ 关键说明：RTC 计数器以秒为单位累计时间，通过计算从基准年（如 2000 年）到当前时间的总秒数实现时间管理；备份寄存器`BKP_DR1`用于标记是否首次配置，避免每次上电重复初始化 LSE。

# 二、PWR电源控制

## 2.1 简介

- PWR(Power Control)电源控制
- PWR负责管理STM32内部的电源供电部分，可以实现可编程电压监测器和低功耗模式的功能
- 可编程电压监测器(PVD)可以监控VDD电源电压，当VDD下降到PVD阀值以下或上升到PVD阀值之上时，PVD会触发中断，用于执行紧急关闭任务
- **低功耗模式包括睡眠模式(Sleep)、停机模式(Stop)和待机模式(Standby)，**可在系统**空闲时**，降低STM32的功耗，延长设备使用时间**（低功耗模式我们需要考虑关闭那些硬件，保留那些硬件，以及如何去唤醒，用关闭不同程度的硬件来区分不同模式）**



## 2.2 电源框图

![STM32内部供电方案](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713774974670-365f55f9-7b5c-400c-9b46-ed9c3f43ed1d.png)

核心供电靠1.8V运行，只要需要进行外设交流时候才通过IO电路转换到3.3V。

## 2.3 电压监测

![上电复位和掉电复位](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713834197379-eb765b92-1163-4006-acb8-023145143e77.png)

当VDD或VDDA电压过低时，内部电路直接产生复位，让STM32不要乱操作。具体数值范围查看手册。

![PVD可编程电压监测器](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713838462506-83fbd1aa-ef89-49e4-ac67-004ba3cade1a.png)

可以指定电压阈值，PVD中断是外部触发的。因为低功耗唤醒只有外部触发模式。

## 2.4 低功耗模式

### 2.4.1 简介

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713775000308-c1fc7d22-a508-40e9-a0f5-e79df57a0401.png)

- 关闭电路通常有两种做法，一个是关闭时钟，一个是关闭电源。关闭时钟，所有的运算和设计时序的操作都会暂停，但是寄存器和存储器里面保存的数据还可以维持，不会消失。关闭电源，所有操作和数据都会丢失，更省电。
- 用**PDDS**标志位来区分是停机模式还是待机模式。
- **WFI**要用外部中断唤醒，**WFE**要用外部事件唤醒。**（非常省电，需要外部敲醒）**
- 待机模式需要指定信号唤醒！关闭状态严重，内部存储器数据和寄存器数据均丢失。**和停机模式一样，不会主动关闭LSI/LSE两个低速时钟，用于维持，RTC和IWDG看门狗。**

### 2.4.2 模式选择

执行Fl(Wait For Interrupt)或者WFE(Wait For Event)指令后STM32进入低功耗模式。

![选择流程图](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713833799484-1e2b8183-32d9-4253-bd9c-91708abb49ac.png)

### 2.4.3 睡眠模式

- 执行完WFI/WFE指令后，STM32进入睡眠模式，程序暂停运行，唤醒后程序从暂停的地方继续运行
- SLEEPONEXIT位决定STM32执行完WFI或WFE后，是立刻进入睡眠还是等STM32从最低优先级的中断处理程序中退出时进入睡眠
- 在睡眠模式下，所有的1/0引脚都保持它们在运行模式时的状态
- WFI指令进入睡眠模式，可被任意一个NVIC响应的**中断唤醒**
- WFE指令进入睡眠模式，可被唤醒**事件唤醒**

### 2.4.4 停止模式

- 执行完WFI/WFE指令后，STM32进入停止模式，程序暂停运行，**唤醒后程序从暂停的地方继续运行**
- 1.8V供电区域的所有时钟都被停止，PLL、HSI和HSE被禁止，**SRAM和寄存器内容被保留下来**
- 在停止模式下，所有的**IO引脚都保持**它们在运行模式时的状态
- 当一个中断或唤醒事件导致**退出停止模式时，HSI被选为系统时钟****（因此第一时间要启动HSE，配置主频）**
- 当电压调节器处于低功耗模式下，**系统从停止模式退出时，会有一段额外的启动延时**
- WFI指令进入停止模式，可被任意一个**EXTI中断唤醒**
- WFE指令进入停止模式，可被任意一个**EXTI事件唤醒**

### 2.4.5 待机模式

- 执行完WFI/WFE指令后，STM32进入待机模式，**唤醒后程序从头开始运行**
- 整个1.8V供电区域被断电，PLL、HSI和HSE也被断电，SRAM和寄存器内容丢失，只有备份的寄存器和待机电路维持供电
- 在待机模式下，所有的IO引脚变为**高阻态(浮空输入)**
- WKUP引脚的上升沿、RTC闹钟事件的上升沿、NRST引脚上外部复位、IWDG复位退出待机模式



手册，略~

### 【案例】修改主频

① 使能 PWR 时钟：PWR 属于 APB1 总线，需先开启其时钟才能配置电源控制：

```c
#include "stm32f10x.h"

void PWR_Config(void) {
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_PWR, ENABLE);
}
```

② 配置系统时钟源及主频切换基础（以 STM32F103 为例，支持 HSI、HSE 作为 PLL 输入，通过 PLL 倍频生成系统时钟）：

```c
// 定义主频配置参数（PLL倍频系数）
#define SYSCLK_8MHz   0 // 8MHz（HSI直接使用）
#define SYSCLK_72MHz  1 // 72MHz（HSE 8MHz×9）
#define SYSCLK_48MHz  2 // 48MHz（HSE 8MHz×6）
#define SYSCLK_36MHz  3 // 36MHz（HSE 8MHz×4.5）

// 切换系统主频函数
void RCC_ChangeSysClock(uint8_t clk_mode) {
    // 切换前先将系统时钟切换到HSI（确保安全）
    RCC_SYSCLKConfig(RCC_SYSCLKSource_HSI);
    
    // 关闭PLL（配置PLL前需关闭）
    RCC_PLLCmd(DISABLE);
    while (RCC_GetFlagStatus(RCC_FLAG_PLLRDY) != RESET);
    
    // 根据模式配置PLL倍频系数
    switch (clk_mode) {
        case SYSCLK_8MHz:
            // 直接使用HSI（8MHz）
            RCC_SYSCLKConfig(RCC_SYSCLKSource_HSI);
            break;
            
        case SYSCLK_72MHz:
            // HSE 8MHz ×9 = 72MHz（需外部8MHz晶振）
            RCC_HSEConfig(RCC_HSE_ON);
            while (RCC_GetFlagStatus(RCC_FLAG_HSERDY) == RESET);
            RCC_PLLConfig(RCC_PLLSource_HSE_Div1, RCC_PLLMul_9); // 8MHz×9=72MHz
            RCC_PLLCmd(ENABLE);
            while (RCC_GetFlagStatus(RCC_FLAG_PLLRDY) == RESET);
            RCC_SYSCLKConfig(RCC_SYSCLKSource_PLLCLK); // 切换到PLL输出
            break;
            
        case SYSCLK_48MHz:
            // HSE 8MHz ×6 = 48MHz
            RCC_HSEConfig(RCC_HSE_ON);
            while (RCC_GetFlagStatus(RCC_FLAG_HSERDY) == RESET);
            RCC_PLLConfig(RCC_PLLSource_HSE_Div1, RCC_PLLMul_6); // 8MHz×6=48MHz
            RCC_PLLCmd(ENABLE);
            while (RCC_GetFlagStatus(RCC_FLAG_PLLRDY) == RESET);
            RCC_SYSCLKConfig(RCC_SYSCLKSource_PLLCLK);
            break;
            
        case SYSCLK_36MHz:
            // HSE 8MHz ×4.5 = 36MHz
            RCC_HSEConfig(RCC_HSE_ON);
            while (RCC_GetFlagStatus(RCC_FLAG_HSERDY) == RESET);
            RCC_PLLConfig(RCC_PLLSource_HSE_Div1, RCC_PLLMul_4_5); // 8MHz×4.5=36MHz
            RCC_PLLCmd(ENABLE);
            while (RCC_GetFlagStatus(RCC_FLAG_PLLRDY) == RESET);
            RCC_SYSCLKConfig(RCC_SYSCLKSource_PLLCLK);
            break;
    }
    
    // 配置AHB、APB1、APB2分频（确保外设时钟不超过上限）
    RCC_HCLKConfig(RCC_SYSCLK_Div1); // AHB = SYSCLK（最大72MHz）
    RCC_PCLK1Config(RCC_HCLK_Div2); // APB1 = AHB/2（最大36MHz）
    RCC_PCLK2Config(RCC_HCLK_Div1); // APB2 = AHB（最大72MHz）
}
```

③ 结合 PWR 实现低功耗主频切换（如进入睡眠模式前降频）：

```c
// 进入睡眠模式前降频到36MHz
void PWR_EnterSleepWithLowFreq(void) {
    // 切换到36MHz
    RCC_ChangeSysClock(SYSCLK_36MHz);
    
    // 配置PWR睡眠模式（内核停止，外设运行）
    PWR_EnterSTOPMode(PWR_Regulator_ON, PWR_STOPEntry_WFE); // 等待事件唤醒
    
    // 唤醒后切换回72MHz
    RCC_ChangeSysClock(SYSCLK_72MHz);
}
```

④ 主函数使用示例：动态切换主频并测试：

```c
int main(void) {
    PWR_Config(); // 初始化PWR
    
    // 初始主频设为72MHz
    RCC_ChangeSysClock(SYSCLK_72MHz);
    
    while (1) {
        // 运行一段时间后切换到48MHz
        delay_ms(5000);
        RCC_ChangeSysClock(SYSCLK_48MHz);
        
        // 再运行一段时间后进入低功耗睡眠
        delay_ms(5000);
        PWR_EnterSleepWithLowFreq();
        
        // 唤醒后继续循环
    }
}
```

⑤ 关键说明：STM32 主频由 PLL 倍频决定，切换时需先切到 HSI 再重新配置 PLL；APB1 外设时钟最大 36MHz，切换主频后需确保分频后不超限；结合 PWR 的 STOP 模式可在低主频下进一步降低功耗。

### 【案例】睡眠模式+串口发送接收

① 使能相关时钟：开启 USART1、GPIOA、AFIO、PWR 时钟：

```c
#include "stm32f10x.h"
#include <string.h>

#define RX_BUF_SIZE 50
uint8_t rx_buf[RX_BUF_SIZE];
uint16_t rx_len = 0;
uint8_t rx_flag = 0;

void System_Init(void) {
    // 使能外设时钟
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_USART1 | RCC_APB2Periph_GPIOA | RCC_APB2Periph_AFIO, ENABLE);
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_PWR, ENABLE); // 使能PWR时钟
```

② 配置串口 GPIO 及参数（115200-8-N-1）：



```c
    // 配置串口GPIO
    GPIO_InitTypeDef GPIO_InitStructure;
    // TX(PA9)：复用推挽输出
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_9;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
    // RX(PA10)：浮空输入
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_10;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
    
    // 配置USART1
    USART_InitTypeDef USART_InitStructure;
    USART_InitStructure.USART_BaudRate = 115200;
    USART_InitStructure.USART_WordLength = USART_WordLength_8b;
    USART_InitStructure.USART_StopBits = USART_StopBits_1;
    USART_InitStructure.USART_Parity = USART_Parity_No;
    USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
    USART_InitStructure.USART_Mode = USART_Mode_Tx | USART_Mode_Rx;
    USART_Init(USART1, &USART_InitStructure);
```

③ 配置串口接收中断（用于唤醒睡眠模式）：

```c
    // 配置NVIC
    NVIC_InitTypeDef NVIC_InitStructure;
    NVIC_InitStructure.NVIC_IRQChannel = USART1_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);
    
    // 使能串口接收中断
    USART_ITConfig(USART1, USART_IT_RXNE, ENABLE);
    USART_Cmd(USART1, ENABLE);
}
```

④ 实现串口发送函数：

```c
void USART1_SendByte(uint8_t byte) {
    while (USART_GetFlagStatus(USART1, USART_FLAG_TXE) == RESET);
    USART_SendData(USART1, byte);
}

void USART1_SendString(uint8_t *str) {
    while (*str) {
        USART1_SendByte(*str++);
    }
}
```

⑤ 编写睡眠模式进入函数（STOP 模式，可被串口中断唤醒）：

```c
void Enter_SleepMode(void) {
    USART1_SendString((uint8_t*)"Entering sleep mode...\r\n");
    
    // 配置睡眠模式：STOP模式， regulator保持开启，等待事件唤醒
    PWR_EnterSTOPMode(PWR_Regulator_ON, PWR_STOPEntry_WFE);
    
    // 唤醒后需要重新配置系统时钟（STOP模式会关闭PLL）
    RCC_HSEConfig(RCC_HSE_ON);
    while (RCC_GetFlagStatus(RCC_FLAG_HSERDY) == RESET);
    RCC_PLLConfig(RCC_PLLSource_HSE_Div1, RCC_PLLMul_9);
    RCC_PLLCmd(ENABLE);
    while (RCC_GetFlagStatus(RCC_FLAG_PLLRDY) == RESET);
    RCC_SYSCLKConfig(RCC_SYSCLKSource_PLLCLK);
    
    USART1_SendString((uint8_t*)"Woken up!\r\n");
}
```

⑥ 串口中断服务函数（接收数据并唤醒）：

```c
void USART1_IRQHandler(void) {
    if (USART_GetITStatus(USART1, USART_IT_RXNE) != RESET) {
        uint8_t data = USART_ReceiveData(USART1);
        
        // 存储接收数据，收到回车结束
        if (rx_len < RX_BUF_SIZE - 1 && data != '\r') {
            rx_buf[rx_len++] = data;
        } else {
            rx_buf[rx_len] = '\0';
            rx_flag = 1;
            rx_len = 0;
        }
        
        USART_ClearITPendingBit(USART1, USART_IT_RXNE);
    }
}
```

⑦ 主函数逻辑：循环接收数据，超时进入睡眠：

```c
int main(void) {
    System_Init();
    uint32_t sleep_timer = 0;
    
    USART1_SendString((uint8_t*)"System initialized\r\n");
    
    while (1) {
        // 处理接收数据
        if (rx_flag) {
            USART1_SendString((uint8_t*)"Received: ");
            USART1_SendString(rx_buf);
            USART1_SendString((uint8_t*)"\r\n");
            rx_flag = 0;
            sleep_timer = 0; // 重置睡眠计时器
        }
        
        // 5秒无数据则进入睡眠
        if (sleep_timer++ >= 5000000) { // 约5秒（需根据实际主频调整）
            Enter_SleepMode();
            sleep_timer = 0;
        }
    }
}
```

⑧ 关键说明：STOP 模式下系统时钟关闭，唤醒后需重新初始化 PLL 恢复主频；串口接收中断可作为唤醒源，确保外部数据能唤醒设备；进入睡眠前发送提示信息，唤醒后重新配置时钟并反馈状态。

### 【案例】停止模式+对射式红外传感器计次

① 使能相关时钟：开启 GPIO（传感器引脚）、EXTI（外部中断）、PWR 时钟：

```c
#include "stm32f10x.h"

uint32_t count = 0; // 计数变量

void System_Init(void) {
    // 使能外设时钟
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA | RCC_APB2Periph_AFIO, ENABLE);
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_PWR, ENABLE); // 使能PWR时钟
```

② 配置对射式红外传感器引脚（PA0）为输入，用于触发外部中断：

```c
    // 配置传感器GPIO（PA0）
    GPIO_InitTypeDef GPIO_InitStructure;
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IPU; // 上拉输入（传感器输出低电平有效）
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
```

③ 配置外部中断（EXTI0），由传感器信号触发：

```c
    // 配置EXTI0（PA0）
    EXTI_InitTypeDef EXTI_InitStructure;
    GPIO_EXTILineConfig(GPIO_PortSourceGPIOA, GPIO_PinSource0); // 映射PA0到EXTI0
    EXTI_InitStructure.EXTI_Line = EXTI_Line0;
    EXTI_InitStructure.EXTI_Mode = EXTI_Mode_Interrupt; // 中断模式
    EXTI_InitStructure.EXTI_Trigger = EXTI_Trigger_Falling; // 下降沿触发（传感器遮挡时电平变低）
    EXTI_InitStructure.EXTI_LineCmd = ENABLE;
    EXTI_Init(&EXTI_InitStructure);
```

④ 配置 NVIC 中断优先级（用于中断唤醒停止模式）：

```c
    // 配置NVIC
    NVIC_InitTypeDef NVIC_InitStructure;
    NVIC_InitStructure.NVIC_IRQChannel = EXTI0_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0; // 高优先级确保唤醒
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);
}
```

⑤ 实现停止模式（STOP）进入函数：

```c
void Enter_StopMode(void) {
    // 配置停止模式：关闭 regulator 以降低功耗，等待中断唤醒
    PWR_EnterSTOPMode(PWR_Regulator_LowPower, PWR_STOPEntry_WFI); // WFI：等待中断
    
    // 唤醒后重新配置系统时钟（STOP模式会关闭PLL）
    RCC_HSEConfig(RCC_HSE_ON);
    while (RCC_GetFlagStatus(RCC_FLAG_HSERDY) == RESET);
    RCC_PLLConfig(RCC_PLLSource_HSE_Div1, RCC_PLLMul_9);
    RCC_PLLCmd(ENABLE);
    while (RCC_GetFlagStatus(RCC_FLAG_PLLRDY) == RESET);
    RCC_SYSCLKConfig(RCC_SYSCLKSource_PLLCLK);
}
```

⑥ 外部中断服务函数（传感器触发时计次）：

```c
void EXTI0_IRQHandler(void) {
    if (EXTI_GetITStatus(EXTI_Line0) != RESET) {
        count++; // 每触发一次中断，计数+1
        
        // 延时消抖（简单处理传感器抖动）
        for (uint32_t i = 0; i < 10000; i++);
        
        EXTI_ClearITPendingBit(EXTI_Line0); // 清除中断标志
    }
}
```

⑦ 主函数逻辑：循环进入停止模式，等待传感器触发唤醒并计次：

```c
int main(void) {
    System_Init();
    
    while (1) {
        // 进入停止模式，等待传感器触发中断唤醒
        Enter_StopMode();
        
        // 唤醒后可执行计数相关处理（如通过其他外设输出计数结果）
        // 此处省略输出代码，仅累加计数
    }
}
```

### 【案例】待机模式+实时时钟

① 使能相关时钟：开启 RTC、PWR、BKP 时钟，用于实时时钟和待机模式控制：

```c
#include "stm32f10x.h"

// 定义时间结构体
typedef struct {
    uint8_t hour;
    uint8_t min;
    uint8_t sec;
} RTC_TimeTypeDef;

RTC_TimeTypeDef rtc_time = {0, 0, 0}; // 初始时间
uint8_t wakeup_flag = 0; // 唤醒标志
```

② 初始化 RTC（使用 LSE 时钟，配置闹钟唤醒功能）：

```c
void RTC_Init(void) {
    // 使能PWR和BKP时钟
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_PWR | RCC_APB1Periph_BKP, ENABLE);
    
    // 解锁备份区域
    PWR_BackupAccessCmd(ENABLE);
    
    // 检查RTC是否已初始化
    if (BKP_ReadBackupRegister(BKP_DR1) != 0xAA55) {
        // 初始化LSE
        RCC_LSEConfig(RCC_LSE_ON);
        while (RCC_GetFlagStatus(RCC_FLAG_LSERDY) == RESET);
        
        // 配置RTC时钟源为LSE
        RCC_RTCCLKConfig(RCC_RTCCLKSource_LSE);
        RCC_RTCCLKCmd(ENABLE);
        
        // 等待RTC同步
        RTC_WaitForSynchro();
        
        // 允许配置RTC
        RTC_EnterConfigMode();
        RTC_SetPrescaler(32767); // 32768Hz→1Hz
        RTC_SetCounter(0); // 初始计数0
        RTC_ExitConfigMode();
        
        // 标记已初始化
        BKP_WriteBackupRegister(BKP_DR1, 0xAA55);
    } else {
        RTC_WaitForSynchro();
    }
    
    // 配置RTC闹钟：每天固定时间唤醒（如00:00:00）
    RTC_EnterConfigMode();
    RTC_SetAlarm(RTC_GetCounter() + 86400); // 24小时后唤醒（86400秒）
    RTC_ExitConfigMode();
    
    // 使能RTC闹钟中断
    RTC_ITConfig(RTC_IT_ALR, ENABLE);
    
    // 配置闹钟中断NVIC
    NVIC_InitTypeDef NVIC_InitStructure;
    NVIC_InitStructure.NVIC_IRQChannel = RTCAlarm_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);
}
```

③ 实现待机模式进入函数：

```c
void Enter_StandbyMode(void) {
    // 清除所有唤醒标志
    PWR_ClearFlag(PWR_FLAG_WU);
    RTC_ClearFlag(RTC_FLAG_ALR);
    
    // 配置待机模式：RTC闹钟作为唤醒源
    PWR_WakeUpPinCmd(DISABLE); // 禁用WKUP引脚唤醒
    PWR_EnterSTANDBYMode(); // 进入待机模式
}
```

④ RTC 闹钟中断服务函数（唤醒待机模式）：

```c
void RTCAlarm_IRQHandler(void) {
    if (RTC_GetITStatus(RTC_IT_ALR) != RESET) {
        wakeup_flag = 1; // 置唤醒标志
        
        // 更新下次闹钟时间（24小时后）
        RTC_EnterConfigMode();
        RTC_SetAlarm(RTC_GetCounter() + 86400);
        RTC_ExitConfigMode();
        
        RTC_ClearITPendingBit(RTC_IT_ALR);
        EXTI_ClearITPendingBit(EXTI_Line17); // 清除EXTI17标志（RTC闹钟映射）
    }
}
```

⑤ 读取当前 RTC 时间函数：

```c
void RTC_GetTime(RTC_TimeTypeDef *time) {
    uint32_t sec = RTC_GetCounter();
    time->hour = sec / 3600;
    time->min = (sec % 3600) / 60;
    time->sec = sec % 60;
}
```

⑥ 主函数逻辑：初始化后进入待机，被 RTC 闹钟唤醒后处理任务：

```c
int main(void) {
    // 检查是否从待机模式唤醒
    if (PWR_GetFlagStatus(PWR_FLAG_SB) != RESET) {
        wakeup_flag = 1;
        PWR_ClearFlag(PWR_FLAG_SB); // 清除待机标志
    }
    
    RTC_Init(); // 初始化RTC
    
    if (wakeup_flag) {
        // 唤醒后执行任务（如记录时间、数据上报等）
        RTC_GetTime(&rtc_time);
        // 此处添加具体任务代码
        wakeup_flag = 0;
    }
    
    // 任务完成后再次进入待机模式
    Enter_StandbyMode();
    
    while (1) {
        // 待机模式下不会执行到此处
    }
}
```

# 三、WDG看门狗

## 3.1 简介

- WDG(Watchdog)看门狗
- 看门狗可以监控程序的运行状态，当程序因为**设计漏洞**（无法预料）、**硬件故障、电磁干扰**等原因，**出现卡死或跑飞现象时，看门狗能及时复位程序避免程序陷入长时间的罢工状态，保证系统的可靠性和安全性**
- **看门狗本质上是一个定时器，**当指定时间范围内，程序没有执行喂狗(重置计数器)操作时，看门狗硬件电路就自动产生复位信号
- **STM32内置两个看门狗**

- 独立看门狗(IWDG)：独立工作，对时间精度要求较低
- 窗口看门狗(WWDG)：要求看门狗在精确计时窗口起作用（有明确喂狗清零界限）

## 3.2 IWDG框图

### 3.2.1 简介

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713837992210-d5957bab-712e-4343-8c76-a2f044aa1e80.png)

 对比定时器结构。定时器产生中断，看门狗产生复位。

### 3.2.2 IWDG键寄存器

- 键寄存器本质上是控制寄存器，用于控制硬件电路的工作
- 在可能存在干扰的情况下，一般通过在整个键寄存器写入特定值来代替控制寄存器写入一位的功能，以**降低硬件电路受到干扰的概率（恶劣情况）**

 	![img](STM32_Standard_Peripheral_Libraries-4.assets/1713838189622-e4627b1a-1e91-4270-a39d-1ba3839c0a7c.png)

## 3.3 IWDG超时时间

- 超时时间：TIWDG=TLSI x PR预分频系数 x (RL+1)
- 其中：TLSI =1/FLSI

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713838756383-a4771a30-b592-40d0-8856-1758c21c1f78.png)

**注：****超时时间40k输入时钟会在30~60kHz波动。**

## 3.4 WWDG框图

### 3.4.1 简介

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713835175040-fce0d7d4-cc6b-4bc3-9dc9-5612f2056db3.png)

**【计数器部分最晚界限】**如果把T6位看作计数器的一部分，那就是整个计数器值减到**0x40**之后溢出；而T6当成溢出标志位，低6位当作计数器，数值减到**0**之后溢出。

**【复位信号】**程序运行状态下始终保证T6位位1，这样才能避免复位。

**【最早界限】**首先写入一个最早时间界限计数值到W0~6中，写入WWDG_CR，就是喂狗，一旦它比较，我们当前的计数器T6：0>窗口之W6：0，比较结果就等于1，就可以去申请复位。

也就是为狗的时候，把**当前计数值**和**预设窗口值**进行比较，若余粮充足，喂得频繁，就有问题，就会复位。

### 3.4.2 WWDG工作特性

- 递减计数器T[6:0]的值小于0x40时，WDG产生复位
- 递减计数器T[6:0]在窗口W[6:0]外被重新装载时，WDG产生复位
- 递减计数器T[6:01**等于0x40时可以产生早期唤醒中断（EWI），死前中断（马上就要溢出复位时，用来执行一些紧急操作，比如保存重要数据，关闭危险操作）**，用于重装载计数器以避免WWDG复位
- 定期写入WWDG CR寄存器(喂狗)以避免WWDG复位

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713839801498-ffcd36aa-5ea5-49cf-b361-ac7a55e23fad.png)刷新窗口可以喂狗。

### 3.4.3 WWDG超时时间计算

- 超时时间：TWWDG=TPCLK1x4096xWDGTB预分频系数 x(T[5:0]+ 1)
- 窗口时间：TWIN =TPCLK1x 4096 x WDGTB预分频系数 x(T[5:0] - W[5:0])
- 其中：TPCLK1=1/FPCLK1

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713840410674-488cbcb1-ca3f-4a83-ae21-70a766d9e41e.png)

## 3.5 IWDG和WWDG对比

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713842834388-7ce9adbd-3321-4b62-b31e-9495a41c4596.png)

手册，略~

### 【案例】独立看门狗 

① 独立看门狗（IWDG）初始化：独立看门狗使用内部低速时钟（LSI，约 40kHz），无需外部时钟，适合监测程序运行状态：

```c
#include "stm32f10x.h"

// 初始化独立看门狗，timeout_ms为超时时间（最大约262ms@40kHz）
void IWDG_Init(uint16_t timeout_ms) {
    // 使能写访问（解锁写IWDG_PR和IWDG_RLR寄存器前需置位）
    IWDG_WriteAccessCmd(IWDG_WriteAccess_Enable);
    
    // 配置预分频器：LSI=40kHz，分频后时钟=40kHz/(4^prescaler)
    // 预分频选项：IWDG_Prescaler_4(4分频)、8、16、32、64、128、256
    IWDG_SetPrescaler(IWDG_Prescaler_64); // 40kHz/64=625Hz（周期1.6ms）
    
    // 配置重装载值：timeout_ms = (reload * 1.6ms) → reload = timeout_ms / 1.6
    uint16_t reload = (uint16_t)(timeout_ms / 1.6f);
    if (reload > 0xFFF) reload = 0xFFF; // 最大重装载值为4095
    IWDG_SetReload(reload);
    
    // 重载计数器（喂狗）
    IWDG_ReloadCounter();
    
    // 使能独立看门狗
    IWDG_Enable();
}
```

② 喂狗函数（重置看门狗计数器，避免复位）：

```c
// 喂狗操作
void IWDG_Feed(void) {
    IWDG_ReloadCounter(); // 重载计数器
}
```

③ 主函数使用示例：定期喂狗，模拟程序正常运行；若超时未喂狗，系统会复位：

```c
int main(void) {
    // 初始化独立看门狗，超时时间100ms
    IWDG_Init(100);
    
    // 假设系统初始化代码
    // ...
    
    while (1) {
        // 正常运行时，每隔50ms喂一次狗（小于超时时间100ms）
        IWDG_Feed();
        
        // 执行其他任务
        // ...
        
        // 延时50ms（需确保延时小于超时时间）
        for (uint32_t i = 0; i < 3600000; i++);
    }
}
```

> 独立看门狗一旦使能无法关闭，需持续喂狗；超时时间由预分频器和重装载值决定，计算公式为`超时时间(ms) = (重装载值 + 1) * (4^预分频器) / 40`；适用于监测程序是否跑飞，若程序异常未及时喂狗，系统会自动复位。

### 【案例】窗口看门狗

① 窗口看门狗（WWDG）初始化：窗口看门狗使用 APB1 时钟分频后的时钟（PCLK1/4096），需设置窗口值和计数器，用于监测程序在规定时间窗口内运行：

```c
#include "stm32f10x.h"

// 初始化窗口看门狗，tr为计数器值(0x40~0x7F)，wr为窗口值(wr < tr)
void WWDG_Init(uint8_t tr, uint8_t wr) {
    // 使能WWDG时钟（APB1外设）
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_WWDG, ENABLE);
    
    // 设置预分频器：WWDG时钟 = PCLK1/4096 / 2^prescaler
    // 预分频选项：WWDG_Prescaler_1(1分频)、2、4、8
    WWDG_SetPrescaler(WWDG_Prescaler_8);
    
    // 设置窗口值（喂狗必须在计数器 > 窗口值时进行）
    WWDG_SetWindowValue(wr);
    
    // 设置计数器初始值（计数器从tr递减，到0x40以下会复位）
    WWDG_Enable(tr);
    
    // 使能WWDG中断（计数器到0x40时触发，可用于紧急处理）
    WWDG_ClearFlag();
    WWDG_EnableIT();
    
    // 配置NVIC
    NVIC_InitTypeDef NVIC_InitStructure;
    NVIC_InitStructure.NVIC_IRQChannel = WWDG_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 2;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 2;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);
}
```

② 喂狗函数（需在计数器 > 窗口值时调用，否则触发复位）：

```c
// 喂狗操作（重置计数器为初始值）
void WWDG_Feed(void) {
    WWDG_SetCounter(0x7F); // 重置计数器（值需 > 窗口值）
}
```

③ WWDG 中断服务函数（计数器降至 0x40 时触发，可做最后处理）：

```c
void WWDG_IRQHandler(void) {
    WWDG_ClearFlag(); // 清除中断标志
    // 此处可添加紧急处理代码（如保存关键数据）
}
```

④ 主函数使用示例：在窗口时间内喂狗，确保程序正常运行：

```c
int main(void) {
    // 初始化窗口看门狗：计数器0x7F，窗口值0x5F（喂狗需在0x7F~0x5F之间）
    WWDG_Init(0x7F, 0x5F);
    
    while (1) {
        // 模拟程序运行，确保在窗口时间内喂狗
        // ...（执行任务，耗时需小于窗口上限）
        
        WWDG_Feed(); // 喂狗（需在计数器 > 0x5F时调用）
        
        // 延时一段时间（需确保不超过窗口下限）
        for (uint32_t i = 0; i < 100000; i++);
    }
}
```

> 窗口看门狗有严格的喂狗时间窗口（计数器 > 窗口值），过早或过晚喂狗都会触发复位；计数器从 0x7F 递减到 0x40，低于 0x40 后自动复位；适用于监测程序是否在规定时间内完成任务（如实时性要求高的场景）。

# 四、Flash闪存

## 4.1 简介

- STM32F1系列的FLASH包含程序存储器、系统存储器和选项字节三个部分，通过**闪存存储器接口(外设)**可以对程序存储器和选项字节进行擦除和编程
- **读写FLASH的用途：**

- 利用**程序存储器的剩余空间**来保存掉电不丢失的用户数据
- 通过在程序中编程(IAP)，实现程序的自我更新

- 在线编程（In-Circuit Programming-ICP）用于更新程序存储器的全部内容它通过**JTAG、SWD**协议或系统加载程序（Bootloader）下载程序
- 在程序中编程(In-Application Programming-lAP)可以使用微控制器支持的任一种通信接口下载程序

## 4.2 闪存模块组织

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713842900819-5c2f512f-cc31-4146-adcd-55c7d15a54c5.png)

闪存存储器借口寄存器为闪存的管理员，擦除和编程通过对这些寄存器操作来完成。而读取只需要使用指针直接读取即可。

## 4.3 Flash基本结构

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713842930919-95878d73-cd49-43d0-83cd-d3ad931ef4d1.png)

整个闪存分为程序存储器、系统存储器、选项字节（配置读写保护）。

如何操作FPEC来对程序存储器和选项字节进行擦除和编程？

## 4.4 Flash操作

### 4.4.1 Flash解锁

- **FPEC共有三个键值：（防止误操作）**

RDPRT键=0x000000A5

KEY1 = 0x45670123

KEY2 =0xCDEF89AB

- **解锁：**

复位后，FPEC被保护，不能写入FLASHCR

在FLASH_KEYR先写入KEY1，再写入KEY2，解锁

错误的操作序列会在下次复位前锁死FPEC和FLASHCR

- **加锁：**

设置FLASH CR中的LOCK位锁住FPEC和FLASHCR

### 4.4.2 使用指针访问存储器

- **使用指针读指定地址下的存储器：**（注意优先级，可以用括号控制）

```
uint16_t Data=*(( __I0 uint16_t*)(0x08000000))
```

- **使用指针写指定地址下的存储器：**

```
*((__Io uint16_t*)(0x08000000))= 0x1234;
```

读写Flash所需权限比较大，读写RAM就比较容易，因为在程序运行过程中是可读可写的。

- **其中：**

`#define	__IO	volatile`防止编译器优化。

### 4.4.3 程序存储器编程流程图

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713841407228-6d0f380a-88a1-4366-8099-6f89cb416d59.png)

解锁，擦除，全擦除需要时间，程序会一直等待，判断寄存器BSY位是否为1，表示忙，继续循环等待，直到=0，跳出循环，全擦除结束。最后一步读出来验证工作量大就不管了。

### 4.4.4 程序存储器页擦除流程图

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713844498703-1b057aec-c541-4350-90a6-090977b1e35f.png)

同样的解锁，AR**选择擦除的页**，置位STRT=1开始操作。

### 4.4.5 程序全擦除流程图

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713841804034-c49a9b51-f304-464b-b9f5-f1f05593ce7b.png)

**检测到擦除之后，才执行写入操作，除非是写入0（即擦除）；**因为写入1可能会产生错误。

**写入操作只能以半字（16位）写入操作。**【字Word(32位)、半字halfWord(16位)、字节Byte(8位)】

写入8位就比较麻烦，如果想单独写入一字节的数据，还要保留另一字节数据，就必须把整页数据读到SRAM里，再随意进行SRAM数据，修改全部完成之后再把整页都擦除，再写回去。

写入32位数据分两次操作，写入很多则只需要不断循环操作就可以了。

## 4.5 选项字节

### 4.5.1 选项字节简介

![img](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/1713840552235-f96c4adc-a7d2-40b8-a00a-78069949ca88.png)

名称前边都带着一个n，表示再写入**X**数据时候，要同时在**nX**写入数据的反码，这样操作才是有效的，如果芯片检测到不是反码的关系，就代表数据无效有错误，对应的功能就不执行，这是一种安全保障措施。这个写入反码操作硬件会自动写入操作，不需要我们担心。函数封装好了。

- **RDP：**写入RDPRT键(0x000000A5)后解除读保护**（默认可读）**
- **USER：**配置硬件看门狗和进入停机/待机模式是否产生复位
- **Data0/1：**用户可自定义使用
- **WRP0/1/2/3：**配置写保护，每一个位对应保护4个存储页(中容量)

### 4.5.2 选项字节编程

**（选项字节本身页是闪存，写入也需要擦除）**

- 检查FLASH_SR的BSY位，以确认没有其他正在进行的编程操作**（等待）**
- 解锁FLASH_CR的OPTWRE位
- 设置FLASH CR的OPTPG位为1
- 写入要编程的半字到指定的地址
- 等待BSY位变为0
- 读出写入的地址并验证数据

### 4.5.3 器件电子签名

- **电子签名**存放在闪存存储器模块的**系统存储区域****（BootLoader区域）**，包含的芯片识别信息在出厂时编写，**不可更改，**使用指针读指定地址下的存储器可获取电子签名
- **闪存容量寄存器**

- 基地址:0x1FFF F7EO
- 大小:16位

- **产品唯一身份标识寄存器**

- 基地址:Ox1FFF F7E8
- 大小:96位



**【闪存FPEC注意】：**在变成过程中，任何读写内存的操作都会使CPU暂停，直到此次闪存编程结束。**即内存闪存弊端，在忙的时候，代码会暂停执行，**因为代码执行需要读操作，而闪存在忙，无法进行闪存读操作，程序就会暂停。这会导致你在使用内部存储，同时中断又在频繁的执行，而在读写闪存的时候，中断就无法及时响应了。比如没有缓存需要持续刷新的屏幕显示，会因此闪烁。



手册，略~

### 【案例】读写内部Flash

① 解锁内部 Flash：操作 Flash 前需解锁写入保护：

```c
#include "stm32f10x.h"

// Flash解锁函数
void Flash_Unlock(void) {
    if (FLASH_GetStatus() == FLASH_STATUS_BSY) {
        while (FLASH_GetStatus() == FLASH_STATUS_BSY); // 等待Flash空闲
    }
    if ((FLASH->CR & FLASH_CR_LOCK) != 0) {
        FLASH_WriteProtectionEntry(FLASH_WRProt_Disable); // 关闭写保护
        FLASH_UnlockCmd(ENABLE); // 解锁Flash
    }
}
```

② 锁定内部 Flash（操作完成后锁定，防止误写）：

```c
void Flash_Lock(void) {
    FLASH_UnlockCmd(DISABLE); // 锁定Flash
    FLASH_WriteProtectionEntry(FLASH_WRProt_Enable); // 开启写保护
}
```

③ 擦除 Flash 扇区（写入前需擦除，STM32F103 每页 1KB，共 64 页）：

```c
// 擦除指定页，page：0~63（1KB/页）
uint8_t Flash_ErasePage(uint16_t page) {
    if (page >= 64) return 1; // 页号超出范围
    
    Flash_Unlock();
    
    if (FLASH_ErasePage(0x08000000 + page * 1024) != FLASH_COMPLETE) {
        Flash_Lock();
        return 1; // 擦除失败
    }
    
    Flash_Lock();
    return 0; // 擦除成功
}
```

④ 写入数据到 Flash（按半字写入，地址需对齐）：

```c
// 向addr写入len个半字数据（addr需为0x08000000以上且2字节对齐）
uint8_t Flash_WriteHalfWord(uint32_t addr, uint16_t *data, uint16_t len) {
    // 检查地址范围（STM32F103C8T6 Flash大小64KB：0x08000000~0x0800FFFF）
    if (addr < 0x08000000 || addr + len * 2 > 0x08010000) {
        return 1;
    }
    
    Flash_Unlock();
    
    for (uint16_t i = 0; i < len; i++) {
        if (FLASH_ProgramHalfWord(addr + i * 2, data[i]) != FLASH_COMPLETE) {
            Flash_Lock();
            return 1; // 写入失败
        }
    }
    
    Flash_Lock();
    return 0; // 写入成功
}
```

⑤ 从 Flash 读取数据（按字节读取）：

```c
// 从addr读取len个字节到buf
void Flash_ReadByte(uint32_t addr, uint8_t *buf, uint16_t len) {
    for (uint16_t i = 0; i < len; i++) {
        buf[i] = *(uint8_t *)(addr + i);
    }
}
```

⑥ 主函数使用示例（擦除→写入→读取验证）：

```c
int main(void) {
    uint16_t w_data[5] = {0x1234, 0x5678, 0x9ABC, 0xDEF0, 0xAAAA};
    uint8_t r_data[10]; // 5个半字=10字节
    
    // 擦除第63页（最后一页，地址0x0800FC00）
    Flash_ErasePage(63);
    
    // 向0x0800FC00写入5个半字
    Flash_WriteHalfWord(0x0800FC00, w_data, 5);
    
    // 从0x0800FC00读取10字节
    Flash_ReadByte(0x0800FC00, r_data, 10);
    
    while (1) {
        // 循环执行
    }
}
```

### 【案例】读取芯片ID

① 读取 STM32 芯片 ID（包含设备 ID 和唯一 ID）：

```c
#include "stm32f10x.h"

// 设备ID（固定值，区分芯片型号）
uint16_t Get_DeviceID(void) {
    return *(uint16_t*)0x1FFFF7E8; // 设备ID低16位
}

// 唯一ID（64位，每个芯片唯一）
void Get_UniqueID(uint8_t *uid) {
    // 唯一ID存储在0x1FFFF7E9~0x1FFFF7F2（共12字节，实际有效64位）
    uid[0] = *(uint8_t*)0x1FFFF7E9;
    uid[1] = *(uint8_t*)0x1FFFF7EA;
    uid[2] = *(uint8_t*)0x1FFFF7EB;
    uid[3] = *(uint8_t*)0x1FFFF7EC;
    uid[4] = *(uint8_t*)0x1FFFF7ED;
    uid[5] = *(uint8_t*)0x1FFFF7EE;
    uid[6] = *(uint8_t*)0x1FFFF7EF;
    uid[7] = *(uint8_t*)0x1FFFF7F0;
}
```

② 主函数使用示例：

```c
int main(void) {
    uint16_t device_id;
    uint8_t unique_id[8];
    
    // 读取设备ID（如STM32F103C8T6的设备ID为0x0410）
    device_id = Get_DeviceID();
    
    // 读取唯一ID（64位）
    Get_UniqueID(unique_id);
    
    while (1) {
        // 可通过串口等外设输出ID
    }
}
```