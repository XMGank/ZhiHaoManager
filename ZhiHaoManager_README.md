# 智耗管家（ZhiHaoManager）

> 振武医院耗材筛选统计系统

智耗管家是一套面向医院卫材进销存明细的轻量化统计工具。程序可批量读取 Excel 或 CSV 文件，按月份、卫材名称、规格和批号汇总入库、发药、退药及累计盈余，生成浏览器交互式看板，并通过可选的 AI Agent 分析库存覆盖、断供风险、积压迹象和补货建议。

## 本版 Agent 更新

本版新增并强化了以下能力：

- 桌面端增加“启用Agent”和“API-Key”输入项
- 桌面程序在本机启动 Agent 桥接服务：`http://127.0.0.1:8787/analyze`
- API Key 由桌面端保管，不写入看板数据或 `AgentSettings.js`
- 看板生成实际盈余、周期消耗、日均消耗和预计可用天数等结构化指标
- Agent 分析覆盖全局台账与单品趋势两个范围
- 识别已透支/已耗尽、预计短期耗尽和低消耗高盈余等异常
- 输出实际盈余复述、总体判断、趋势分析、风险描述及采购、调拨、清库或复核建议
- 对模型返回的嵌套 JSON、代码块 JSON 和常见文本字段进行兼容解析

> Agent 结论仅用于业务筛查和辅助决策，不替代账实核验、安全库存制度、采购审批或临床判断。

## 主要功能

- 支持拖拽或选择多个 `.xls`、`.xlsx`、`.csv` 文件
- 合并多文件数据并生成月度统计结果
- 按卫材名称、日期区间、规格和批号筛选
- 支持显示或合并批号，以及按规格排序
- 导出 Excel 兼容工作簿或 CSV 文件
- 展示入库、发药、退药、盈余及明细组合数量
- 生成月度流转柱状图和盈余趋势折线图
- 未启用 Agent 时执行本地规则分析
- 启用 Agent 后执行盈余、消耗趋势、断供风险、库存积压和补货分析

## 工作流程

```text
Excel / CSV 明细
        │
        ▼
ZhiHaoManager.exe
  ├─ 解析、清洗和月度汇总
  ├─ 生成 DashboardData.js
  ├─ 保存不含 API Key 的 AgentSettings.js
  └─ 启动本机 Agent 桥接服务（启用 Agent 时）
        │
        ▼
Dashboard.html
  ├─ 台账、指标和图表
  ├─ 计算 Agent 结构化输入
  └─ POST http://127.0.0.1:8787/analyze
        │
        ▼
桌面端本地桥接服务
        │
        ▼
AgentSettings.js 中配置的模型服务
```

## 目录结构

```text
ZhiHaoManager/
├─ ZhiHaoManager.exe   # Windows 桌面上传、分析、导出和 Agent 桥接程序
├─ Dashboard.html      # 浏览器数据看板及 Agent 展示逻辑
├─ AgentSettings.js    # Agent 服务、模型和超时配置；不保存 API Key
├─ DashboardData.js    # 点击“分析”后自动生成，初始程序包中不存在
├─ README.md           # 中文说明
└─ README_EN.md        # English documentation
```

请保持 `ZhiHaoManager.exe`、`Dashboard.html` 和 `AgentSettings.js` 位于同一目录。不要直接在压缩包内运行程序，也不要单独移动或删除上述文件。

## 运行环境

- Windows 操作系统
- .NET Framework 4.x 运行环境
- 推荐使用 Microsoft Edge 或 Google Chrome 打开看板
- 读取 Excel 文件时，计算机至少需要具备以下条件之一：
  - 已安装 Microsoft Excel；或
  - 已安装 Microsoft Access Database Engine（ACE OLE DB）
- CSV 文件不依赖 Excel，但应使用 UTF-8 编码
- 图表使用 ECharts 5.5.0 CDN：无网络时明细表和统计值仍可显示，但图表可能无法加载
- 使用外部 Agent 时，还需要：
  - 可访问所配置模型服务的网络
  - 有效的 API Key
  - 本机端口 `8787` 未被其他程序占用

## 快速开始

### 基础分析

1. 解压整个程序目录。
2. 双击 `ZhiHaoManager.exe`。
3. 将一个或多个卫材进销存文件拖入上传区域，或点击“选择文件”。
4. 根据需要设置：
   - 导出卫材
   - 导出开始日期和结束日期
   - 是否显示批号
   - 是否按规格排序
5. 点击“分析”：
   - 程序汇总全部已选择文件；
   - 在程序目录生成或覆盖 `DashboardData.js`；
   - 根据当前 Agent 设置更新 `AgentSettings.js`；
   - 自动使用系统默认浏览器打开 `Dashboard.html`。
6. 点击“导出 Excel 表格”，可将当前桌面端筛选结果保存为 `.xls` 或 `.csv`。

### 启用 Agent

1. 在桌面程序中勾选“启用Agent”。
2. 在“API-Key”输入框中填写有效密钥，或提前设置环境变量 `QNAIGC_API_KEY`。
3. 点击“分析”。
4. **保持 `ZhiHaoManager.exe` 处于打开状态**，再在浏览器中查看 Agent 结果。

程序只有在“启用Agent”已勾选且能够解析到 API Key 时才会启动本机桥接服务。缺少 Key 时，程序会停用外部 Agent，并在状态栏显示提示。

## API Key 配置

### 方法一：桌面程序临时输入

直接在“API-Key”输入框填写密钥。该方式适合临时使用：

- Key 仅保存在当前程序进程的内存中
- 程序写回 `AgentSettings.js` 时会将 `apiKey` 保持为空字符串
- 关闭程序后，下次运行通常需要重新输入

### 方法二：Windows 环境变量

推荐在固定工作站使用环境变量。程序按以下顺序读取：

1. `QNAIGC_API_KEY`
2. `OPENAI_API_KEY`（兼容回退）

CMD 当前会话：

```bat
set QNAIGC_API_KEY=your_api_key_here
ZhiHaoManager.exe
```

CMD 持久设置：

```bat
setx QNAIGC_API_KEY "your_api_key_here"
```

PowerShell 持久设置：

```powershell
[Environment]::SetEnvironmentVariable(
  "QNAIGC_API_KEY",
  "your_api_key_here",
  "User"
)
```

使用 `setx` 或 PowerShell 持久设置后，需要关闭并重新启动桌面程序。不要在截图、日志、README、公开仓库或共享脚本中填写真实 Key。

## 输入数据格式

### 重要说明

程序按**固定列位置**读取数据，并非根据任意表头自动匹配字段。输入表应至少保留 A—L 共 12 列，关键字段位置如下。

| Excel 列 | 列序号 | 用途 | 示例 |
|---|---:|---|---|
| A | 1 | 未使用，可保留原始字段 | 序号 |
| B | 2 | 业务或流转类型 | 入库、发药、退药、消耗 |
| C | 3 | 未使用，可保留原始字段 | — |
| D | 4 | 未使用，可保留原始字段 | — |
| E | 5 | 卫材名称 | 一次性使用输液器 |
| F | 6 | 规格 | 0.7 mm |
| G | 7 | 业务日期 | 2026-07-01 |
| H | 8 | 数量 | 120 |
| I | 9 | 未使用，可保留原始字段 | — |
| J | 10 | 未使用，可保留原始字段 | — |
| K | 11 | 未使用，可保留原始字段 | — |
| L | 12 | 批号 | 20260701A |

推荐的最小示例：

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---:|---|---|---|---|
| 序号 | 业务类型 |  |  | 名称 | 规格 | 日期 | 数量 |  |  |  | 批号 |
| 1 | 入库 |  |  | 一次性使用输液器 | 0.7 mm | 2026-07-01 | 120 |  |  |  | 20260701A |
| 2 | 发药 |  |  | 一次性使用输液器 | 0.7 mm | 2026-07-10 | 30 |  |  |  | 20260701A |
| 3 | 退药 |  |  | 一次性使用输液器 | 0.7 mm | 2026-07-15 | 5 |  |  |  | 20260701A |

### 表头识别

- 程序检查前 25 行，优先将同时包含“名称”“规格”“批号”的行识别为表头。
- 数据从识别到的表头下一行开始读取。
- 建议将表头放在前 4 行内，并保留上述三个中文字段名称。
- Excel 文件仅读取第一个可用工作表；请将待分析明细放在第一个工作表中。

### 业务类型识别

程序按以下优先级识别 B 列：

1. 包含“退” → 退药
2. 包含“入” → 入库
3. 包含“发”或“消耗” → 发药
4. 无明确文字时：数量为负数 → 发药；数量为非负数 → 入库

汇总时使用数量的绝对值。数量为 0、日期无效或关键识别字段全部为空的记录会被跳过。

### 日期格式

支持 Excel 原生日期、Excel 日期序列值及常见文本格式，包括：

```text
yyyy-MM-dd
yyyy/M/d
yyyy/MM/dd
yyyyMMdd
yyyy-MM-dd HH:mm:ss
yyyy/M/d H:mm:ss
yyyy/MM/dd HH:mm:ss
```

### CSV 要求

- 文件编码：UTF-8
- 分隔符：英文逗号 `,`
- 支持使用双引号包裹含逗号的字段
- 字段列位应与上方 A—L 结构一致

## 统计口径

数据按“月份 + 卫材名称 + 规格 + 批号”汇总：

```text
月度净变动 = 入库数量 - 发药数量 + 退药数量
累计盈余 = 上月累计盈余 + 本月净变动
```

程序会在全部数据的最早月份至最晚月份之间，为每个“名称 + 规格 + 批号”组合补齐缺失月份，再计算累计盈余。

取消“显示批号”后，同一月份、名称和规格下的不同批号将被合并，并重新计算累计盈余。

## 日期筛选规则

日期区间采用左闭右开口径：

```text
开始日期 <= 数据日期 < 结束日期
```

例如，要包含 2026 年 7 月的数据，结束日期应设为 `2026-08-01`。程序默认将结束日期设置为最后一个数据月份的下月 1 日。

## 数据看板

`Dashboard.html` 提供：

- 按时间和卫材名称筛选的明细台账
- 入库、发药、退药、盈余和明细组合统计
- 是否显示批号及规格排序选项
- 所有卫材或指定单品的月度流转图
- 盈余趋势图
- “全局台账 Agent 洞察”
- “Agent 单品趋势分析”

浏览器台账最多显示前 800 行，以避免页面卡顿。完整结果应通过桌面程序导出。

调整日期、卫材、批号显示或规格排序后，Agent 面板会按当前筛选范围重新发起分析。频繁切换筛选条件可能增加模型调用次数和费用。

## Agent 架构与配置

### 本机桥接服务

当前版本不建议由浏览器直接请求模型服务。启用 Agent 后：

- 看板请求：`http://127.0.0.1:8787/analyze`
- 桌面程序监听：`http://127.0.0.1:8787/`
- 桌面程序再请求 `providerEndpoint`
- API Key 仅由桌面程序添加到上游请求头
- 关闭桌面程序时，本机桥接服务同步停止

该设计避免将 API Key 暴露给浏览器页面，并减少浏览器跨域配置问题。

### `AgentSettings.js`

当前发布包默认配置为：

```javascript
window.ZHIHAO_AGENT_SETTINGS = {
  enabled: true,
  endpoint: "http://127.0.0.1:8787/analyze",
  method: "POST",
  providerEndpoint: "https://api.qnaigc.com/v1/chat/completions",
  model: "deepseek/deepseek-v4-flash",
  apiKey: "",
  apiKeyEnv: "QNAIGC_API_KEY",
  apiKeyHeader: "Authorization",
  apiKeyPrefix: "Bearer ",
  timeoutMs: 90000
};
```

| 字段 | 说明 |
|---|---|
| `enabled` | 看板是否尝试调用 Agent；桌面程序会依据勾选状态和 Key 可用性更新该值 |
| `endpoint` | 看板调用的本机桥接接口，建议保持 `http://127.0.0.1:8787/analyze` |
| `method` | 看板调用本机桥接接口的方法，当前为 `POST` |
| `providerEndpoint` | 桌面桥接服务请求的上游模型接口，应为兼容 Chat Completions 的地址 |
| `model` | 上游服务使用的模型标识 |
| `apiKey` | 安全占位字段；桌面程序写回时固定为空，不应用于保存真实 Key |
| `apiKeyEnv` | 环境变量名称提示；当前程序优先读取 `QNAIGC_API_KEY` |
| `apiKeyHeader` | 上游请求携带 Key 的 HTTP 头，默认 `Authorization` |
| `apiKeyPrefix` | Key 前缀，默认 `Bearer ` |
| `timeoutMs` | 浏览器和上游请求的超时参考值，单位为毫秒 |

修改 `providerEndpoint` 或 `model` 时，应确保两者属于同一服务，并支持 OpenAI 风格的 `/chat/completions` 请求和响应结构。

## Agent 分析口径

看板会按当前筛选范围，以“名称 + 规格 + 批号”为组合生成重点指标：

```text
周期日均消耗 = 筛选周期内发药数量 / 筛选周期天数
预计可用天数 = 当前累计盈余 / 周期日均消耗
```

- 当前盈余小于或等于 0 时，预计可用天数固定为 0，并标记为已透支或已耗尽。
- 当前版本没有日级近 7 日流水，因此 `near7_avg_daily_consumption` 为空；日均消耗采用当前筛选周期估算。
- 筛选周期过长或存在明显季节性时，预计可用天数可能被平滑，应结合较短日期范围复核。

Agent 输入主要包括：

- `scope`：全局或单品分析范围
- `dateRange`：筛选起止日期
- `totals`：当前范围汇总值
- `items`：按耗尽天数排序的重点组合，最多 500 个
- `rows`：当前范围月度明细，最多 1,500 行
- 系统提示词和任务提示词

预期输出结构：

```json
{
  "summary": "整体库存健康度和实际盈余判断",
  "actual_surplus": [
    {
      "item_name": "卫材名称",
      "spec": "规格",
      "batch": "批号",
      "sentence": "实际盈余、周期消耗、日均消耗和预计可用天数"
    }
  ],
  "analysis": [
    "带有数据依据的趋势或预测判断"
  ],
  "warnings": [
    {
      "item_name": "卫材名称",
      "issue_type": "断供风险",
      "description": "问题及数据依据",
      "recommendation": "采购、调拨、清库或复核建议"
    }
  ]
}
```

### 内置风险规则

在模型未返回可用风险列表时，看板会基于已计算指标补充本地风险判断：

- `current_surplus <= 0`：已透支或已耗尽，按断供风险处理
- `estimated_days_to_depletion <= 7`：短期断供风险
- `estimated_days_to_depletion >= 180`：库存覆盖偏长或积压迹象
- 当前筛选周期发药量为 0 且仍有盈余：低消耗/无消耗积压迹象

本地风险列表最多展示 12 项。阈值属于通用筛查口径，应根据医院采购周期、临床重要性、供应稳定性和有效期制度进一步校准。

## 未启用 Agent 时的本地规则

当外部 Agent 未启用时，看板执行本地规则分析：

- 汇总当前筛选范围的入库、发药、退药和盈余
- 数据月份达到 3 个月后，根据发药序列波动判断消耗是否相对稳定
- 比较最近一期盈余变化与前期平均变化
- 对盈余曲线斜率明显下降的名称、规格和批号组合提示补货复核

启用外部 Agent 后，面板优先显示外部 Agent 结果。若外部请求直接失败，当前版本会显示错误信息；需要本地规则结果时，应在桌面端取消勾选“启用Agent”后重新点击“分析”。

## 数据与安全注意事项

- `DashboardData.js` 包含导入后的卫材运营数据，以明文保存在本地目录。
- 不应将包含真实业务数据的 `DashboardData.js` 上传到公开仓库、公共网盘或未经授权的协作平台。
- 桌面程序不会将 API Key 写入 `AgentSettings.js`；不要自行把真实 Key 填入该文件。
- 使用环境变量会将 Key 保存在本机用户环境中，应限制工作站账户和远程访问权限。
- 启用 Agent 后，当前筛选范围的汇总数据、最多 500 个组合和最多 1,500 行月度明细会发送至配置的上游模型服务。
- 发送内容可能包含卫材名称、规格、批号、流转数量和库存盈余。医院内部使用前，应完成供应商授权、数据分类分级和合规评估。
- 建议使用单位批准的模型网关、专用账户、最小权限 Key 和可审计的调用日志。

## 常见问题

### 1. 提示“没有从上传文件中解析到有效明细”

依次检查：

- 文件是否至少包含 A—L 共 12 列
- 名称、规格、日期、数量和批号是否位于 E、F、G、H、L 列
- 前 25 行内是否存在包含“名称”“规格”“批号”的表头
- 日期是否为有效日期格式
- 数量是否为非零数值
- 数据是否位于 Excel 的第一个工作表

### 2. Excel 文件读取失败

安装 Microsoft Excel，或安装与程序位数兼容的 Microsoft Access Database Engine。也可先将文件另存为 UTF-8 CSV 后再导入。

### 3. 找不到 `Dashboard.html`

将 `Dashboard.html` 放回 `ZhiHaoManager.exe` 同级目录，然后重新点击“分析”。

### 4. 看板打开后没有数据

确认 `DashboardData.js` 已在 `Dashboard.html` 同级目录生成。不要直接打开初始看板后期待其自动读取尚未分析的 Excel 文件。

### 5. 图表无法显示

检查网络是否可以访问 ECharts CDN。明细和统计值正常但图表区域为空，通常是外部脚本未加载。

### 6. Excel 打开导出的 `.xls` 时显示格式提示

程序导出的 `.xls` 是 Excel 可识别的 HTML 兼容工作簿，并非原生二进制 XLS。可在 Excel 中正常打开后，使用“另存为”保存为 `.xlsx`。

### 7. 勾选 Agent 后仍提示未启动

检查：

- API-Key 输入框是否为空
- `QNAIGC_API_KEY` 是否已设置
- 设置环境变量后是否重新启动了桌面程序
- Key 中是否包含多余的引号、空格或换行

### 8. 看板显示“外部 Agent 请求失败”或 `Failed to fetch`

检查：

- `ZhiHaoManager.exe` 是否仍在运行
- 本机端口 `8787` 是否被占用
- 防火墙或安全软件是否拦截本机 HTTP 监听
- `AgentSettings.js` 中的 `endpoint` 是否为 `http://127.0.0.1:8787/analyze`
- 必要时以管理员身份启动程序，排查本机监听权限问题

### 9. 返回 HTTP 401 或 403

通常表示 Key 无效、无权限或请求头配置错误。核对：

- `apiKeyHeader`
- `apiKeyPrefix`
- API Key 所属服务
- `providerEndpoint` 与账户是否匹配

### 10. 返回 HTTP 404、模型不存在或响应格式异常

确认 `providerEndpoint` 和 `model` 属于同一提供方，并且接口兼容 Chat Completions。模型名称必须使用服务商要求的完整标识。

### 11. Agent 请求超时

- 检查模型服务网络连接
- 适当增大 `timeoutMs`
- 缩短看板日期范围或选择单一卫材，减少请求数据量
- 检查服务商是否限流或处于高负载状态

### 12. 关闭桌面程序后 Agent 失效

这是当前架构的预期行为。本机桥接服务随 `ZhiHaoManager.exe` 启动和停止。使用 Agent 看板期间必须保持桌面程序运行。

## 技术构成

- 桌面端：C# / Windows Forms / .NET Framework 4.x
- Excel 读取：OLE DB，失败后尝试 Excel COM
- 前端：HTML、CSS、原生 JavaScript
- 图表：Apache ECharts 5.5.0
- 数据桥接：桌面端生成 `DashboardData.js`
- Agent 桥接：桌面端本机 HTTP 服务，默认监听 `127.0.0.1:8787`
- 上游模型协议：OpenAI 风格 Chat Completions JSON

当前发布包为已编译的可运行版本，未包含 C# 源代码工程或构建脚本。
