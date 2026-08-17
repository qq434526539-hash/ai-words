# AI Words 产品规划文档

> 版本：v0.1（MVP 规划）｜最后更新：2026-08-02

## 1. 产品功能架构

```
AI Words
├── 1. 用户与账户
│   ├── 未登录体验模式（10 个示例单词 + 本地 localStorage 保存）
│   ├── 注册 / 登录（第三阶段接入 Supabase Auth）
│   ├── 学习目标选择（看懂界面 / 学提示词 / AI 编程 / 技术文档 / Agent / 系统掌握）
│   ├── 每日单词量（5 / 10 / 20）
│   ├── 英语水平（4 档）
│   └── 词库推荐（根据目标+水平自动推荐初始词库）
│
├── 2. 词库系统
│   ├── 7 大 AI 场景词库（基础 / 大模型 / 提示词 / 编程 / Agent / API / 报错）
│   ├── 词库卡片：介绍、单词总数、已学数量、掌握进度、难度
│   └── 词库详情：单词列表 + 学习状态
│
├── 3. 学习引擎（核心）
│   ├── 单词卡片（单词为视觉中心）
│   ├── 音标 + 发音按钮（浏览器 TTS，预留发音 URL 字段）
│   ├── 普通含义 / AI 含义 / 记忆提示 / 例句 / 提示词例句 / 搭配 / 相关词 / 易混词
│   ├── 四档掌握程度（不认识 / 有点印象 / 基本掌握 / 非常熟悉）
│   ├── 简化间隔重复（10 分钟 / 1 天 / 3 天 / 7 天），预留 FSRS 升级接口
│   └── 每日任务：优先复习到期单词 → 再学新词
│
├── 4. 练习引擎
│   ├── 题型一：看英文选中文
│   ├── 题型二：看中文选英文
│   ├── 题型三：AI 场景填空
│   ├── 题型四：判断 AI 含义
│   ├── 答错反馈：正确答案 / 错误原因 / AI 真实含义 / 新例句 / 加入重点复习
│   └── 同一天避免重复出完全相同的题目
│
├── 5. AI 讲解（第四阶段）
│   ├── 7 种解释模式（老师 / 大白话 / 案例 / 类比 / 提示词例句 / 编程例句 / 易混词对比）
│   ├── 服务端调用 OpenAI 兼容接口，密钥不进浏览器
│   └── 未配置 API 时返回本地模拟回答
│
├── 6. 错词本
│   ├── 答错 ≥2 次自动收录
│   ├── 错误次数 / 最近错误时间 / 常错题型 / 掌握程度
│   ├── 按错误次数排序、按分类筛选、标记已掌握、移出
│   └── 一键再练
│
├── 7. 收藏夹
│   ├── 单词收藏 + 自定义收藏夹（如「我常用的提示词」「API 报错词汇」）
│   └── 单词可加入 / 移出收藏夹
│
├── 8. 学习统计
│   ├── 累计/连续学习天数、已学/已掌握/待复习数量
│   ├── 总正确率、最近 7 天学习量（图表）
│   ├── 各词库掌握进度、最薄弱分类、最易错单词
│   └── 简洁图表，不做数据大屏
│
└── 9. 数据层
    ├── 本地模式：localStorage（未登录/未配置 Supabase 时）
    ├── Supabase：users / 学习进度 / 记录 / 收藏 / 统计（第三阶段）
    └── RLS：所有学习数据按用户隔离，跨设备同步
```

## 2. 页面信息架构

```
根路由（App Router）
├── /                    首页：今日任务、连续天数、掌握数、总进度、开始学习、今日 AI 小知识
├── /onboarding          首次学习设置（目标 → 每日数量 → 英语水平 → 推荐词库）
├── /libraries           词库列表
├── /libraries/[id]      词库详情（单词列表 + 进度 + 开始学习）
├── /learn               学习中心（今日新词 / 待复习 / 开始学习 / 开始练习）
├── /learn/session       学习会话（逐词卡片 + 掌握程度选择）
├── /learn/[wordId]      单词详情（完整卡片 + AI 讲解 + 收藏 + 掌握程度）
├── /practice            练习（题型选择 / 来源选择 / 答题与反馈）
├── /wrong               错词本
├── /favorites           收藏夹（文件夹管理）
├── /stats               学习统计
├── /me                  我的（个人资料、入口聚合）
├── /settings            设置（学习目标、水平、每日数量、深色模式、清空数据）
├── /login               登录（第三阶段启用）
├── /register            注册（第三阶段启用）
└── /api/explain         AI 讲解服务端接口（第四阶段，含模拟回退）

导航：移动端底部 5 Tab（首页/词库/学习/错词/我的）
      桌面端左侧边栏（同 5 项 + 设置/统计/收藏）
```

## 3. 用户完整学习流程

```
首次进入
  └─> /onboarding（选目标 → 每日数量 → 水平 → 推荐词库）→ 写入本地/云端
       └─> 首页
            ├─ 查看今日任务（新词 N 个 / 复习 M 个）
            ├─ 点击「开始今日学习」→ /learn/session
            │    ├─ 先复习到期单词（next_review_at ≤ 现在）
            │    ├─ 再学习新词（不超过 daily_target）
            │    ├─ 每词：看卡片 → 点发音 → 选掌握程度 → 进入下一词
            │    └─ 完成页 → 推荐进入「今日练习」
            ├─ 点击「开始练习」→ /practice
            │    ├─ 生成 4 种题型混合练习
            │    ├─ 答题 → 即时反馈（对/错 + 解析）
            │    ├─ 答错 → 可「加入重点复习」；错误 ≥2 次自动进错词本
            │    └─ 练习结束 → 统计本次正确率
            ├─ 单词详情：AI 换种方式解释 / 收藏 / 调整掌握程度
            └─ 次日循环：到期复习优先，新词补足配额
```

## 4. 项目目录结构

```
ai-words/
├── docs/PLANNING.md             # 本规划文档
├── supabase/schema.sql          # 建表 + 索引 + RLS
├── public/                      # 图标、manifest、SW
├── src/
│   ├── app/                     # Next.js App Router 页面
│   │   ├── (auth)/login|register
│   │   ├── api/explain/route.ts # AI 讲解服务端接口
│   │   ├── favorites/  learn/  libraries/  practice/  stats/  wrong/
│   │   ├── me/  settings/  onboarding/
│   │   ├── layout.tsx  globals.css  manifest.ts
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 风格基础组件
│   │   ├── layout/              # AppShell、底部导航、侧边栏、顶栏
│   │   └── features/            # WordCard、QuizView、ProgressRing 等
│   ├── data/
│   │   ├── categories.ts
│   │   └── words/               # 7 个分类的种子词（各 15 词，共 105）
│   │       ├── index.ts
│   │       ├── ai-basics.ts  llm-chatgpt.ts  prompt-engineering.ts
│   │       ├── ai-coding.ts  agent.ts  api-docs.ts  error-messages.ts
│   ├── lib/
│   │   ├── types.ts             # 全部类型定义
│   │   ├── store.ts             # 本地存储状态（localStorage + 订阅）
│   │   ├── srs.ts               # 间隔重复调度
│   │   ├── quiz.ts              # 四类题目生成
│   │   ├── ai.ts                # AI 讲解（客户端封装）
│   │   ├── supabase.ts          # Supabase 客户端（未配置时禁用）
│   │   ├── tips.ts              # 今日 AI 英语小知识
│   │   └── utils.ts             # cn() 等工具
│   └── hooks/use-user.ts        # 用户状态 Hook
├── .env.example  .gitignore
├── next.config.mjs  tsconfig.json  tailwind.config.ts
├── postcss.config.mjs  package.json
└── README.md
```

## 5. 数据库设计（Supabase）

8 张表（详见 `supabase/schema.sql`）：

| 表 | 关键字段 | 说明 |
|---|---|---|
| users | id, email, nickname, english_level, learning_goal, daily_word_target, created_at | 用户，关联 auth.users |
| word_categories | id, name, description, icon, difficulty, sort_order | 7 大词库分类 |
| words | word, phonetic, core_translation, general_meaning, ai_meaning, memory_tip, normal_example(+翻译), ai_example(+翻译), prompt_example, collocations[], related_words[], confused_words[], category_id, difficulty, tags[] | 单词种子数据 |
| user_word_progress | user_id, word_id, familiarity_level, correct_count, wrong_count, last_reviewed_at, next_review_at, review_interval, is_mastered | 每用户每词进度（唯一约束） |
| study_records | user_id, word_id, question_type, user_answer, is_correct, familiarity_level, studied_at | 学习/答题流水 |
| favorites | user_id, word_id, folder_name, created_at | 收藏（含自定义收藏夹） |
| daily_statistics | user_id, study_date, new_words_count, review_words_count, correct_count, wrong_count, study_duration | 每日统计 |

要点：所有表 `user_id` 均配置 RLS 策略 `auth.uid() = user_id`；words/categories 对登录用户只读；`user_word_progress` 加 `(user_id, word_id)` 唯一索引。

## 6. 第一版开发任务清单

**第一阶段：产品原型（本次交付）**
- [x] 项目脚手架（Next.js 14 + TS + Tailwind + shadcn 风格组件）
- [x] 数据层：类型、105 词种子数据、本地存储、SRS、题库
- [x] 响应式布局：移动底部导航 / 桌面侧边栏
- [x] 全部页面 + 页面跳转 + 本地模拟数据完整学习流程

**第二阶段：核心学习功能**
- [ ] 单词卡片 + 掌握程度 + 简化间隔重复
- [ ] 四种练习题 + 答错解析 + 错词自动收录
- [ ] 错词本 + 收藏夹（自定义文件夹）

**第三阶段：账户与数据库**
- [ ] Supabase 建表 / RLS / Auth 接入
- [ ] 进度云端保存 + 多设备同步

**第四阶段：AI 功能**
- [ ] /api/explain 服务端接口（OpenAI 兼容 + 模拟回退）
- [ ] 7 种解释模式 + 失败/额度处理

**第五阶段：完善**
- [ ] 学习统计图表（Recharts）、PWA、深色模式、加载/空/错状态、README

## 7. 需要安装的依赖

运行时：next、react、react-dom、typescript、tailwindcss、postcss、autoprefixer、tailwindcss-animate、class-variance-authority、clsx、tailwind-merge、lucide-react、recharts、sonner、next-themes、@supabase/supabase-js

原则：只用必要依赖，交互组件尽量用原生实现，避免引入重型 UI 库。

## 8. 技术风险与对策

| 风险 | 对策 |
|---|---|
| Supabase / AI 未配置时产品不可用 | 统一「本地模式」：localStorage + 模拟回答，天然可降级 |
| 网络受限、npm 安装失败 | 锁版本、最小依赖集；失败时逐个排查 |
| AI 密钥暴露前端 | 密钥只放服务端 route handler，前端仅传参数 |
| PWA + Next 14 兼容性 | 第五阶段用 manifest + 轻量 SW，避免重型 next-pwa 配置 |
| 浏览器 TTS 差异 | 优先 SpeechSynthesis 通用 API，数据预留 pronunciation_url 备用 |
| 种子数据量大导致代码臃肿 | 按分类拆文件，数据结构简单，便于后续维护 |
| 多设备同步冲突 | 第三阶段用 RLS + 唯一约束 + updated_at 简单冲突策略 |

## 9. MVP 暂缓开发的功能

- 完整 FSRS 算法（预留接口，先上简化版）
- 排行榜 / 社交 / 分享卡片
- 音视频课程、单词游戏（拼写、听写等）
- 会员/付费、第三方登录
- 语音跟读评分、离线词包下载
- 桌面端复杂布局（侧边栏高级分组、快捷键）
- 多语言界面（先只做中文 UI）
- 云端 AI 对话聊天式学习
