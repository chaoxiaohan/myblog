---
title: OpenCv学习笔记-（一）
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

## 1.读取显示图片

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

# 二、基础模块

## **1. Core 模块**

**功能:** 提供 OpenCV 的核心功能，包括基本数据结构、矩阵操作、绘图函数等。

**主要类和函数:**

- **Mat:** OpenCV 中用于存储图像和矩阵的基本数据结构。
- **Scalar:** 用于表示颜色或像素值。
- **Point、Size、Rect:** 用于表示点、尺寸和矩形。
- **基本绘图函数:** `cv.line()`、`cv.circle()`、`cv.rectangle()`、`cv.putText()` 等。

**应用场景:**

- 图像的基本操作（如创建、复制、裁剪）。
- 绘制几何图形和文本。

------

## **2. Imgproc 模块**

**功能:** 提供图像处理功能，包括图像滤波、几何变换、颜色空间转换等。

**主要类和函数:**

- **图像滤波:** `cv.blur()`、`cv.GaussianBlur()`、`cv.medianBlur()` 等。
- **几何变换:** `cv.resize()`、`cv.warpAffine()`、`cv.warpPerspective()` 等。
- **颜色空间转换:** `cv.cvtColor()`（如 BGR 转灰度、BGR 转 HSV）。
- **阈值处理:** `cv.threshold()`、`cv.adaptiveThreshold()`。
- **边缘检测:** `cv.Canny()`、`cv.Sobel()`、`cv.Laplacian()`。

**应用场景:**

- 图像平滑、锐化、边缘检测。
- 图像缩放、旋转、仿射变换。
- 图像二值化、颜色空间转换。

------

## **3. HighGUI 模块**

**功能:** 提供高层 GUI 和媒体 I/O 功能，用于图像的显示和交互。

**主要类和函数:**

- **图像显示:** `cv.imshow()`、`cv.waitKey()`、`cv.destroyAllWindows()`。
- **视频捕获:** `cv.VideoCapture()`、`cv.VideoWriter()`。
- **鼠标和键盘事件:** `cv.setMouseCallback()`。

**应用场景:**

- 显示图像和视频。
- 捕获摄像头或视频文件。
- 处理用户交互（如鼠标点击、键盘输入）。

------

## **4. Video 模块**

**功能:** 提供视频分析功能，包括运动检测、目标跟踪等。

**主要类和函数:**

- **背景减除:** `cv.createBackgroundSubtractorMOG2()`、`cv.createBackgroundSubtractorKNN()`。
- **光流法:** `cv.calcOpticalFlowPyrLK()`。
- **目标跟踪:** `cv.TrackerKCF_create()`、`cv.TrackerMOSSE_create()`。

**应用场景:**

- 视频中的运动检测。
- 目标跟踪（如行人、车辆跟踪）。

------

## **5. Calib3d 模块**

**功能:** 提供相机校准和 3D 重建功能。

**主要类和函数:**

- **相机校准:** `cv.calibrateCamera()`、`cv.findChessboardCorners()`。
- **3D 重建:** `cv.solvePnP()`、`cv.reprojectImageTo3D()`。

**应用场景:**

- 相机标定（用于去除镜头畸变）。
- 3D 重建（如从 2D 图像恢复 3D 信息）。

------

## **6. Features2d 模块**

**功能:** 提供特征检测和描述功能。

**主要类和函数:**

- **特征检测:** `cv.SIFT_create()`、`cv.ORB_create()`、`cv.SURF_create()`。
- **特征匹配:** `cv.BFMatcher()`、`cv.FlannBasedMatcher()`。
- **关键点绘制:** `cv.drawKeypoints()`。

**应用场景:**

- 图像特征提取和匹配。
- 图像拼接、物体识别。

------

## **7. Objdetect 模块**

**功能:** 提供目标检测功能。

**主要类和函数:**

- **Haar 特征分类器:** `cv.CascadeClassifier()`（用于人脸检测）。
- **HOG 特征分类器:** 用于行人检测。

**应用场景:**

- 人脸检测、行人检测。

------

## **8. ML 模块**

**功能:** 提供机器学习算法。

**主要类和函数:**

- **支持向量机 (SVM):** `cv.ml.SVM_create()`。
- **K 均值聚类 (K-Means):** `cv.kmeans()`。
- **神经网络 (ANN):** `cv.ml.ANN_MLP_create()`。

**应用场景:**

- 图像分类、聚类分析。

------

## **9. DNN 模块**

**功能:** 提供深度学习功能，支持加载和运行预训练的深度学习模型。

**主要类和函数:**

- **模型加载:** `cv.dnn.readNetFromCaffe()`、`cv.dnn.readNetFromTensorflow()`。
- **前向传播:** `net.forward()`。

**应用场景:**

- 图像分类、目标检测、语义分割。

------

## **10. 其他模块**

- **Flann:** 快速近似最近邻搜索。
- **Photo:** 图像修复和去噪。
- **Stitching:** 图像拼接。
- **Shape:** 形状匹配和距离计算。

# 三、图像处理基础

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

## 1.图像基本操作

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

## 2.图像算术运算

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



**、图像混合**

```
result = cv2.addWeighted(image1, alpha, image2, beta, gamma)
```

**alpha** 和 **beta** 是权重，**gamma** 是标量值。

## 3.图像阈值处理

**1、简单阈值处理**

```
ret, thresholded_image = cv2.threshold(image, thresh, maxval, cv2.THRESH_BINARY)
```

**thresh** 是阈值，**maxval** 是最大值。

**2、自适应阈值处理**

```
thresholded_image = cv2.adaptiveThreshold(image, maxval, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, block_size, C)
```

**3、Otsu's 二值化**

```
ret, thresholded_image = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
```

## 4.图像平滑处理

**1、均值滤波**

```
blurred_image = cv2.blur(image, (kernel_size, kernel_size))
```

**2、高斯滤波**

```
blurred_image = cv2.GaussianBlur(image, (kernel_size, kernel_size), sigmaX)
```

**3、中值滤波**

```
blurred_image = cv2.medianBlur(image, kernel_size)
```

**4、双边滤波**

```
blurred_image = cv2.bilateralFilter(image, d, sigmaColor, sigmaSpace)
```

## 5.图像的颜色空间与转换

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

## 6.图像的大小调整与裁剪

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

## 7.图像平滑与去噪（模糊处理）

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

## 8.图像边缘检测

边缘检测是一种常用的图像处理技术，用于检测图像中的边缘，最常用的方法是 Canny 边缘检测。

**Canny 边缘检测：**

```
edges = cv2.Canny(img, 100, 200)
```

Canny 算法通过对图像进行梯度计算来找出边缘，返回一个二值图像，边缘处为白色，其他区域为黑色。

**Sobel 算子：**

```
sobel_x = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=5)
sobel_y = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=5)
```

**Laplacian 算子：**

```
laplacian = cv2.Laplacian(image, cv2.CV_64F)
```

## 9.形态学操作

形态学操作常用于二值图像的处理，常见的操作有腐蚀、膨胀、开运算、闭运算等。

**腐蚀（Erosion）：**将图像中的白色区域收缩。

```
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
eroded_img = cv2.erode(img, kernel, iterations=1)
```

**膨胀（Dilation）：**将图像中的白色区域扩展。

```
dilated_img = cv2.dilate(img, kernel, iterations=1)
```

**开运算与闭运算：**

- 开运算（先腐蚀再膨胀）：用于去除小物体。
- 闭运算（先膨胀再腐蚀）：用于填补图像中的小孔洞。

```
opening_img = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)
closing_img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)
```

## 10.图像轮廓检测

OpenCV 提供了强大的轮廓检测功能，可以用于对象识别、图像分割等应用。

检测轮廓：

```
gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, threshold_img = cv2.threshold(gray_img, 127, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(threshold_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
```

绘制轮廓：

```
cv2.drawContours(img, contours, -1, (0, 255, 0), 3)
```

## 11.视频处理

OpenCV 也支持视频的处理，可以读取视频文件、捕捉视频流并进行实时处理。

读取视频：

```python
cap = cv2.VideoCapture('video.mp4')
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    # 处理每一帧
    cv2.imshow('Video', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
cap.release()
cv2.destroyAllWindows()
```

