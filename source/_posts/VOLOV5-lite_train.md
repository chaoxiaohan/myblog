---
title: 使用YOLOV5-Lite训练模型
date: 2025-09-27 00:00:00
type: paper
photos: 
tags:
  - YOLOV5
  - OpenCV
  - Pytorch
excerpt: 这是摘要

---

# 在Windows上使用yolov5-lite部署和训练

## 一、克隆YOLOV5-lite仓库

```
git clone https://github.com/ppogg/YOLOv5-Lite.git
```

克隆后使用IDE打开该文件夹

输入

```
pip install -r requirements.txt
```

安装依赖文件

## 二、下载权重文件

```
git clone https://gitcode.com/open-source-toolkit/8fb60.git
```

v5lite_s,复制到yolov5的weights文件夹

## 三、准备训练集

使用labelimg进行训练集标注

labelimg已打包好的程序

```
通过网盘分享的文件：windows_v1.8.1.zip
链接: https://pan.baidu.com/s/1L4oobKRK2EWzRD9e9SW8MQ?pwd=75kf 提取码: 75kf
```

在yolov5-lite文件夹里创建一个新的文件夹，名为xunlianji

文件结构如下图

```
xunlianji
	--train
		--images
		--label
	--valid
		--images
		--label
	--text
		--images
		--label
```

## 四、准备配置文件



准备model文件

复制data文件夹里的`coco128.yaml`到xunlianji里，修改名称`xunlianji_model.yaml`

修改文件内的nc

> nc的值为你的标签数量

复制data文件夹里的`v5Lite-s.yaml`到xunlianji里，修改名称`xunlianji_parameter.yaml`

修改文件里的内容

```yaml
# COCO 2017 dataset http://cocodataset.org - first 128 training images
# Train command: python train.py --data coco128.yaml
# Default dataset location is next to /yolov5:
#   /parent_folder
#     /coco128
#     /yolov5


# train and val data as 1) directory: path/images/, 2) file: path/images.txt, or 3) list: [path1/images/, path2/images/]
train: ./xunlianji/train/images/  # 128 images
val: ./xunlianji/vaild/images/  # 128 images

# number of classes
nc: 6

# class names
names: [ 'red', 'green', 'blue',"red_box","green_box","blue_box" ]

```

> train为train的地址
>
> val为valid的地址
>
> nc为标签数量
>
> names为所有标签内容

五、修改train.py

- `--weights`：指定预训练权重，这里我们使用的是yolov5s.pt，如果没有下载，你运行后它会自己下载的

- `--cfg`：指定模型配置文件，这里我们使用的是yolov5s.yaml

- `--data`：指定数据集配置文件，这里我们使用的是myvoc.yaml。这个要改成你自己的配置文件路径。

- `--epoch`：指定训练的轮数，这里我们设置为200。训练200次

- `--batch-size`：指定训练的batch size，这里我们设置为8。训练8张图片后进行权重更新

- `--img`：指定训练的图片大小，这里我们设置为640。

- `--device`：指定训练的设备，这里我们设置为cpu。当然cpu会比较慢而且如果你cpu不咋行会报一些错，如果可以建议用GPU训练。

  

> 我们设置如下几个核心配置：
>
> --weights v5lite-s.pt
>
> --cfg models/v5Lite-s.yaml
>
> --data data/mydata.yaml
>
> --img-size 320
>
> --batch-size 16
>
> --data data/mydata.yaml
>
> device 0/cpu                        （可以不使用CUDA训练）
> 

修改后运行`train.py`

训练成功之后，将会在当前目录下的 **run** 文件下的 **trian** 文件下找到 **expx** (x代表数字)，**expx** 则存放了第 **x** 次训练时候的各种数据内容，**包括：**历史最优权重**best_weight**，当前权重**last_weight**，训练结果**result**等等；

