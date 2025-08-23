# 移动端警告弹窗功能

## 功能说明

当网站在移动设备上打开时，会自动显示一个弹窗提示：
- 内容：「推荐使用电脑端打开此网站，手机端目录及视频显示可能有问题」
- 提供两个按钮：「下次不再提示」和「好的」
- 如果点击「下次不再提示」，会将设置保存到 localStorage，之后访问不会再显示弹窗
- 支持 ESC 键关闭和点击遮罩层关闭

## 检测逻辑

移动设备检测包含两个条件（满足其一即为移动设备）：
1. User Agent 匹配移动设备模式
2. 屏幕宽度小于等于 768px

## 文件结构

### 主题源文件（用于重新生成网站）：
- `themes/vivia/source/css/mobile-warning.css` - 弹窗样式
- `themes/vivia/source/js/mobile-warning.js` - 弹窗功能脚本
- `themes/vivia/layout/_partial/head.ejs` - 已添加 CSS 引用
- `themes/vivia/layout/layout.ejs` - 已添加 JS 引用

### 生成的公开文件：
- `public/css/mobile-warning.css` - 弹窗样式
- `public/js/mobile-warning.js` - 弹窗功能脚本
- 所有 HTML 文件已添加相应的 CSS 和 JS 引用

### 源文件备份（可选）：
- `source/css/mobile-warning.css` - 弹窗样式备份
- `source/js/mobile-warning.js` - 弹窗功能脚本备份

## 测试文件

- `test-mobile-warning.html` - 测试页面，可以手动触发弹窗和检查状态

## 使用方法

1. 所有文件已经创建并配置完成
2. 在移动设备或缩小浏览器窗口到 768px 以下时自动触发
3. 使用测试页面进行功能验证

## 自定义配置

如需修改弹窗内容或样式，请编辑：
- `mobile-warning.js` 中的弹窗 HTML 内容
- `mobile-warning.css` 中的样式定义

## 注意事项

1. 弹窗会在页面加载后 500ms 显示，避免影响页面加载体验
2. 使用 localStorage 存储用户选择，支持跨页面记忆
3. 完全响应式设计，适配各种屏幕尺寸
4. 支持深色主题和高对比度模式
5. 当重新生成网站时，请确保主题文件中的修改保持完整
