# Content Flow Animator

这是一个对 [Content Architecture](https://www.contentarchitecture.dev) 官网进行视觉与动效复刻的实验性网站项目。项目重点不是业务功能，而是还原原站的版式、滚动节奏、ASCII 字符场、光标交互、悬停揭示、打字机文字、轮播和响应式行为。

## 在线地址

- 当前公开站点：[https://fuckcoding.com/](https://fuckcoding.com/)
- 原始参考站点：[https://www.contentarchitecture.dev](https://www.contentarchitecture.dev)
- GitHub：[https://github.com/NextCandy/content-animator](https://github.com/NextCandy/content-animator)

## 功能与动效

首页包含以下主要区域：

| 区域 | 内容与交互 |
| --- | --- |
| Hero | 深色 ASCII 视觉场、光标闪烁、滚动提示和可点击的字符重排效果 |
| Common Problems | 逐行显现、字符扰动和滚动进入动效 |
| Features | 基于 Canvas 的 Glyph Field；随指针产生局部空洞、字符扰动和点击波纹 |
| The Repo | 仓库 IDE 预览、文件树、README、Minimap 扫描、终端状态栏和标签切换 |
| Showcase | 本地作品截图、ASCII 遮罩、悬停/点击揭示和键盘可操作的卡片 |
| Reviews | 自动滚动的评价条和可暂停的评价轮播 |
| Pricing | 三列价格卡片、悬停高亮、价格字符扰动和状态指示灯 |
| FAQ | 使用 CSS Grid 高度过渡的展开/收起问答 |
| Footer | ASCII 检查框、字符场、链接悬停和深色页脚 |

项目同时保留以下体验约束：

- 桌面端使用粘性区块还原原站的滚动叙事；移动端自动切换为普通流式布局。
- `prefers-reduced-motion` 开启时关闭 Lenis、循环动画和 Canvas 动画，并显示静态内容。
- 导航、按钮、卡片、FAQ 和 Showcase 均支持键盘焦点状态。
- 关键图片和评价头像使用仓库内的本地资源，避免公开站点依赖临时外链。

## 技术栈

- React 19
- TypeScript
- TanStack Start / TanStack Router
- Vite 8
- Tailwind CSS 4
- Motion
- Lenis
- Lucide React
- Nitro Node Server

## 环境要求

- Node.js 20 或更高版本
- npm（项目已提交 `package-lock.json`）
- 如使用 Bun，也可以根据仓库中的 `bun.lock` 安装依赖

## 本地开发

```bash
git clone https://github.com/NextCandy/content-animator.git
cd content-animator
npm ci
npm run dev
```

启动后，以终端输出的本地地址访问。若需要从局域网中的其他设备访问：

```bash
npm run dev -- --host 0.0.0.0
```

常用命令：

```bash
# 开发服务器
npm run dev

# 生产构建
NITRO_PRESET=node-server npm run build

# 预览构建结果
npm run preview

# TypeScript 类型检查
npx tsc --noEmit

# ESLint
npm run lint

# 格式化
npm run format
```

## 生产运行

构建完成后，Node Server 入口位于 `.output/server/index.mjs`：

```bash
NITRO_PRESET=node-server npm run build
NITRO_HOST=0.0.0.0 NITRO_PORT=3100 node .output/server/index.mjs
```

也可以使用 `HOST` 和 `PORT` 环境变量覆盖监听地址和端口：

```bash
HOST=0.0.0.0 PORT=3100 node .output/server/index.mjs
```

`.output/` 是构建产物，已加入 `.gitignore`，不应提交到 Git。每次修改代码后应重新执行生产构建。

## 树莓派部署说明

当前公开站点运行在树莓派上，项目部署约定如下：

| 项目 | 当前值 |
| --- | --- |
| 项目目录 | `/srv/content-animator` |
| systemd 服务 | `content-animator.service` |
| 应用监听 | `0.0.0.0:3100` |
| 公网域名 | `https://fuckcoding.com/` |

FRP 和 OpenResty 的反向代理配置属于树莓派基础设施，不放在本仓库中。修改应用时只调整项目代码和构建产物，避免覆盖其他站点的代理、端口或服务配置。

在树莓派上更新应用的基本流程：

```bash
cd /srv/content-animator
git fetch origin
git checkout main
git pull --ff-only origin main
npm ci
NITRO_PRESET=node-server npm run build
sudo systemctl restart content-animator.service
sudo systemctl is-active content-animator.service
curl -fsS http://127.0.0.1:3100/ >/dev/null
```

排查服务时可使用：

```bash
sudo systemctl status content-animator.service --no-pager
sudo journalctl -u content-animator.service -n 100 --no-pager
ss -lntp | rg ':3100'
curl -I https://fuckcoding.com/
```

如果本机 `3100` 正常而公网不可访问，应继续检查 FRP 会话、OpenResty `proxy_pass` 和域名对应的入口，不要仅通过域名名称猜测实际源站。

## 路由

项目使用 TanStack Router 的文件路由：

| 路径 | 页面 |
| --- | --- |
| `/` | 首页和全部动效区域 |
| `/blog` | Blog 列表 |
| `/blog/:slug` | Blog 文章详情 |
| `/roadmap` | Roadmap |
| `/privacy-policy` | 隐私政策 |
| `/terms-of-service` | 服务条款 |

路由文件位于 `src/routes/`。`src/routeTree.gen.ts` 是自动生成文件，应通过路由构建流程更新，不要手工维护。

## 目录结构

```text
.
├── docs/
│   └── motion-audit.md       # 原站与本项目的动效审计记录
├── public/
│   ├── avatars/              # 评价头像
│   └── showcase/             # Showcase 本地截图
├── src/
│   ├── components/
│   │   ├── motion/            # Canvas、ASCII、滚动和通用动效
│   │   ├── sections/          # 首页各区块
│   │   └── ui/                # 通用 UI 组件
│   ├── lib/site-data.ts       # 站点文案、导航和展示数据
│   ├── routes/                # TanStack 文件路由
│   ├── router.tsx             # Router 配置
│   ├── server.ts              # SSR 错误包装入口
│   └── styles.css             # 全局颜色、字体、动效和响应式样式
├── package.json
├── package-lock.json
├── bun.lock
└── vite.config.ts
```

## 动效实现说明

### Canvas 字符场

`src/components/motion/glyph-field.tsx` 使用 2D Canvas 模拟原站的 Glyph Field：

- 根据容器尺寸和设备像素比绘制字符网格。
- 将字符密度偏向右侧，形成原站类似的视觉重量。
- 指针附近产生局部空洞和字符扰动。
- 点击或键盘激活时触发局部波纹与重新采样。
- 组件进入视口后才持续绘制，离开视口时暂停以降低树莓派负载。

`src/components/motion/ascii-field.tsx` 用于静态图像的 ASCII 遮罩和字符重排，Showcase 的本地图像资源位于 `public/showcase/`。

### 滚动与响应式

`src/components/motion/scroll-container.tsx` 管理 Lenis 滚动容器。大屏幕通过 `sticky`、`svh` 和分段间距实现粘性叙事；小屏幕取消粘性定位和复杂横向布局，保证 375px、390px、768px 等宽度下不产生横向溢出。

更多尺寸、时序、缓动函数和交互选择器见 [`docs/motion-audit.md`](docs/motion-audit.md)。

## 资源与使用说明

`public/showcase/` 和 `public/avatars/` 中的文件用于复刻参考站点的视觉演示。它们随站点一起发布前，请确认相应图片、头像和品牌内容的使用许可。本仓库当前未声明额外的开源许可证，不能仅因代码已公开就推断所有资源均可自由商用。

## 验证清单

提交代码前建议至少执行：

```bash
npx tsc --noEmit
NITRO_PRESET=node-server npm run build
git diff --check
```

变更动效或布局后，还应在桌面端和移动端检查：

1. 首页所有区块能够正常滚动，且没有横向溢出。
2. Features 的指针空洞、点击波纹和降级静态状态正常。
3. Showcase 的悬停、点击、键盘激活和图片加载正常。
4. Reviews 轮播可以前后切换，悬停时暂停。
5. FAQ 可以通过鼠标和键盘展开/收起。
6. `/blog`、`/roadmap`、`/privacy-policy` 和 `/terms-of-service` 可正常访问。
7. 浏览器控制台没有新增错误。

## Git 工作流

该仓库连接 Lovable，推送到 GitHub 的提交会同步到关联项目。提交前请确认工作区只包含当前任务的文件：

```bash
git status -sb
git diff --check
git diff --stat
```

默认分支是 `main`。为了保留已发布历史，不要对已经推送的提交执行 `reset --hard`、rebase、amend、squash 或强制推送。正常更新使用快进或普通新提交：

```bash
git checkout main
git pull --ff-only origin main
git add README.md src public package.json package-lock.json
git commit -m "更新中文项目说明"
git push origin main
```
