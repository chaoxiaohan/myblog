---
title: GD32F470入门教程（一）系统架构
date: 2026-02-10 00:00:00
type: paper
category: GD32F470xx
photos: 
tags:
excerpt: 这是摘要
description: 
---

> GD32的工程配置网络中教程已经很多了，这里就不过多赘述了

了解一个芯片首先了解其系统架构

# 系统及存储器架构

GD32F470系列MCU基于ARM Cortex-M4内核，主频高达200MHz，集成了丰富的片上资源和外设，适用于高性能嵌入式应用。其系统架构主要包括以下几个部分：

## 1. 内核与总线架构
GD32F470采用Cortex-M4内核，支持单周期乘法和硬件浮点运算。内核通过AHB/APB多层总线与片上各模块连接，实现高速数据传输。

![Cortex®-M4 结构框图](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/Cortex®-M41231434sd.png)

## 2. 存储器结构
- **Flash存储器**：最大可达3072KB，用于存放程序代码和常量数据。
- **SRAM**：分为主SRAM（256KB）和Tightly Coupled Memory（TCM，64KB），满足高速数据访问需求。
- **外部存储接口**：支持FSMC（灵活静态存储控制器），可扩展SRAM、NOR/NAND Flash、LCD等外部设备。

## 3. 时钟系统
内置多种时钟源（HXTAL、IRC、LXTAL、LIRC），通过PLL可灵活配置系统主频。支持外部高速/低速晶振和内部RC振荡器。

## 4. 片上外设
- **通用定时器/高级定时器**：支持PWM、输入捕获、输出比较等功能。
- **多种通信接口**：包括USART、SPI、I2C、CAN、USB OTG、SDIO、以太网等。
- **模拟外设**：12位ADC、DAC、比较器等。
- **DMA控制器**：支持多通道数据搬运，减轻CPU负担。

## 5. 安全与系统管理
- **看门狗**、**低功耗管理**、**时钟安全系统**等，提升系统可靠性。

## 6. 典型系统架构图

![GD32F4xx 器件的系统架构示意图](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/GD32F4xx854642213ssa.png)

通过上述架构，GD32F470实现了高性能、低功耗和丰富的外设扩展能力，适合多种嵌入式应用场景。

