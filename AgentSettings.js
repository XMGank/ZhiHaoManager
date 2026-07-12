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
