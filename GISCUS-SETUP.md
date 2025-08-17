# Vivia主题 Giscus评论系统使用指南

## ✅ 安装完成

恭喜！我已经成功为您的Vivia主题添加了Giscus评论系统支持。现在您可以按照以下步骤来启用它。

## 🚀 快速启用步骤

### 1. 准备GitHub仓库
- 确保您的 `chaoxiaohan/myblog` 仓库是**公开的**
- 在仓库设置中启用**Discussions**功能

### 2. 安装Giscus App
1. 访问：https://github.com/apps/giscus
2. 点击 "Install" 按钮
3. 选择安装到 `chaoxiaohan/myblog` 仓库

### 3. 获取配置参数
1. 访问：https://giscus.app/zh-CN
2. 在 "仓库" 部分输入：`chaoxiaohan/myblog`
3. 选择页面映射方式（推荐：**路径名**）
4. 选择Discussion分类（推荐：**General** 或新建一个 **Comments** 分类）
5. 复制生成的配置代码中的参数

### 4. 配置主题
在您的 `_config.vivia.yml` 文件中找到 `comment.giscus` 部分，修改如下：

```yaml
comment:
  # 关闭其他评论系统
  valine:
    enable: false
  twikoo:
    enable: false
  
  # 启用 Giscus
  giscus:
    enable: true                           # 改为 true
    repo: chaoxiaohan/myblog              # 已设置
    repo_id: "R_kgDO你的仓库ID"            # 从giscus.app复制
    category: General                      # 已设置，可修改
    category_id: "DIC_kwDO你的分类ID"      # 从giscus.app复制
    mapping: pathname                      # 已设置
    strict: 0                             # 已设置
    reactions_enabled: 1                  # 已设置
    emit_metadata: 0                      # 已设置
    input_position: bottom                # 已设置
    theme: preferred_color_scheme         # 已设置
    lang: zh-CN                           # 已设置
```

### 5. 测试评论系统
```bash
hexo clean && hexo g && hexo s
```

然后访问任意一篇文章页面，您应该可以看到Giscus评论组件。

## 🎨 主题选项说明

| 选项 | 说明 |
|------|------|
| `light` | 浅色主题 |
| `dark` | 深色主题 |
| `dark_dimmed` | GitHub深色暗淡主题 |
| `transparent_dark` | 透明深色主题 |
| `preferred_color_scheme` | 跟随系统主题（推荐） |

## 🔧 高级配置

### 映射方式选择
- `pathname`：使用页面路径（推荐）
- `url`：使用完整URL
- `title`：使用页面标题
- `og:title`：使用Open Graph标题

### 输入框位置
- `top`：评论输入框在顶部
- `bottom`：评论输入框在底部（推荐）

## 📖 示例配置

以下是一个完整的工作示例：

```yaml
comment:
  giscus:
    enable: true
    repo: "chaoxiaohan/myblog"
    repo_id: "R_kgDOH1234567"
    category: "General"
    category_id: "DIC_kwDOH1234567"
    mapping: pathname
    strict: 0
    reactions_enabled: 1
    emit_metadata: 0
    input_position: bottom
    theme: preferred_color_scheme
    lang: zh-CN
```

## 🔍 故障排除

### 评论不显示？
1. 检查仓库是否公开
2. 确认Discussions功能已启用
3. 验证repo_id和category_id是否正确
4. 检查Giscus App是否已安装

### 主题不匹配？
- 使用 `preferred_color_scheme` 让评论系统自动适应网站主题

### 语言设置
- 中文：`zh-CN`
- 英文：`en`
- 日文：`ja`

## 🎉 享受评论功能

现在您的博客已经支持Giscus评论系统！访客可以：
- 使用GitHub账户登录评论
- 点赞/反对评论
- 回复其他用户
- 使用Emoji反应

所有评论数据都存储在GitHub Discussions中，完全免费且可靠。
