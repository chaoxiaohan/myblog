# Giscus评论系统配置指南

## 1. 什么是Giscus？
Giscus是一个基于GitHub Discussions的评论系统，完全免费，支持多种主题，功能强大且易于配置。

## 2. 配置步骤

### 步骤1：准备GitHub仓库
1. 确保你的GitHub仓库是公开的
2. 在仓库设置中启用Discussions功能：
   - 进入仓库 → Settings → General → Features → 勾选 Discussions

### 步骤2：安装Giscus App
1. 访问：https://github.com/apps/giscus
2. 点击"Install"为你的仓库安装Giscus App
3. 选择要安装的仓库（可以选择特定仓库或所有仓库）

### 步骤3：获取配置参数
1. 访问：https://giscus.app/zh-CN
2. 填写你的仓库信息（用户名/仓库名）
3. 选择页面↔️Discussions映射方式（推荐使用 pathname）
4. 选择Discussion分类（推荐创建一个专门的"评论"分类）
5. 复制生成的配置参数

### 步骤4：配置主题
在 `_config.vivia.yml` 文件中的 `comment.giscus` 部分填入配置：

```yaml
comment:
  giscus:
    enable: true                    # 启用giscus
    repo: "用户名/仓库名"            # 你的仓库
    repo_id: "R_kgDOxxxxxxxx"       # 从giscus.app获取
    category: "Announcements"       # Discussion分类名
    category_id: "DIC_kwDOxxxxxxxx" # 从giscus.app获取
    mapping: pathname               # 映射方式
    strict: 0                       # 严格匹配
    reactions_enabled: 1            # 启用反应
    emit_metadata: 0               # 元数据
    input_position: bottom         # 输入框位置
    theme: preferred_color_scheme  # 主题
    lang: zh-CN                    # 语言
```

## 3. 完整配置示例

```yaml
comment:
  valine:
    enable: false
  twikoo:
    enable: false
  giscus:
    enable: true
    repo: "chaoxiaohan/myblog"
    repo_id: "R_kgDOxxxxxxxx"
    category: "General"
    category_id: "DIC_kwDOxxxxxxxx"
    mapping: pathname
    strict: 0
    reactions_enabled: 1
    emit_metadata: 0
    input_position: bottom
    theme: preferred_color_scheme
    lang: zh-CN
```

## 4. 注意事项
- 确保只启用一个评论系统（将其他评论系统的enable设为false）
- repo_id和category_id必须从giscus.app获取，不能自己编造
- 主题会自动适应网站的明暗模式
- 第一次加载可能需要等待几秒钟

## 5. 主题选项说明
- `light`: 浅色主题
- `dark`: 深色主题
- `dark_dimmed`: 暗淡深色主题
- `transparent_dark`: 透明深色主题
- `preferred_color_scheme`: 跟随系统（推荐）

## 6. 测试
配置完成后，运行：
```bash
hexo clean && hexo g && hexo s
```
然后访问任意一篇文章页面查看评论系统是否正常显示。
