# ZhiHao Manager (智耗管家)

> Zhenwu Hospital Medical Consumables Screening and Statistical System

ZhiHao Manager is a lightweight tool for processing hospital medical-consumables inventory transactions. It batch-reads Excel or CSV files, aggregates stock-in, issue, return, and cumulative balance data by month, item, specification, and batch, generates an interactive browser dashboard, and optionally uses an AI Agent to assess inventory coverage, stockout risk, overstock signals, and replenishment actions.

## Agent Update in This Release

This release adds and strengthens the following capabilities:

- New **“启用Agent” (Enable Agent)** and **“API-Key”** controls in the desktop application
- A local Agent bridge started by the desktop application at `http://127.0.0.1:8787/analyze`
- API keys are held by the desktop process and are not written to dashboard data or `AgentSettings.js`
- Structured calculations for actual balance, period consumption, average daily consumption, and estimated days to depletion
- Agent analysis for both the overall ledger and individual-item trends
- Detection of exhausted/negative balances, near-term depletion, and high-balance low-consumption conditions
- Structured output covering actual balances, an overall assessment, trend analysis, risk descriptions, and procurement, transfer, clearance, or verification actions
- Compatibility parsing for nested JSON, JSON in code fences, and common model-response fields

> Agent output is advisory. It does not replace physical inventory checks, safety-stock policies, procurement approval, or clinical judgment.

## Key Features

- Drag and drop or select multiple `.xls`, `.xlsx`, and `.csv` files
- Merge multiple files and generate monthly statistics
- Filter by consumable name, date range, specification, and batch number
- Show or merge batch numbers and sort records by specification
- Export an Excel-compatible workbook or CSV file
- Display stock-in, issue, return, balance, and detail-combination counts
- Generate monthly movement bar charts and balance trend line charts
- Run local rule-based analysis when the external Agent is disabled
- Run Agent-based balance, consumption-trend, stockout, overstock, and replenishment analysis when enabled

## Processing Flow

```text
Excel / CSV transactions
        │
        ▼
ZhiHaoManager.exe
  ├─ Parse, clean, and aggregate monthly data
  ├─ Generate DashboardData.js
  ├─ Save AgentSettings.js without the API key
  └─ Start the local Agent bridge when Agent is enabled
        │
        ▼
Dashboard.html
  ├─ Ledger, metrics, and charts
  ├─ Build structured Agent inputs
  └─ POST http://127.0.0.1:8787/analyze
        │
        ▼
Local bridge in the desktop application
        │
        ▼
Model service configured in AgentSettings.js
```

## Directory Structure

```text
ZhiHaoManager/
├─ ZhiHaoManager.exe   # Windows upload, analysis, export, and Agent-bridge application
├─ Dashboard.html      # Browser dashboard and Agent presentation logic
├─ AgentSettings.js    # Agent service, model, and timeout settings; no persisted API key
├─ DashboardData.js    # Generated after “Analyze”; not present in the initial package
├─ README.md           # Chinese documentation
└─ README_EN.md        # English documentation
```

Keep `ZhiHaoManager.exe`, `Dashboard.html`, and `AgentSettings.js` in the same directory. Do not run the application directly inside the ZIP file, and do not move or delete these files separately.

## System Requirements

- Windows operating system
- .NET Framework 4.x runtime
- Microsoft Edge or Google Chrome is recommended for the dashboard
- To read Excel files, the computer must have at least one of the following:
  - Microsoft Excel; or
  - Microsoft Access Database Engine (ACE OLE DB)
- CSV files do not require Excel, but should use UTF-8 encoding
- Charts use the ECharts 5.5.0 CDN. Without internet access, tables and metrics can still load, but charts may not
- External Agent use additionally requires:
  - Network access to the configured model service
  - A valid API key
  - Local port `8787` available

## Quick Start

### Standard Analysis

1. Extract the entire program directory.
2. Double-click `ZhiHaoManager.exe`.
3. Drag one or more transaction files into the upload area, or click **“选择文件” (Select Files)**.
4. Configure as needed:
   - Consumable to export
   - Export start and end dates
   - Whether to display batch numbers
   - Whether to sort by specification
5. Click **“分析” (Analyze)**:
   - The application aggregates all selected files.
   - It creates or overwrites `DashboardData.js` in the program directory.
   - It updates `AgentSettings.js` according to the current Agent controls.
   - It opens `Dashboard.html` in the default browser.
6. Click **“导出 Excel 表格” (Export Excel Table)** to save the desktop-filtered results as `.xls` or `.csv`.

### Enable the Agent

1. Select **“启用Agent” (Enable Agent)** in the desktop application.
2. Enter a valid key in the **API-Key** field, or configure the `QNAIGC_API_KEY` environment variable in advance.
3. Click **“分析” (Analyze)**.
4. **Keep `ZhiHaoManager.exe` open** while viewing Agent results in the browser.

The local bridge starts only when Agent is selected and an API key can be resolved. If no key is available, the desktop application disables the external Agent and displays a status message.

## API Key Configuration

### Option 1: Enter a Temporary Key in the Desktop Application

Enter the key directly in the **API-Key** field. This is suitable for temporary use:

- The key exists only in the running process memory
- When the application rewrites `AgentSettings.js`, the `apiKey` field remains an empty string
- The key normally needs to be entered again after the application is closed

### Option 2: Use a Windows Environment Variable

This is recommended for a dedicated workstation. The application checks the following variables in order:

1. `QNAIGC_API_KEY`
2. `OPENAI_API_KEY` as a compatibility fallback

CMD, current session:

```bat
set QNAIGC_API_KEY=your_api_key_here
ZhiHaoManager.exe
```

CMD, persistent user variable:

```bat
setx QNAIGC_API_KEY "your_api_key_here"
```

PowerShell, persistent user variable:

```powershell
[Environment]::SetEnvironmentVariable(
  "QNAIGC_API_KEY",
  "your_api_key_here",
  "User"
)
```

After using `setx` or the persistent PowerShell command, close and restart the desktop application. Never place a real key in screenshots, logs, documentation, public repositories, or shared scripts.

## Input Data Format

### Important

The application reads fields by **fixed column position**. It does not dynamically map arbitrary headers. The input table must retain at least 12 columns, from A through L.

| Excel column | Column number | Purpose | Example |
|---|---:|---|---|
| A | 1 | Not used; may retain an original field | Record number |
| B | 2 | Transaction or movement type | 入库, 发药, 退药, 消耗 |
| C | 3 | Not used; may retain an original field | — |
| D | 4 | Not used; may retain an original field | — |
| E | 5 | Medical consumable name | Disposable infusion set |
| F | 6 | Specification | 0.7 mm |
| G | 7 | Transaction date | 2026-07-01 |
| H | 8 | Quantity | 120 |
| I | 9 | Not used; may retain an original field | — |
| J | 10 | Not used; may retain an original field | — |
| K | 11 | Not used; may retain an original field | — |
| L | 12 | Batch number | 20260701A |

Recommended minimum example:

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---:|---|---|---|---|
| 序号 | 业务类型 |  |  | 名称 | 规格 | 日期 | 数量 |  |  |  | 批号 |
| 1 | 入库 |  |  | Disposable infusion set | 0.7 mm | 2026-07-01 | 120 |  |  |  | 20260701A |
| 2 | 发药 |  |  | Disposable infusion set | 0.7 mm | 2026-07-10 | 30 |  |  |  | 20260701A |
| 3 | 退药 |  |  | Disposable infusion set | 0.7 mm | 2026-07-15 | 5 |  |  |  | 20260701A |

> The current application recognizes specific Chinese header and transaction-type keywords. Retain the exact Chinese strings shown above unless the application code is changed.

### Header Detection

- The application checks the first 25 rows and prioritizes a row containing `名称` (name), `规格` (specification), and `批号` (batch number).
- Data reading begins on the next row.
- For reliable detection, place the header within the first four rows and retain these Chinese field names.
- Only the first available Excel worksheet is read.

### Transaction-Type Detection

Column B is interpreted in the following order:

1. Contains `退` → return
2. Contains `入` → stock-in
3. Contains `发` or `消耗` → issue/consumption
4. If no recognized text is present: negative quantity → issue; non-negative quantity → stock-in

Absolute quantity values are used for aggregation. Records are skipped when quantity is zero, the date is invalid, or all key identification fields are empty.

### Supported Date Formats

The application supports native Excel dates, Excel serial dates, and common text formats:

```text
yyyy-MM-dd
yyyy/M/d
yyyy/MM/dd
yyyyMMdd
yyyy-MM-dd HH:mm:ss
yyyy/M/d H:mm:ss
yyyy/MM/dd HH:mm:ss
```

### CSV Requirements

- Encoding: UTF-8
- Delimiter: comma `,`
- Fields containing commas may be enclosed in double quotation marks
- Column positions must follow the A–L structure above

## Statistical Definitions

Data are aggregated by **month + consumable name + specification + batch number**:

```text
Monthly net movement = Stock-in - Issue + Return
Cumulative balance = Previous-month cumulative balance + Current-month net movement
```

For each name/specification/batch combination, the application fills missing months between the earliest and latest months in the complete dataset before calculating cumulative balance.

When **“显示批号” (Show Batch Number)** is cleared, batches under the same month, name, and specification are combined and cumulative balance is recalculated.

## Date Filtering Rules

The date range is left-inclusive and right-exclusive:

```text
Start date <= Record date < End date
```

For example, to include July 2026, set the end date to `2026-08-01`. By default, the end date is the first day of the month following the last data month.

## Data Dashboard

`Dashboard.html` provides:

- A detail ledger filtered by date and consumable name
- Stock-in, issue, return, balance, and detail-combination metrics
- Batch-number display and specification-sort options
- Monthly movement charts for all consumables or a selected item
- A cumulative balance trend chart
- **“全局台账 Agent 洞察” (Overall Ledger Agent Insights)**
- **“Agent 单品趋势分析” (Agent Individual-Item Trend Analysis)**

To reduce browser load, the on-screen ledger displays at most 800 rows. Use desktop export for the complete result.

Changing the date, material, batch display, or sorting options causes the Agent panels to analyze the current filter scope again. Frequent filter changes may increase model calls and cost.

## Agent Architecture and Configuration

### Local Bridge

The current release is designed so the browser does not call the upstream model service directly. When Agent is enabled:

- Dashboard request: `http://127.0.0.1:8787/analyze`
- Desktop listener: `http://127.0.0.1:8787/`
- The desktop bridge calls `providerEndpoint`
- The API key is added only by the desktop application to the upstream request
- Closing the desktop application stops the local bridge

This design reduces API-key exposure in the browser and avoids most upstream browser-CORS requirements.

### `AgentSettings.js`

The current package ships with:

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

| Field | Description |
|---|---|
| `enabled` | Whether the dashboard attempts Agent calls; the desktop application updates it from the checkbox and key availability |
| `endpoint` | Local bridge URL; normally keep `http://127.0.0.1:8787/analyze` |
| `method` | HTTP method used by the dashboard for the local bridge; currently `POST` |
| `providerEndpoint` | Upstream model endpoint called by the desktop bridge; it should support Chat Completions |
| `model` | Model identifier expected by the upstream service |
| `apiKey` | Security placeholder; the desktop application writes it as empty and it must not be used to persist a real key |
| `apiKeyEnv` | Environment-variable hint; the executable currently checks `QNAIGC_API_KEY` first |
| `apiKeyHeader` | Upstream HTTP header carrying the key; default `Authorization` |
| `apiKeyPrefix` | Key prefix; default `Bearer ` |
| `timeoutMs` | Browser/upstream timeout reference in milliseconds |

When changing `providerEndpoint` or `model`, ensure both belong to the same provider and support an OpenAI-style `/chat/completions` request and response structure.

## Agent Calculation Rules

For the current filter scope, the dashboard creates one item per **name + specification + batch** combination:

```text
Period average daily consumption = Period issue quantity / Number of days in the selected period
Estimated days to depletion = Current cumulative balance / Period average daily consumption
```

- When current balance is less than or equal to zero, estimated days to depletion is fixed at 0 and the item is marked as exhausted or overdrawn.
- The current release does not contain daily near-seven-day records, so `near7_avg_daily_consumption` is null; daily consumption is estimated from the selected period.
- A long date range or seasonal demand can smooth the estimate. Use a shorter date range for operational verification.

The Agent payload mainly contains:

- `scope`: overall or individual-item scope
- `dateRange`: selected start and end dates
- `totals`: summary values for the current scope
- `items`: priority item combinations sorted by days to depletion, up to 500
- `rows`: monthly detail rows, up to 1,500
- System and task prompts

Expected output:

```json
{
  "summary": "Overall inventory-health and actual-balance assessment",
  "actual_surplus": [
    {
      "item_name": "Consumable name",
      "spec": "Specification",
      "batch": "Batch number",
      "sentence": "Actual balance, period use, daily use, and estimated available days"
    }
  ],
  "analysis": [
    "A trend or forecast statement supported by the supplied data"
  ],
  "warnings": [
    {
      "item_name": "Consumable name",
      "issue_type": "Stockout risk",
      "description": "Issue and supporting values",
      "recommendation": "Procurement, transfer, clearance, or verification action"
    }
  ]
}
```

### Built-in Risk Rules

If the model does not return a usable warning list, the dashboard supplements it using calculated indicators:

- `current_surplus <= 0`: exhausted/overdrawn; treated as stockout risk
- `estimated_days_to_depletion <= 7`: near-term stockout risk
- `estimated_days_to_depletion >= 180`: unusually long inventory coverage or overstock signal
- Period issue quantity is 0 while balance remains positive: low/no-consumption overstock signal

The local warning list displays at most 12 items. These are generic screening thresholds and should be calibrated to procurement lead time, clinical criticality, supply reliability, and shelf-life policies.

## Local Rules When Agent Is Disabled

When the external Agent is disabled, the dashboard runs local rule-based analysis:

- Summarizes stock-in, issue, return, and balance values for the current filter scope
- Assesses consumption stability after at least three months of data are available
- Compares the latest balance change with the average earlier change
- Flags name/specification/batch combinations whose cumulative-balance slope declines abnormally

When the external Agent is enabled, the panels prioritize external Agent output. If the external request itself fails, the current release displays the error rather than automatically restoring the complete local analysis. To use local rules, clear **“启用Agent” (Enable Agent)** in the desktop application and click **“分析” (Analyze)** again.

## Data and Security Considerations

- `DashboardData.js` stores imported operational data as plaintext in the local directory.
- Do not upload a real-data `DashboardData.js` file to a public repository, public cloud drive, or unauthorized collaboration platform.
- The desktop application does not persist the API key in `AgentSettings.js`; do not manually place a real key in that file.
- An environment variable stores the key in the local user environment. Restrict workstation accounts and remote access accordingly.
- When Agent is enabled, the current filtered summaries, up to 500 item combinations, and up to 1,500 monthly detail rows are sent to the configured upstream model service.
- Sent data may include consumable names, specifications, batch numbers, movement quantities, and balances. Complete vendor authorization, data classification, and compliance review before hospital deployment.
- Use an institution-approved model gateway, dedicated account, least-privilege key, and auditable invocation logs where possible.

## Troubleshooting

### 1. No valid detail records were parsed

Check:

- The file contains at least 12 columns, A through L
- Name, specification, date, quantity, and batch are in E, F, G, H, and L
- A header containing `名称`, `规格`, and `批号` appears within the first 25 rows
- Dates are valid
- Quantities are non-zero numeric values
- Data are in the first Excel worksheet

### 2. Excel files cannot be read

Install Microsoft Excel or a Microsoft Access Database Engine version compatible with the application architecture. Alternatively, save the source file as UTF-8 CSV before importing it.

### 3. `Dashboard.html` cannot be found

Restore `Dashboard.html` to the same directory as `ZhiHaoManager.exe`, and click **“分析” (Analyze)** again.

### 4. The dashboard opens without data

Confirm that `DashboardData.js` was generated beside `Dashboard.html`. Opening the initial dashboard directly does not read unanalyzed Excel files.

### 5. Charts are missing

Check access to the ECharts CDN. If tables and metrics load but chart areas are blank, the external chart script probably failed to load.

### 6. Excel warns about the exported `.xls` format

The exported `.xls` is an HTML-based Excel-compatible workbook, not a native binary XLS file. Open it in Excel and use **Save As** to create `.xlsx` if needed.

### 7. Agent remains inactive after it is selected

Check:

- The API-Key field is not empty
- `QNAIGC_API_KEY` is configured
- The desktop application was restarted after setting the environment variable
- The key does not contain extra quotation marks, spaces, or line breaks

### 8. The dashboard reports an external Agent failure or `Failed to fetch`

Check:

- `ZhiHaoManager.exe` is still running
- Local port `8787` is not occupied
- Firewall or endpoint-security software is not blocking the local HTTP listener
- `endpoint` in `AgentSettings.js` is `http://127.0.0.1:8787/analyze`
- If required, run the application as administrator to diagnose local listener permission issues

### 9. HTTP 401 or 403

This normally indicates an invalid key, insufficient permission, or incorrect authentication configuration. Verify:

- `apiKeyHeader`
- `apiKeyPrefix`
- The service that issued the key
- The account matches `providerEndpoint`

### 10. HTTP 404, model-not-found, or malformed response

Confirm that `providerEndpoint` and `model` belong to the same provider and that the endpoint supports Chat Completions. Use the provider's exact model identifier.

### 11. Agent request timeout

- Check network access to the model service
- Increase `timeoutMs` where appropriate
- Shorten the dashboard date range or select one material to reduce payload size
- Check provider rate limits and service status

### 12. Agent stops after the desktop application is closed

This is expected. The local bridge starts and stops with `ZhiHaoManager.exe`. Keep the desktop application running while using Agent-enabled dashboards.

## Technology Stack

- Desktop: C# / Windows Forms / .NET Framework 4.x
- Excel reading: OLE DB, with Excel COM fallback
- Front end: HTML, CSS, and vanilla JavaScript
- Charts: Apache ECharts 5.5.0
- Data bridge: desktop-generated `DashboardData.js`
- Agent bridge: local HTTP service in the desktop application, listening on `127.0.0.1:8787` by default
- Upstream model protocol: OpenAI-style Chat Completions JSON

The current release is a compiled runnable package. It does not include the C# source project or build scripts.
