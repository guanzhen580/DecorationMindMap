# 装修思维导图项目 - CloudFlare部署指南

## CloudFlare部署指南

本指南提供将装饰装修思维导图应用部署到CloudFlare Pages和Workers平台的详细步骤。

### 项目结构概览

- **前端**: React + Vite (使用CloudFlare Pages部署)
- **后端**: Express + MySQL (需要部署到支持Node.js的环境)
- **API代理**: CloudFlare Worker (用于处理API请求转发和跨域问题)

## 部署方案

### 前端部署（CloudFlare Pages）

#### 准备工作

1. **创建CloudFlare账户**：
   - 访问 [CloudFlare官网](https://www.cloudflare.com/) 并注册账户
   - 登录后，在控制面板中选择 "Pages" 服务

2. **连接GitHub仓库**：
   - 点击 "创建项目" 或 "Create a project"
   - 选择 "连接到Git" 选项
   - 授权CloudFlare访问您的GitHub账户
   - 选择包含本项目的仓库

3. **配置构建设置**：
   - **框架预设**：选择 "Vite"
   - **构建命令**：`npm run build:cloudflare`
   - **构建输出目录**：`dist`
   - **环境变量**（可选）：根据需要配置环境变量

### API代理部署 (CloudFlare Worker)

1. **Worker配置文件**
   - 项目已包含`wrangler.toml`配置文件，设置了正确的Worker名称和兼容性日期
   - 主要配置项:
     - `name = "decorationmindmap"`: Worker名称
     - `compatibility_date = "2025-11-28"`: 兼容性日期
     - `BACKEND_API_URL`: 后端API地址环境变量

2. **部署Worker**
   - 安装Wrangler CLI: `npm install -g wrangler`
   - 登录CloudFlare: `wrangler login`
   - 部署Worker: `wrangler deploy`
   - 或者通过CloudFlare仪表板部署

3. **配置环境变量**
   - 在部署后，需要在CloudFlare仪表板中设置`BACKEND_API_URL`环境变量
   - 指向您实际部署的后端API地址

#### 配置步骤

1. **添加构建脚本**：

   在 `package.json` 中添加CloudFlare专用构建脚本：

   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "build:cloudflare": "vite build --config vite.config.cloudflare.js",
     "lint": "eslint .",
     "preview": "vite preview"
   }
   ```

2. **环境变量设置**：

   在CloudFlare Pages项目的设置中，添加以下环境变量：
   - `VITE_API_URL`：您的后端API服务地址
   - `NODE_VERSION`：推荐设置为 `18` 或更高版本

3. **部署触发**：
   - 配置为在推送到特定分支（如`main`或`deploy`）时自动部署
   - 或手动触发部署

### 后端部署选项

由于项目使用MySQL数据库和Express后端，有以下几种部署方案：

#### 选项1：使用CloudFlare Workers + Pages Functions (推荐)

1. **使用已配置的Worker作为API代理**：
   - 已设置好的Worker将处理API请求转发和跨域问题
   - 后端API可部署到任何支持Node.js的环境
   - 通过环境变量`BACKEND_API_URL`配置后端地址

2. **将Express后端转换为Worker**（可选）：
   - 使用 `wrangler` 工具初始化项目
   - 重构Express代码以适配Worker环境
   - 使用CloudFlare D1或其他支持的数据库替代MySQL

3. **部署Worker**：
   - 使用 `wrangler publish` 命令部署
   - 配置Worker环境变量

#### 选项2：使用传统云服务器

1. **选择云服务提供商**：
   - AWS、Azure、GCP、阿里云等
   - 或使用VPS服务如DigitalOcean、Vultr等

2. **设置服务器**：
   - 安装Node.js、npm、MySQL
   - 配置防火墙和安全组

3. **部署后端**：
   - 上传后端代码
   - 安装依赖：`npm install`
   - 配置数据库：导入 `server/init_db.sql`
   - 启动服务：使用PM2管理进程

4. **配置API地址**：
   - 在前端配置中更新API地址为服务器公网IP或域名

#### 选项3：使用托管数据库服务

1. **选择托管MySQL服务**：
   - AWS RDS、Google Cloud SQL、Azure Database for MySQL
   - 或第三方服务如PlanetScale、Supabase等

2. **配置数据库**：
   - 创建数据库实例
   - 导入 `server/init_db.sql`

3. **更新后端配置**：
   - 修改环境变量，指向托管数据库
   - 部署后端代码到任何支持Node.js的平台

## 部署后的配置

1. **域名配置**：
   - 在CloudFlare中设置自定义域名
   - 配置SSL证书

2. **API地址配置**：
   - 前端API客户端会自动根据环境判断API地址
   - 确保Worker的`BACKEND_API_URL`环境变量指向正确的后端地址

3. **更新Worker配置**
   - 如需修改Worker配置，更新`wrangler.toml`文件
   - 重新部署Worker: `wrangler deploy`

4. **CORS设置**：
   - 已配置Worker自动处理CORS问题，添加必要的响应头

5. **性能优化**：
   - 启用CloudFlare缓存
   - 配置图片优化

## 注意事项

1. **环境变量管理**：
   - 敏感信息（如数据库密码）应通过环境变量管理
   - 不要将.env文件提交到版本控制系统

2. **数据库迁移**：
   - 确保生产环境数据库结构与开发环境一致
   - 考虑使用数据库迁移工具管理模式变更

3. **API安全**：
   - 实施适当的认证和授权机制
   - 考虑使用CloudFlare Access增强安全性

4. **监控与日志**：
   - 设置日志收集和监控
   - 配置错误告警

5. **Worker配置**
   - 确保Worker名称与wrangler.toml中配置的一致
   - 保持compatibility_date为最新值以获得最佳性能

## 故障排除

1. **构建失败**：
   - 检查依赖安装是否成功
   - 验证构建命令是否正确
   - 查看构建日志中的错误信息

2. **API连接问题**：
   - 确认后端服务正常运行
   - 检查CORS配置是否正确
   - 验证API地址和端口设置

3. **数据库连接错误**：
   - 检查数据库凭据是否正确
   - 确认数据库服务可访问
   - 验证数据库权限设置

---

通过以上步骤，您可以成功将装修思维导图项目部署到CloudFlare Pages和适当的后端服务中。根据您的具体需求和技术环境，选择最合适的部署方案。