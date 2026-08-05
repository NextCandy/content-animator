# 复刻 contentarchitecture.dev（整站 + 动效）

以 Geist / Geist Mono、米色与近黑双色的终端式排版风格，复刻站点结构、英文原文案与滚动动效。

## 站点结构（TanStack 路由）

- `/` 首页（长滚动，含 `#features` `#the-repo` `#showcase` `#pricing` `#faq` 锚点分区）
- `/blog` 文章列表，`/blog/$slug` 文章详情（复刻原站两篇：llms.txt / Sanity 缓存）
- `/roadmap`
- `/privacy-policy`、`/terms-of-service`
- 共享顶部胶囊导航（FEATURES / THE REPO / SHOWCASE / PRICING / FAQ / BLOG）+ 底部状态栏

## 首页分区（按原站顺序）

1. Hero：左米右黑分屏、等宽 eyebrow、超大紧排标题、双段式 GET / ACCESS 按钮
2. 终端 ticker：NEXT 16.x · SANITY v6 · TS: STRICT · AGENTS.MD: LOADED · MCP: 2 SERVERS · DRIFT: 0
3. Common problems：001–011 编号清单 + "ESTIMATED TIME LOST: ~24 HOURS PER PROJECT" 总计行
4. 两段叙事大标题段落
5. Features：编号特性列表（Agent-native、Agent-ready in production、Schema as a system 等），滚动逐条展开
6. The Repo / Studio 展示区
7. Showcase：客户站点网格（Server Robotics、Blink、Muralia、Anuchome 等）
8. Pricing：购买按钮指向原站 Stripe 结账链接
9. FAQ 折叠区
10. Footer：邮箱、外链、法务页链接

## 动效（重点）

- 滚动进场：文本按行/字 mask-reveal，编号列表逐项 stagger 上浮
- Hero 分屏随滚动的宽度/位移视差；标题入场收敛
- Sticky 分区：problems 与 features 列表滚动时行高亮、计数推进
- Ticker 无限横向滚动，hover 暂停
- 按钮双块 hover 位移、磁吸反馈、链接下划线擦除
- 导航胶囊随滚动收缩/模糊；锚点平滑滚动与当前分区高亮
- 数字与状态文本的等宽 scramble/翻牌效果
- 全站尊重 `prefers-reduced-motion`

## 技术方案

- 动效用 Motion for React（`useScroll` / `useTransform` 滚动驱动）+ CSS `sticky` 与 IntersectionObserver
- 在 `__root.tsx` 用 `<link>` 引入 Geist / Geist Mono
- 颜色、字号、圆角、阴影全部作为 oklch 语义 token 写进 `src/styles.css`
- 分区拆成 `src/components/sections/*` 独立组件；博客与 roadmap 内容以本地 TS 数据文件承载（无后端）
- 每个路由单独 `head()` 元数据

## 说明

原站客户案例截图与 Logo 属他人素材，将用风格一致的自生成图片替代；文案照抄英文原文。