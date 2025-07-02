# GitHub 文件加速器 🚀

一个基于 Cloudflare Workers 构建的 GitHub 文件加速服务。旨在解决国内访问 GitHub 文件（如 releases、archive、raw 文件）速度慢的问题。

通过本服务，您可以：

* 直接加速下载 GitHub Releases 和 Archive 包。
* 加速访问 GitHub Raw 文件（例如 `blob` 文件的原始内容）。
* 配置 `git clone` 代理，提升代码克隆速度。
* 配置 `npm`/`yarn` 代理，加速前端依赖安装。

## 🌐 在线体验

本服务已部署于：`https://proxy.frp.gs/`

## ✨ 功能特性

* **极速下载：** 利用 Cloudflare 全球 CDN 网络，加速 GitHub 文件传输。
* **兼容性广：** 支持 `releases`、`archive` 和 `raw` 文件链接。
* **智能跳转：** 对于 `release` 和 `archive` 类型的文件，自动跳转至 JsDelivr CDN 进行二次加速。
* **Git / NPM 代理：** 方便命令行工具的加速配置。
* **轻量高效：** 基于 Cloudflare Workers，无需服务器，成本低廉，部署方便。

## 🚀 部署指南

您可以将此 Worker 部署到您的 Cloudflare 账户。

### 前置条件

1. 一个 Cloudflare 账户。
2. 一个绑定到 Cloudflare 的域名 (可选，但推荐用于自定义域名，如 `proxy.frp.gs`)。

### 部署步骤

1. **登录 Cloudflare 控制台：** 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. **创建 Worker：**
    * 在左侧导航栏选择 **"Workers 和 Pages"**。
    * 点击 **"创建应用程序"**，然后选择 **"创建 Worker"**。
    * 给您的 Worker 起一个名称（例如 `github-proxy`），然后点击 **"部署"**。
3. **编辑 Worker 代码：**
    * 部署成功后，点击 **"编辑代码"**。
    * 将本文档提供的完整 Worker JavaScript 代码（包含内联 HTML 的那部分）复制并粘贴到编辑器中，替换掉默认的代码。
    * 点击 **"保存并部署"**。
4. **绑定自定义域名 (可选，但推荐):**
    * 回到您的 Worker 概览页面，点击 **"触发器"** 选项卡。
    * 在 "自定义域" 部分，点击 **"添加自定义域"**。
    * 输入您的域名（例如 `proxy.frp.gs`），按照提示完成域名验证和 DNS 配置。
    * **重要：** 如果您绑定了自定义域名，请确保您的 DNS 配置中 `proxy.frp.gs` 指向了您的 Worker。

## 💡 使用方法

### 网页界面加速下载

1. 访问您部署的 Worker 域名，例如：`https://proxy.frp.gs/`
2. 从 GitHub 页面复制您想要加速的文件链接，例如：
    * `https://github.com/torvalds/linux/archive/refs/tags/v6.9.zip` (Releases / Archive)
    * `https://github.com/microsoft/vscode/blob/main/README.md` (Raw 文件)
3. 将复制的链接粘贴到页面上方的输入框中。
4. 点击“下载”按钮，文件将通过本加速服务进行传输或跳转至CDN。

> **注意：** 本服务不支持加速整个项目文件夹（即通过 GitHub 网页直接下载整个仓库），请下载特定文件或归档。

### Git Clone / NPM / Yarn 代理

您可以通过配置代理来加速 `git clone`、`npm` 或 `yarn` 等命令行工具的下载。

请将以下示例中的 `proxy.frp.gs` 替换为您实际部署的 Cloudflare Worker 域名。

#### Git Clone 加速

在您的终端中运行以下命令：

```bash
git config --global http.proxy [https://proxy.frp.gs](https://proxy.frp.gs)
git config --global https.proxy [https://proxy.frp.gs](https://proxy.frp.gs)
