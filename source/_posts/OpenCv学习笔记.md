---
title: OpenCv学习笔记
date: 2025-05-12 00:00:00
type: paper
photos: 
tags:
  - OpenCv
  - learn
excerpt: 本文作为OpenCV学习入门，介绍了其基础概念、安装与配置方法，并通过一个简单的图像处理示例，演示了基本使用流程，为后续学习奠定基础。
description: 
---

# 一、基础操作

## 读取显示图片

```python
# 导入 OpenCV 库
import cv2

# 1. 读取图像
# 替换为实际的图像路径，这里是当前目录下的 "bird.jpg"
image_path = "./bird.jpg"
image = cv2.imread(image_path)

# 检查图像是否成功读取
if image is None:
    print("错误：无法加载图像，请检查路径是否正确。")
    exit()

# 2. 显示图像
# 创建一个名为 "Display Image" 的窗口，并在其中显示图像
cv2.imshow("Display Image", image)

# 3. 等待用户按键
# 参数 0 表示无限等待，直到用户按下任意键
key = cv2.waitKey(0)

# 4. 根据用户按键执行操作
if key == ord('s'):  # 如果按下 's' 键
    # 保存图像
    output_path = "saved_image.jpg"
    cv2.imwrite(output_path, image)
    print(f"图像已保存为 {output_path}")
else:  # 如果按下其他键
    print("图像未保存。")

# 5. 关闭所有窗口
cv2.destroyAllWindows()
```

读取图像：`cv2.imread(image_path)`

在窗口中显示图像：`cv2.imshow("Display Image", image)`

保存图像：`  cv2.imwrite(output_path, image)`

关闭窗口：`cv2.destroyAllWindows()`

# 二、图像处理基础

**图像的基本属性：**

- **图像的尺寸（Width, Height）**：可以通过 `img.shape` 获取。
- **颜色通道（Channels）**：通常为 RGB（三个通道），也可以是灰度图（单通道）。
- **数据类型（Data type）**：常见的有 `uint8`（0-255 范围），也可以是 `float32` 或其他。

**读取图像：**

```
import cv2
img = cv2.imread('image.jpg')
```

- `cv2.imread()` 读取图像文件，返回一个 NumPy 数组。
- 如果图像路径错误或文件不存在，返回 `None`。

**显示图像：**

```
# 显示图像
cv2.imshow("Display Window", image)

# 等待按键输入
cv2.waitKey(0)

# 关闭所有窗口
cv2.destroyAllWindows()
```

**cv2.imshow()** 用于显示图像，**cv2.waitKey(0)** 等待按键事件，**cv2.destroyAllWindows()** 关闭所有窗口。

保存图像：

```
# 保存图像
cv2.imwrite("output_image.jpg", image)
```

**cv2.imwrite()** 将图像保存到指定路径。

## 2.1图像基本操作

**1、访问和修改像素值**

```
# 获取像素值 (BGR 格式)
pixel_value = image[100, 100]  # 获取 (100, 100) 处的像素值

# 修改像素值
image[100, 100] = [255, 255, 255]  # 将 (100, 100) 处的像素设置为白色
```

**2、图像 ROI（Region of Interest）**

```
# 获取 ROI
roi = image[50:150, 50:150]  # 获取 (50,50) 到 (150,150) 的区域

# 修改 ROI
image[50:150, 50:150] = [0, 255, 0]  # 将 ROI 区域设置为绿色
```

**3、图像通道分离与合并**

```
# 分离通道
b, g, r = cv2.split(image)

# 合并通道
merged_image = cv2.merge([b, g, r])
```

**4、图像缩放、旋转、平移、翻转**

```python
# 缩放
resized_image = cv2.resize(image, (new_width, new_height))

# 旋转
(h, w) = img.shape[:2]
center = (w // 2, h // 2)
M = cv2.getRotationMatrix2D(center, 45, 1.0)  # 旋转 45 度
rotated_img = cv2.warpAffine(img, M, (w, h))

rotation_matrix = cv2.getRotationMatrix2D((center_x, center_y), angle, scale)
rotated_image = cv2.warpAffine(image, rotation_matrix, (width, height))

# 平移
translation_matrix = np.float32([[1, 0, tx], [0, 1, ty]])  # tx, ty 为平移距离
translated_image = cv2.warpAffine(image, translation_matrix, (width, height))

# 翻转
flipped_image = cv2.flip(image, flip_code)  # flip_code: 0 (垂直翻转), 1 (水平翻转), -1 (双向翻转)
```

## 2.2图像算术运算

### 2.2.1基础运算

**1、图像加法**

```
result = cv2.add(image1, image2)
```

**注意**：如果像素值相加后超过 255，OpenCV 会自动将其截断为 255。

**2、图像减法**

```
result = cv2.subtract(image1, image2)
```

**注意**：如果像素值相减后小于 0，OpenCV 会自动将其截断为 0。

**3、图像乘法**

```
result = cv2.multiply(img1, img2)
```

4.**图像除法**

```
result = cv2.divide(img1, img2)
```

### 2.2.2图像位运算 (AND, OR, NOT, XOR)

位运算是对图像的每个像素进行二进制位操作。

| 函数                | 功能         | 应用场景           |
| :------------------ | :----------- | :----------------- |
| `cv2.bitwise_and()` | 按位与操作   | 掩码操作、图像分割 |
| `cv2.bitwise_or()`  | 按位或操作   | 图像叠加           |
| `cv2.bitwise_not()` | 按位取反操作 | 图像反色           |
| `cv2.bitwise_xor()` | 按位异或操作 | 图像差异检测       |

**1.位与运算 (AND)**

位与运算是对两幅图像的每个像素进行按位与操作。

```
result = cv2.bitwise_and(img1, img2)
```

**2.位或运算 (OR)**

位或运算是对两幅图像的每个像素进行按位或操作。

```
result = cv2.bitwise_or(img1, img2)
```

**3.位非运算 (NOT)**

位非运算是对图像的每个像素进行按位取反操作。

```
result = cv2.bitwise_not(img1)
```

**4.位异或运算 (XOR)**

位异或运算是对两幅图像的每个像素进行按位异或操作。

```
result = cv2.bitwise_xor(img1, img2)
```

### 2.2.3图像混合

在 OpenCV 中，可以使用 `cv2.addWeighted()` 函数来实现图像混合。

```python
# 图像混合
alpha = 0.7  # 第一幅图像的权重
beta = 0.3   # 第二幅图像的权重
gamma = 0    # 可选的标量值

result = cv2.addWeighted(img1, alpha, img2, beta, gamma)

# 显示结果
cv2.imshow('Result', result)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

**参数说明**：

- `alpha`：第一幅图像的权重。
- `beta`：第二幅图像的权重。
- `gamma`：可选的标量值，通常设置为 0。

**公式**：

```
result = img1 * alpha + img2 * beta + gamma
```

## 2.3图像阈值处理

### **2.3.1简单阈值处理**

OpenCV 提供了 `cv2.threshold()` 函数来实现这一功能。

**函数原型**

```
retval, dst = cv2.threshold(src, thresh, maxval, type)
```

**参数说明**

- `src`: 输入图像，通常为灰度图像。

- `thresh`: 设定的阈值。

- `maxval`: 当像素值超过（或小于，根据类型）阈值时，赋予的新值。

- `type`  : 阈值处理的类型，常见的类型有：

  - `cv2.THRESH_BINARY`: 如果像素值大于阈值，则赋予 `maxval`，否则赋予 `0`。
  - `cv2.THRESH_BINARY_INV`: 与 `cv2.THRESH_BINARY` 相反，如果像素值大于阈值，则赋予 `0`，否则赋予 `maxval`。
  - `cv2.THRESH_TRUNC`: 如果像素值大于阈值，则赋予阈值，否则保持不变。
  - `cv2.THRESH_TOZERO`: 如果像素值大于阈值，则保持不变，否则赋予 `0`。
  - `cv2.THRESH_TOZERO_INV`: 与 `cv2.THRESH_TOZERO` 相反，如果像素值大于阈值，则赋予 `0`，否则保持不变。

**返回值**

- `retval`: 实际使用的阈值（在某些情况下可能与设定的阈值不同）。
- `dst`: 处理后的图像。

### **2.3.2自适应阈值处理**

在某些情况下，图像的亮度分布不均匀，使用固定的阈值可能无法得到理想的效果。自适应阈值处理通过为图像的不同区域计算不同的阈值，从而更好地处理这种情况。

**函数原型**

```
dst = cv2.adaptiveThreshold(src, maxValue, adaptiveMethod, thresholdType, blockSize, C)
```

**参数说明**

- `src`: 输入图像，通常为灰度图像。

- `maxValue`: 当像素值超过（或小于，根据类型）阈值时，赋予的新值。

- `adaptiveMethod` : 自适应阈值计算方法，常见的类型有：

  - `cv2.ADAPTIVE_THRESH_MEAN_C`: 阈值是邻域的平均值减去常数 `C`。
  - `cv2.ADAPTIVE_THRESH_GAUSSIAN_C`: 阈值是邻域的加权平均值减去常数 `C`，权重由高斯函数确定。

- `thresholdType`: 阈值处理的类型，通常为 `cv2.THRESH_BINARY` 或 `cv2.THRESH_BINARY_INV`。

- `blockSize`: 计算阈值时使用的邻域大小，必须为奇数。

- `C`: 从平均值或加权平均值中减去的常数。

**返回值**

- `dst`: 处理后的图像。

### **2.3.3Otsu's 二值化**

Otsu's 二值化是一种自动确定阈值的方法。它通过最大化类间方差来找到最佳的全局阈值，适用于双峰图像（即图像直方图有两个明显的峰值）。

**函数原型**

```
retval, dst = cv2.threshold(src, thresh, maxval, type)
```

**参数说明**

- `src`: 输入图像，通常为灰度图像。
- `thresh`: 由于 Otsu's 方法会自动确定阈值，因此该参数通常设置为 `0`。
- `maxval`: 当像素值超过（或小于，根据类型）阈值时，赋予的新值。
- `type`: 阈值处理的类型，通常为 `cv2.THRESH_BINARY` 或 `cv2.THRESH_BINARY_INV`，并加上 `cv2.THRESH_OTSU`。

**返回值**

- `retval`: 自动确定的阈值。
- `dst`: 处理后的图像。

## 2.4图像平滑处理

### **2.4.1均值滤波**

均值滤波是最简单的平滑处理方法之一。

均值滤波的原理是将图像中每个像素的值替换为其周围像素的平均值。

均值滤波可以有效地去除噪声，但可能会导致图像变得模糊。

```
blurred_image = cv2.blur(image, (kernel_size, kernel_size))
```

**cv2.blur(image, (5, 5)) 参数说明****

- `image`: 输入的图像。

- `(kernel_size, kernel_size)`: 滤波核的大小，表示在水平和垂直方向上取平均值的范围。

  均值滤波适用于去除图像中的随机噪声，但可能会导致图像边缘变得模糊。

### **2.4.2高斯滤波**

高斯滤波是一种基于高斯函数的平滑处理方法。与均值滤波不同，高斯滤波在计算像素平均值时，会给中心像素赋予更高的权重，而给边缘像素赋予较低的权重。

高斯滤波在去除噪声的同时，能够更好地保留图像的边缘信息。

```
blurred_image = cv2.GaussianBlur(image, (kernel_size, kernel_size), sigmaX)
```

**cv2.GaussianBlur(image, (5, 5), 0) 参数说明**

- `image`: 输入的图像。
- `(5, 5)`: 滤波核的大小。
- `0`: 高斯核的标准差，如果为0，则根据核大小自动计算。

高斯滤波适用于去除图像中的高斯噪声，并且在保留图像边缘信息方面表现较好。

### **2.4.3中值滤波**

中值滤波是一种非线性平滑处理方法。它的原理是将图像中每个像素的值替换为其周围像素的中值。

中值滤波在去除椒盐噪声（即图像中随机出现的黑白点）时非常有效。

```
blurred_image = cv2.medianBlur(image, kernel_size)
```

**cv2.medianBlur(image, 5) 参数说明**

- `image`: 输入的图像。
- `5`: 滤波核的大小，必须是奇数。

### **2.4.4双边滤波**

双边滤波是一种非线性的平滑处理方法，它结合了空间邻近度和像素值相似度。

与高斯滤波不同，双边滤波在平滑图像的同时，能够保留图像的边缘信息。这是因为双边滤波不仅考虑像素之间的空间距离，还考虑像素值之间的差异。

```
blurred_image = cv2.bilateralFilter(image, d, sigmaColor, sigmaSpace)
```

**cv2.bilateralFilter(image, 9, 75, 75) 参数说明**

- `image`: 输入的图像。
- `9`: 滤波核的大小。
- `75`: 颜色空间的标准差，控制像素值相似度的权重。
- `75`: 坐标空间的标准差，控制空间距离的权重。

## 2.5图像的颜色空间与转换

OpenCV 支持多种颜色空间的转换，如从 RGB 到灰度图、HSV 等。

图像的颜色空间转换在许多图像处理任务中非常重要。

从 RGB 转换为灰度图：

```
gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
```

从 BGR 转换为 HSV：

```
hsv_img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
```

从 RGB 转换为 YUV：

```
yuv_img = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
```

颜色空间转换是图像处理中的基础操作，用于不同的算法和视觉效果。

## 2.6图像的大小调整与裁剪

OpenCV 提供了多种方式来调整图像大小和裁剪图像区域。

调整图像大小：

```
resized_img = cv2.resize(img, (width, height))
```

裁剪图像：

```
cropped_img = img[y1:y2, x1:x2]
```

可以通过切片操作裁剪图像的特定区域。

## 2.7图像平滑与去噪（模糊处理）

图像平滑可以减少噪声，常用的模糊算法有高斯模糊、均值模糊等。

高斯模糊：

```
blurred_img = cv2.GaussianBlur(img, (5, 5), 0)
```

均值模糊：

```
blurred_img = cv2.blur(img, (5, 5))
```

中值模糊：

```
blurred_img = cv2.medianBlur(img, 5)
```

## 2.8图像边缘检测

边缘检测是一种常用的图像处理技术，用于检测图像中的边缘，最常用的方法是 Canny 边缘检测。

| **函数**              | **算法**       | **说明**                                         | **适用场景**                   |
| :-------------------- | :------------- | :----------------------------------------------- | :----------------------------- |
| **`cv2.Canny()`**     | Canny 边缘检测 | 多阶段算法，检测效果较好，噪声抑制能力强。       | 通用边缘检测，适合大多数场景。 |
| **`cv2.Sobel()`**     | Sobel 算子     | 基于一阶导数的边缘检测，可以检测水平和垂直边缘。 | 检测水平和垂直边缘。           |
| **`cv2.Scharr()`**    | Scharr 算子    | Sobel 算子的改进版本，对边缘的响应更强。         | 检测细微的边缘。               |
| **`cv2.Laplacian()`** | Laplacian 算子 | 基于二阶导数的边缘检测，对噪声敏感。             | 检测边缘和角点。               |

### 2.8.1.**Canny 边缘检测**

#### 2.8.1.1 Canny 边缘检测的步骤

Canny 边缘检测算法主要包括以下几个步骤：

1. **噪声抑制**：使用高斯滤波器对图像进行平滑处理，以减少噪声的影响。
2. **计算梯度**：使用 Sobel 算子计算图像的梯度幅值和方向。
3. **非极大值抑制**：沿着梯度方向，保留局部梯度最大的像素点，抑制其他像素点。
4. **双阈值检测**：使用两个阈值（低阈值和高阈值）来确定真正的边缘。高于高阈值的像素点被认为是强边缘，低于低阈值的像素点被抑制，介于两者之间的像素点如果与强边缘相连则保留。
5. **边缘连接**：通过滞后阈值处理，将弱边缘与强边缘连接起来，形成完整的边缘。

#### 2.8.1.2 使用 OpenCV 实现 Canny 边缘检测

在 OpenCV 中，可以使用 `cv2.Canny()` 函数来实现 Canny 边缘检测。

该函数的原型如下：

```
edges = cv2.Canny(image, threshold1, threshold2, apertureSize=3, L2gradient=False)
```

- `image`：输入图像，必须是单通道的灰度图像。
- `threshold1`：低阈值。
- `threshold2`：高阈值。
- `apertureSize`：Sobel 算子的孔径大小，默认为 3。
- `L2gradient`：是否使用 L2 范数计算梯度幅值，默认为 False（使用 L1 范数）。

```Py
import cv2
import numpy as np

# 读取图像
image = cv2.imread('image.jpg', cv2.IMREAD_GRAYSCALE)

# 应用 Canny 边缘检测
edges = cv2.Canny(image, 100, 200)

# 显示结果
cv2.imshow('Canny Edges', edges)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### 2.8.2Sobel 算子

Sobel 算子是一种基于梯度的边缘检测算子，它通过计算图像在水平和垂直方向上的梯度来检测边缘。

Sobel 算子结合了高斯平滑和微分操作，因此对噪声具有一定的抑制作用。

#### 2.8.2.1 Sobel 算子的原理

Sobel 算子使用两个 3x3 的卷积核分别计算图像在水平和垂直方向上的梯度：

- 水平方向的卷积核：

  ```
  [-1, 0, 1]
  [-2, 0, 2]
  [-1, 0, 1]
  ```

- 垂直方向的卷积核：

  ```
  [-1, -2, -1]
  [ 0,  0,  0]
  [ 1,  2,  1]
  ```

通过这两个卷积核，可以分别得到图像在水平和垂直方向上的梯度 `Gx` 和 `Gy`。最终的梯度幅值可以通过以下公式计算：

```
G = sqrt(Gx^2 + Gy^2)
```

#### 2.8.2.2 使用 OpenCV 实现 Sobel 算子

在 OpenCV 中，可以使用 `cv2.Sobel()` 函数来计算图像的梯度。该函数的原型如下：

```
dst = cv2.Sobel(src, ddepth, dx, dy, ksize=3, scale=1, delta=0, borderType=cv2.BORDER_DEFAULT)
```

- `src`：输入图像。
- `ddepth`：输出图像的深度，通常使用 `cv2.CV_64F`。
- `dx`：x 方向上的导数阶数。
- `dy`：y 方向上的导数阶数。
- `ksize`：Sobel 核的大小，默认为 3。
- `scale`：缩放因子，默认为 1。
- `delta`：可选的 delta 值，默认为 0。
- `borderType`：边界填充类型，默认为 `cv2.BORDER_DEFAULT`。

```Py
import cv2
import numpy as np

# 读取图像
image = cv2.imread('image.jpg', cv2.IMREAD_GRAYSCALE)

# 计算 x 方向的梯度
sobel_x = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=3)

# 计算 y 方向的梯度
sobel_y = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=3)

# 计算梯度幅值
sobel_combined = np.sqrt(sobel_x**2 + sobel_y**2)

# 显示结果
cv2.imshow('Sobel X', sobel_x)
cv2.imshow('Sobel Y', sobel_y)
cv2.imshow('Sobel Combined', sobel_combined)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### 2.8.3 Laplacian 算子

Laplacian 算子是一种二阶微分算子，它通过计算图像的二阶导数来检测边缘。Laplacian 算子对噪声比较敏感，因此通常在使用之前会对图像进行高斯平滑处理。

#### 2.8.3.1 Laplacian 算子的原理

Laplacian 算子使用以下卷积核来计算图像的二阶导数：

```
[ 0,  1,  0]
[ 1, -4,  1]
[ 0,  1,  0]
```

通过这个卷积核，可以得到图像的 Laplacian 值。Laplacian 值较大的区域通常对应于图像的边缘。

#### 2.8.3.2 使用 OpenCV 实现 Laplacian 算子

在 OpenCV 中，可以使用 `cv2.Laplacian()` 函数来计算图像的 Laplacian 值。

该函数的原型如下：

```
dst = cv2.Laplacian(src, ddepth, ksize=1, scale=1, delta=0, borderType=cv2.BORDER_DEFAULT)
```

- `src`：输入图像。
- `ddepth`：输出图像的深度，通常使用 `cv2.CV_64F`。
- `ksize`：Laplacian 核的大小，默认为 1。
- `scale`：缩放因子，默认为 1。
- `delta`：可选的 delta 值，默认为 0。
- `borderType`：边界填充类型，默认为 `cv2.BORDER_DEFAULT`。

```Py
import cv2
import numpy as np

# 读取图像
image = cv2.imread('image.jpg', cv2.IMREAD_GRAYSCALE)

# 应用 Laplacian 算子
laplacian = cv2.Laplacian(image, cv2.CV_64F)

# 显示结果
cv2.imshow('Laplacian', laplacian)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### 常用边缘检测函数对比

以下是 OpenCV 中常用边缘检测函数的对比：

| **函数**              | **算法**       | **优点**                             | **缺点**                       | **适用场景**                   |
| :-------------------- | :------------- | :----------------------------------- | :----------------------------- | :----------------------------- |
| **`cv2.Canny()`**     | Canny 边缘检测 | 噪声抑制能力强，边缘检测效果好。     | 参数调节较为复杂。             | 通用边缘检测，适合大多数场景。 |
| **`cv2.Sobel()`**     | Sobel 算子     | 计算简单，适合检测水平和垂直边缘。   | 对噪声敏感，边缘检测效果一般。 | 检测水平和垂直边缘。           |
| **`cv2.Scharr()`**    | Scharr 算子    | 对边缘的响应更强，适合检测细微边缘。 | 对噪声敏感。                   | 检测细微的边缘。               |
| **`cv2.Laplacian()`** | Laplacian 算子 | 可以检测边缘和角点。                 | 对噪声非常敏感。               | 检测边缘和角点                 |

## 2.9形态学操作

| **操作**       | **函数**             | **说明**                                                     | **应用场景**               |
| :------------- | :------------------- | :----------------------------------------------------------- | :------------------------- |
| **腐蚀**       | `cv2.erode()`        | 用结构元素扫描图像，如果结构元素覆盖的区域全是前景，则保留中心像素。 | 去除噪声、分离物体。       |
| **膨胀**       | `cv2.dilate()`       | 用结构元素扫描图像，如果结构元素覆盖的区域存在前景，则保留中心像素。 | 连接断裂的物体、填充空洞。 |
| **开运算**     | `cv2.morphologyEx()` | 先腐蚀后膨胀。                                               | 去除小物体、平滑物体边界。 |
| **闭运算**     | `cv2.morphologyEx()` | 先膨胀后腐蚀。                                               | 填充小孔洞、连接邻近物体。 |
| **形态学梯度** | `cv2.morphologyEx()` | 膨胀图减去腐蚀图。                                           | 提取物体边缘。             |
| **顶帽运算**   | `cv2.morphologyEx()` | 原图减去开运算结果。                                         | 提取比背景亮的细小物体。   |
| **黑帽运算**   | `cv2.morphologyEx()` | 闭运算结果减去原图。                                         | 提取比背景暗的细小物体。   |

### 2.9.1腐蚀

腐蚀操作是一种缩小图像中前景对象的过程。

腐蚀操作通过将结构元素与图像进行卷积，只有当结构元素完全覆盖图像中的前景像素时，中心像素才会被保留，否则会被腐蚀掉。

```
cv2.erode(src, kernel, iterations=1)
```

- `src`: 输入图像，通常是二值图像。
- `kernel`: 结构元素，可以自定义或使用 `cv2.getStructuringElement()` 生成。
- `iterations`: 腐蚀操作的次数，默认为1。

腐蚀操作会使图像中的前景对象变小，边缘被腐蚀掉，常用于去除噪声或分离连接的对象。

### 2.9.2膨胀

膨胀操作与腐蚀相反，它是一种扩大图像中前景对象的过程。

膨胀操作通过将结构元素与图像进行卷积，只要结构元素与图像中的前景像素有重叠，中心像素就会被保留。

```
cv2.dilate(src, kernel, iterations=1)
```

- `src`: 输入图像，通常是二值图像。
- `kernel`: 结构元素，可以自定义或使用 `cv2.getStructuringElement()` 生成。
- `iterations`: 膨胀操作的次数，默认为1。

膨胀操作会使图像中的前景对象变大，边缘被扩展，常用于填补前景对象中的空洞或连接断裂的对象。

### 2.9.3开运算

```
cv2.morphologyEx(src, op, kernel)
```

- `src`: 输入图像，通常是二值图像。
- `op`: 形态学操作类型，开运算使用 `cv2.MORPH_OPEN`。
- `kernel`: 结构元素，可以自定义或使用 `cv2.getStructuringElement()` 生成。

开运算可以去除图像中的小噪声，同时保留图像中的主要前景对象。

### 2.9.4闭运算

闭运算是先膨胀后腐蚀的组合操作。

闭运算主要用于填补前景对象中的小孔或连接断裂的对象。

```
cv2.morphologyEx(src, op, kernel)
```

- `src`: 输入图像，通常是二值图像。
- `op`: 形态学操作类型，闭运算使用 `cv2.MORPH_CLOSE`。
- `kernel`: 结构元素，可以自定义或使用 `cv2.getStructuringElement()` 生成。

闭运算可以填补前景对象中的小孔，同时保留图像中的主要前景对象。

### 2.9.5形态学梯度

形态学梯度是膨胀图像与腐蚀图像的差值。

形态学梯度主要用于提取图像中前景对象的边缘。

```
cv2.morphologyEx(src, op, kernel)
```

- `src`: 输入图像，通常是二值图像。
- `op`: 形态学操作类型，形态学梯度使用 `cv2.MORPH_GRADIENT`。
- `kernel`: 结构元素，可以自定义或使用 `cv2.getStructuringElement()` 生成。

## 2.10图像轮廓检测

### 2.10.1轮廓检测的基本概念

- **轮廓:** 图像中物体的边界，由一系列点组成。
- **轮廓层次结构:** 轮廓之间的嵌套关系，例如一个轮廓是否包含另一个轮廓。
- **轮廓特征:** 轮廓的面积、周长、边界矩形、最小外接矩形、最小外接圆等。

### 2.10.2轮廓检测常用函数

| 函数名称                   | 功能描述               |
| :------------------------- | :--------------------- |
| `cv2.findContours()`       | 查找图像中的轮廓       |
| `cv2.drawContours()`       | 在图像上绘制轮廓       |
| `cv2.contourArea()`        | 计算轮廓的面积         |
| `cv2.arcLength()`          | 计算轮廓的周长或弧长   |
| `cv2.boundingRect()`       | 计算轮廓的边界矩形     |
| `cv2.minAreaRect()`        | 计算轮廓的最小外接矩形 |
| `cv2.minEnclosingCircle()` | 计算轮廓的最小外接圆   |
| `cv2.approxPolyDP()`       | 对轮廓进行多边形近似   |

### 2.10.3 `cv2.findContours()`

**功能描述**:
该函数用于在二值图像中查找轮廓。轮廓是图像中具有相同颜色或强度的连续点的曲线。

**函数定义**:

```
contours, hierarchy = cv2.findContours(image, mode, method[, contours[, hierarchy[, offset]]])
```

**参数说明**:

- `image`: 输入的二值图像（通常为经过阈值处理或边缘检测后的图像）。

- `mode`: 轮廓检索模式，常用的有：
  - `cv2.RETR_EXTERNAL`: 只检测最外层轮廓。
  - `cv2.RETR_LIST`: 检测所有轮廓，但不建立层次关系。
  - `cv2.RETR_TREE`: 检测所有轮廓，并建立完整的层次结构。
  
- `method`: 轮廓近似方法，常用的有：
  - `cv2.CHAIN_APPROX_NONE`: 存储所有的轮廓点。
  - `cv2.CHAIN_APPROX_SIMPLE`: 压缩水平、垂直和对角线段，只保留端点。

- `contours`: 输出的轮廓列表，每个轮廓是一个点集。

- `hierarchy`: 输出的层次结构信息。

- `offset`: 可选参数，轮廓点的偏移量。

**返回值**:

- `contours`: 检测到的轮廓列表。
- `hierarchy`: 轮廓的层次结构信息。

### 2.10.4 `cv2.drawContours()`

**功能描述**:
该函数用于在图像上绘制检测到的轮廓。

**函数定义**:

```
cv2.drawContours(image, contours, contourIdx, color[, thickness[, lineType[, hierarchy[, maxLevel[, offset]]]]])
```

**参数说明**:

- `image`: 要绘制轮廓的图像。
- `contours`: 轮廓列表。
- `contourIdx`: 要绘制的轮廓索引，如果为负数，则绘制所有轮廓。
- `color`: 轮廓的颜色。
- `thickness`: 轮廓线的厚度，如果为负数，则填充轮廓内部。
- `lineType`: 线型。
- `hierarchy`: 轮廓的层次结构信息。
- `maxLevel`: 绘制的最大层次深度。
- `offset`: 轮廓点的偏移量。

**返回值**:
无返回值，直接在输入图像上绘制轮廓。

### 2.10.5 `cv2.contourArea()`

**功能描述**:
该函数用于计算轮廓的面积。

**函数定义**:

```
area = cv2.contourArea(contour[, oriented])
```

**参数说明**:

- `contour`: 输入的轮廓点集。
- `oriented`: 可选参数，如果为True，返回有符号的面积。

**返回值**:
轮廓的面积。

### 2.10.6 `cv2.arcLength()`

**功能描述**:
该函数用于计算轮廓的周长或弧长。

**函数定义**:

```
length = cv2.arcLength(curve, closed)
```

**参数说明**:

- `curve`: 输入的轮廓点集。
- `closed`: 布尔值，表示轮廓是否闭合。

**返回值**:
轮廓的周长或弧长。

### 2.10.7 `cv2.boundingRect()`

**功能描述**:
该函数用于计算轮廓的边界矩形。

**函数定义**:

```
x, y, w, h = cv2.boundingRect(points)
```

**参数说明**:

- `points`: 输入的轮廓点集。

**返回值**:
边界矩形的左上角坐标 `(x, y)` 和宽度 `w`、高度 `h`。

### 2.10.8 `cv2.minAreaRect()`

**功能描述**:
该函数用于计算轮廓的最小外接矩形（旋转矩形）。

**函数定义**:

```
rect = cv2.minAreaRect(points)
```

**参数说明**:

- `points`: 输入的轮廓点集。

**返回值**:
返回一个旋转矩形，包含中心点 `(x, y)`、宽度、高度和旋转角度。

### 2.10.9 `cv2.minEnclosingCircle()`

**功能描述**:
该函数用于计算轮廓的最小外接圆。

**函数定义**:

```
(center, radius) = cv2.minEnclosingCircle(points)
```

**参数说明**:

- `points`: 输入的轮廓点集。

**返回值**:
返回圆心 `(x, y)` 和半径 `radius`。

### 2.10.10 `cv2.approxPolyDP()`

**功能描述**:
该函数用于对轮廓进行多边形近似。

**函数定义**:

```
approx = cv2.approxPolyDP(curve, epsilon, closed)
```

**参数说明**:

- `curve`: 输入的轮廓点集。
- `epsilon`: 近似精度，值越小，近似越精确。
- `closed`: 布尔值，表示轮廓是否闭合。

**返回值**:
返回近似后的多边形点集。

### 2.10.11轮廓检测的应用

- 物体识别: 通过轮廓检测可以识别图像中的物体，例如检测圆形、矩形等。
- 形状分析: 通过计算轮廓的特征（如面积、周长、边界矩形等），可以分析物体的形状。
- 目标跟踪: 在视频中，可以通过轮廓检测跟踪运动的目标。
- 图像分割: 通过轮廓检测可以将图像中的物体分割出来。

OpenCV 提供了强大的轮廓检测功能，可以用于提取图像中物体的边界，并计算轮廓的特征。

以下是轮廓检测的主要步骤和函数：

| **步骤**             | **函数**                   | **说明**                 |
| :------------------- | :------------------------- | :----------------------- |
| **图像预处理**       | `cv2.cvtColor()`           | 将图像转换为灰度图。     |
| **二值化处理**       | `cv2.threshold()`          | 将灰度图转换为二值图像。 |
| **查找轮廓**         | `cv2.findContours()`       | 查找图像中的轮廓。       |
| **绘制轮廓**         | `cv2.drawContours()`       | 绘制检测到的轮廓。       |
| **计算轮廓面积**     | `cv2.contourArea()`        | 计算轮廓的面积。         |
| **计算轮廓周长**     | `cv2.arcLength()`          | 计算轮廓的周长。         |
| **计算边界矩形**     | `cv2.boundingRect()`       | 计算轮廓的边界矩形。     |
| **计算最小外接矩形** | `cv2.minAreaRect()`        | 计算轮廓的最小外接矩形。 |
| **计算最小外接圆**   | `cv2.minEnclosingCircle()` | 计算轮廓的最小外接圆。   |
| **多边形逼近**       | `cv2.approxPolyDP()`       | 对轮廓进行多边形逼近。   |

以下是一个完整的轮廓检测示例代码：

```python
import cv2

# 读取图像
image = cv2.imread("path/to/image")

# 转换为灰度图
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# 二值化处理
ret, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

# 查找轮廓
contours, hierarchy = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

# 绘制轮廓
cv2.drawContours(image, contours, -1, (0, 255, 0), 2)

# 显示结果
cv2.imshow("Contours", image)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

## 2.11图像直方图

### 2.11.1什么是图像直方图？

图像直方图是图像像素强度分布的图形表示，对于灰度图像，直方图显示了每个灰度级（0到255）在图像中出现的频率，对于彩色图像，我们可以分别计算每个通道（如R、G、B）的直方图。

直方图可以帮助我们了解图像的亮度、对比度等信息。例如，如果直方图集中在低灰度区域，说明图像偏暗；如果直方图分布均匀，说明图像对比度较好。

- **直方图:** 表示图像中像素强度的分布情况，横轴表示像素强度值，纵轴表示该强度值的像素数量。
- **灰度直方图:** 针对灰度图像的直方图，表示每个灰度级的像素数量。
- **颜色直方图:** 针对彩色图像的直方图，分别表示每个颜色通道（如 BGR）的像素强度分布。

OpenCV 提供了丰富的直方图计算和操作函数：

| **功能**         | **函数**                   | **说明**                     |
| :--------------- | :------------------------- | :--------------------------- |
| **计算直方图**   | `cv2.calcHist()`           | 计算图像的直方图。           |
| **直方图均衡化** | `cv2.equalizeHist()`       | 增强图像的对比度。           |
| **直方图比较**   | `cv2.compareHist()`        | 比较两个直方图的相似度。     |
| **绘制直方图**   | `matplotlib.pyplot.plot()` | 使用 Matplotlib 绘制直方图。 |

### 2.11.2OpenCV 中的直方图计算函数

在 OpenCV 中，我们可以使用 `cv2.calcHist()` 函数来计算图像的直方图。

**`cv2.calcHist()` 函数语法**

```
cv2.calcHist(images, channels, mask, histSize, ranges[, hist[, accumulate]])
```

**参数说明**

- **images**: 输入的图像列表，通常是一个包含单通道或多通道图像的列表。例如 `[img]`。
- **channels**: 需要计算直方图的通道索引。对于灰度图像，使用 `[0]`；对于彩色图像，可以使用 `[0]`、`[1]`、`[2]` 分别计算蓝色、绿色和红色通道的直方图。
- **mask**: 掩码图像。如果指定了掩码，则只计算掩码区域内的像素。如果不需要掩码，可以传入 `None`。
- **histSize**: 直方图的 bin 数量。对于灰度图像，通常设置为 `[256]`，表示将灰度级分为 256 个 bin。
- **ranges**: 像素值的范围。对于灰度图像，通常设置为 `[0, 256]`，表示像素值的范围是 0 到 255。
- **hist**: 输出的直方图数组。
- **accumulate**: 是否累积直方图。如果设置为 `True`，则直方图不会被清零，而是在每次调用时累积。

假设我们有一张灰度图像 `img`，我们可以使用以下代码计算其直方图：

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# 读取图像
img = cv2.imread('image.jpg', cv2.IMREAD_GRAYSCALE)

# 计算直方图
hist = cv2.calcHist([img], [0], None, [256], [0, 256])

# 绘制直方图
plt.plot(hist)
plt.title('Grayscale Histogram')
plt.xlabel('Pixel Value')
plt.ylabel('Frequency')
plt.show()
```

### 2.11.3直方图均衡化

直方图均衡化是一种增强图像对比度的方法，通过重新分配像素强度值，使直方图更加均匀。

语法:

```
equalized_image = cv2.equalizeHist(image)
```

```python
# 直方图均衡化
equalized_image = cv2.equalizeHist(image)

# 显示结果
cv2.imshow("Equalized Image", equalized_image)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### 2.11.4颜色直方图

**计算颜色直方图**

对于彩色图像，可以分别计算每个颜色通道的直方图。

```python
# 读取彩色图像
image = cv2.imread("path/to/image")

# 计算 BGR 各通道的直方图
colors = ('b', 'g', 'r')
for i, color in enumerate(colors):
    hist = cv2.calcHist([image], [i], None, [256], [0, 256])
    plt.plot(hist, color=color)

# 绘制直方图
plt.title("Color Histogram")
plt.xlabel("Pixel Intensity")
plt.ylabel("Pixel Count")
plt.show()
```

**颜色直方图均衡化**

对于彩色图像，可以对每个通道分别进行直方图均衡化。

```python
# 分离通道
b, g, r = cv2.split(image)

# 对每个通道进行直方图均衡化
b_eq = cv2.equalizeHist(b)
g_eq = cv2.equalizeHist(g)
r_eq = cv2.equalizeHist(r)

# 合并通道
equalized_image = cv2.merge([b_eq, g_eq, r_eq])

# 显示结果
cv2.imshow("Equalized Color Image", equalized_image)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

**直方图比较**

OpenCV 提供了 cv2.compareHist() 函数，用于比较两个直方图的相似度。

语法:

```
similarity = cv2.compareHist(hist1, hist2, method)
```

- `hist1`: 第一个直方图。
- `hist2`: 第二个直方图。
- `method`: 比较方法，例如 `cv2.HISTCMP_CORREL`（相关性比较）。

```python
# 计算两个图像的直方图
hist1 = cv2.calcHist([image1], [0], None, [256], [0, 256])
hist2 = cv2.calcHist([image2], [0], None, [256], [0, 256])

# 比较直方图
similarity = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
print("Histogram Similarity:", similarity)
```

**直方图的应用**

- 图像增强: 通过直方图均衡化，可以增强图像的对比度，使细节更加清晰。
- 图像分割: 过分析直方图，可以确定阈值，用于图像分割。
- 图像匹配: 通过比较直方图，可以判断两幅图像的相似度，用于图像匹配和检索。
- 颜色分析: 通过颜色直方图，可以分析图像的颜色分布，用于颜色校正和风格化处理。

以下是一个完整的直方图计算和均衡化示例代码：

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# 读取灰度图像
image = cv2.imread("path/to/image", cv2.IMREAD_GRAYSCALE)

# 计算灰度直方图
hist = cv2.calcHist([image], [0], None, [256], [0, 256])

# 绘制直方图
plt.plot(hist)
plt.title("Grayscale Histogram")
plt.xlabel("Pixel Intensity")
plt.ylabel("Pixel Count")
plt.show()

# 直方图均衡化
equalized_image = cv2.equalizeHist(image)

# 显示结果
cv2.imshow("Equalized Image", equalized_image)
cv2.waitKey(0)
cv2.destroyAllWindows()
```



## 2.12视频处理

OpenCV 也支持视频的处理，可以读取视频文件、捕捉视频流并进行实时处理。



