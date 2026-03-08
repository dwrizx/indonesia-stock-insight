import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  CircleDashed,
  History,
  Plus,
  Trash2,
  Settings2,
  Search,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { stocks, type Stock } from "@/data/stockData";
import {
  chatWithOpenRouter,
  fetchOpenRouterModels,
  sortOpenRouterModels,
  type ChatMessage,
  type OpenRouterModel,
} from "@/lib/openrouter";
import {
  buildBrokerConsensus,
  buildTechnicalInsight,
  getActionSignal,
} from "@/lib/aiInsight";
import {
  deleteAiChatSession,
  listAiChatSessions,
  type AiChatSession,
  type AnalysisMethod,
  upsertAiChatSession,
} from "@/lib/aiChatHistory";
import { Switch } from "@/components/ui/switch";

type ModelScope = "all" | "free" | "zero";
type ModelSort = "newest" | "oldest" | "name-asc" | "name-desc";
type InsightMode = "standard" | "detail" | "ultra";

type AIStockAnalysisProps = {
  stock?: Stock;
  className?: string;
};

const AI_PREFS_STORAGE_KEY = "ai-stock-analysis-prefs-v1";
const AI_REPORTS_STORAGE_KEY = "ai-stock-analysis-reports-v1";

type StoredPrefs = {
  selectedModel?: string;
  modelScope?: ModelScope;
  modelSort?: ModelSort;
  insightMode?: InsightMode;
};

type StoredReport = {
  markdown: string;
  generatedAt: number;
};

function getMethodInstruction(method: AnalysisMethod): string {
  if (method === "scalping") {
    return "Metode scalping: fokus 1-2 hari, momentum cepat, volume spike, level entry/stop ketat.";
  }
  if (method === "investing") {
    return "Metode investing: horizon 6-24 bulan, kualitas fundamental, valuasi, risiko makro.";
  }
  return "Metode swing: horizon 1-4 minggu, kombinasi teknikal dan momentum.";
}

function extractVerdict(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes("STRONG BUY")) return "Strong Buy";
  if (upper.includes("STRONG SELL")) return "Strong Sell";
  if (upper.includes(" BUY")) return "Buy";
  if (upper.includes(" SELL")) return "Sell";
  if (upper.includes(" HOLD")) return "Hold";
  return "-";
}

function initialAssistantMessage(ticker: string): ChatMessage {
  return {
    role: "assistant",
    content: `Siap membantu analisis ${ticker}. Kamu bisa tanya: entry area, stop loss, skenario BUY/HOLD/SELL, atau bandingkan dengan saham lain.`,
  };
}

function extractTickerMentions(text: string): string[] {
  const matches = text.match(/\b[A-Z]{4}(?:\.JK)?\b/g) ?? [];
  return matches
    .map((item) => (item.endsWith(".JK") ? item : `${item}.JK`))
    .filter((item, index, arr) => arr.indexOf(item) === index);
}

function extractConfidence(text: string): string {
  const match = text.match(/confidence\s*[:-]\s*([0-9]{1,3})%/i);
  if (!match) return "-";
  return `${match[1]}%`;
}

const AIStockAnalysis = ({ stock, className }: AIStockAnalysisProps) => {
  const [selectedTicker, setSelectedTicker] = useState<string>(
    stock?.ticker ?? stocks[0]?.ticker ?? "",
  );
  const [tickerQuery, setTickerQuery] = useState<string>(
    stock ? `${stock.ticker} - ${stock.name}` : "",
  );
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [modelScope, setModelScope] = useState<ModelScope>("free");
  const [modelSort, setModelSort] = useState<ModelSort>("newest");
  const [insightMode, setInsightMode] = useState<InsightMode>("detail");
  const [method, setMethod] = useState<AnalysisMethod>("swing");
  const [modelQuery, setModelQuery] = useState<string>("");
  const [compareTicker, setCompareTicker] = useState<string>("");
  const [loadingModels, setLoadingModels] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showHistoryPanel, setShowHistoryPanel] = useState<boolean>(true);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(true);
  const [showSuggestionsPanel, setShowSuggestionsPanel] =
    useState<boolean>(true);
  const [compareQuery, setCompareQuery] = useState<string>("");
  const [sessions, setSessions] = useState<AiChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [deepInsightLoading, setDeepInsightLoading] = useState<boolean>(false);
  const [deepInsightMarkdown, setDeepInsightMarkdown] = useState<string>("");
  const [deepInsightGeneratedAt, setDeepInsightGeneratedAt] = useState<
    number | null
  >(null);
  const [savedReports, setSavedReports] = useState<
    Record<string, StoredReport>
  >({});
  const chatRef = useRef<HTMLDivElement>(null);

  const hasApiKey = useMemo(
    () =>
      Boolean(
        (import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined)?.trim(),
      ),
    [],
  );

  const selectedStock = useMemo(
    () => stocks.find((item) => item.ticker === selectedTicker),
    [selectedTicker],
  );

  const stockOptions = useMemo(() => {
    const query = tickerQuery.trim().toLowerCase();
    const base = query
      ? stocks.filter(
          (item) =>
            item.ticker.toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query),
        )
      : stocks;
    return base.slice(0, 80);
  }, [tickerQuery]);

  const compareCandidates = useMemo(() => {
    if (!selectedStock) return [];
    return stocks.filter(
      (item) =>
        item.ticker !== selectedStock.ticker &&
        item.sector === selectedStock.sector,
    );
  }, [selectedStock]);
  const compareOptions = useMemo(() => {
    const q = compareQuery.trim().toLowerCase();
    if (!q) return compareCandidates.slice(0, 120);
    return compareCandidates
      .filter(
        (item) =>
          item.ticker.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q),
      )
      .slice(0, 120);
  }, [compareCandidates, compareQuery]);

  const compareStock = useMemo(
    () => compareCandidates.find((item) => item.ticker === compareTicker),
    [compareCandidates, compareTicker],
  );

  const technical = useMemo(
    () => (selectedStock ? buildTechnicalInsight(selectedStock) : null),
    [selectedStock],
  );
  const consensus = useMemo(
    () => (selectedStock ? buildBrokerConsensus(selectedStock) : null),
    [selectedStock],
  );
  const action = useMemo(
    () => (technical ? getActionSignal(technical.totalScore) : "-"),
    [technical],
  );
  const compareTechnical = useMemo(
    () => (compareStock ? buildTechnicalInsight(compareStock) : null),
    [compareStock],
  );

  const refreshSessions = useCallback(async () => {
    try {
      const all = await listAiChatSessions();
      setSessions(all);
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  const createSession = useCallback(
    async (overwriteTicker?: string, overwriteMethod?: AnalysisMethod) => {
      const ticker = overwriteTicker ?? selectedTicker;
      const m = overwriteMethod ?? method;
      const id = `${ticker}-${m}-${Date.now()}`;
      const session: AiChatSession = {
        id,
        title: `Analisis ${ticker} (${m})`,
        ticker,
        method: m,
        compareTicker: "",
        messages: [initialAssistantMessage(ticker)],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await upsertAiChatSession(session);
      await refreshSessions();
      setActiveSessionId(id);
      setMessages(session.messages);
    },
    [selectedTicker, method, refreshSessions],
  );

  useEffect(() => {
    const matching = sessions.filter(
      (item) => item.ticker === selectedTicker && item.method === method,
    );
    if (!activeSessionId) {
      const latest = matching[0];
      if (latest) {
        setActiveSessionId(latest.id);
        setMessages(latest.messages);
      } else if (selectedTicker) {
        void createSession(selectedTicker, method);
      }
      return;
    }
    const active = sessions.find((item) => item.id === activeSessionId);
    if (active) {
      setMessages(active.messages);
      setCompareTicker(active.compareTicker ?? "");
      if (active.compareTicker) {
        const activeCompareStock = stocks.find(
          (s) => s.ticker === active.compareTicker,
        );
        setCompareQuery(
          activeCompareStock
            ? `${activeCompareStock.ticker} - ${activeCompareStock.name}`
            : active.compareTicker,
        );
      } else {
        setCompareQuery("");
      }
      if (active.ticker !== selectedTicker) {
        setSelectedTicker(active.ticker);
        const activeStock = stocks.find((s) => s.ticker === active.ticker);
        setTickerQuery(
          activeStock
            ? `${activeStock.ticker} - ${activeStock.name}`
            : active.ticker,
        );
      }
    }
  }, [sessions, activeSessionId, selectedTicker, method, createSession]);

  const persistMessages = useCallback(
    async (nextMessages: ChatMessage[]) => {
      if (!activeSessionId || !selectedTicker) return;
      const session = sessions.find((item) => item.id === activeSessionId);
      const payload: AiChatSession = {
        id: activeSessionId,
        title: session?.title ?? `Analisis ${selectedTicker} (${method})`,
        ticker: selectedTicker,
        method,
        compareTicker,
        messages: nextMessages,
        createdAt: session?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      };
      await upsertAiChatSession(payload);
      await refreshSessions();
    },
    [
      activeSessionId,
      selectedTicker,
      method,
      compareTicker,
      sessions,
      refreshSessions,
    ],
  );

  const loadModels = useCallback(async () => {
    setLoadingModels(true);
    setError("");
    try {
      const allModels = await fetchOpenRouterModels();
      setModels(allModels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil model.");
    } finally {
      setLoadingModels(false);
    }
  }, []);

  useEffect(() => {
    if (!hasApiKey) return;
    void loadModels();
  }, [hasApiKey, loadModels]);

  useEffect(() => {
    try {
      const rawPrefs = window.localStorage.getItem(AI_PREFS_STORAGE_KEY);
      if (rawPrefs) {
        const prefs = JSON.parse(rawPrefs) as StoredPrefs;
        if (prefs.modelScope) setModelScope(prefs.modelScope);
        if (prefs.modelSort) setModelSort(prefs.modelSort);
        if (prefs.selectedModel) setSelectedModel(prefs.selectedModel);
        if (prefs.insightMode) setInsightMode(prefs.insightMode);
      }
    } catch {
      // noop
    }
    try {
      const rawReports = window.localStorage.getItem(AI_REPORTS_STORAGE_KEY);
      if (rawReports) {
        const parsed = JSON.parse(rawReports) as Record<string, StoredReport>;
        setSavedReports(parsed);
      }
    } catch {
      // noop
    }
  }, []);

  const modelOptions = useMemo(() => {
    let next = [...models];
    if (modelScope === "free") next = next.filter((model) => model.isFree);
    if (modelScope === "zero") {
      next = next.filter(
        (model) => model.promptPrice === 0 && model.completionPrice === 0,
      );
    }
    const q = modelQuery.trim().toLowerCase();
    if (q) {
      next = next.filter(
        (model) =>
          model.id.toLowerCase().includes(q) ||
          model.name.toLowerCase().includes(q),
      );
    }
    return sortOpenRouterModels(next, modelSort);
  }, [models, modelScope, modelQuery, modelSort]);

  useEffect(() => {
    if (modelOptions.length === 0) {
      setSelectedModel("");
      return;
    }
    if (
      !selectedModel ||
      !modelOptions.some((item) => item.id === selectedModel)
    ) {
      setSelectedModel(modelOptions[0].id);
    }
  }, [modelOptions, selectedModel]);

  useEffect(() => {
    try {
      const prefs: StoredPrefs = {
        selectedModel,
        modelScope,
        modelSort,
        insightMode,
      };
      window.localStorage.setItem(AI_PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // noop
    }
  }, [selectedModel, modelScope, modelSort, insightMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        AI_REPORTS_STORAGE_KEY,
        JSON.stringify(savedReports),
      );
    } catch {
      // noop
    }
  }, [savedReports]);

  useEffect(() => {
    if (!selectedTicker) return;
    const cached = savedReports[selectedTicker];
    if (!cached) {
      setDeepInsightMarkdown("");
      setDeepInsightGeneratedAt(null);
      return;
    }
    setDeepInsightMarkdown(cached.markdown);
    setDeepInsightGeneratedAt(cached.generatedAt);
  }, [selectedTicker, savedReports]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const systemPrompt = useMemo(() => {
    if (!selectedStock || !technical || !consensus) return "";
    const compareBlock =
      compareStock && compareTechnical
        ? `\nPerbandingan dengan ${compareStock.ticker} (${compareStock.name}):
- Technical Score: ${compareTechnical.totalScore}/100
- Action Signal: ${getActionSignal(compareTechnical.totalScore)}`
        : "";
    return `Kamu analis saham Indonesia yang objektif dan ringkas.
Gunakan bahasa Indonesia yang mudah dibaca.
${getMethodInstruction(method)}
Gunakan format markdown rapi (judul kecil, bullet points, dan tabel ringkas jika perlu).
Selalu pakai data saham yang diberikan sebagai referensi utama, jangan memberi jawaban generik.

Data utama ${selectedStock.ticker} (${selectedStock.name}):
- Sector: ${selectedStock.sector}
- Price: ${selectedStock.price}
- Change: ${selectedStock.changePercent.toFixed(2)}%
- Volume: ${selectedStock.volume}
- Market Cap: ${selectedStock.marketCap}
- PE: ${selectedStock.pe}, PBV: ${selectedStock.pbv}, ROE: ${selectedStock.roe}, DY: ${selectedStock.dividendYield}
- 52W High/Low: ${selectedStock.high52w}/${selectedStock.low52w}
- Technical Score: ${technical.totalScore}/100
- Action Signal: ${action}
- Broker Consensus:
  Strong Buy ${consensus.strongBuy}, Buy ${consensus.buy}, Hold ${consensus.hold}, Sell ${consensus.sell}, Strong Sell ${consensus.strongSell}
${compareBlock}

Format jawaban:
1) Ringkasan cepat
2) Bull case
3) Bear case
4) Aksi: Strong Buy/Buy/Hold/Sell/Strong Sell + alasan
5) Level entry, stop, dan target
6) Rekomendasi saham lain (maks 4) format: - TICKER | alasan singkat
7) Disclaimer singkat.`;
  }, [
    selectedStock,
    technical,
    consensus,
    compareStock,
    compareTechnical,
    method,
    action,
  ]);

  const sendMessage = async (preset?: string) => {
    const question = (preset ?? input).trim();
    if (!question) return;
    if (!selectedModel || !selectedStock || !systemPrompt) {
      setError("Model atau saham belum siap.");
      return;
    }
    const userMsg: ChatMessage = { role: "user", content: question };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSending(true);
    setError("");
    await persistMessages(next);
    try {
      const reply = await chatWithOpenRouter({
        model: selectedModel,
        systemPrompt,
        messages: next.slice(-16),
      });
      const finalMessages = [...next, { role: "assistant", content: reply }];
      setMessages(finalMessages);
      await persistMessages(finalMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim chat AI.");
    } finally {
      setSending(false);
    }
  };

  const generateDeepInsight = async () => {
    if (
      !selectedModel ||
      !selectedStock ||
      !technical ||
      !consensus ||
      !systemPrompt
    ) {
      setError("Model atau saham belum siap.");
      return;
    }
    setDeepInsightLoading(true);
    setError("");
    try {
      const depthInstruction =
        insightMode === "ultra"
          ? "Buat analisis paling mendalam dan komprehensif."
          : insightMode === "detail"
            ? "Buat analisis detail yang tetap ringkas per bagian."
            : "Buat analisis standard yang cepat dipahami.";

      const deepPrompt = `Buat laporan AI Insight untuk ${selectedStock.ticker} yang sangat terstruktur, detail, dan siap dibaca investor.
JANGAN tanya balik. Langsung berikan hasil final.
Gunakan markdown yang rapi dan pakai heading.

Wajib format:
# AI Insight
## Keputusan Utama
- Recommendation: (Strong Buy/Buy/Hold/Sell/Strong Sell)
- Confidence: xx%
- Alasan inti (2-3 poin)
## Ringkasan Fundamental
## Ringkasan Teknikal
## Broker Consensus
## Skenario (Bull/Base/Bear)
## Risk Checklist
## Action Plan (Entry/Stop/Target)
## Watchlist Rekomendasi

Ketentuan:
- Bahasa Indonesia.
- Fokus data yang diberikan, tidak boleh generik.
- Beri poin yang actionable.
- ${depthInstruction}
- Watchlist maksimal 5 ticker Indonesia dengan alasan singkat.`;

      const reply = await chatWithOpenRouter({
        model: selectedModel,
        systemPrompt,
        messages: [{ role: "user", content: deepPrompt }],
      });
      setDeepInsightMarkdown(reply);
      const generatedAt = Date.now();
      setDeepInsightGeneratedAt(generatedAt);
      setSavedReports((prev) => ({
        ...prev,
        [selectedStock.ticker]: {
          markdown: reply,
          generatedAt,
        },
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal membuat deep analysis.",
      );
    } finally {
      setDeepInsightLoading(false);
    }
  };

  const clearDeepInsight = () => {
    if (!selectedTicker) return;
    setDeepInsightMarkdown("");
    setDeepInsightGeneratedAt(null);
    setSavedReports((prev) => {
      const next = { ...prev };
      delete next[selectedTicker];
      return next;
    });
  };

  const deleteActiveSession = async () => {
    if (!activeSessionId) return;
    await deleteAiChatSession(activeSessionId);
    setActiveSessionId("");
    setMessages([]);
    await refreshSessions();
  };

  const latestAssistant = [...messages]
    .reverse()
    .find((item) => item.role === "assistant");
  const mentionedStocks = useMemo(() => {
    if (!latestAssistant) return [];
    const mentions = extractTickerMentions(latestAssistant.content);
    return mentions
      .filter(
        (ticker) =>
          ticker !== selectedTicker &&
          (!compareTicker || ticker !== compareTicker),
      )
      .map((ticker) => stocks.find((item) => item.ticker === ticker))
      .filter((item): item is Stock => Boolean(item))
      .slice(0, 8);
  }, [latestAssistant, selectedTicker, compareTicker]);
  const aiVerdict = latestAssistant
    ? extractVerdict(latestAssistant.content)
    : "-";
  const deepVerdict = deepInsightMarkdown
    ? extractVerdict(deepInsightMarkdown)
    : action;
  const deepConfidence = deepInsightMarkdown
    ? extractConfidence(deepInsightMarkdown)
    : "-";
  const deepMentionedStocks = useMemo(() => {
    if (!deepInsightMarkdown) return [];
    return extractTickerMentions(deepInsightMarkdown)
      .filter((ticker) => ticker !== selectedTicker)
      .map((ticker) => stocks.find((item) => item.ticker === ticker))
      .filter((item): item is Stock => Boolean(item))
      .slice(0, 10);
  }, [deepInsightMarkdown, selectedTicker]);
  const freeCount = models.filter((item) => item.isFree).length;
  const zeroPriceCount = models.filter(
    (item) => item.promptPrice === 0 && item.completionPrice === 0,
  ).length;
  const suggestionPrompts = [
    "Apakah saham ini lebih cocok HOLD atau BUY untuk minggu ini?",
    "Buat entry, stop loss, dan target untuk mode swing.",
    "Apa 3 risiko terbesar jika beli saham ini sekarang?",
    "Bandingkan saham ini dengan pembanding yang dipilih, mana lebih baik?",
    "Kalau saya konservatif, aksi paling aman sekarang apa?",
  ];

  useEffect(() => {
    if (focusMode) {
      setShowStats(false);
      setShowControls(false);
      setShowHistoryPanel(false);
      setShowDiagnostics(false);
      setShowSuggestionsPanel(false);
    } else {
      setShowStats(true);
      setShowControls(true);
      setShowHistoryPanel(true);
      setShowDiagnostics(true);
      setShowSuggestionsPanel(true);
    }
  }, [focusMode]);

  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 gradient-border ${className ?? ""}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
          <Bot className="h-4 w-4 text-primary" />
          AI Chat Analysis
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Settings
          </button>
          <button
            onClick={() => void loadModels()}
            disabled={loadingModels || !hasApiKey}
            className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground disabled:opacity-50"
          >
            Refresh Model
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-border bg-secondary/10 p-3 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-md border border-border bg-card px-2.5 py-2 text-xs">
            Focus Mode
            <Switch checked={focusMode} onCheckedChange={setFocusMode} />
          </label>
          <label className="flex items-center justify-between rounded-md border border-border bg-card px-2.5 py-2 text-xs">
            Tampilkan Stats
            <Switch checked={showStats} onCheckedChange={setShowStats} />
          </label>
          <label className="flex items-center justify-between rounded-md border border-border bg-card px-2.5 py-2 text-xs">
            Tampilkan Controls
            <Switch checked={showControls} onCheckedChange={setShowControls} />
          </label>
          <label className="flex items-center justify-between rounded-md border border-border bg-card px-2.5 py-2 text-xs">
            Tampilkan History
            <Switch
              checked={showHistoryPanel}
              onCheckedChange={setShowHistoryPanel}
            />
          </label>
          <label className="flex items-center justify-between rounded-md border border-border bg-card px-2.5 py-2 text-xs">
            Tampilkan Diagnostics
            <Switch
              checked={showDiagnostics}
              onCheckedChange={setShowDiagnostics}
            />
          </label>
          <label className="flex items-center justify-between rounded-md border border-border bg-card px-2.5 py-2 text-xs">
            Tampilkan Suggestions
            <Switch
              checked={showSuggestionsPanel}
              onCheckedChange={setShowSuggestionsPanel}
            />
          </label>
        </div>
      )}

      {!hasApiKey && (
        <p className="rounded-md border border-loss/30 bg-loss/10 p-2 text-[11px] text-loss">
          Isi `VITE_OPENROUTER_API_KEY` di `.env` untuk mengaktifkan AI Chat.
        </p>
      )}

      {hasApiKey && (
        <div className="space-y-3">
          {showStats && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-secondary/20 p-3">
                  <p className="text-[10px] text-muted-foreground">
                    Technical Score
                  </p>
                  <p className="text-lg font-extrabold text-foreground">
                    {technical?.totalScore ?? "-"}/100
                  </p>
                  <p className="text-[11px] font-semibold text-primary">
                    {action}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-3">
                  <p className="text-[10px] text-muted-foreground">
                    Broker Consensus
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {consensus?.consensus ?? "-"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {consensus?.analysts ?? "-"} analis
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-primary/25 bg-primary/10 p-2 text-xs">
                <p className="text-[10px] text-primary/80">
                  AI Verdict Terakhir
                </p>
                <p className="font-semibold text-primary">{aiVerdict}</p>
              </div>
            </>
          )}

          <div className="rounded-xl border border-border bg-secondary/10 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-foreground">AI Insight</p>
                <p className="text-[10px] text-muted-foreground">
                  AI insights provide deeper analysis for informed decisions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="max-w-[260px] rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] text-foreground"
                >
                  {loadingModels && <option value="">Memuat model...</option>}
                  {!loadingModels && modelOptions.length === 0 && (
                    <option value="">Model tidak tersedia</option>
                  )}
                  {modelOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}{" "}
                      {item.promptPrice === 0 && item.completionPrice === 0
                        ? "[HARGA 0]"
                        : item.isFree
                          ? "[FREE]"
                          : ""}
                    </option>
                  ))}
                </select>
                <select
                  value={insightMode}
                  onChange={(e) =>
                    setInsightMode(e.target.value as InsightMode)
                  }
                  className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] text-foreground"
                >
                  <option value="standard">Mode Standard</option>
                  <option value="detail">Mode Detail</option>
                  <option value="ultra">Mode Ultra</option>
                </select>
                <button
                  onClick={() => void generateDeepInsight()}
                  disabled={deepInsightLoading || !selectedModel}
                  className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary disabled:opacity-60"
                >
                  {deepInsightLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {deepInsightLoading
                    ? "Menyusun Insight..."
                    : "Generate AI Insight"}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-center">
                <p className="inline-flex items-center gap-2 text-2xl font-extrabold text-foreground">
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                  {deepVerdict === "-" ? action : deepVerdict}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Technical Score: {technical?.totalScore ?? "-"}/100
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Confidence: {deepConfidence}
                </p>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-foreground">
                  Broker Consensus
                </p>
                {consensus && (
                  <div className="space-y-2 text-xs">
                    {[
                      {
                        label: "Strong Buy",
                        value: consensus.strongBuy,
                        color: "bg-emerald-400",
                      },
                      {
                        label: "Buy",
                        value: consensus.buy,
                        color: "bg-cyan-400",
                      },
                      {
                        label: "Hold",
                        value: consensus.hold,
                        color: "bg-slate-400",
                      },
                      {
                        label: "Sell",
                        value: consensus.sell,
                        color: "bg-amber-400",
                      },
                      {
                        label: "Strong Sell",
                        value: consensus.strongSell,
                        color: "bg-rose-400",
                      },
                    ].map((row) => {
                      const max = Math.max(
                        consensus.strongBuy,
                        consensus.buy,
                        consensus.hold,
                        consensus.sell,
                        consensus.strongSell,
                        1,
                      );
                      const width = `${Math.max(8, (row.value / max) * 100)}%`;
                      return (
                        <div key={row.label}>
                          <div className="mb-1 flex items-center justify-between text-[11px]">
                            <span className="text-foreground">{row.label}</span>
                            <span className="text-muted-foreground">
                              {row.value}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary/40">
                            <div
                              className={`h-2 rounded-full ${row.color}`}
                              style={{ width }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {deepInsightMarkdown && (
              <div className="mt-3 rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Deep Analysis Report</span>
                  <div className="flex items-center gap-2">
                    <span>
                      {deepInsightGeneratedAt
                        ? new Date(deepInsightGeneratedAt).toLocaleString(
                            "id-ID",
                          )
                        : "-"}
                    </span>
                    <button
                      onClick={clearDeepInsight}
                      className="rounded-md border border-border px-2 py-1 text-[10px] hover:border-primary/30"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert prose-headings:text-foreground prose-strong:text-foreground prose-code:text-primary max-w-none font-sans text-[15px] leading-8 prose-p:my-2.5 prose-li:my-1 prose-headings:mb-2 prose-headings:mt-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {deepInsightMarkdown}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {deepMentionedStocks.length > 0 && (
              <div className="mt-3 rounded-lg border border-border bg-card p-3">
                <p className="mb-2 text-xs font-semibold text-foreground">
                  Watchlist dari AI Insight
                </p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {deepMentionedStocks.map((item) => (
                    <Link
                      key={item.ticker}
                      to={`/stock/${item.ticker}`}
                      className="rounded-lg border border-border bg-secondary/20 p-2.5 transition-colors hover:border-primary/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-mono text-sm font-bold text-foreground">
                            {item.ticker.replace(".JK", "")}
                          </p>
                          <p className="line-clamp-1 text-[11px] text-muted-foreground">
                            {item.name}
                          </p>
                        </div>
                        <span
                          className={
                            item.changePercent >= 0
                              ? "text-xs font-semibold text-gain"
                              : "text-xs font-semibold text-loss"
                          }
                        >
                          {item.changePercent >= 0 ? "+" : ""}
                          {item.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {showControls && (
            <>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] text-muted-foreground">
                    Pilih Saham (search)
                  </label>
                  <input
                    value={tickerQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTickerQuery(value);
                      const normalized = value
                        .split(" - ")[0]
                        ?.trim()
                        .toUpperCase();
                      const exact = stocks.find(
                        (item) =>
                          item.ticker === normalized ||
                          `${item.ticker} - ${item.name}`.toLowerCase() ===
                            value.trim().toLowerCase(),
                      );
                      if (exact) {
                        setSelectedTicker(exact.ticker);
                        setTickerQuery(`${exact.ticker} - ${exact.name}`);
                      }
                    }}
                    list="ai-stock-options"
                    className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground"
                    placeholder="Cari ticker atau nama saham..."
                  />
                  <datalist id="ai-stock-options">
                    {stockOptions.map((item) => (
                      <option key={item.ticker} value={item.ticker}>
                        {item.name}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-muted-foreground">
                    Bandingkan (opsional)
                  </label>
                  <input
                    value={compareQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCompareQuery(value);
                      const normalized = value
                        .split(" - ")[0]
                        ?.trim()
                        .toUpperCase();
                      const exact = compareCandidates.find(
                        (item) =>
                          item.ticker === normalized ||
                          `${item.ticker} - ${item.name}`.toLowerCase() ===
                            value.trim().toLowerCase(),
                      );
                      if (exact) {
                        setCompareTicker(exact.ticker);
                        setCompareQuery(`${exact.ticker} - ${exact.name}`);
                      } else if (!value.trim()) {
                        setCompareTicker("");
                      }
                    }}
                    list="ai-compare-options"
                    className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground"
                    placeholder="Cari saham pembanding (sektor sama)..."
                  />
                  <datalist id="ai-compare-options">
                    {compareOptions.map((item) => (
                      <option
                        key={item.ticker}
                        value={`${item.ticker} - ${item.name}`}
                      />
                    ))}
                  </datalist>
                  {compareTicker && compareStock && (
                    <button
                      onClick={() => {
                        setCompareTicker("");
                        setCompareQuery("");
                      }}
                      className="mt-1 text-[10px] text-muted-foreground underline underline-offset-2"
                    >
                      Reset pembanding ({compareStock.ticker})
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-[11px] md:grid-cols-2">
                <div className="rounded-lg border border-border bg-secondary/15 p-2.5">
                  <p className="mb-1 text-[10px] font-semibold text-muted-foreground">
                    Referensi Utama
                  </p>
                  <p className="font-semibold text-foreground">
                    {selectedStock?.ticker} - {selectedStock?.name}
                  </p>
                  <p className="text-muted-foreground">
                    Sector: {selectedStock?.sector} | Price:{" "}
                    {selectedStock?.price}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/15 p-2.5">
                  <p className="mb-1 text-[10px] font-semibold text-muted-foreground">
                    Referensi Pembanding
                  </p>
                  {compareStock ? (
                    <>
                      <p className="font-semibold text-foreground">
                        {compareStock.ticker} - {compareStock.name}
                      </p>
                      <p className="text-muted-foreground">
                        Sector: {compareStock.sector} | Price:{" "}
                        {compareStock.price}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Tanpa perbandingan</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMethod("scalping")}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold ${method === "scalping" ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-secondary/20 text-muted-foreground"}`}
                >
                  Scalping
                </button>
                <button
                  onClick={() => setMethod("swing")}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold ${method === "swing" ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-secondary/20 text-muted-foreground"}`}
                >
                  Swing
                </button>
                <button
                  onClick={() => setMethod("investing")}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold ${method === "investing" ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-secondary/20 text-muted-foreground"}`}
                >
                  Investing
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={modelScope}
                  onChange={(e) => setModelScope(e.target.value as ModelScope)}
                  className="rounded-lg border border-border bg-secondary/30 px-2 py-2 text-xs text-foreground"
                >
                  <option value="zero">Harga 0 Saja ({zeroPriceCount})</option>
                  <option value="free">Free / Harga 0 ({freeCount})</option>
                  <option value="all">Semua Model ({models.length})</option>
                </select>
                <select
                  value={modelSort}
                  onChange={(e) => setModelSort(e.target.value as ModelSort)}
                  className="rounded-lg border border-border bg-secondary/30 px-2 py-2 text-xs text-foreground"
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="name-asc">Nama A-Z</option>
                  <option value="name-desc">Nama Z-A</option>
                </select>
              </div>

              <input
                value={modelQuery}
                onChange={(e) => setModelQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground"
                placeholder="Cari model..."
              />

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground"
              >
                {loadingModels && <option>Memuat model...</option>}
                {!loadingModels && modelOptions.length === 0 && (
                  <option>Tidak ada model sesuai filter</option>
                )}
                {modelOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}{" "}
                    {item.promptPrice === 0 && item.completionPrice === 0
                      ? "[HARGA 0]"
                      : item.isFree
                        ? "[FREE]"
                        : ""}{" "}
                    | {item.id}
                  </option>
                ))}
              </select>
            </>
          )}

          {showHistoryPanel && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => void createSession()}
                  className="flex items-center justify-center gap-1 rounded-lg border border-border bg-secondary/20 px-2 py-2 text-xs font-semibold text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Sesi Baru
                </button>
                <select
                  value={activeSessionId}
                  onChange={(e) => setActiveSessionId(e.target.value)}
                  className="col-span-2 rounded-lg border border-border bg-secondary/20 px-2 py-2 text-xs text-foreground"
                >
                  <option value="">Pilih history</option>
                  {sessions
                    .filter((item) => item.ticker === selectedTicker)
                    .slice(0, 40)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {new Date(item.updatedAt).toLocaleString("id-ID")} -{" "}
                        {item.method}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={() => void deleteActiveSession()}
                disabled={!activeSessionId}
                className="flex items-center justify-center gap-2 rounded-lg border border-loss/30 bg-loss/10 px-3 py-2 text-xs font-semibold text-loss disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus History Aktif
              </button>

              <div className="rounded-md border border-border bg-secondary/10 p-2 text-[11px] text-muted-foreground">
                <p className="mb-1 flex items-center gap-1">
                  <History className="h-3 w-3" />
                  History chat disimpan di IndexedDB (tetap ada setelah
                  refresh).
                </p>
              </div>
            </>
          )}

          {showDiagnostics && (
            <>
              <div className="rounded-md border border-border bg-secondary/10 p-2 text-[11px] text-muted-foreground">
                <p>
                  EMA 20/50 (30%), RSI (25%), MACD (25%), Volume (10%), Broker
                  Consensus (10%).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="rounded-md border border-border bg-secondary/15 p-2">
                  <p className="mb-1 flex items-center gap-1 text-muted-foreground">
                    <BarChart3 className="h-3 w-3" />
                    Score Components
                  </p>
                  <p>MA: {technical?.movingAverage.value.toFixed(0) ?? "-"}</p>
                  <p>RSI: {technical?.rsiMomentum.value.toFixed(0) ?? "-"}</p>
                  <p>MACD: {technical?.macdSignal.value.toFixed(0) ?? "-"}</p>
                  <p>
                    Volume: {technical?.volumeAnalysis.value.toFixed(0) ?? "-"}
                  </p>
                </div>
                <div className="rounded-md border border-border bg-secondary/15 p-2">
                  <p className="mb-1 flex items-center gap-1 text-muted-foreground">
                    <CircleDashed className="h-3 w-3" />
                    Consensus Detail
                  </p>
                  <p>Strong Buy: {consensus?.strongBuy ?? "-"}</p>
                  <p>Buy: {consensus?.buy ?? "-"}</p>
                  <p>Hold: {consensus?.hold ?? "-"}</p>
                  <p>
                    Sell/Strong Sell:{" "}
                    {(consensus?.sell ?? 0) + (consensus?.strongSell ?? 0)}
                  </p>
                </div>
              </div>
            </>
          )}

          <div
            ref={chatRef}
            className="max-h-[32rem] space-y-2 overflow-y-auto rounded-lg border border-border bg-secondary/5 p-3.5"
          >
            {messages.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-lg px-3.5 py-2.5 ${
                  item.role === "user"
                    ? "ml-4 bg-primary/15 text-foreground md:ml-10"
                    : "mr-4 border border-border bg-card text-foreground md:mr-10"
                }`}
              >
                <p className="mb-1 text-[10px] font-semibold text-muted-foreground">
                  {item.role === "user" ? "Kamu" : "AI"}
                </p>
                {item.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert prose-headings:text-foreground prose-strong:text-foreground prose-code:text-primary max-w-none font-sans text-[15px] leading-8 prose-p:my-2 prose-li:my-1 prose-headings:mb-2 prose-headings:mt-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap font-sans text-[15px] leading-8">
                    {item.content}
                  </p>
                )}
              </div>
            ))}
          </div>

          {mentionedStocks.length > 0 && (
            <div className="rounded-lg border border-border bg-secondary/10 p-2.5">
              <p className="mb-2 inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                <Search className="h-3 w-3" />
                Saham Disebut / Direkomendasikan AI
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {mentionedStocks.map((item) => (
                  <Link
                    key={item.ticker}
                    to={`/stock/${item.ticker}`}
                    className="rounded-lg border border-border bg-card p-2.5 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-sm font-bold text-foreground">
                          {item.ticker.replace(".JK", "")}
                        </p>
                        <p className="line-clamp-1 text-[11px] text-muted-foreground">
                          {item.name}
                        </p>
                      </div>
                      <span className="rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {item.sector}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-foreground">
                        {item.price}
                      </span>
                      <span
                        className={
                          item.changePercent >= 0
                            ? "font-semibold text-gain"
                            : "font-semibold text-loss"
                        }
                      >
                        {item.changePercent >= 0 ? "+" : ""}
                        {item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {showSuggestionsPanel && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    void sendMessage(
                      "Buat analisis lengkap dengan keputusan aksi dan level entry/stop/target.",
                    )
                  }
                  className="flex items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-2 text-xs font-semibold text-primary"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Analisis Lengkap
                </button>
                <button
                  onClick={() =>
                    void sendMessage(
                      compareStock
                        ? `Bandingkan ${selectedTicker} vs ${compareStock.ticker}. Mana yang lebih layak untuk metode ${method}?`
                        : "Berikan rekomendasi HOLD/BUY/SELL dengan alasan detail.",
                    )
                  }
                  className="flex items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-2 text-xs font-semibold text-primary"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Bandingkan Sekali Klik
                </button>
              </div>

              <div className="rounded-lg border border-border bg-secondary/10 p-2">
                <p className="mb-2 text-[10px] font-semibold text-muted-foreground">
                  Saran Pertanyaan Cepat
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestionPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-md border border-border bg-card px-2.5 py-1.5 text-[10px] text-foreground hover:border-primary/30"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
              rows={3}
              className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2.5 font-sans text-[15px] leading-7 text-foreground"
              placeholder="Tanya AI, mis: apakah HOLD atau BUY minggu ini?"
            />
            <button
              onClick={() => void sendMessage()}
              disabled={sending || !selectedModel}
              className="flex h-10 items-center justify-center gap-1 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-md border border-loss/30 bg-loss/10 p-2 text-[11px] text-loss">
          {error}
        </p>
      )}
    </div>
  );
};

export default AIStockAnalysis;
