# ZhiHao Manager (智耗管家)

> Zhenwu Hospital Medical Consumables Screening and Statistical System

ZhiHao Manager is a lightweight statistical tool for processing hospital medical-consumables inventory transaction records. It can batch-read Excel or CSV files, aggregate stock-in, issue, return, and balance data by month, item name, specification, and batch number, and generate an interactive browser-based dashboard.

## Key Features

- Drag and drop or select multiple `.xls`, `.xlsx`, and `.csv` files
- Merge data from multiple files and generate monthly statistics
- Filter by consumable name, date range, specification, and batch number
- Show or merge batch numbers and sort records by specification
- Export an Excel-compatible workbook or CSV file
- Display stock-in, issue, return, balance, and detail-combination counts
- Generate a monthly movement bar chart and balance trend line chart
- Apply built-in local rules to identify consumption fluctuations and abnormal balance declines
- Optionally connect to an external Agent through an HTTP endpoint for extended intelligent analysis

## Directory Structure

```text
ZhiHaoManager/
├─ ZhiHaoManager.exe   # Windows desktop application for upload, analysis, and export
├─ Dashboard.html      # Browser-based data dashboard
├─ AgentSettings.js    # External Agent endpoint configuration
├─ DashboardData.js    # Generated automatically after “Analyze”; not included initially
├─ README.md           # Chinese documentation
└─ README_EN.md        # English documentation
```

Keep `ZhiHaoManager.exe`, `Dashboard.html`, and `AgentSettings.js` in the same directory. Do not move or delete `Dashboard.html` separately.

## System Requirements

- Windows operating system
- .NET Framework 4.x runtime
- Microsoft Edge or Google Chrome is recommended for viewing the dashboard
- To read Excel files, the computer must have at least one of the following:
  - Microsoft Excel installed; or
  - Microsoft Access Database Engine (ACE OLE DB) installed
- CSV files do not require Excel, but they should use UTF-8 encoding
- Charts use the ECharts 5.5.0 CDN. Without an internet connection, detail tables and statistical values can still be displayed, but the bar and line charts may not load

## Quick Start

1. Extract the entire program directory. Do not run the `.exe` directly from inside the ZIP archive.
2. Double-click `ZhiHaoManager.exe`.
3. Drag one or more medical-consumables transaction files into the upload area, or click **“选择文件” (Select Files)**.
4. Configure the following options as needed:
   - Consumable to export
   - Export start and end dates
   - Whether to display batch numbers
   - Whether to sort by specification
5. Click **“分析” (Analyze)**:
   - The application aggregates all selected files.
   - It creates or overwrites `DashboardData.js` in the directory containing `Dashboard.html`.
   - It automatically opens `Dashboard.html` in the system's default browser.
6. Click **“导出 Excel 表格” (Export Excel Table)** to save the current filtered results as `.xls` or `.csv`.

## Input Data Format

### Important

The application reads fields by **fixed column position**. It does not dynamically map arbitrary column headers. The input table must retain at least 12 columns, from A through L. The required field positions are shown below.

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

> The application currently recognizes specific Chinese header and transaction-type keywords. Retain the exact strings shown above unless the application code is modified.

### Header Detection

- The application checks the first 25 rows and prioritizes a row containing all three exact keywords: `名称` (name), `规格` (specification), and `批号` (batch number).
- Data reading begins on the row immediately below the detected header.
- For reliable detection, place the header within the first four rows and retain these three Chinese field names.
- For Excel files, only the first available worksheet is read. Place the transaction details to be analyzed in the first worksheet.

### Transaction-Type Detection

The application interprets column B in the following priority order:

1. Contains `退` → return
2. Contains `入` → stock-in
3. Contains `发` or `消耗` → issue/consumption
4. If no recognized text is present:
   - Negative quantity → issue
   - Non-negative quantity → stock-in

Absolute quantity values are used during aggregation. Records are skipped when the quantity is zero, the date is invalid, or all key identification fields are empty.

### Supported Date Formats

The application supports native Excel dates, Excel serial date values, and common text formats, including:

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
- Column positions must follow the A–L structure described above

## Statistical Definitions

Data are aggregated by **month + consumable name + specification + batch number**:

```text
Monthly net movement = Stock-in quantity - Issue quantity + Return quantity
Cumulative balance = Previous month's cumulative balance + Current month's net movement
```

For every combination of name, specification, and batch number, the application fills in missing months between the earliest and latest months in the complete dataset before calculating the cumulative balance.

When **“显示批号” (Show Batch Number)** is cleared, different batch numbers under the same month, name, and specification are combined.

## Date Filtering Rules

The date range is left-inclusive and right-exclusive:

```text
Start date <= Record date < End date
```

For example, to include all data from July 2026, set the end date to `2026-08-01`. By default, the application sets the end date to the first day of the month following the last month in the dataset.

## Data Dashboard

`Dashboard.html` provides:

- A detail ledger filtered by date and consumable name
- Statistics for stock-in, issue, return, balance, and detail combinations
- Options to show batch numbers and sort by specification
- Monthly movement charts for all consumables or a selected item
- A balance trend chart
- Agent insights for the overall ledger and individual-item trends

To prevent browser performance issues, the on-screen ledger displays at most the first 800 rows. Export the results from the desktop application to obtain the complete dataset.

## Local Agent Rules

Even when no external endpoint is configured, the dashboard applies local rule-based analysis, including:

- Summarizing stock-in, issue, return, and balance values for the current filter range
- Evaluating whether consumption is relatively stable based on issue-series fluctuations once at least three months of data are available
- Comparing the latest balance change with the average change in earlier periods
- Flagging name, specification, and batch-number combinations whose balance trend shows a marked downward slope for replenishment review

Local alerts are intended only for preliminary screening. They do not replace safety-stock rules, procurement approval procedures, or manual verification.

## External Agent Configuration

The external Agent is disabled by default. Edit `AgentSettings.js` to enable an HTTP endpoint:

```javascript
window.ZHIHAO_AGENT_SETTINGS = {
  enabled: true,
  endpoint: "https://example.com/api/analyze",
  method: "POST",
  apiKey: "YOUR_API_KEY",
  apiKeyHeader: "Authorization",
  apiKeyPrefix: "Bearer ",
  timeoutMs: 30000
};
```

Configuration fields:

| Field | Description |
|---|---|
| `enabled` | Whether the external Agent is enabled |
| `endpoint` | Endpoint URL |
| `method` | HTTP method; defaults to `POST` |
| `apiKey` | Endpoint API key; may be left blank |
| `apiKeyHeader` | API-key request header; defaults to `Authorization` |
| `apiKeyPrefix` | API-key prefix; defaults to `Bearer ` |
| `timeoutMs` | Request timeout in milliseconds |

The dashboard sends the current analysis scope, date range, summary values, and up to 1,500 detail rows. The endpoint may return:

```json
{
  "insights": [
    "Review the recent increase in consumption for the specified item.",
    "The balance for one batch is declining faster than its earlier average."
  ]
}
```

It may also return JSON containing a `summary`, `result`, `output_text`, or `message` field, or return plain text directly.

Because requests are initiated by the browser, the endpoint must be configured correctly for HTTPS and Cross-Origin Resource Sharing (CORS).

## Data and Security Considerations

- `DashboardData.js` contains imported medical-consumables operational data and is stored as plaintext in the local directory after generation.
- Do not upload a `DashboardData.js` file containing real operational data to a public source-code repository or public cloud drive.
- API keys in `AgentSettings.js` are also stored as plaintext and should not be committed to a public repository.
- When the external Agent is enabled, up to 1,500 rows within the current analysis scope are sent to the configured endpoint.
- For internal hospital use, configure only authorized data-processing services and comply with the institution's data-security and network-management requirements.

## Troubleshooting

### 1. The application reports that no valid detail records were parsed

Check the following in order:

- The file contains at least 12 columns, from A through L
- Name, specification, date, quantity, and batch number are located in columns E, F, G, H, and L
- A header containing `名称`, `规格`, and `批号` appears within the first 25 rows
- Dates use a valid date format
- Quantities are non-zero numeric values
- The data are located in the first Excel worksheet

### 2. Excel files cannot be read

Install Microsoft Excel or a Microsoft Access Database Engine version compatible with the application's architecture. Alternatively, save the file as a UTF-8 CSV file before importing it.

### 3. `Dashboard.html` cannot be found

Place `Dashboard.html` in the same directory as `ZhiHaoManager.exe`, and then click **“分析” (Analyze)** again.

### 4. The dashboard opens but contains no data

Confirm that `DashboardData.js` has been generated in the same directory as `Dashboard.html`. Opening the initial dashboard directly will not cause it to read Excel files that have not yet been analyzed by the desktop application.

### 5. Charts are not displayed

Check whether the network can access the ECharts CDN. If the detail table and statistical values appear normally but the chart area is blank, the external chart script has probably failed to load.

### 6. Excel displays a format warning when opening an exported `.xls` file

The exported `.xls` file is an HTML-based, Excel-compatible workbook rather than a native binary XLS file. It can be opened normally in Excel and then saved as `.xlsx` by using **Save As**.

### 7. External Agent requests fail

Check the following:

- `enabled` is set to `true`
- `endpoint` is reachable
- The API key, request header, and prefix are correct
- The endpoint permits cross-origin browser requests
- The response time does not exceed `timeoutMs`

## Technology Stack

- Desktop application: C# / Windows Forms / .NET Framework 4.x
- Excel reading: OLE DB, with Excel COM attempted as a fallback
- Front end: HTML, CSS, and vanilla JavaScript
- Charts: Apache ECharts 5.5.0
- Data bridge: the desktop application generates `DashboardData.js`, which the dashboard reads through `window.ZHIHAO_DASHBOARD_DATA`

The current release package is a compiled, runnable build. It does not include the C# source project or build scripts.
