# SSH Key Generator 全站 SEO 与 GEO 审计

审阅日期：2026-11-04。覆盖 30 个语言首页、210 篇文章、4 个新增项目说明页面，以及路由、静态输出、元数据、站点地图、robots、PWA 和 llms 文件。

最需要修复的是正文可访问性。线上抽查及原构建逻辑表明，原始 HTML 只含摘要和链接，完整正文依赖 JavaScript；另外一份隐藏摘要产生重复 H1。现已从同一套 React 页面生成完整静态 HTML，保留工具在页面前部的位置和现有客户端交互。

## 保留已有搜索基础

所有原有文章 title、description、publishDate、关键词字段和 URL 均保持不变。所有语言首页 hero.title、hero.subtitle 保持不变，首页标题和描述继续使用原来的生成规则。未添加重定向、批量关键词着陆页或改变文章的主要搜索意图。

180 篇文章实际新增来源或修正事实，因此仅将它们的 modifiedDate 更新为本次修改日期；其余 30 篇文章保留原日期。首页审阅日期来自明确维护的 siteReview.json；sitemap 不再随每次部署虚假刷新全部日期。

## URL 和搜索意图

以下为现有 URL 的内容分工与查询假设，不是搜索量或排名数据。其他语言保留对应的本地化路径，例如简体中文为 /zh-Hans/。

| URL | 主要需求与关键词 | 次要关键词与实体 |
| --- | --- | --- |
| / | 在线生成 SSH 密钥；ssh key generator | generate ssh keys、Ed25519、RSA、GitHub、GitLab |
| /generate-ssh-key/ | 生成密钥的完整操作；generate SSH key | 在线与本机方式、保存私钥、安装公钥 |
| /ssh-keygen/ | 命令用法；ssh-keygen | -t、-b、-C、-f、口令、指纹 |
| /what-is-ssh/ | 协议定义；what is SSH | Secure Shell、传输、认证、远程访问 |
| /what-is-an-ssh-key/ | 密钥与认证原理；what is an SSH key | public key、private key、数字签名、authorized_keys |
| /ssh-command/ | SSH 连接命令；SSH command | -i、端口、隧道、ProxyJump、调试 |
| /how-to-set-up-ssh/ | 平台配置；how to set up SSH | ssh-agent、GitHub、Linux、macOS、Windows |
| /check-vps-ip/ | 登录 VPS 后查询出口 IP；check VPS IP | curl、IPv4、IPv6、网络排障 |

首页和生成指南有相邻意图，但分别承担直接操作与解释工作流；本次保留既有 URL，并通过现有相关指南链接连接页面。未凭关键词拼写差异新增页面。

## 已完成的修复

- 为全部语言首页、文章页和新增项目说明页面输出真实正文。删除隐藏爬虫摘要，消除其重复 H1；异步文章与翻译在静态生成前完成加载。
- 新增 About、Contact、Privacy、Terms，公共页脚均可发现。维护者和联系渠道指向真实 GitHub 项目；隐私说明区分密钥、本地配置、统计、广告和托管请求。
- 文章展示本地化作者署名、发布日期和更新日期，使用 time 元素，并与结构化数据保持一致。首页展示审阅日期和官方参考文档。
- 为 180 篇核心文章增加 450 个相关官方参考链接；另 30 篇 VPS 文章已有 curl 文档链接。引用服务于具体说明，没有为扩展评分机械添加名人引文。
- 修正多语言 SSH 认证中的“加密挑战再解密”错误、Ed25519 安全位数、侧信道绝对化和抗量子错误。首页比较表去除缺少基准的“快 10 倍”和 RSA“所有系统通用”说法。
- 增加顶层 noindex 404.html，按 Cloudflare Pages 的静态路由规则关闭未知路径返回首页的隐式 SPA 行为。
- PWA 导航回退只匹配首页，避免文章或不存在的 URL 被首页覆盖；修正图标及重复 manifest，静态生成后重新计算 SW 缓存版本。
- PWA 安装预缓存排除 210 个指南脚本，避免首次访问就下载全部语言文章；工具相关脚本、翻译、样式和图标继续预缓存。最终清单从 270 项约 5.58 MiB 降为 60 项约 1.56 MiB。
- robots 显式允许 OAI-SearchBot 等搜索与助手抓取代理；保留原本的全站允许策略。
- 统一两份 llms.txt，按工具、7 篇指南及 30 种语言提供真实入口；删除缺少当前证据的 GSC、推荐背书和审计宣称。

## 验证与关键词测量

构建后运行 `pnpm seo:verify`，覆盖全部 244 个可索引 URL：完整 main 正文、单 H1、原有标题描述、canonical、精确的双向 hreflang、结构化数据、可见 FAQ、真实日期、内部链接及锚点、信任链接、404 和最终 SW 的 HTML 版本。`pnpm build`、`pnpm lint` 与 `git diff --check` 也需通过。

浏览器抽查包含英文首页、法文文章、简体中文移动端、About 页面、密钥生成和命令标签。移动端以 390 × 844 检查横向溢出。生成测试只检查输出格式与存在性，不记录私钥内容。

以下关键词密度是文本 QA 指标，不能预测排名。首页测量使用构建后 main 的文本，文章使用 MDX 正文近似值；导航、脚本和 JSON-LD 不计入。关键词族允许自然包含算法名等实体，没有按目标百分比增加重复语句。

| 英文页面 | 词数 | 主关键词次数 | 每百词出现次数 | 关键词族词语覆盖率 |
| --- | ---: | ---: | ---: | ---: |
| / | 1317 | 12 | 0.911 | 6.758% |
| /what-is-ssh/ | 2163 | 1 | 0.046 | 0.786% |
| /what-is-an-ssh-key/ | 2300 | 2 | 0.087 | 7.261% |
| /ssh-command/ | 1577 | 9 | 0.571 | 2.536% |
| /how-to-set-up-ssh/ | 1979 | 2 | 0.101 | 3.588% |
| /generate-ssh-key/ | 391 | 1 | 0.256 | 7.417% |
| /ssh-keygen/ | 263 | 4 | 1.521 | 4.563% |
| /check-vps-ip/ | 454 | 1 | 0.220 | 5.066% |

## 上线后验证与流量衡量

代码和本地输出通过不代表线上已生效。本次未部署。部署后应检查几个语言首页和指南的原始响应、随机不存在 URL 的真实 HTTP 404、robots、sitemap，以及 CDN 或 WAF 是否影响已验证身份的搜索爬虫。本环境对生产站直接请求有过 403 或超时；搜索浏览工具能读取部分页面，不能据此判定 OAI-SearchBot 已通过或被阻止。

Google Search Console 应按语言与页面类型观察展示、点击、索引和查询变化。Google Analytics 已有基础接入；可使用来源 chatgpt.com、chat.openai.com 与 utm_source=chatgpt.com 建立对话搜索流量报告，并与工具实际使用分开衡量。本次已通过只读 API 取得该域名的 GSC 和 GA4 基线，见下一节；不设置没有试验依据的增长保证。

针对“如何生成 GitHub SSH 密钥”“ssh-keygen Ed25519 命令”“SSH 公钥和私钥有什么区别”等非品牌问题，可定期记录真实 AI 搜索回答的日期、问题、引用 URL 和后续会话。普通网页搜索结果不能代替 ChatGPT 引用记录。抓取允许、llms.txt 或结构化数据都不保证被引用。

构建仍提示初始 JS chunk 超过 500 kB，以及 Browserslist 数据较旧；本次没有采集线上 Core Web Vitals，后续应基于字段数据决定是否进一步拆分公共包。与工具无关的全语言文章预下载已单独处理。

## 实际搜索基线

Google Search Console 的最终数据窗口为 2026-10-05 至 2026-11-01，共 28 天，网页搜索合计 5,847 次点击、171,681 次展示、3.41% CTR、平均位置 6.62。首页取得 3,946 次点击，占全站 67.49%，支持本次保留现有标题描述的选择。

| 页面 | Google 点击 | 展示 | 观察 |
| --- | ---: | ---: | --- |
| / | 3946 | 60146 | 主要流量入口，优先保护已有意图 |
| /pt/ | 242 | — | 已有本地化需求 |
| /zh-Hans/ | 225 | — | 已有本地化需求 |
| /es/ | 146 | — | 已有本地化需求 |
| /ssh-command/ | 63 | 9900 | CTR 0.64%，应先按具体查询核对意图与 SERP，再考虑微调 |
| /ssh-keygen/ | 16 | 1483 | 平均位置 10.79，优先观察完整静态正文上线后的变化 |
| /generate-ssh-key/ | 12 | 772 | 平均位置 7.00，保留与直接工具的意图区分 |

查询 ssh key generator 为 506 次点击、1,067 次展示、平均位置 1.19；generate ssh key 为 467 次点击、8,612 次展示、平均位置 2.30。这些位置是日期与查询聚合值，不能等同于每位用户看到的固定排名。

GA4 窗口为 2026-10-07 至 2026-11-03，共 28 个完整日：Google organic 来源为 5,746 个会话；chatgpt.com / ai-assistant 为 4 个会话、4 位活跃用户。该来源报告共返回 42 行。会话属于统计归因结果，并不证明某个具体提问获得了 ChatGPT 引用；GA4 与 GSC 的日期、点击/会话口径和过滤方式不同，不应强行对齐。

后续优先级：上线后先比较技术收录与原有查询的表现，保护首页及葡萄牙语、简体中文、西班牙语入口；英文 /ssh-command/ 展示量高而 CTR 较低，待按 query/page 分析后再决定是否微调摘要或补充实例。ChatGPT 会话目前样本很小，需要更长窗口和真实引用测试，不能从 4 次会话外推稳定增长。

本次对线上首页、/ssh-keygen/、/fr/what-is-ssh/ 的 URL Inspection 均返回已索引、允许抓取及索引、Google 选择的 canonical 与声明一致。这是部署前基线，说明 Google 已能索引现有页面；完整 HTML 修复主要减少对 JavaScript 渲染的依赖，并改善无脚本抓取器可读性。239 个页面行与前 1,000 条查询仅为导出范围，查询受隐私过滤和截断影响。

## 官方依据

- [Google AI 搜索功能与网站](https://developers.google.com/search/docs/appearance/ai-features)：沿用基础 SEO、内容可读性、内部链接和真实结构化数据；没有额外的 AI 专用 schema 或 llms.txt 要求，也不保证收录与展示。
- [Google sitemap 最佳实践](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)：使用 canonical URL 和可靠的 lastmod。
- [Cloudflare Pages 静态路由与 404](https://developers.cloudflare.com/pages/configuration/serving-pages/)：顶层 404.html 控制隐式 SPA fallback。
- [RFC 4252 第 7 节](https://www.rfc-editor.org/rfc/rfc4252.html#section-7)：SSH 公钥认证通过会话相关数据上的数字签名证明身份。
- [RFC 8032](https://www.rfc-editor.org/rfc/rfc8032.html#section-1)：Ed25519 的传统安全强度与量子计算局限。
- [OpenSSH ssh-keygen 手册](https://man.openbsd.org/ssh-keygen)、[GitHub 生成 SSH 密钥](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)：命令、算法、口令与平台行为。

流量数据通过 [ship_gsc 技能](/Users/fechin/.agents/skills/ship_gsc/SKILL.md) 与 [ship_google_analytics 技能](/Users/fechin/.agents/skills/ship_google_analytics/SKILL.md) 的只读 API 获取；账户凭证和完整导出均未加入版本控制。
