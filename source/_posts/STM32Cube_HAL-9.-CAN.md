---
title: STM32Cube_HAL库笔记（九）-CAN
date: 2025-11-16 00:00:00
type: paper
category: HAL
photos: 
tags:
  - CAN
  - STM32
  - HAL
excerpt: 介绍STM32 HAL库中CAN通信的使用，包括原理、配置和数据传输等。
description: 
---

> 本系列主要讲解STM32CubeHAL的使用，详细的安装部署教程请见[【STM32】STM32 CubeMx使用教程一--安装教程-CSDN博客](https://blog.csdn.net/as480133937/article/details/98885316)

# CAN

## CAN原理

### CAN物理层

与I2C、SPI等具有时钟信号的同步通讯方式不同，CAN通讯并不是以时钟信号来进行同步的，它是一种异步通讯，只具有CAN_High和CAN_Low两条信号线， 共同构成一组差分信号线，以差分信号的形式进行通讯。

#### 闭环总线网络

CAN物理层的形式主要有两种，图 CAN闭环总线通讯网络 中的CAN通讯网络是一种遵循ISO11898标准的高速、 短距离“闭环网络”，它的总线最大长度为40m，通信速度最高为1Mbps，总线的两端各要求有一个“120欧”的电阻。

![CAN闭环总线通讯网络](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/CAN002.png)

#### 开环总线网络

图 CAN开环总线通讯网络中的是遵循ISO11519-2标准的低速、远距离“开环网络”，它的最大传输距离为1km， 最高通讯速率为125kbps，两根总线是独立的、不形成闭环，要求每根总线上各串联有一个“2.2千欧”的电阻。

![CAN开环总线通讯网络](https://doc.embedfire.com/mcu/stm32/h750prov/hal/zh/latest/_images/CAN003.png)

#### 通讯节点

从CAN通讯网络图可了解到，CAN总线上可以挂载多个通讯节点，节点之间的信号经过总线传输，实现节点间通讯。由于CAN通讯协议不对节点进行地址编码， 而是对数据内容进行编码的，所以网络中的节点个数理论上不受限制，只要总线的负载足够即可，可以通过中继器增强负载。

CAN通讯节点由一个CAN控制器及CAN收发器组成，控制器与收发器之间通过CAN_Tx及CAN_Rx信号线相连，收发器与CAN总线之间使用CAN_High及CAN_Low信号线相连。 其中CAN_Tx及CAN_Rx使用普通的类似TTL逻辑信号，而CAN_High及CAN_Low是一对差分信号线，使用比较特别的差分信号，下一小节再详细说明。

当CAN节点需要发送数据时，控制器把要发送的二进制编码通过CAN_Tx线发送到收发器，然后由收发器把这个普通的逻辑电平信号转化成差分信号， 通过差分线CAN_High和CAN_Low线输出到CAN总线网络。而通过收发器接收总线上的数据到控制器时，则是相反的过程， 收发器把总线上收到的CAN_High及CAN_Low信号转化成普通的逻辑电平信号，通过CAN_Rx输出到控制器中。

例如，STM32的CAN片上外设就是通讯节点中的控制器，为了构成完整的节点，还要给它外接一个收发器，在我们实验板中使用型号为TJA1050的芯片作为CAN收发器。 CAN控制器与CAN收发器的关系如同TTL串口与MAX3232电平转换芯片的关系，MAX3232芯片把TTL电平的串口信号转换成RS-232电平的串口信号， CAN收发器的作用则是把CAN控制器的TTL电平信号转换成差分信号(或者相反)。

#### 差分信号

差分信号又称差模信号，与传统使用单根信号线电压表示逻辑的方式有区别，使用差分信号传输时，需要两根信号线，这两个信号线的振幅相等， 相位相反，通过两根信号线的电压差值来表示逻辑0和逻辑1。见图 差分信号 ，它使用了V+与V-信号的差值表达出了图下方的信号。

![差分信号](https://doc.embedfire.com/mcu/stm32/h750prov/hal/zh/latest/_images/CAN004.png)

相对于单信号线传输的方式，使用差分信号传输具有如下优点：

- 抗干扰能力强，当外界存在噪声干扰时，几乎会同时耦合到两条信号线上，而接收端只关心两个信号的差值，所以外界的共模噪声可以被完全抵消。
- 能有效抑制它对外部的电磁干扰，同样的道理，由于两根信号的极性相反，他们对外辐射的电磁场可以相互抵消，耦合的越紧密，泄放到外界的电磁能量越少。
- 时序定位精确，由于差分信号的开关变化是位于两个信号的交点，而不像普通单端信号依靠高低两个阈值电压判断，因而受工艺，温度的影响小， 能降低时序上的误差，同时也更适合于低幅度信号的电路。

由于差分信号线具有这些优点，所以在USB协议、485协议、以太网协议及CAN协议的物理层中，都使用了差分信号传输。

####  CAN协议中的差分信号

CAN协议中对它使用的CAN_High及CAN_Low表示的差分信号做了规定，见表 [CAN协议标准表示的信号逻辑]及图 [CAN的差分信号高速]。 以高速CAN协议为例，当表示逻辑1时(隐性电平)，CAN_High和CAN_Low线上的电压均为2.5v， 即它们的电压差VH-VL=0V；而表示逻辑0时(显性电平)， CAN_High的电平为3.5V，CAN_Low线的电平为1.5V， 即它们的电压差为VH-VL=2V。例如，当CAN收发器从CAN_Tx线接收到来自CAN控制器的低电平信号时(逻辑0)， 它会使CAN_High输出3.5V，同时CAN_Low输出1.5V，从而输出显性电平表示逻辑0。

![CAN协议标准表示的信号逻辑](https://doc.embedfire.com/mcu/stm32/h750prov/hal/zh/latest/_images/CAN01.png)![CAN的差分信号高速](https://doc.embedfire.com/mcu/stm32/h750prov/hal/zh/latest/_images/CAN005.png)

在CAN总线中，必须使它处于隐性电平(逻辑1)或显性电平(逻辑0)中的其中一个状态。假如有两个CAN通讯节点，在同一时间，一个输出隐性电平， 另一个输出显性电平，类似I2C总线的“线与”特性将使它处于显性电平状态，显性电平的名字就是这样来的，即可以认为显性具有优先的意味。

由于CAN总线协议的物理层只有1对差分线，在一个时刻只能表示一个信号，所以对通讯节点来说，CAN通讯是半双工的，收发数据需要分时进行。 在CAN的通讯网络中，因为共用总线，在整个网络中同一时刻只能有一个通讯节点发送信号，其余的节点在该时刻都只能接收。

### CAN协议

#### CAN总线传输特点

CAN 总线的数据传输有其自身的特点，主要有以下几点。

- CAN 总线上的节点既可以发送数据又可以接收数据，没有主从之分。但是在同一个时刻，只能有一个节点发送数据，其他节点只能接收数据。
- CAN 总线上的节点没有地址的概念。CAN 总线上的数据是以帧为单位传输的，帧又分为数据帧、遥控帧等多种帧类型，帧包含需要传输的数据或控制信息。
- CAN 总线具有 “线与” 的特性，也就是当有两个节点同时向总线发送信号时，一个发送显性电平（逻辑 0），另一个发送隐性电平（逻辑 1），则总线呈现为显性电平。这个特性被用于总线仲裁，也就是哪个节点优先占用总线进行发送操作。
- 每个帧有一个标识符（Identifier，以下简称 ID）。ID 不是地址，它表示传输数据的类型，也可以用于总线仲裁时确定优先级。例如，在汽车的 CAN 总线上，假设用于碰撞检测的节点输出数据帧的 ID 为 01，车内温度检测节点发送数据帧的 ID 为 05 等。
- 每个 CAN 节点都接收数据，但是可以对接收的帧根据 ID 进行过滤。只有节点需要的数据才会被接收并进一步处理，不需要的数据会被自动舍弃。例如，假设安全气囊控制器只接受碰撞检测节点发出的 ID 为 01 的帧，这种 ID 的过滤是由硬件完成的，以便安全气囊控制器在发生碰撞时能及时响应。
- CAN 总线通信是半双工的，即总线不能同时发送和接收。在多个节点竞争总线进行发送时，通过 ID 的优先级进行仲裁，竞争胜出的节点继续发送，竞争失败的节点立刻转入接收状态。
- CAN 总线没有用于同步的时钟信号，所以需要规定 CAN 总线通信的波特率，所有节点都使用相同的波特率进行通信。

CAN还会使用“位同步”的方式来抗干扰、吸收误差，实现对总线电平信号进行正确的采样，确保通讯正常。

#### **位时序分解**

为了实现位同步，CAN协议把每一个数据位的时序分解成如图  所示的SS段、 PTS段、PBS1段、PBS2段，这四段的长度加起来即为一个CAN数据位的长度。分解后最小的时间单位是Tq，而一个完整的位由8~25个Tq组成。 为方便表示，图中的高低电平直接代表信号逻辑0或逻辑1(不是差分信号)。

![CAN位时序分解图](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/CAN006.png)

该图中表示的CAN通讯信号每一个数据位的长度为19Tq，其中SS段占1Tq，PTS段占6Tq，PBS1段占5Tq，PBS2段占7Tq。 信号的采样点位于PBS1段与PBS2段之间，通过控制各段的长度，可以对采样点的位置进行偏移，以便准确地采样。

各段的作用如介绍下：

- SS段(SYNC SEG)

> SS译为同步段，若通讯节点检测到总线上信号的跳变沿被包含在SS段的范围之内，则表示节点与总线的时序是同步的， 当节点与总线同步时，采样点采集到的总线电平即可被确定为该位的电平。SS段的大小固定为1Tq。

- PTS段(PROP SEG)

> PTS译为传播时间段，这个时间段是用于补偿网络的物理延时时间。是总线上输入比较器延时和输出驱动器延时总和的两倍。PTS段的大小可以为1~8Tq。

- PBS1段(PHASE SEG1)，

> PBS1译为相位缓冲段，主要用来补偿边沿阶段的误差，它的时间长度在重新同步的时候可以加长。PBS1段的初始大小可以为1~8Tq。

- PBS2段(PHASE SEG2)

> PBS2这是另一个相位缓冲段，也是用来补偿边沿阶段误差的，它的时间长度在重新同步时可以缩短。PBS2段的初始大小可以为2~8Tq。

#### **通讯的波特率**

总线上的各个通讯节点只要约定好1个Tq的时间长度以及每一个数据位占据多少个Tq，就可以确定CAN通讯的波特率。

例如，假设上图中的1Tq=1us，而每个数据位由19个Tq组成， 则传输一位数据需要时间T1bit =19us，从而每秒可以传输的数据位个数为：

1x106­/19 = 52631.6 (bps)

这个每秒可传输的数据位的个数即为通讯中的波特率。

#### **同步过程分析**

波特率只是约定了每个数据位的长度，数据同步还涉及到相位的细节，这个时候就需要用到数据位内的SS、PTS、PBS1及PBS2段了。

根据对段的应用方式差异，CAN的数据同步分为硬同步和重新同步。其中硬同步只是当存在“帧起始信号”时起作用，无法确保后续一连串的位时序都是同步的， 而重新同步方式可解决该问题，这两种方式具体介绍如下：

(1) 硬同步

若某个CAN节点通过总线发送数据时，它会发送一个表示通讯起始的信号(即下一小节介绍的帧起始信号)，该信号是一个由高变低的下降沿。 而挂载到CAN总线上的通讯节点在不发送数据时，会时刻检测总线上的信号。

见图 [硬同步过程图] ，可以看到当总线出现帧起始信号时， 某节点检测到总线的帧起始信号不在节点内部时序的SS段范围，所以判断它自己的内部时序与总线不同步，因而这个状态的采样点采集得的数据是不正确的。 所以节点以硬同步的方式调整，把自己的位时序中的SS段平移至总线出现下降沿的部分，获得同步，同步后采样点就可以采集得正确数据了。

![硬同步过程图](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/CAN007.png)

(2) 重新同步

前面的硬同步只是当存在帧起始信号时才起作用，如果在一帧很长的数据内，节点信号与总线信号相位有偏移时，这种同步方式就无能为力了。 因而需要引入重新同步方式，它利用普通数据位的高至低电平的跳变沿来同步(帧起始信号是特殊的跳变沿)。 重新同步与硬同步方式相似的地方是它们都使用SS段来进行检测，同步的目的都是使节点内的SS段把跳变沿包含起来。

重新同步的方式分为超前和滞后两种情况，以总线跳变沿与SS段的相对位置进行区分。第一种相位超前的情况如图， 节点从总线的边沿跳变中，检测到它内部的时序比总线的时序相对超前2Tq，这时控制器在下一个位时序中的PBS1段增加2Tq的时间长度，使得节点与总线时序重新同步。

![相位超前时的重新同步](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/CAN008.png)

第二种相位滞后的情况如图，节点从总线的边沿跳变中， 检测到它的时序比总线的时序相对滞后2Tq，这时控制器在前一个位时序中的PBS2段减少2Tq的时间长度，获得同步。

![相位滞后时的重新同步](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251116162244318.png)

在重新同步的时候， PBS1和PBS2中增加或减少的这段时间长度被定义为“重新同步补偿宽度SJW (reSynchronization Jump Width)”。 一般来说CAN控制器会限定SJW的最大值，如限定了最大SJW=3Tq时，单次同步调整的时候不能增加或减少超过3Tq的时间长度，若有需要， 控制器会通过多次小幅度调整来实现同步。当控制器设置的SJW极限值较大时，可以吸收的误差加大，但通讯的速度会下降。

#### 帧的种类

CAN 网络通信是通过 5 种类型的帧（frame）进行的，这 5 种帧及其用途如表 18-2 所示。

| 帧类型                        | 帧用途                                                       |
| ----------------------------- | ------------------------------------------------------------ |
| 数据帧（Data frame）          | 节点发送的包含 ID 和数据的帧                                 |
| 遥控帧（Remote frame）        | 节点向网络上的其他节点发出的某个 ID 的数据请求，发送节点收到遥控帧后就可以发送相应 ID 的数据帧 |
| 错误帧（Error frame）         | 节点检测出错误时，向其他节点发送的通知错误的帧               |
| 过载帧（Overload frame）      | 接收单元未做好接收数据的准备时发送的帧，发送节点收到过载帧后可以暂缓发送数据帧 |
| 帧间空间（Inter-frame space） | 用于将数据帧、遥控帧与前后的帧分隔开的帧                     |

其中，数据帧和遥控帧有 ID，并且有标准格式和扩展格式两种格式，标准格式的 ID 是 11 位，扩展格式的 ID 是 29 位。下面仅详细介绍数据帧和遥控帧的结构，其他帧的结构可参考相关资料。

#### 标准格式数据帧和遥控帧

标准格式数据帧和遥控帧的结构如图 18-4 所示，它们都有 11 位的 ID。数据帧传输带有 ID 的 0 到 8 字节的数据；遥控帧只有 ID，没有数据，用于请求数据。

数据帧可以分为以下几段。

（1）帧起始（Start Of Frame，SOF）。帧起始只有一个位，是一个显性电平（逻辑 0），表示一个帧的开始。

（2）仲裁段（Arbitration Field）。仲裁段包括 11 位的 ID 和 RTR 位，共 12 位。多个节点竞争总线发送数据时，根据仲裁段的数据决定哪个节点优先占用总线。哪个 ID 先出现显性电平（逻辑 0），对应的节点就占用总线。所以，ID 数值小的优先级更高。如果两个节点发送数据帧的 ID 相同，再根据仲裁段最后的 RTR 位裁决。

![image-20251116162132601](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/CAN009.png)

RTR（Remote Transmit Request）是远程传输请求，RTR 位用于区分数据帧和遥控帧。数据帧的 RTR 位是显性电平（逻辑 0），遥控帧的 RTR 位是隐性电平（逻辑 1）。所以，具有相同 ID 的数据帧和遥控帧竞争总线时，数据帧优先获得发送权。（3）控制段。控制段包括 IDE 位、RB0 位和 4 位的 DLC，共 6 位。

IDE 是标识符扩展位（Identifier Extension Bit），用于表示帧是标准格式，还是扩展格式。标准格式帧的 IDE 是显性电平（逻辑 0），扩展格式帧的 IDE 是隐性电平（逻辑 1）。

RB0 是保留位，默认为显性电平。

DLC 是 4 个位的数据长度编码（Data Length Code），编码数值为 0 到 8，表示后面数据段的字节数。遥控帧的 DLC 编码数值总是 0，因为遥控帧不传输数据。（4）数据段。数据段里是数据帧需要传输的数据，可以是 0 到 8 字节，数据的字节个数由 DLC 编码确定。遥控帧没有数据段。（5）CRC 段。CRC 段共 16 位，其中前 15 位是 CRC 校验码，最后一位总是隐性电平，是 CRC 段的界定符（Delimiter）。（6）ACK 段。ACK 段包括一个 ACK 位（Acknowledge Bit）和一个 ACK 段界定符。发送节点发送的 ACK 位是隐性电平，接收节点接收的 ACK 位是显性电平。（7）帧结束（End Of Frame，EOF）。帧结束是帧结束段，由 7 个隐性位表示 EOF。

数据帧或遥控帧结束后，后面一般是帧间空间或过载帧，用于分隔开数据帧或遥控帧。

#### 扩展格式数据帧和遥控帧

扩展格式数据帧和遥控帧的结构如图 18-5 所示。扩展格式的 ID 总共是 29 位，扩展格式帧与标准格式帧的差异在于仲裁段和控制段。（1）仲裁段。扩展格式数据帧的仲裁段总共 32 位，包括 11 位标准 ID、SRR 位、IDE 位、18 位扩展 ID、RTR 位。

SRR 位（Substitute Remote Request Bit）只存在于扩展格式帧中，用于替代标准格式帧中的 RTR 位。SRR 位总是隐性电平，相当于是一个占位符，真正的 RTR 位在仲裁段的最后一位。RTR 位还是用于区分数据帧和遥控帧。扩展格式帧中的 IDE 位总是隐性电平，表示这是扩展格式的帧。

![image-20251116162244318](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251116162132601.png)

（2）控制段。控制段由 RB1 位、RB0 位和 4 位 DLC 组成。RB1 位和 RB0 位是保留位，总是显性电平。4 位的 DLC 编码表示数据的长度，从 0 到 8 字节。

####  优先级法则

数据帧和遥控帧的仲裁段用于多个节点竞争总线时进行仲裁，优先级高的帧获得在总线上发送数据的权利。优先级的确认总结为以下几条法则。

- 在总线空闲时，最先开始发送消息的节点获得发送权。
- 多个节点同时开始发送时，从仲裁段的第一位开始进行仲裁，第一次出现各节点的位电平互异时，输出显性电平的节点获得发送权。
- 相同 ID 和格式的数据帧和遥控帧，数据帧具有更高优先级，因为数据帧的 RTR 位是显性电平，而遥控帧的 RTR 位是隐性电平。
- 对于 11 位标准 ID 相同的标准数据帧和扩展数据帧，标准数据帧具有更高的优先级，因为标准数据帧的 IDE 位是显性电平，而扩展数据帧的 IDE 位是隐性电平。

#### **其它报文的结构**

![各种CAN报文的结构](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/CAN012.png)

## STM32的CAN外设

STM32F4 系列器件上有两个基本扩展 CAN（Basic Extended CAN，bxCAN）外设，称为 bxCAN 外设，支持 2.0A 和 2.0B 的 CAN 协议。在本书中，我们将 bxCAN 外设还是简称为 CAN 外设，两个 CAN 外设是 CAN1 和 CAN2，称它们为 CAN 模块。

STM32F4 系列器件的两个 CAN 模块的结构如图 18-6 所示。CAN1 是带有 512 字节 SRAM 的主 CAN 控制器，CAN2 无法直接访问 SRAM 存储器，是从 CAN 控制器。两个 CAN 控制器共享 512 字节的 SRAM。

STM32F4 CAN 外设的主要特点如下。

- 波特率最高为 1Mbit/s。
- 每个 CAN 模块有 3 个发送邮箱，可自动重发。
- ![image-20251116163633994](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251116170215027.png)
- 具有 16 位自由运行的定时器，可以定时触发通信，可以在最后两个数据字节发送间戳。
- 每个 CAN 模块有两个 FIFO 单元，每个 FIFO 有 3 个接收邮箱，每个 FIFO 有独立的断地址。
- 两个 CAN 模块共用 28 个筛选器组，筛选器用于配置可接收 ID 列表或掩码。数据帧遥控帧根据 ID 被筛选，只有通过筛选的帧才进入接收邮箱。帧的筛选完全由硬件完成减少处理器的负担。

STM32F4 系列 MCU 上的 CAN 模块只是 CAN 控制器，要构成图 18-1 或图 18-2 中的一 CAN 节点，MCU 还需要外接一个 CAN 收发器芯片，实现 MCU 逻辑电平到 CAN 总线物理的电平转换和控制。本章后面的示例部分会介绍开发板上的 CAN 通信接口电路。

### CAN 模块的基本控制

CAN 模块有 3 种主要的工作模式：初始化、正常和睡眠。硬件复位后，CAN 模块处于

| 函数                    | 功能描述                                                     |
| ----------------------- | ------------------------------------------------------------ |
| HAL_CAN_RequestSleep()  | 使 CAN 模块在完成当前操作后进入睡眠模式                      |
| HAL_CAN_WakeUp()        | 将 CAN 模块从睡眠模式唤醒                                    |
| HAL_CAN_IsSleepActive() | 查询 CAN 模块是否处于睡眠模式，返回值为 1 表示模块处于睡眠模式 |

CAN 模块的初始化函数是 `HAL_CAN_Init`，其原型定义如下：

```c
HAL_StatusTypeDef HAL_CAN_Init(CAN_HandleTypeDef *hcan);
```

其中，`hcan` 是 `CAN_HandleTypeDef` 结构体类型指针，是 CAN 模块对象指针。`CAN_HandleTypeDef` 的成员变量 `Init` 是结构体类型 `CAN_InitTypeDef`，用于存储 CAN 通信参数。

在 CubeMX 生成的代码中，会为启用的 CAN 模块定义外设对象变量，例如：

```c
CAN_HandleTypeDef  hcan1;    //表示 CAN1 的外设对象变量
```

表 18-3 中的其他函数的原型定义如下：

```c
void HAL_CAN_MspInit(CAN_HandleTypeDef *hcan);        //MSP 初始化函数
HAL_StatusTypeDef HAL_CAN_Start(CAN_HandleTypeDef *hcan);   //启动 CAN 模块
HAL_StatusTypeDef HAL_CAN_Stop(CAN_HandleTypeDef *hcan);    //停止 CAN 模块
HAL_StatusTypeDef HAL_CAN_RequestSleep(CAN_HandleTypeDef *hcan); //进入睡眠模式
HAL_StatusTypeDef HAL_CAN_WakeUp(CAN_HandleTypeDef *hcan);//从睡眠模式唤醒
uint32_t HAL_CAN_IsSleepActive(CAN_HandleTypeDef *hcan);  //返回 1 表示模块处于睡眠模式
```

一个 CAN 模块需要先用函数 `HAL_CAN_Init()` 进行外设初始化，模块处于初始化模式，可以进行筛选器组的配置。执行函数 `HAL_CAN_Start()` 启动 CAN 模块进入正常模式，模块可以在正常模式和睡眠模式之间切换。执行 `HAL_CAN_Stop()` 将停止 CAN 模块。

###  CAN 模块的测试模式
在对 CAN 模块进行初始化设置时，我们通过设置位时序寄存器 CAN_BTR 的 SILM 和 LBKM 位，可以使 CAN 模块进入测试模式。在测试模式下，我们将主控制寄存器 CAN_MCR 中的 INRQ 位复位，可以进入正常模式。要进入测试模式，必须在 CAN 模块初始化时进行设置。在测试模式下，CAN 模块可以自发自收，以测试 CAN 模块的功能是否正常。CAN 模块的 3 种测试模式如图 18-7 所示。

（1）静默模式（silent mode）。在静默模式下，CAN 模块可以接收有效的数据帧和遥控帧，但是只能向总线发送隐性位，发送的显性位都被自己接收，所以在静默模式下，CAN 模块无法启动发送操作。这种模式一般用于监测总线流量。

![image-20251116170215027](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251116171625803.png)

（2）回环模式（loop back mode）。在回环模式下，CAN 模块可以正常地向总线发送数据，但不能接收总线上的数据，只能接收自己发送的数据（需要通过筛选规则）。这种模式可用于自检测试。为了不受外部事件的影响，CAN 内核在此模式下不会对数据或遥控帧的 ACK 段采样，这样可以忽略 ACK 错误。

（3）回环与静默组合模式（loop back combined with silent mode）。这是回环与静默模式的组合，可用于“热自检”。在这种模式下，CAN 模块不能接收总线上的数据，只能接收自己发送的数据；只能向总线上发送隐性位，因而不会影响 CAN 总线。

使 CAN 模块进入某种测试模式是在初始化函数 `HAL_CAN_Init()` 中，通过设置 CAN 模块的属性实现的，在示例代码里会具体介绍。

###  消息发送
一个 CAN 模块有 3 个发送邮箱。发送数据时，用户需要选择一个空闲的发送邮箱，将标识符 ID、数据长度和数据（最多 8 字节）写入邮箱，然后 CAN 模块会自动控制将邮箱内的数据发送出去。

用户可以设置自动重发，也就是在出现错误后自动重发，直到成功发送出去。如果禁止自动重发，则发送失败后不再重发，会通过发送状态寄存器 CAN_TSR 相应的位指示错误原因，如仲裁丢失或发送错误。

用户可以终止邮箱数据的发送，终止发送后邮箱会变成空闲状态。

用户可以设置时间触发通信模式（time triggered communication mode）。在此模式下，会激活 CAN 模块内部的一个硬件计数器，CAN 总线每收发一个位数据，计数器都会递增。在发送或接收时，在帧的起始位时刻捕获计数值，作为发送或接收数据帧的时间戳数据。

在 CAN 的 HAL 驱动程序中，与发送消息相关的函数如表 18-4 所示。

| 函数名                         | 功能描述                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| `HAL_CAN_GetTxMailboxesFreeLevel()` | 查询空闲的发送邮箱个数，空闲邮箱个数大于 0 时就可以发送     |
| `HAL_CAN_AddTxMessage()`        | 向一个邮箱写入一条消息，由 CAN 模块自动控制邮箱内消息的发送 |
| `HAL_CAN_AbortTxRequest()`      | 中止发送一个被挂起（等待发送）的消息                         |
| `HAL_CAN_IsTxMessagePending()`  | 判断一个消息是否在等待发送                                   |
| `HAL_CAN_GetTxTimestamp()`      | 如果使用了时间触发通信模式，此函数读取发送消息的时间戳       |

函数 `HAL_CAN_GetTxMailboxesFreeLevel()` 用于查询一个 CAN 模块空闲的发送邮箱个数，如果有空闲的发送邮箱，就可以使用函数 `HAL_CAN_AddTxMessage()` 向发送邮箱写入一条消息，然后由 CAN 模块启动发送过程。这个函数只能发送数据帧或遥控帧，其函数原型定义如下：
```c
HAL_StatusTypeDef HAL_CAN_AddTxMessage(CAN_HandleTypeDef *hcan, CAN_TxHeaderTypeDef *pHeader, uint8_t aData[], uint32_t *pTxMailbox);
```
其中，参数 `hcan` 是 CAN 模块外设对象指针；参数 `pHeader` 是 `CAN_TxHeaderTypeDef` 结构体类型指针，定义了消息的一些参数；`aData` 是发送数据的数组，最多 8 字节的数据；参数 `pTxMailbox` 用于返回实际使用的发送邮箱号。

结构体 `CAN_TxHeaderTypeDef` 用于定义消息的一些参数，用于 CAN 模块组装成数据帧，该结构体完整定义如下：
```c
typedef struct
{
    uint32_t StdId;          //11 位的标准标识符，设置范围是 0～0x7FF
    uint32_t ExtId;          //29 位的扩展标识符，设置范围是 0～0x1FFFFFFF
    uint32_t IDE;            //帧格式类型，标准 ID(CAN_ID_STD)或扩展 ID(CAN_ID_EXT)
    uint32_t RTR;            //数据位，消息类型：数据帧(CAN_RTR_DATA)或遥控帧(CAN_RTR_REMOTE)
    uint32_t DLC;            //数据字节数，最多 8 字节，设置范围是 0～8
    FunctionalState TransmitGlobalTime; //是否使用时间戳，取值 ENABLE 或 DISABLE
} CAN_TxHeaderTypeDef;
```
其中，成员变量 `IDE` 表示帧格式类型，有两个宏定义表示标准 ID 和扩展 ID。
```c
#define CAN_ID_STD    (0x00000000U)    //标准 ID
#define CAN_ID_EXT    (0x00000004U)    //扩展 ID
```
成员变量 `RTR` 表示消息类型，只能是数据帧或遥控帧，有两个宏定义用于此变量的取值。
```c
#define CAN_RTR_DATA    (0x00000000U)    //数据帧
#define CAN_RTR_REMOTE  (0x00000002U)    //遥控帧
```

CAN 模块发送数据是将消息写入模块的发送邮箱，然后由 CAN 控制器将邮箱内的消息发送出去。CAN 模块发送消息只有 `HAL_CAN_AddTxMessage()` 这一个函数，不像串口、SPI 等其他外设有中断模式、DMA 方式的专用函数。

将消息写入邮箱后，可以用函数 `HAL_CAN_IsTxMessagePending()` 查询邮箱里的消息是否发送出去，这个函数的原型定义是：
```c
uint32_t HAL_CAN_IsTxMessagePending(CAN_HandleTypeDef *hcan, uint32_t TxMailboxes);
```
其中，参数 `TxMailboxes` 是发送邮箱号。函数返回值如果是 0，则表示没有等待发送的消息，也就是消息已经被发送出去了；如果返回值为 1，则表示邮箱里的消息仍然在等待发送。CAN 总线上可能有很多个节点，需要通过总线仲裁获得 CAN 总线使用权之后，节点才能将邮箱里的消息发送出去。

CAN 模块也有表示消息发送出去的中断事件，如果打开了相应的中断事件便能控制它，也可以在中断里做出响应。在后面会专门介绍 CAN 的中断。

###  消息接收
每个 CAN 模块有两个接收 FIFO（Receive FIFO），每个 FIFO（本章后面都将“接收 FIFO”简称为“FIFO”）有 3 个邮箱。FIFO 完全由硬件管理，当有邮箱接收到有效消息时，就会产生相应的事件中断标志，可以产生 CAN RX 硬件中断。FIFO0 和 FIFO1 有各自的中断地址。

从邮箱中读出消息后，邮箱就自动释放。如果一个 FIFO 的 3 个邮箱都接收到消息而没有及时读出，再有消息进入时就会产生上溢。根据是否设置 FIFO 锁定，有两种处理情况。
- 如果禁止 FIFO 锁定，则新传入的消息会覆盖 FIFO 中存储的最后一条消息。
- 如果启用 FIFO 锁定，则新传入的消息会被舍弃。

用户可以通过轮询方式或中断方式读取接收邮箱中的消息。CAN 模块接收消息的相关函数如表 18-5 所示，接收消息相关的中断在后面具体介绍。

| 函数名                         | 功能描述                                   |
| ------------------------------ | ------------------------------------------ |
| `HAL_CAN_GetRxFifoFillLevel()` | 查询一个 FIFO 中存在未读消息的邮箱个数     |
| `HAL_CAN_GetRxMessage()`        | 读取一个接收邮箱中的消息                   |

函数 `HAL_CAN_GetRxFifoFillLevel()` 用于查询某个 FIFO 存在未读消息的邮箱个数，函数原型定义如下：
```c
uint32_t HAL_CAN_GetRxFifoFillLevel(CAN_HandleTypeDef *hcan, uint32_t RxFifo);
```
其中，参数 `RxFifo` 是 FIFO 编号，一个 CAN 模块有两个 FIFO，可使用如下的两个宏作为此参数的取值。
```c
#define CAN_RX_FIFO0    (0x00000000U)    //CAN 模块 FIFO0
#define CAN_RX_FIFO1    (0x00000001U)    //CAN 模块 FIFO1
```

如果查询到有未读取的消息，就用函数 `HAL_CAN_GetRxMessage()` 读取接收的消息，此函数的原型定义如下：
```c
HAL_StatusTypeDef HAL_CAN_GetRxMessage(CAN_HandleTypeDef *hcan, uint32_t RxFifo, CAN_RxHeaderTypeDef *pHeader, uint8_t aData[]);
```
其中，参数 `RxFifo` 是 FIFO 编号，用宏 `CAN_RX_FIFO0` 和 `CAN_RX_FIFO1` 分别表示 FIFO0 和 FIFO1；参数 `pHeader` 是 `CAN_RxHeaderTypeDef` 结构体类型指针，记录了帧的一些信息；`aData[]` 是接收数据的数组，最多 8 字节。

记录帧信息的结构体 `CAN_RxHeaderTypeDef` 的定义如下：
```c
typedef struct
{
    uint32_t StdId;          //11 位的标准标识符，设置范围是 0～0x7FF
    uint32_t ExtId;          //29 位的扩展标识符，设置范围是 0～0x1FFFFFFF
    uint32_t IDE;            //帧格式类型，标准 ID(CAN_ID_STD)或扩展 ID(CAN_ID_EXT)
    uint32_t RTR;            //RTR 位，消息类型：数据帧或遥控帧
    uint32_t DLC;            //数据字节数，最多 8 字节
    uint32_t Timestamp;      //时间戳数据，数值范围是 0～0xFFFF
    uint32_t FilterMatchIndex; //匹配的筛选器索引
} CAN_RxHeaderTypeDef;
```
结构体 `CAN_RxHeaderTypeDef` 的部分成员变量与结构体 `CAN_TxHeaderTypeDef` 的相同，只有后面两个成员变量是 `CAN_RxHeaderTypeDef` 特有的。

###  标识符筛选
#### 标识符筛选原理
在 CAN 网络中，发送节点是以广播方式发送消息的，所有 CAN 节点都可以收到消息。数据帧和遥控帧带有标识符，标识符一般表示了消息的类型。一个 CAN 节点一般只对特定的消息感兴趣，如果用软件对所有的 ID 进行判别，将消耗接收节点的大量 CPU 时间。从图 18-6 中可以看到，STM32F4 的两个 CAN 控制器有 28 个共用的标识符筛选器组（Filter Bank），可以完全用硬件方式对接收的帧 ID 进行筛选，只允许符合条件的帧进入接收邮箱，自动放弃不符合条件的帧。

每个筛选器组包含两个 32 位寄存器，分别是 CAN_FxR1 和 CAN_FxR2。这两个寄存器可以被配置为两个 32 位单滤波器或 4 个 16 位长滤波器，筛选器可以是掩码模式或列表模式，所以一个筛选器组有 4 种配置模式，如图所示。

![image-20251116170249146](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251116170343376.png)

（1）1 个 32 位筛选器——标识符掩码模式。在这种模式下，寄存器 CAN_FxR1 存储一个 32 位 ID，这个 ID 与 11 位标准 ID（STID[10:0]）、18 位扩展 ID（EXTID[17:0]）、IDE 位、RTR 位的位置对应关系如图 18-8 中的模式（1）所示。IDE 为 0 时表示标准格式帧，否则表示扩展格式帧。

寄存器 CAN_FxR2 存储一个 32 位掩码，如果掩码为 1，则表示该位必须与 ID 中的位一致，如果为 0，则表示不用一致。

例如，如果让一个 CAN 节点只接收标准 ID 为奇数的标准格式数据帧，则设置寄存器 CAN_FxR1 表示的 ID 时，STID[0]位必须设置为 1，IDE 位必须设置为 0（表示标准格式帧），RTR 位必须设置为 0（表示数据帧）。设置寄存器 CAN_FxR2 表示的掩码时，对应的这些位必须设置为 1，其他位可以是 0。ID 和掩码的设置结果如表 18-6 所示，表中“X”表示这个位可以是 0，也可以是 1。

![image-20251116170343376](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251116163633994.png)

（2）2 个 32 位筛选器——标识符列表模式。在这种模式下，寄存器 CAN_FxR1 和 CAN_FxR2 各存储一个 32 位 ID，ID 的组成与模式（1）相同。只有匹配这两个 ID 的帧才能通过筛选。

（3）2 个 16 位筛选器——标识符掩码模式。在这种模式下，寄存器 CAN_FxR1 的高 16 位组成一个掩码 ID，低 16 位组成一个掩码；寄存器 CAN_FxR2 的高 16 位组成一个掩码 ID，低 16 位组成一个掩码。

（4）4 个 16 位筛选器——标识符列表模式。在这种模式下，寄存器 CAN_FxR1 表示 2 个 16 位 ID，寄存器 CAN_FxR2 表示 2 个 16 位 ID，16 位 ID 的组成如图 18-8 中的模式（4）所示。

用户可以为一个 FIFO 设置多个筛选器组，但是一个筛选器组只能配置给一个 FIFO。如果为了 FIFO 设置了筛选器，并且接收的帧与所有筛选器都不匹配，那么该帧会被丢弃。只要通过了一个筛选器，帧就会被存入接收邮箱。

####  函数`HAL_CAN_ConfigFilter()`
函数 `HAL_CAN_ConfigFilter()` 用于设置 CAN 模块的标识符筛选器，应该在执行 `HAL_CAN_Start()` 启动一个 CAN 模块之前调用这个函数。其原型定义如下：
```c
HAL_StatusTypeDef HAL_CAN_ConfigFilter(CAN_HandleTypeDef *hcan, CAN_FilterTypeDef *sFilterConfig);
```
其中，参数 `sFilterConfig` 是结构体 `CAN_FilterTypeDef` 类型指针，它保存了筛选器的设置。这个结构体定义如下，各成员变量的意义见注释：
```c
typedef struct
{
    uint32_t FilterIdHigh;       //CAN_FxR1 寄存器的高 16 位，取值范围为 0～0xFFFF
    uint32_t FilterIdLow;        //CAN_FxR1 寄存器的低 16 位，取值范围为 0～0xFFFF
    uint32_t FilterMaskIdHigh;   //CAN_FxR2 寄存器的高 16 位，取值范围为 0～0xFFFF
    uint32_t FilterMaskIdLow;    //CAN_FxR2 寄存器的低 16 位，取值范围为 0～0xFFFF
    /* 筛选器用于哪个 FIFO，使用宏 CAN_FILTER_FIFO0 或 CAN_FILTER_FIFO1 */
    uint32_t FilterFIFOAssignment;
    /* 筛选器组编号，具有双 CAN 模块的 MCU 有 28 个筛选器组，编号范围为 0～27 */
    uint32_t FilterBank;
    /* 筛选器模式，具有双 CAN 模块的 MCU 有 2 种模式：ID 掩码模式(CAN_FILTERMODE_IDMASK)或 ID 列表模式(CAN_FILTERMODE_IDLIST) */
    uint32_t FilterMode;
    /* 筛选器位宽，即 32 位(CAN_FILTERSCALE_32BIT)或 16 位(CAN_FILTERSCALE_16BIT) */
    uint32_t FilterScale;
    /* 筛选器使能，即是否启用此筛选器，ENABLE 或者 DISABLE */
    uint32_t FilterActivation;
    uint32_t SlaveStartFilterBank; //设置应用于从 CAN 控制器的筛选器组的起编号
} CAN_FilterTypeDef;
```
某些变量的取值具有相应的宏定义，例如，`FilterMode` 是筛选器模式，有两个宏定义可用于此变量的取值，宏定义如下：
```c
#define CAN_FILTERMODE_IDMASK    (0x00000000U)    //ID 掩码模式
#define CAN_FILTERMODE_IDLIST    (0x00000001U)    //ID 列表模式
```

筛选器的设置是 CAN 模块使用中比较复杂的环节，在后面示例里会用具体代码解释。

###  中断及其处理
####  中断和中断事件
一个 CAN 模块有 4 个中断，对应 4 个 ISR。例如，CAN1 的 4 个中断及其 ISR 如表 18-7 所示，下面都以 CAN1 为例说明。

| 中断名称 | 中断中文名称       | 说明                                       | ISR 名称                  |
| -------- | ------------------ | ------------------------------------------ | ------------------------- |
| CAN1_TX  | 发送中断           | 任何一个发送邮箱发送完成时产生的中断       | `CAN1_TX_IRQHandler()`    |
| CAN1_RX0 | FIFO0 接收中断     | FIFO0 接收消息、满或上溢时产生的中断       | `CAN1_RX0_IRQHandler()`   |
| CAN1_RX1 | FIFO1 接收中断     | FIFO1 接收消息、满或上溢时产生的中断       | `CAN1_RX1_IRQHandler()`   |
| CAN1_SCE | 状态改变和错误中断 | 状态改变或发生错误时产生的中断             | `CAN1_SCE_IRQHandler()`   |

每个中断又有 1 个或多个中断事件源，HAL 驱动程序中为每个中断事件源定义了中断类型宏定义，也就是中断事件使能控制位的宏定义。例如，CAN1_TX 只有一个中断事件源，为其定义中断事件类型的宏定义如下：
```c
#define CAN_IT_TX_MAILBOX_EMPTY    ((uint32_t)CAN_IER_TMEIE)
```

HAL 驱动程序中有两个宏函数可以开启或禁止某个具体的中断事件源。
```c
__HAL_CAN_ENABLE_IT(__HANDLE__, __INTERRUPT__)    //开启某个中断事件源
__HAL_CAN_DISABLE_IT(__HANDLE__, __INTERRUPT__)   //禁用某个中断事件源
```
其中，`__HANDLE__` 是 CAN 模块对象指针，`__INTERRUPT__` 是表示中断事件类型的宏，例如 `CAN_IT_TX_MAILBOX_EMPTY`。

在 CubeMX 为 CAN 模块的 4 个中断生成的 ISR 中，都调用了函数 `HAL_CAN_IRQHandler()`，这是 CAN 中断处理通用函数。函数 `HAL_CAN_IRQHandler()` 会根据中断使能寄存器、中断标志寄存器的内容判断具体发生了哪个中断事件，再调用相应的回调函数。CAN 的 HAL 驱动程序中为常用的中断事件定义了回调函数，只要搞清楚中断事件与回调函数的对应关系，编程时重新实现关联的回调函数，就可以对某个中断事件做出处理。

#### 发送中断的事件源和回调函数
发送中断（CAN1_TX）只有一个中断事件源 `CAN_IT_TX_MAILBOX_EMPTY`，在 3 个发送邮箱中任何一个发送完成时都产生该事件中断，但是 3 个邮箱有各自的回调函数，如表 18-8 所示。

| 中断事件类型宏               | 中断事件说明   | 回调函数                          |
| ---------------------------- | -------------- | --------------------------------- |
| `CAN_IT_TX_MAILBOX_EMPTY`    | 邮箱 0 发送完成 | `HAL_CAN_TxMailbox0CompleteCallback()` |
|                              | 邮箱 1 发送完成 | `HAL_CAN_TxMailbox1CompleteCallback()` |
|                              | 邮箱 2 发送完成 | `HAL_CAN_TxMailbox2CompleteCallback()` |

另外，调用函数 `HAL_CAN_AbortTxRequest()` 中止某个邮箱的发送后，也会调用相应的回调函数，如表 18-9 所示，只是这几个回调函数不是由中断引起的，而是由函数 `HAL_CAN_AbortTxRequest()` 引起的。

| 引起事件的函数               | 事件说明         | 回调函数                          |
| ---------------------------- | ---------------- | --------------------------------- |
| `HAL_CAN_AbortTxRequest()`   | 邮箱 0 发送被中止 | `HAL_CAN_TxMailbox0AbortCallback()` |
|                              | 邮箱 1 发送被中止 | `HAL_CAN_TxMailbox1AbortCallback()` |
|                              | 邮箱 2 发送被中止 | `HAL_CAN_TxMailbox2AbortCallback()` |

#### FIFO0 的中断事件源和回调函数
FIFO0 接收中断（CAN1_RX0）是在 FIFO0 接收消息、满或上溢时触发的中断。这个中断有 3 个中断事件源，对应的回调函数如表 18-10 所示。

| 中断事件类型宏                | 中断事件说明    | 回调函数                            |
| ----------------------------- | --------------- | ----------------------------------- |
| `CAN_IT_RX_FIFO0_MSG_PENDING` | FIFO0 接收新消息 | `HAL_CAN_RxFifo0MsgPendingCallback()` |
| `CAN_IT_RX_FIFO0_FULL`        | FIFO0 满        | `HAL_CAN_RxFifo0FullCallback()`      |
| `CAN_IT_RX_FIFO0_OVERRUN`     | FIFO0 发生上溢  | —                                   |

其中，接收新消息的中断事件是比较有用的，因为 CAN 模块接收消息一般是使用中断方式。

#### FIFO1 的中断事件源和回调函数
FIFO1 接收中断（CAN1_RX1）是在 FIFO1 接收消息、满或上溢时触发的中断。这个中断也有 3 个中断事件源，对应的回调函数如表 18-11 所示。

| 中断事件类型宏                | 中断事件说明    | 回调函数                            |
| ----------------------------- | --------------- | ----------------------------------- |
| `CAN_IT_RX_FIFO1_MSG_PENDING` | FIFO1 接收新消息 | `HAL_CAN_RxFifo1MsgPendingCallback()` |
| `CAN_IT_RX_FIFO1_FULL`        | FIFO1 满        | `HAL_CAN_RxFifo1FullCallback()`      |
| `CAN_IT_RX_FIFO1_OVERRUN`     | FIFO1 发生上溢  | —                                   |

####  状态改变或错误的中断事件源和回调函数
状态改变或错误中断（CAN1_SCE）在 CAN 模块发生状态改变或错误时触发，例如，CAN 模块进入睡眠状态或从睡眠状态被唤醒，或出现总线错误等。CAN1_SCE 的中断事件源和回调函数如表 18-12 所示。

| 中断事件宏定义               | 中断事件说明                                                                 | 回调函数                              |
| ---------------------------- | ---------------------------------------------------------------------------- | ------------------------------------- |
| `CAN_IT_SLEEP_ACK`           | CAN 模块进入睡眠状态                                                         | `HAL_CAN_SleepCallback()`             |
| `CAN_IT_WAKEUP`              | 监测到消息，被唤醒                                                           | `HAL_CAN_WakeUpFromRxMsgCallback()`   |
| `CAN_IT_ERROR`、`CAN_IT_BUSOFF` 等多种 | 有多种错误事件源，通过错误状态寄存器 CAN_ESR 的内容判断具体错误类型 | `HAL_CAN_ErrorCallback()`             |

### 示例1：轮询方式CAN通信
#### 示例功能和CubeMX项目设置
在本节中，我们将创建一个示例（Demo18_1_Poll），使用开发板上的CAN通信电路，测试轮询模式的CAN通信编程。示例功能和操作流程如下。
- 使用CAN测试模式中的回环模式，进行自发自收的测试。
- 设置筛选器组，只接收ID为奇数的消息。
- 使用轮询方式接收数据。

本示例使用LCD和按键，所以从CubeMX模板项目文件M4_LCD_KeyLED.ioc创建本示例的CubeMX文件Demo18_1_Poll，操作方法见附录A。

为便于计算CAN通信的波特率，重新配置PCLK1，设置HCLK为100MHz，PCLK1为25MHz，然后对CAN模块进行设置，设置界面如图18-10所示。CAN1的模式设置只需勾选Master Mode即可，这样将自动分配PA11和PA12作为CAN1的复用引脚，也是开发板电路实际使用的引脚。

CAN1的参数设置分为3个部分，这些参数在CAN模块初始化时会用到。

![image-20251116171625803](https://picgo-chaoxiaohan.oss-cn-qingdao.aliyuncs.com/img/image-20251116170249146.png)

（1）Bit Timing Parameters组，位时序参数。
位时序和波特率的原理在18.2节已经详细介绍，这里设置的参数如下。

- `Prescaler`，预分频系数，这里设置为5，可设置范围是1~1024。CAN1的时钟频率fCAN由PCLK1经过分频后得到，本示例在时钟树中设置PCLK1为25MHz，经过5分频后，fCAN=5MHz。
- `Time Quantum`，时间片。在设置预分频系数后，时间片会被自动计算。例如，本例中PCLK1为25MHz，预分频系数为5，fCAN=5MHz，则时间片tq=1/(5×10⁶)s=200ns。
- `Time Quanta in Bit Segment 1`，位段1的时间片个数为m，范围为1~16，这里设置为4。
- `Time Quanta in Bit Segment 2`，位段2的时间片个数为n，范围为1~8，这里设置为3。
- `Resynchronization Jump Width（SJW）`，再同步跳转宽度，设置范围为1~4，这里设置为1。

CAN通信的波特率由同步段、BS1、BS2的时间片数决定（见图18-3），波特率计算公式如下：
$$\text{Baudrate}=\frac{1}{(1+m+n)\times t_q}=\frac{1}{8\times 200\text{ns}}=625\text{kbits/s}$$

注意，STM32F407的CAN控制器在闭环CAN网络中波特率范围是125kbit/s~1Mbit/s，如果计算的实际波特率不在这个范围内，则需要调整分频数或位段的时间片个数。

（2）Basic Parameters组，基本参数。图18-10中的基本参数与CAN主控制寄存器CAN_MCR中的一些位对应，对CAN模块的一些特性进行设置。
- `Time Triggered Communication Mode（TTCM位）`，时间触发通信模式。设置为Disable表示禁止时间触发通信模式，若启用TTCM，则在发送或接收消息时，会加上一个内部计数器的计数值。
- `Automatic Bus-Off Management（ABOM位）`，自动的总线关闭管理。设置为Disable表示不使用自动的总线关闭管理。
- `Automatic Wake-Up Mode（AWUM位）`，自动唤醒模式。这个参数用于控制CAN模块在睡眠模式下接收消息时的行为，如果设置为Enable，则表示只要接收消息，就通过硬件自动退出睡眠模式。
- `Automatic Retransmission（NART位）`，自动重发。若设置为Enable，CAN模块将自动重发消息帧，直到发送成功为止。若设置为Disable，则无论发送结果如何，消息只发送一次。这个设置其实是对NART位的取反，因为NART表示禁止自动重发。
- `Receive FIFO Locked Mode（RFLM位）`，接收FIFO锁定模式。若设置为Disable，表示FIFO上溢不锁定，下一条新消息覆盖前一条消息。若设置为Enable，则表示上溢后锁定，丢弃下一条新消息。
- `Transmit FIFO Priority（TXFP位）`，发送FIFO优先级。若设置为Disable，表示消息优先级由标识符决定；若设置为Enable，表示优先级由请求顺序决定。

（3）Advanced Parameters组，高级参数。
- `Operating Mode`，用于设置CAN模块的工作模式，有4种工作模式可选，即正常（Normal）、静默（Silent）、回环（Loopback）、回环静默（Loopback combined with Silent）。其中，后3种是CAN模块的测试模式（见图18-7）。这里设置为Loopback，使用其自发自收功能进行CAN收发功能的测试。

本示例中使用轮询方式测试CAN模块的数据发送和接收功能，所以不开启CAN1的任何中断。

#### 程序功能实现
##### 主程序
在CubeMX中完成设置后生成代码，我们在CubeIDE中打开项目，先将PublicDrivers目录下的文件MFX_LCD和KEY_LED添加到项目的搜索路径（操作方法见附录A）。在主程序中添加用户代码，完成后的文件main.c的代码如下：
```c
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "can.h"
#include "gpio.h"
/* USER CODE BEGIN Includes */
#include "keyled.h"
#include "tftlcd.h"
/* USER CODE END Includes */

/* USER CODE BEGIN 1 */
int main(void)
{
    HAL_Init();
    SystemClock_Config();
    /* Initialize all configured peripherals */
    MX_GPIO_Init();
    MX_FSMC_Init();
    MX_CAN1_Init();        //CAN1初始化
    /* USER CODE BEGIN 2 */
    TFTLCD_Init();
    LCD_ShowStr(10,10, (uint8_t *)"Demo18-1:CAN Polling");
    LCD_ShowStr(10,LCD_CurY+LCD_SP15, (uint8_t *)"Test mode:Loopback");

    CAN_SetFilters(); //设置筛选器组，设置成只接收ID为奇数的消息
    if (HAL_CAN_Start(&hcan1) != HAL_OK) {
        LCD_ShowStr(10,LCD_CurY+LCD_SP10, (uint8_t *)"CAN is started");
    }

    LCD_ShowStr(10,LCD_CurY+LCD_SP15, (uint8_t *)"[1]KeyUp = Send a Data Frame");
    LCD_ShowStr(10,LCD_CurY+LCD_SP15, (uint8_t *)"[2]KeyDown = Send a Remote Frame");
    LCD_ShowInt(10,LCD_CurY+LCD_SP15, (uint32_t)1); //信息显示起始行
    LCD_Clear_Line(LCD_InfoStartPosY, LCD_LCDBACK_COLOR); //清除信息显示区域

    /* USER CODE BEGIN WHILE */
    uint8_t msgID=1;
    while (1)
    {
        KEYS curKey=ScanPressedKey(KEY_WAIT_ALWAYS);
        LCD_Clear_Line(LCD_InfoStartPosY, LCD_LCDBACK_COLOR); //清除信息显示区域

        if (curKey==KEY_UP)
            CAN_TestPoll(msgID++,CAN_RTR_DATA);    //发送数据帧
        else if (curKey==KEY_DOWN)
            CAN_TestPoll(msgID++,CAN_RTR_REMOTE); //发送遥控帧

        LCD_ShowStr(10,LCD_CurY+LCD_SP20, (uint8_t *)"* Press Reset menu or reset *");
        HAL_Delay(300); //延时，消除按键抖动影响
        /* USER CODE END WHILE */
    }
}
```

`MX_CAN1_Init()`是CAN1模块的初始化函数，是CubeMX自动生成的，在文件can.h中定义。

在完成CAN1的初始化后，调用了一个函数`CAN_SetFilters()`设置CAN1模块的筛选器组，这是个自定义函数，在文件can.c里实现。然后调用函数`HAL_CAN_Start()`启动CAN1模块。

在进入while循环之前，显示菜单提示信息，即
- [1]KeyUp = Send a Data Frame
- [2]KeyDown = Send a Remote Frame

在while()循环中，检测按键输入，当KeyUp键被按下时，调用函数`CAN_TestPoll()`测试发送数据帧，当KeyDown键被按下时，调用函数`CAN_TestPoll()`测试发送遥控帧。函数`CAN_TestPoll()`是在文件can.c中实现的自定义函数。

##### CAN1模块初始化
CubeMX为can.c模块生成初始化函数`MX_CAN1_Init()`，文件can.c中的实现代码如下：
```c
/* Includes ------------------------------------------------------------------*/
#include "can.h"
CAN_HandleTypeDef hcan1;    //CAN1模块的外设对象变量

/* CAN1初始化函数 */
void MX_CAN1_Init(void)
{
    hcan1.Instance = CAN1;                  //CAN1的寄存器基址
    hcan1.Init.Prescaler = 5;               //预分频系数
    hcan1.Init.Mode = CAN_MODE_LOOPBACK;    //回环模式
    hcan1.Init.SyncJumpWidth = CAN_SJW_1TQ; //SJW长度：1个tq
    hcan1.Init.TimeSeg1 = CAN_BS1_4TQ;      //BS1长度：4个tq
    hcan1.Init.TimeSeg2 = CAN_BS2_3TQ;      //BS2长度：3个tq
    hcan1.Init.TimeTriggeredMode = DISABLE; //TTCM禁用
    hcan1.Init.AutoBusOff = DISABLE;        //ABOM禁用
    hcan1.Init.AutoRetransmission = ENABLE; //NART开启，可自动重发
    hcan1.Init.ReceiveFifoLocked = DISABLE; //RFLM禁用
    hcan1.Init.TransmitFifoPriority = DISABLE; //TXFP禁用
    if (HAL_CAN_Init(&hcan1) != HAL_OK) {   //CAN1初始化
        Error_Handler();
    }
}

/* MSP初始化函数，在HAL_CAN_Init()中被调用 */
void HAL_CAN_MspInit(CAN_HandleTypeDef* canHandle)
{
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    if(canHandle->Instance==CAN1)
    {
        __HAL_RCC_CAN1_CLK_ENABLE();       //开启CAN1的时钟
        __HAL_RCC_GPIOA_CLK_ENABLE();      //开启GPIOA时钟

        /* CAN1 GPIO配置 PA11 --> CAN1_RX; PA12 --> CAN1_TX */
        GPIO_InitStruct.Pin = GPIO_PIN_11|GPIO_PIN_12;
        GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
        GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_VERY_HIGH;
        GPIO_InitStruct.Alternate = GPIO_AF9_CAN1;
        HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);
    }
}
```

在文件can.c中有一个`CAN_HandleTypeDef`类型的变量`hcan1`，这是表示CAN1模块的外设对象变量。

函数`MX_CAN1_Init()`中对变量`hcan1`的各成员变量赋值。成员变量`hcan1.Init`是结构体类型`CAN_InitTypeDef`，用于设置CAN通信的各种参数。各变量的意义见程序中的注释，赋值代码与CubeMX中的参数设置是对应的，各参数的意义见CubeMX图形化设置时的解释。

MSP初始化函数`HAL_CAN_MspInit()`在函数`HAL_CAN_Init()`中被调用，其功能是开启CAN1的时钟，以及配置CAN1的GPIO复用引脚。

##### CAN1模块的筛选器设置
在文件can.c中有两个自定义函数，其中函数`CAN_SetFilters()`用于筛选器设置。文件can.c中函数`CAN_SetFilters()`的实现代码（代码在沙箱内）如下：
```c
/* USER CODE BEGIN 1 */
HAL_StatusTypeDef CAN_SetFilters(void)
{
    CAN_FilterTypeDef canFilter;    //筛选器结构体变量
    canFilter.FilterBank = 0;       //筛选器组编号
    canFilter.FilterMode = CAN_FILTERMODE_IDMASK; //ID掩码模式
    canFilter.FilterScale = CAN_FILTERSCALE_16BIT; //16位模式
    //设置1：接收ID为奇数的4个16位ID
    canFilter.FilterIdHigh = 0x0001;    //CAN_FxR1的高16位
    canFilter.FilterIdLow = 0x0000;     //CAN_FxR1的低16位
    canFilter.FilterMaskIdHigh = 0x0001; //CAN_FxR2的高16位，所有位任意
    canFilter.FilterMaskIdLow = 0x0000;  //CAN_FxR2的低16位
    //设置2：只接收Filter为数据帧
    canFilter.FilterIdHigh = 0x0002;     //CAN_FxR1的高16位
    canFilter.FilterIdLow = 0x0000;      //CAN_FxR1的低16位
    canFilter.FilterMaskIdHigh = 0x0002; //CAN_FxR2的高16位
    canFilter.FilterMaskIdLow = 0x0000;  //CAN_FxR2的低16位
    canFilter.FilterFIFOAssignment = CAN_RX_FIFO0; //用于FIFO0
    canFilter.SlaveStartFilterBank = 14; //使用CAN控制器筛选器起始Bank
    canFilter.FilterActivation = ENABLE; //使能筛选器
    return HAL_CAN_ConfigFilter(&hcan1, &canFilter);
}
/* USER CODE END 1 */
```

上述程序定义了一个`CAN_FilterTypeDef`结构体类型的变量`canFilter`，对其各成员变量赋值后调用函数`HAL_CAN_ConfigFilter()`进行CAN控制器的筛选器设置。

结合函数参数的意义以及18.2.6节的介绍，读者可以理解程序的功能。`CAN_FilterTypeDef`结构体各成员变量的意义描述如下。
- `uint32_t FilterBank`，筛选器组编号，共有28个筛选器组，其取值范围为0~27。
- `uint32_t FilterMode`，筛选器模式，即掩码模式或列表模式，其取值为如下两个宏定义：
  ```c
  #define CAN_FILTERMODE_IDMASK    (0x00000000U) //ID掩码模式
  #define CAN_FILTERMODE_IDLIST    (0x00000001U) //ID列表模式
  ```
- `uint32_t FilterScale`，筛选器长度，即32位或16位，其取值为如下两个宏定义常量：
  ```c
  #define CAN_FILTERSCALE_16BIT    (0x00000000U) //2个16位长度筛选器
  #define CAN_FILTERSCALE_32BIT    (0x00000001U) //1个32位长度筛选器
  ```
- `uint32_t FilterIdHigh`和`uint32_t FilterIdLow`，都是`uint32`类型，是寄存器`CAN_FxR1`的高16位和低16位。在32位掩码模式下，它们合起来表示一个32位ID。
- `uint32_t FilterMaskIdHigh`和`uint32_t FilterMaskIdLow`，都是`uint32`类型，是寄存器`CAN_FxR2`的高16位和低16位。在32位掩码模式下，它们合起来表示一个32位掩码。

本示例的代码中设置为16位掩码模式，若使CAN1只能接收2位消息，将这4个16位寄存器全部设置为0x0000即可。本示例的程序中设置CAN1只能接收StdID为奇数的4个16位寄存器`FilterIdHigh`为0x0002，`FilterMaskIdHigh`为0x0002，具体的设置原理可参见表18-6。

- `uint32_t FilterFIFOAssignment`，筛选器应用于哪个FIFO。一个CAN控制器有两个用于接收消息的FIFO，其取值为如下的两个宏定义常量：
  ```c
  #define CAN_RX_FIFO0    (0x00000000U) // FIFO0
  #define CAN_RX_FIFO1    (0x00000001U) // FIFO1
  ```
- `uint32_t FilterActivation`，是否启用此筛选器。
- `uint32_t SlaveStartFilterBank`，设置应用于从CAN控制器的筛选器的起始编号。在STM32F4中，14~27号筛选器组都应用于CAN2。若设置`SlaveStartFilterBank`为14，则表示14~27号筛选器组都应用于CAN2。

当筛选器的各成员变量赋值后，执行`HAL_CAN_ConfigFilter(&hcan1, &canFilter)`为CAN1控制器设置一个筛选器组。用户可以为一个FIFO设置多个筛选器，但是一个筛选器只能配置给一个FIFO。

#####  轮询方式的数据发送与接收
函数`CAN_TestPoll()`用于测试CAN1模块在轮询方式下的数据发送和接收，文件can.c中这个函数的实现代码（代码在沙箱内）如下：
```c
//测试轮询方式发送和接收消息，参数msgID是消息ID，frameType是帧类型：数据帧或遥控帧
void CAN_TestPoll(uint8_t msgID, uint32_t frameType)
{
    uint8_t TxData[8]={0};    //发送数据，最多8字节
    TxData[0]=msgID;
    TxData[1]=msgID;
    CAN_TxHeaderTypeDef TxHeader; //发送消息的结构体变量
    TxHeader.StdId = msgID;       //标准ID
    TxHeader.RTR = frameType;     //数据帧或遥控帧，CAN_RTR_DATA或CAN_RTR_REMOTE
    TxHeader.IDE = CAN_ID_STD;    //标准帧或扩展格式
    TxHeader.DLC = 2;             //数据字节数
    TxHeader.TransmitGlobalTime = DISABLE; //禁用时间戳

    while(HAL_CAN_GetTxMailboxesFreeLevel(&hcan1) < 1) {
        //等待有可用的发送邮箱
    }
    uint32_t TxMailbox;           //临时变量，用于返回实际使用的邮箱号
    if (HAL_CAN_AddTxMessage(&hcan1, &TxHeader, TxData, &TxMailbox) != HAL_OK)
    { //将消息发送到邮箱
        LCD_ShowStr(10, LCD_CurY, (uint8_t *)"Send to mailbox error");
        return;
    }
    LCD_ShowStr(10, LCD_CurY, (uint8_t *)"Send Msg ID = ");
    LCD_ShowUint(10, LCD_CurY, LCD_CurY, TxHeader.StdId);
    while(HAL_CAN_GetRxFifoFillLevel(&hcan1, CAN_RX_FIFO0) == 0) {
        //等待CAN收到消息（最多等待3秒）
        if(HAL_GetTick()-startTick > 3000) break;
    }

    //2. 接收消息
    uint8_t RxData[8]={0};        //接收数据
    CAN_RxHeaderTypeDef RxHeader; //接收消息的结构体变量
    if (HAL_CAN_GetRxMessage(&hcan1, CAN_RX_FIFO0, &RxHeader, RxData) != HAL_OK)
    {
        LCD_ShowStr(10, LCD_CurY+LCD_SP15, (uint8_t *)"Message is not received");
        return;
    }
    LCD_ShowStr(10, LCD_CurY+LCD_SP15, (uint8_t *)"Message is received");
    if (HAL_CAN_GetRxMessage(&hcan1, CAN_RX_FIFO0, &RxHeader, RxData) == HAL_OK)
    {
        LCD_ShowStr(10, LCD_CurY, LCD_CurY, (uint8_t *)"StdID = ");
        LCD_ShowUint(10, LCD_CurY, LCD_CurY, RxHeader.StdId);
        LCD_ShowStr(10, LCD_CurY, LCD_CurY, (uint8_t *)"RTR(0=Data,2=Remote) = ");
        LCD_ShowUint(10, LCD_CurY, LCD_CurY, RxHeader.RTR);
        LCD_ShowStr(10, LCD_CurY, LCD_CurY, (uint8_t *)"IDE(0=Std,1=Ext) = ");
        LCD_ShowUint(10, LCD_CurY, LCD_CurY, RxHeader.IDE);
        LCD_ShowStr(10, LCD_CurY, LCD_CurY, (uint8_t *)"DLC(Data length) = ");
        LCD_ShowUint(10, LCD_CurY, LCD_CurY, RxHeader.DLC);

        if (RxHeader.RTR == CAN_RTR_DATA) { //数据帧，显示数据内容，遥控帧没有数据
            LCD_ShowStr(10, LCD_CurY+LCD_SP15, (uint8_t *)"Data[0] = ");
            LCD_ShowUint(10, LCD_CurY+LCD_SP15, RxData[0]);
            LCD_ShowStr(10, LCD_CurY+LCD_SP15, (uint8_t *)"Data[1] = ");
            LCD_ShowUint(10, LCD_CurY+LCD_SP15, RxData[1]);
        }
    }
}
```

这个函数的代码分为发送消息和接收消息两个部分。
（1）发送消息。一个CAN控制器有3个发送邮箱，发送消息就是将数据封装为消息后写入发送邮箱，然后由CAN控制器自动将消息发送到CAN总线上。如果设置了自动重发功能，CAN控制器在CAN发送失败（如总线仲裁失败）后将自动重发，直到消息发送成功。

函数`HAL_CAN_GetTxMailboxesFreeLevel()`用于查询一个CAN控制器空闲的发送邮箱个数，如果有空闲的发送邮箱，就可以使用函数`HAL_CAN_AddTxMessage()`向发送邮箱写入一条消息。程序中调用这个函数的语句如下：
```c
if (HAL_CAN_AddTxMessage(&hcan1, &TxHeader, TxData, &TxMailbox) != HAL_OK)
```
其中，`TxHeader`是一个`CAN_TxHeaderTypeDef`结构体类型变量，用于定义消息的一些参数；`TxData`是发送数据的缓冲区数组，最多8字节的数据；`TxMailbox`用于返回实际使用的发送邮箱编号。

结构体`CAN_TxHeaderTypeDef`的完整定义参见18.2.4节，结合18.2.4节的解释和这里的代码，读者可以理解`CAN_TxHeaderTypeDef`各成员变量的意义。

函数`CAN_TestPoll()`根据传入的参数`frameType`的不同，可以发送数据帧或遥控帧。数据帧调用8字节的数据，遥控帧没有数据。

调用函数`HAL_CAN_AddTxMessage()`将消息写入发送邮箱后，消息何时发送出去就是CAN模块硬件的事了。上述程序中使用轮询方式查询邮箱里的消息是否发送出去了，即调用函数`HAL_CAN_GetTxMailboxesFreeLevel()`查询空闲邮箱个数，当空闲邮箱个数复为3时，就表示CAN成功发送了消息。

（2）接收消息。因为本示例设置CAN1工作于回环模式，所以CAN1发送的消息如果通过了筛选器会被自己接收。本示例的CAN1只用于接收StdID为奇数的消息，所以当消息ID为奇数时，就可以通过一个FIFO接收的消息总数。如果有消息，就调用函数`HAL_CAN_GetRxMessage()`读取消息的内容。程序中执行的语句如下：
```c
if (HAL_CAN_GetRxMessage(&hcan1, CAN_RX_FIFO0, &RxHeader, RxData) == HAL_OK)
```
其中，`RxHeader`是`CAN_RxHeaderTypeDef`结构体类型变量，用于存储接收数据帧的类型，最多8字节。

结构体`CAN_RxHeaderTypeDef`存储了CAN帧的参数，其定义参见18.2.5节。结合其定义和这里的代码，读者很容易理解`CAN_RxHeaderTypeDef`各成员变量的作用。

##### 运行与测试
按一下KeyUp键会发送一个数据帧，按一次KeyDown键会发送一个遥控帧，变量`msgID`加一，变量`msgID`作为消息的标识符ID。因为FIFO0的筛选器设置为只接收标识符ID为奇数的消息，所以只有`msgID`为奇数时CubeMX文件Demo18_1_Poll才会显示接收到的消息。

###  示例2：中断方式CAN通信
#### 示例功能和CubeMX项目设置
在实际的CAN通信中，使用轮询方式发送消息，使用中断方式接收消息更加实用和普遍。本节再设计一个CAN通信示例（Demo18_2Intrrupt），使用中断方式接收消息，并且测试在两个FIFO上使用不同的筛选器。示例的功能和使用流程如下。
- 使用CAN1的回环模式自发自收。
- 开启FIFO0的接收中断，开启FIFO1的接收中断。
- 为FIFO0设置筛选器，只接收标识符ID为奇数的消息；为FIFO1设置筛选器，接收所有消息。
- 使用随机数生成器（Random Number Generator，RNG），在发送消息时，用随机数作为帧的数据。

我们仍以项目文件Demo18_1Poll为基础进行修改，操作方法见附录D。在CubeMX中打开文件Demo18_2Intrrupt.ioc，在原来的基础上进行一些修改。

CAN1模块的参数生成代码与示例1的代码相同，只需要开启CAN1的RX0和RX1中断即可。CubeMX生成的配置程序代码如下：
```c
/* 文件：main.c */
#include "main.h"
#include "keyled.h"
/* USER CODE END Includes */

int main(void)
{
    HAL_Init();
    SystemClock_Config();
    /* Initialize all configured peripherals */
    MX_GPIO_Init();
    MX_FSMC_Init();
    MX_RNG_Init();
    MX_CAN1_Init();
    TFTLCD_Init();
    LCD_ShowStr(10,10, (uint8_t *)"Demo18-2:CAN Interrupt");

    if (curKey==KEY_UP)
        CAN_SendMsg(msgID++, CAN_RTR_DATA);    //发送数据帧
    HAL_Delay(500);                           //延时，消除按键抖动影响
    /* USER CODE END WHILE */
}
```

在外设初始化部分，函数`MX_RNG_Init()`用于RNG的初始化，函数`MX_CAN1_Init()`用于CAN1模块的初始化。

函数`CAN_SetFilters()`用于设置FIFO0和FIFO1的筛选器组，与前一示例的同名函数代码不同。

要使用中断方式进行消息接收，还需要开启FIFO0和FIFO1的接收新消息的中断事件，即
```c
__HAL_CAN_ENABLE_IT(&hcan1, CAN_IT_RX_FIFO0_MSG_PENDING);
__HAL_CAN_ENABLE_IT(&hcan1, CAN_IT_RX_FIFO1_MSG_PENDING);
```
其中的两个宏定义是FIFO0和FIFO1接收新消息的中断事件使能控制位的宏定义，也作为中断事件类型宏定义，如表18-10和表18-11所示。

主程序的while()循环中调用自定义函数`CAN_SendMsg()`以轮询方式发送一个数据帧，接收数据帧在中断里处理。

####  CAN1初始化
```c
hcan1.Init.TransmitFifoPriority = DISABLE;
if (HAL_CAN_Init(&hcan1) != HAL_OK)
    Error_Handler();

/* CAN模块的MSP初始化函数，在HAL_CAN_Init()函数中被调用 */
void HAL_CAN_MspInit(CAN_HandleTypeDef* canHandle)
{
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    __HAL_RCC_CAN1_CLK_ENABLE();    /* CAN1时钟使能 */
    __HAL_RCC_GPIOA_CLK_ENABLE();
    /* CAN1 GPIO配置 PA11---> CAN1_RX, PA12---> CAN1_TX */
    GPIO_InitStruct.Pin = GPIO_PIN_11|GPIO_PIN_12;
    GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
    GPIO_InitStruct.Pull = GPIO_NOPULL;
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_VERY_HIGH;
    GPIO_InitStruct.Alternate = GPIO_AF9_CAN1;
    HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

    HAL_NVIC_SetPriority(CAN1_RX0_IRQn, 1, 0);
    HAL_NVIC_EnableIRQ(CAN1_RX0_IRQn);
    HAL_NVIC_SetPriority(CAN1_RX1_IRQn, 1, 0);
    HAL_NVIC_EnableIRQ(CAN1_RX1_IRQn);
}
```

本示例中CAN1的参数设置与示例Demo18_1Poll完全相同，只是开启了CAN1 RX0和CAN1 RX1中断。函数`MX_CAN1_Init()`的代码与前一示例完全相同，函数`HAL_CAN_MspInit()`中增加了两个中断的初始化设置。

#### RNG初始化和随机数产生
RNG是处理器的一个内部单元，其初始化很简单，就是定义了RNG模块的外设对象变量，开启其时钟。相关代码如下：
```c
#include "rng.h"
RNG_HandleTypeDef hrng;    //RNG模块的外设对象变量

/* RNG初始化函数 */
void MX_RNG_Init(void)
{
    hrng.Instance = RNG;
    if (HAL_RNG_Init(&hrng) != HAL_OK)
        Error_Handler();
}

/* RNG的MSP初始化函数，在HAL_RNG_Init()中被调用 */
void HAL_RNG_MspInit(RNG_HandleTypeDef* rngHandle)
{
    // 开启RNG时钟等初始化操作
}
```

可以使用轮询方式或中断方式产生32位的随机数，分别对应两个函数。
- `HAL_RNG_GenerateRandomNumber()`，轮询方式产生随机数。
- `HAL_RNG_GetRandomNumber_IT()`，中断方式产生随机数。

```c
HAL_StatusTypeDef CAN_SetFilters()
{
    CAN_FilterTypeDef canFilter;
    //1. 设置FIFO0的筛选器
    canFilter.FilterBank = 0;                  //筛选器组编号
    canFilter.FilterMode = CAN_FILTERMODE_IDMASK; //ID掩码模式
    canFilter.FilterScale = CAN_FILTERSCALE_32BIT; //32位长度
    //只接收stdID为奇数的帧
    canFilter.FilterIdHigh = 0x0002;           //CAN_FxR1寄存器的高16位
    canFilter.FilterIdLow = 0x0000;            //CAN_FxR1寄存器的低16位
    canFilter.FilterMaskIdHigh = 0x0002;       //CAN_FxR2寄存器的高16位
    canFilter.FilterMaskIdLow = 0x0000;        //CAN_FxR2寄存器的低16位

    canFilter.FilterFIFOAssignment = CAN_RX_FIFO0; //应用于FIFO0
    canFilter.FilterActivation = ENABLE;       //使用筛选器
    canFilter.SlaveStartFilterBank = 14;       //CAN1控制器筛选器起始的Bank
    HAL_StatusTypeDef result=HAL_CAN_ConfigFilter(&hcan1, &canFilter);

    //2. 设置FIFO1的筛选器
    canFilter.FilterBank = 1;                  //筛选器组编号
    //接收所有帧
    canFilter.FilterIdHigh = 0x0000;           //CAN_FxR1寄存器的高16位
    canFilter.FilterIdLow = 0x0000;            //CAN_FxR1寄存器的低16位
    canFilter.FilterMaskIdHigh = 0x0000;       //CAN_FxR2寄存器的高16位，所有位任意
    canFilter.FilterMaskIdLow = 0x0000;        //CAN_FxR2寄存器的低16位，所有位任意
    canFilter.FilterFIFOAssignment = CAN_RX_FIFO1; //应用于FIFO1
    result=HAL_CAN_ConfigFilter(&hcan1, &canFilter);
    return result;
}
/* USER CODE END 1 */
```

这个函数为FIFO0设置的筛选器是只接收标识符ID为奇数的消息，为FIFO1设置的筛选器是可以接收任何消息。注意，可以为一个FIFO设置多个筛选器，但是一个筛选器只能用于一个FIFO，所以，这两个筛选器的`FilterBank`必须不同。结构体`CAN_FilterTypeDef`各成员变量的意义以及筛选器的设置原理见前面相关内容，在此不再赘述。

```c
//发送消息
TxHeader.StdId = msgID;            //StdID
TxHeader.RTR = frameType;          //数据帧，CAN_RTR_DATA
TxHeader.IDE = CAN_ID_STD;         //标准格式
TxHeader.DLC = 4;                  //数据长度
TxHeader.TransmitGlobalTime = DISABLE;

while(HAL_CAN_GetTxMailboxesFreeLevel(&hcan1) < 1) {
    //等待有可用的发送邮箱
}
LCD_ShowStr(10, LCD_CurY, (uint8_t *)"Send MsgID = ");
LCD_ShowUint(10, LCD_CurY, LCD_CurY, msgID);

uint32_t TxMailbox;                //临时变量，用于返回使用的邮箱编号
/* 发送到邮箱，由CAN模块负责发送到CAN总线上 */
if (HAL_CAN_AddTxMessage(&hcan1, &TxHeader, TxData, &TxMailbox) != HAL_OK)
    LCD_ShowStr(10, LCD_CurY+LCD_SP10, (uint8_t *)"Send to mailbox error");
/* USER CODE END 1 */
```

由于开启了CAN1的RX0中断和RX1中断，在文件stm32f4xx_it.c中自动生成了这两个中断的ISR框架。代码如下：
```c
/* 文件：stm32f4xx_it.c */
void CAN1_RX0_IRQHandler(void)
{
    HAL_CAN_IRQHandler(&hcan1);
}

void CAN1_RX1_IRQHandler(void)
{
    HAL_CAN_IRQHandler(&hcan1);
}
```

我们在18.2.7节分析过CAN的中断事件和回调函数。CAN1 RX0是FIFO0接收消息、满或上溢时产生的中断，接收消息中断事件对应的回调函数是`HAL_CAN_RxFifo0MsgPendingCallback()`。同样的，FIFO1接收消息中断事件对应的回调函数是`HAL_CAN_RxFifo1MsgPendingCallback()`。CAN1_RX0和CAN1_RX1中断事件与回调函数的对应关系如表18-10和表18-11所示。

所以，要使用中断方式处理FIFO0和FIFO1接收的消息，只需重新实现这两个回调函数即可。在文件can.c中重新实现这两个回调函数，相关代码（代码写在沙箱段内）如下：
```c
/* USER CODE BEGIN 1 */
//读取和显示FIFO0或FIFO1的消息
//参数Fifo_num是FIFO编号，CAN_RX_FIFO0或CAN_RX_FIFO1
void CAN_ReadMsg(uint32_t Fifo_num)
{
    CAN_RxHeaderTypeDef RxHeader;  //接收消息结构体
    uint8_t RxData[8] = {0};       //接收数据缓冲区，最多8字节

    if (Fifo_num==CAN_RX_FIFO0)
    {
        LCD_ShowStr(10, LCD_CurY+LCD_SP15, (uint8_t *)"Msg received by FIFO0");
        if (HAL_CAN_GetRxMessage(&hcan1, CAN_RX_FIFO0, &RxHeader, RxData) != HAL_OK)
        {
            LCD_ShowStr(10, LCD_CurY+LCD_SP10, (uint8_t *)"Read FIFO0 error");
            return;
        }
    }
    else
    {
        LCD_ShowStr(10, LCD_CurY+LCD_SP15, (uint8_t *)"Msg received by FIFO1");
        if (HAL_CAN_GetRxMessage(&hcan1, CAN_RX_FIFO1, &RxHeader, RxData) != HAL_OK)
        {
            LCD_ShowStr(10, LCD_CurY+LCD_SP10, (uint8_t *)"Read FIFO1 error");
            return;
        }
    }

    //显示读取的消息
    LCD_ShowStr(30, LCD_CurY, LCD_CurY, (uint8_t *)"StdID = ");
    LCD_ShowUint(30, LCD_CurY, LCD_CurY, RxHeader.StdId);
    LCD_ShowStr(30, LCD_CurY, LCD_CurY, (uint8_t *)"RTR(0=Data,2=Remote) = ");
    LCD_ShowUint(30, LCD_CurY, LCD_CurY, RxHeader.RTR);
    LCD_ShowStr(30, LCD_CurY, LCD_CurY, (uint8_t *)"IDE(0=Std,1=Ext) = ");
    LCD_ShowUint(30, LCD_CurY, LCD_CurY, RxHeader.IDE);
    LCD_ShowStr(30, LCD_CurY, LCD_CurY, (uint8_t *)"FilterMatchIndex = ");
    LCD_ShowUint(30, LCD_CurY, LCD_CurY, RxHeader.FilterMatchIndex);
    LCD_ShowStr(30, LCD_CurY, LCD_CurY, (uint8_t *)"DLC(Data length) = ");
    LCD_ShowUint(30, LCD_CurY, LCD_CurY, RxHeader.DLC);
    LCD_ShowStr(30, LCD_CurY, LCD_CurY, (uint8_t *)"Data = ");
    uint16_t xpos=10;
    for (int i=0; i<RxHeader.DLC; i++)
    {
        LCD_ShowHexNum(xpos, LCD_CurY, RxData[i], 2);
        xpos += 25;
    }
    LCD_ShowStr(10, LCD_CurY+LCD_SP20, (uint8_t *)"* Reselect menu or reset *");
}

//FIFO0接收新消息事件中断回调函数
void HAL_CAN_RxFifo0MsgPendingCallback(CAN_HandleTypeDef *hcan)
{
    CAN_ReadMsg(CAN_RX_FIFO0);
}

//FIFO1接收新消息事件中断回调函数
void HAL_CAN_RxFifo1MsgPendingCallback(CAN_HandleTypeDef *hcan)
{
    CAN_ReadMsg(CAN_RX_FIFO1);
}
/* USER CODE END 1 */
```

两个回调函数都调用了同一个函数`CAN_ReadMsg()`，只是传递了相应的FIFO编号。

函数`CAN_ReadMsg()`负责读取FIFO0或FIFO1的消息并显示。读取FIFO里面收到的消息仍然使用函数`HAL_CAN_GetRxMessage()`，消息头结构体`CAN_RxHeaderTypeDef`的意义见18.2.5节的解释。这里显示了一个成员变量`FilterMatchIndex`的值，这是接收消息的FIFO内接收了消息的筛选器的序号，是在一个FIFO内的筛选器的序号，而不是筛选器的`FilterBank`属性值。

#### 运行与测试
构建项目无误后，我们将其下载到开发板上并予以测试。每次按下KeyUp键可以发送一个标准格式数据帧，`msgID`加1，`msgID`作为数据帧的标识符ID。

运行时会发现，`msgID`为奇数时，是由FIFO0接收消息，`msgID`为偶数时，是由FIFO1接收消息。因为在设置筛选器组时，设置FIFO0只能接收标识符ID为奇数的消息，FIFO1可以接收任意标识符ID的消息。当标识符ID为偶数时，只能由FIFO1接收，当标识符ID为奇数时，两个FIFO都可以接收，但是FIFO0优先接收。

如果FIFO0和FIFO1接收的消息，显示的`FilterMatchIndex`的值都是0，因为它们都只有一个筛选器。