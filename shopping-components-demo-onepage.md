---
project-name: shopping-components-demo
status: active
start-date: 2026-07-13
end-date:
team-size: 1
impact: medium
skills: [视觉设计, ai协作, 参考锚点应用, 品味对齐, 前端实现]
tags: [purchase-decision, killer, landing, demo, component-design]
---

# 购物决策组件 demo — Onepage

## 核心目标 / 为什么

给购物 killer 方向做一版**可视化组件示例**，作为入职后和何塞、木柚讨论"AI 生成的文字层长什么样"的抓手。

**光有想法没物料时讨论是抽象的；有 demo 后能直接进"这里改那里加"的层面。**

## 关键信息

- **场景**：购物决策 —— 潜水运动相机（选品对比 / 榜单 / 单品分析）
- **规格**：393px 手机端多列展示，覆盖三类模式（推荐 / 单品 / 对比）
- **技术**：单文件 HTML + inline CSS，无依赖
- **主色**：绿色系 #34B39D（团队现有产品视觉语汇）
- **部署**：Vercel（`shopping-components-demo`）
- **仓库路径**：`projects/shopping-components-demo/`

## 组件清单

- **富集卡**（分类推荐榜单）：绿色边框 + 排名 + 商品缩略
- **商品卡**（扁平横条）：图 + 名 + 特征 + 星级
- **高亮块**：绿底文字高亮 `.hl`
- **引用块**：红色系用户原声引用
- **对比表**：横向多品参数对比
- **段标题 / 组件标注**：不同类型组件用不同色 tag（rich/card/table/voice/quote/cite/mark/follow/detail）

## 相关工作 · 数据源盘点（2026-07-15）

demo 是"组件长什么样"，2026-07-15 补了一份"组件里的字段从哪来"：

- **购物组件数据源 reddoc**：https://docs.xiaohongshu.com/doc/d2397ae881cbf7dcde37fec060798033
  - 13 个字段按"够用 / 拿到了但不够用 / 完全缺失 / 依赖建设"四层盘点
  - 6 个组件可用性：1 个可用（quote）、2 个半可用（商详、cite）、3 个阻塞（商品卡、富集卡、对比表）
  - 9 条待确认清单
- **点点百宝袋 reddoc**：https://docs.xiaohongshu.com/doc/ce59a90276b53cb56ef9c1394a369ee0
  - 51 个 Eden 工具按 12 类分层 + 场景速查表

**核心结论**：
- wiki（算法侧新建的商品知识库）是多字段的长期首选源，刚开始做
- 原有 `<goods>` 目前仅支持"美妆个护"，需协议扩类目
- 商品图、参数、卖点、类目标签、观点聚合、cite 置信度 全都没有 Eden 工具直接返回

## 关键决策 / 方法论

### ⭐ 从"AI 自由发挥"到"抓团队参考锚点"

**第一版**：cc + frontend-design skill 自己画 → 出来是"通用扁平设计规范" → 和团队现有视觉不一致、"看起来对但不像我们的产品"

**第二版**：透纳发了别的团队做的对话 demo vercel 网页 → 让 cc **照那个风格重做** → 视觉一致、不出戏

**结论**：
- frontend-design skill = 通用美学，不等于"这个团队的美学"
- 给 AI 一个**团队内活样品**比给一堆规则更有效 —— 样品里内嵌了所有隐性视觉约定
- **视觉产出的第一步是找锚点，不是让 AI 自由发挥**

## 快速操作

- 修改组件：编辑 `index.html`（单文件）
- 重新部署：`vercel --prod`（`.vercel/project.json` 已存在）
- 新增组件：仿照现有 `.comp-note.xxx` 命名 + 独立 CSS class

## NEVER 列表

- ❌ 不改主色系（#34B39D 是团队视觉锚点）
- ❌ 不引外部库（保持单文件、便携）
- ❌ 不用 frontend-design skill 的默认输出（会漂）

## 相关链接

- [[daily-logs/2026-07-13]]
- [[projects/2607-landing/landing-onepage]]
- [[colleagues/透纳]]（无意提供了参考锚点）
- [[resume-materials/ShoppingComponentsDemo]]
- [[insights/reference-anchor-over-ai-default]]

---

*状态: active | 影响: medium | 首次部署: 2026-07-13*
