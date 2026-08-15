"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAiConfig,
  updateAiConfig,
  testAiConnection,
  runAiPlayground,
  getAiAnalytics,
  clearAiAnalytics,
} from "@/lib/api";

const SUPPORTED_MODELS = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    tag: "Recommended",
    desc: "Next-gen multimodal model optimized for speed, precision, and high-quality structured JSON.",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    tag: "Ultra-Fast",
    desc: "Lightweight and cost-efficient for instant response latency.",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    tag: "Deep Reasoning",
    desc: "Maximum reasoning power for complex technical synthesis.",
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash (Latest)",
    tag: "Auto-Updated",
    desc: "Points to the latest stable Google Gemini Flash release.",
  },
];

const PLAYGROUND_PRESETS = {
  description: "i built an ecommerce store using next.js and stripe with cart and checkout",
  feature_desc: "added jwt authentication and protected routes for users",
  suggest_badges: "A real estate property booking platform with 3D tours and map view",
  custom: "Explain why clean code architecture improves scalability in 2 concise sentences.",
};

const ACTION_LABELS = {
  resume_analysis: "Resume Project Analysis",
  overview_polish: "Project Overview Polish",
  title_polish: "Project Title Polish",
  feature_polish: "Feature Bullet Polish",
  feature_title: "Feature Title Generation",
  generate_features: "AI Features Auto-Gen",
  suggest_badges: "AI Tech Badges Suggestion",
  categorize_stack: "Tech Stack Categorization",
  playground_test: "Playground Sandbox Test",
  test_connection: "Live API Connection Ping",
  general_ai: "General Gemini Request",
};

export default function AdminAiConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Config States
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [temperature, setTemperature] = useState(0.2);
  const [thinkingBudget, setThinkingBudget] = useState(0);
  const [maxOutputTokens, setMaxOutputTokens] = useState(4096);
  const [enableResumeAnalysis, setEnableResumeAnalysis] = useState(true);
  const [enableFormAssistant, setEnableFormAssistant] = useState(true);

  // Diagnostics
  const [lastTestedAt, setLastTestedAt] = useState(null);
  const [lastTestStatus, setLastTestStatus] = useState("untested");
  const [lastTestLatency, setLastTestLatency] = useState(0);

  // Analytics States
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Playground States
  const [playgroundAction, setPlaygroundAction] = useState("description");
  const [playgroundInput, setPlaygroundInput] = useState(PLAYGROUND_PRESETS.description);
  const [playgroundOutput, setPlaygroundOutput] = useState("");
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundLatency, setPlaygroundLatency] = useState(null);

  const showNotice = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  // Load active dynamic AI configuration
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAiConfig();
      setModel(data.model || "gemini-2.5-flash");
      setTemperature(data.temperature !== undefined ? data.temperature : 0.2);
      setThinkingBudget(data.thinkingBudget || 0);
      setMaxOutputTokens(data.maxOutputTokens || 4096);
      setEnableResumeAnalysis(data.enableResumeAnalysis !== false);
      setEnableFormAssistant(data.enableFormAssistant !== false);
      setHasApiKey(data.hasApiKey);
      setMaskedKey(data.maskedApiKey || "");
      setLastTestedAt(data.lastTestedAt);
      setLastTestStatus(data.lastTestStatus || "untested");
      setLastTestLatency(data.lastTestLatencyMs || 0);
    } catch (err) {
      showNotice("Failed to load AI settings: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Usage Analytics
  const loadAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      const data = await getAiAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.warn("Failed to load AI analytics:", err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
    loadAnalytics();
  }, [loadConfig, loadAnalytics]);

  // Save Config
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        model,
        temperature: Number(temperature),
        thinkingBudget: Number(thinkingBudget),
        maxOutputTokens: Number(maxOutputTokens),
        enableResumeAnalysis,
        enableFormAssistant,
      };

      if (apiKeyInput.trim()) {
        payload.apiKey = apiKeyInput.trim();
      }

      const res = await updateAiConfig(payload);
      showNotice(res.message || "Configuration updated successfully!", "success");
      setApiKeyInput("");
      setHasApiKey(res.config.hasApiKey);
      setMaskedKey(res.config.maskedApiKey);
      loadAnalytics();
    } catch (err) {
      showNotice("Save failed: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Test Connection Live
  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const keyToTest = apiKeyInput.trim() || undefined;
      const res = await testAiConnection(keyToTest);
      if (res.success) {
        setLastTestStatus("success");
        setLastTestLatency(res.latencyMs);
        setLastTestedAt(new Date());
        showNotice(`✓ Connection Verified! Latency: ${res.latencyMs}ms (${res.availableModelsCount || 0} models ready)`, "success");
      } else {
        setLastTestStatus("error");
        showNotice("Verification Failed: " + res.message, "error");
      }
      loadAnalytics();
    } catch (err) {
      setLastTestStatus("error");
      showNotice("Connection failed: " + err.message, "error");
    } finally {
      setTesting(false);
    }
  };

  // Run Playground Sandbox
  const handleRunPlayground = async () => {
    if (!playgroundInput.trim()) return;
    setPlaygroundLoading(true);
    setPlaygroundOutput("");
    setPlaygroundLatency(null);

    try {
      const res = await runAiPlayground({
        action: playgroundAction,
        input: playgroundInput,
        customPrompt: playgroundAction === "custom" ? playgroundInput : undefined,
      });

      if (res.success) {
        setPlaygroundLatency(res.latencyMs);
        if (res.result?.enhancedText) {
          setPlaygroundOutput(res.result.enhancedText);
        } else if (res.result?.output) {
          setPlaygroundOutput(res.result.output);
        } else if (res.result?.badges) {
          setPlaygroundOutput(res.result.badges.join(", "));
        } else {
          setPlaygroundOutput(JSON.stringify(res.result, null, 2));
        }
        loadAnalytics();
      }
    } catch (err) {
      setPlaygroundOutput("Error: " + err.message);
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Clear Logs
  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to reset all AI activity and usage logs?")) return;
    try {
      await clearAiAnalytics();
      showNotice("AI usage logs have been reset.", "success");
      loadAnalytics();
    } catch (err) {
      showNotice("Failed to clear logs: " + err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-xs text-gray-400 font-mono">Loading Dynamic AI Configuration...</p>
      </div>
    );
  }

  const todayRequests = analytics?.today?.requests || 0;
  const dailyLimit = analytics?.quotas?.dailyLimit || 1500;
  const usedPercent = analytics?.today?.usedPercent || 0;
  const remainingToday = analytics?.today?.remainingRequests !== undefined ? analytics.today.remainingRequests : dailyLimit;
  const lifetimeCalls = analytics?.lifetime?.totalRequests || 0;
  const lifetimeTokens = analytics?.lifetime?.totalTokens || 0;
  const avgLatency = analytics?.lifetime?.avgLatencyMs || lastTestLatency || 0;

  return (
    <div className="space-y-6 max-w-full pb-12 text-xs">
      {/* Toast Notification */}
      {message.text && (
        <div
          className={`sticky top-2 z-40 px-4 py-2.5 rounded-xl border text-xs font-medium backdrop-blur-md shadow-xl flex items-center justify-between animate-fade-in ${
            message.type === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <span>{message.type === "error" ? "⚠️" : "✨"}</span>
            {message.text}
          </span>
          <button type="button" onClick={() => setMessage({ text: "", type: "" })} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header & Status KPI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e1e32] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 border border-indigo-500/40 flex items-center justify-center text-base shadow-[0_0_15px_rgba(99,102,241,0.25)]">
              ⚡
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">Gemini AI Engine & Usage Monitor</h1>
              <p className="text-xs text-gray-400">Dynamic model orchestration, quota tracking & live execution diagnostics</p>
            </div>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`px-3 py-1 rounded-full border text-xs font-mono font-semibold flex items-center gap-2 ${
              lastTestStatus === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                : lastTestStatus === "error"
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                lastTestStatus === "success" ? "bg-emerald-400 animate-ping" : "bg-yellow-400"
              }`}
            />
            {lastTestStatus === "success"
              ? `Operational (${lastTestLatency}ms)`
              : lastTestStatus === "error"
              ? "Verification Error"
              : "Untested"}
          </div>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151524] hover:bg-[#1f1f34] border border-[#2a2a46] text-gray-200 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {testing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Pinging API...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Verify Connection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. REAL-TIME AI USAGE & QUOTA ANALYTICS (NEW!) */}
      {/* ============================================================ */}
      <div className="bg-[#0e0e18] border border-[#1e1e32] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1a1a2c] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <div>
              <h2 className="text-sm font-bold text-white">Gemini API Consumption & Free Tier Quotas</h2>
              <p className="text-[11px] text-gray-400">Live requests, token consumption, and daily rate limit tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAnalytics}
              disabled={loadingAnalytics}
              className="text-[11px] text-gray-400 hover:text-white px-2.5 py-1 bg-[#161628] hover:bg-[#202036] rounded-lg border border-[#262640] transition-colors"
            >
              {loadingAnalytics ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Today's Requests */}
          <div className="bg-[#121222] border border-[#1f1f38] p-3.5 rounded-xl space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Today&apos;s Calls</span>
              <span className="text-xs">⚡</span>
            </div>
            <p className="text-xl font-bold text-white tracking-tight">
              {todayRequests} <span className="text-xs text-gray-400 font-normal">/ {dailyLimit}</span>
            </p>
            <p className="text-[10.5px] text-emerald-400 font-medium">
              {remainingToday} calls remaining today
            </p>
          </div>

          {/* Card 2: Daily Quota Bar */}
          <div className="bg-[#121222] border border-[#1f1f38] p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Daily Quota</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{usedPercent}%</span>
            </div>
            <div className="h-2 w-full bg-[#090912] rounded-full overflow-hidden border border-[#202036]">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                style={{ width: `${Math.max(4, usedPercent)}%` }}
              />
            </div>
            <p className="text-[10.5px] text-gray-400">1,500 Requests / Day Free Limit</p>
          </div>

          {/* Card 3: Total Lifetime Calls */}
          <div className="bg-[#121222] border border-[#1f1f38] p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Lifetime Calls</span>
              <span className="text-xs">🚀</span>
            </div>
            <p className="text-xl font-bold text-indigo-300 tracking-tight">
              {lifetimeCalls} <span className="text-xs text-gray-400 font-normal">requests</span>
            </p>
            <p className="text-[10.5px] text-gray-400">
              Avg Latency: <span className="text-gray-200 font-mono">{avgLatency}ms</span>
            </p>
          </div>

          {/* Card 4: Tokens Processed */}
          <div className="bg-[#121222] border border-[#1f1f38] p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Total Tokens</span>
              <span className="text-xs">🪙</span>
            </div>
            <p className="text-xl font-bold text-fuchsia-300 tracking-tight font-mono">
              {lifetimeTokens.toLocaleString()}
            </p>
            <p className="text-[10.5px] text-gray-400">
              Today: <span className="text-gray-200 font-mono">{(analytics?.today?.tokens || 0).toLocaleString()} tokens</span>
            </p>
          </div>
        </div>

        {/* Feature Usage Breakdown & Recent Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-1">
          {/* Left: Feature Breakdown */}
          <div className="bg-[#0a0a14] border border-[#1b1b2e] rounded-xl p-3.5 space-y-2.5">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block border-b border-[#181828] pb-1.5">
              Usage by Feature
            </span>

            {analytics?.featureBreakdown?.length > 0 ? (
              <div className="space-y-2">
                {analytics.featureBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-300 font-medium">
                        {ACTION_LABELS[item.action] || item.action}
                      </span>
                      <span className="font-mono text-indigo-300 font-bold">
                        {item.count} calls ({item.tokens.toLocaleString()} tok)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#121220] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((item.count / (lifetimeCalls || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No feature calls recorded yet.</p>
            )}
          </div>

          {/* Right (2 cols): Live Activity Feed */}
          <div className="lg:col-span-2 bg-[#0a0a14] border border-[#1b1b2e] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#181828] pb-1.5">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                Recent AI Activity Stream
              </span>
              {analytics?.recentLogs?.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="text-[10px] text-gray-500 hover:text-red-400 transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>

            {analytics?.recentLogs?.length > 0 ? (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {analytics.recentLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-[#0e0e18] border border-[#1c1c2e] rounded-lg text-[10.5px] font-mono gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          log.status === "success" ? "bg-emerald-400" : "bg-red-400"
                        }`}
                      />
                      <span className="text-gray-200 font-sans truncate font-medium">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0 text-gray-400">
                      <span className="text-indigo-400">{log.totalTokens || 0} tok</span>
                      <span className="text-cyan-400">{log.latencyMs || 0}ms</span>
                      <span className="text-gray-500">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">
                No recent activity. Use the AI Resume analyzer or Project Assistant to see real-time logs here.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. API CREDENTIALS & KEY MANAGEMENT */}
      {/* ============================================================ */}
      <div className="bg-[#0e0e18] border border-[#1e1e32] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1a1a2c] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🔑</span>
            <div>
              <h2 className="text-sm font-bold text-white">API Credentials & Keys</h2>
              <p className="text-[11px] text-gray-400">Google AI Studio Generative Language API Key</p>
            </div>
          </div>

          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Get Free API Key</span>
            <span>↗</span>
          </a>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Active Gemini API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={hasApiKey ? `Current: ${maskedKey}` : "Paste AIzaSy... API Key here"}
                  className="w-full px-3.5 py-2 bg-[#08080f] border border-[#222238] focus:border-indigo-500 rounded-xl text-white text-xs font-mono placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                >
                  {showApiKey ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !apiKeyInput.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-colors"
              >
                {saving ? "Updating..." : "Update Key"}
              </button>
            </div>
            <p className="text-[10.5px] text-gray-500 mt-1">
              {hasApiKey
                ? `Key is active and configured (${maskedKey}). Enter a new key above only if you want to replace it.`
                : "No API key configured. Paste your Google AI Studio key above to activate AI features."}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. DYNAMIC MODEL SELECTION & INFERENCE TUNING */}
      {/* ============================================================ */}
      <div className="bg-[#0e0e18] border border-[#1e1e32] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#1a1a2c] pb-3">
          <span className="text-base">🧠</span>
          <div>
            <h2 className="text-sm font-bold text-white">Model Selection & Hyperparameters</h2>
            <p className="text-[11px] text-gray-400">Configure default generation engine and reasoning temperature</p>
          </div>
        </div>

        {/* Model Cards Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-300">Active Neural Model</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SUPPORTED_MODELS.map((m) => (
              <div
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  model === m.id
                    ? "bg-[#141428] border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/40"
                    : "bg-[#0a0a12] border-[#1e1e30] hover:border-[#2e2e4a] opacity-80"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white tracking-wide">{m.name}</span>
                  <span
                    className={`text-[9.5px] px-2 py-0.2 rounded-full font-semibold border ${
                      model === m.id
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                        : "bg-[#18182a] text-gray-400 border-[#282840]"
                    }`}
                  >
                    {m.tag}
                  </span>
                </div>
                <p className="text-[10.5px] text-gray-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Temperature */}
          <div className="bg-[#0b0b14] border border-[#1b1b2e] p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-300">Temperature (Creativity)</label>
              <span className="text-xs font-mono font-bold text-indigo-400">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>0.0 (Deterministic / Exact)</span>
              <span>1.0 (Creative)</span>
            </div>
          </div>

          {/* Thinking Budget */}
          <div className="bg-[#0b0b14] border border-[#1b1b2e] p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-300">Thinking Mode Budget</label>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {thinkingBudget === 0 ? "Disabled (Instant 2s)" : `${thinkingBudget} tokens`}
              </span>
            </div>
            <select
              value={thinkingBudget}
              onChange={(e) => setThinkingBudget(parseInt(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#121220] border border-[#26263e] rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="0">0 (Fast Instant Mode - Recommended for UI)</option>
              <option value="512">512 tokens (Light reasoning)</option>
              <option value="1024">1024 tokens (Deep architectural reasoning)</option>
              <option value="2048">2048 tokens (Maximum reasoning)</option>
            </select>
            <p className="text-[10px] text-gray-500">
              0 returns output in ~2s. Higher budgets generate hidden internal thoughts before output.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. FEATURE TOGGLES */}
      {/* ============================================================ */}
      <div className="bg-[#0e0e18] border border-[#1e1e32] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#1a1a2c] pb-3">
          <span className="text-base">⚙️</span>
          <div>
            <h2 className="text-sm font-bold text-white">AI Feature Toggles</h2>
            <p className="text-[11px] text-gray-400">Enable or disable specific AI integrations across the portfolio</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {/* Toggle 1 */}
          <div className="flex items-center justify-between p-3 bg-[#0b0b14] border border-[#1b1b2e] rounded-xl">
            <div>
              <p className="text-xs font-semibold text-white">Resume Project Analysis & Extraction Engine</p>
              <p className="text-[10.5px] text-gray-400">
                Uses Gemini AI to parse uploaded PDF resumes into structured projects with executive overviews
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnableResumeAnalysis(!enableResumeAnalysis)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                enableResumeAnalysis
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-gray-800 border-gray-700 text-gray-400"
              }`}
            >
              {enableResumeAnalysis ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between p-3 bg-[#0b0b14] border border-[#1b1b2e] rounded-xl">
            <div>
              <p className="text-xs font-semibold text-white">Project Form Writing Assistant</p>
              <p className="text-[10.5px] text-gray-400">
                Enables inline &apos;AI Polish Title&apos;, &apos;AI Polish Overview&apos;, &apos;AI Suggest Badges&apos;, and &apos;AI Auto-Categorize&apos;
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnableFormAssistant(!enableFormAssistant)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                enableFormAssistant
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-gray-800 border-gray-700 text-gray-400"
              }`}
            >
              {enableFormAssistant ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. LIVE INTERACTIVE AI TEST SANDBOX / PLAYGROUND */}
      {/* ============================================================ */}
      <div className="bg-[#0e0e18] border border-[#1e1e32] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1a1a2c] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🧪</span>
            <div>
              <h2 className="text-sm font-bold text-white">Interactive AI Test Sandbox</h2>
              <p className="text-[11px] text-gray-400">Test prompt generation and measure live latency directly in browser</p>
            </div>
          </div>

          {playgroundLatency !== null && (
            <span className="text-[10.5px] font-mono px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
              ⚡ {playgroundLatency}ms
            </span>
          )}
        </div>

        <div className="space-y-3">
          {/* Action Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "description", label: "✨ Enhance Overview" },
              { id: "feature_desc", label: "⚡ Polish Feature Bullet" },
              { id: "suggest_badges", label: "🏷️ Suggest Badges" },
              { id: "custom", label: "💬 Custom Prompt" },
            ].map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => {
                  setPlaygroundAction(act.id);
                  setPlaygroundInput(PLAYGROUND_PRESETS[act.id] || "");
                  setPlaygroundOutput("");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  playgroundAction === act.id
                    ? "bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                    : "bg-[#141424] text-gray-400 hover:text-white border border-[#22223a]"
                }`}
              >
                {act.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div>
            <textarea
              value={playgroundInput}
              onChange={(e) => setPlaygroundInput(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 bg-[#08080f] border border-[#222238] focus:border-indigo-500 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter text or rough sentence to test..."
            />
          </div>

          {/* Trigger Button */}
          <button
            type="button"
            onClick={handleRunPlayground}
            disabled={playgroundLoading || !playgroundInput.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50"
          >
            {playgroundLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Running Gemini AI...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Execute Test</span>
              </>
            )}
          </button>

          {/* Output Box */}
          {playgroundOutput && (
            <div className="bg-[#08080f] border border-[#202036] rounded-xl p-3.5 space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>AI RESPONSE OUTPUT</span>
                <span>ENGINE: {model}</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line font-sans">
                {playgroundOutput}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. SAVE BUTTON BAR */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between pt-3 border-t border-[#1e1e32]">
        <span className="text-xs text-gray-500">
          All settings are saved dynamically to MongoDB and take effect immediately.
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Saving Settings...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Save AI Configuration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
