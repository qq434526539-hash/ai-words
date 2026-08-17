# AI Words

> 专注 AI 场景英语词汇的背单词应用：提示词、大模型、AI 编程、Agent、API 文档与报错信息。

不是普通背单词软件——每个单词都来自 AI 真实使用场景，配有普通含义、AI 领域含义、真实提示词例句，学完就能在 ChatGPT / Claude / Cursor / Codex 里用起来。

## 功能

- 7 大 AI 场景词库，内置 105 个种子单词（可按分类扩充）
- 首次学习引导：学习目标 / 每日数量 / 英语水平 → 自动推荐词库
- 学习卡片：音标、发音、普通含义、AI 含义、AI 例句、提示词例句、常见搭配、相关/易混词、记忆提示
- 四档掌握程度 + 简化间隔重复（10 分钟 / 1 天 / 3 天 / 7 天，预留 FSRS 升级接口）
- 四种练习题型：看英选中 / 看中选英 / AI 场景填空 / 判断 AI 含义；答错即展示解析并可加入重点复习
- 错词本（答错自动收录、排序、筛选、标记掌握）
- 收藏夹（支持自定义收藏夹）
- 学习统计：连续天数、正确率、最近 7 天图表、词库进度、薄弱分类、最易错词
- AI 讲解：7 种解释模式（老师 / 大白话 / 案例 / 类比 / 提示词例句 / 编程例句 / 易混词对比）
- 响应式布局：移动端底部导航 + 桌面侧边栏；浅色 / 深色模式；PWA 可安装
- **未配置 Supabase / AI 接口时，使用本地 localStorage 与模拟数据，产品完整可用**

## 技术栈

- Next.js 14（App Router）+ TypeScript + Tailwind CSS
- shadcn/ui 风格组件（仅依赖 cva / clsx / tailwind-merge，交互组件使用原生实现，避免重型依赖）
- Supabase（Auth + Postgres + RLS，`supabase/schema.sql`）
- Recharts（统计图表）· Lucide Icons · next-themes · sonner
- 状态管理：React `useSyncExternalStore` + localStorage（轻量方案）

## 本地运行

```bash
cd ai-words
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

打开 http://localhost:3000

> 不配置任何环境变量也能跑：数据存本地，AI 讲解用预设模拟回答。

## 环境变量

见 `.env.example`：

| 变量 | 说明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase（第三阶段接入；未配置则本地模式） |
| `OPENAI_API_KEY` | OpenAI 兼容 API 密钥（**仅服务端使用**，绝不进前端） |
| `OPENAI_BASE_URL` | 可换 DeepSeek / OpenRouter / Ollama 等兼容服务 |
| `OPENAI_MODEL` | 默认 `gpt-4o-mini` |

> ⚠️ `NEXT_PUBLIC_` 前缀变量会暴露给浏览器；`OPENAI_API_KEY` 只能存在于服务端环境。

## 接入 Supabase

1. 在 [supabase.com](https://supabase.com) 创建项目
2. 打开 SQL Editor，执行 `supabase/schema.sql`（建表 + 索引 + RLS + 注册触发器）
3. 将种子数据写入数据库（可运行项目后由服务端脚本导入，或按 `src/data/words` 结构自行导入）
4. 配置 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 后部署/重启

## 接入 AI 讲解

在服务端配置 `OPENAI_API_KEY`（及可选的 `OPENAI_BASE_URL`、`OPENAI_MODEL`）。请求会走 `/api/explain`，密钥不会出现在浏览器中；调用失败或未配置时自动降级为本地模拟讲解。

## 部署到 Vercel

1. 将代码推送到 GitHub
2. Vercel 中 Import 该仓库，Framework 选择 Next.js
3. 在 Environment Variables 中粘贴上述变量（`OPENAI_API_KEY` 等）
4. Deploy

## 目录结构

```
src/
├── app/            # 页面与 API 路由
├── components/     # ui 基础组件 + layout + features
├── data/words/     # 105 个种子单词（按 7 个分类拆分）
├── hooks/          # use-app-state
└── lib/            # store / srs / quiz / plan / ai / types
supabase/schema.sql # 数据库脚本
docs/PLANNING.md    # 产品规划文档
```

## 开发阶段

1. ✅ 产品原型（布局 / 页面 / 本地数据 / 完整学习流程）
2. ✅ 核心学习功能（单词卡 / 四题型 / 掌握程度 / 间隔重复 / 错词本 / 收藏）
3. 🔜 账户与数据库（Supabase 接入，脚本已就绪）
4. 🔜 AI 功能（服务端接口与模拟回退已实现，配置密钥即启用）
5. 🔜 完善（统计已实现；PWA 基础已配置）

## 脚本

```bash
npm run dev        # 开发
npm run build      # 生产构建
npm run start      # 生产运行
npm run typecheck  # TS 类型检查
```
