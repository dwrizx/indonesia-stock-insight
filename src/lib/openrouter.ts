import OpenAI from "openai";
import type { Stock } from "@/data/stockData";

export type OpenRouterModel = {
  id: string;
  name: string;
  promptPrice: number;
  completionPrice: number;
  contextLength: number;
  created: number;
  isFree: boolean;
};

export type RawOpenRouterModel = {
  id?: string;
  name?: string;
  created?: number;
  context_length?: number;
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
  };
};

type RawModelsResponse = {
  data?: RawOpenRouterModel[];
};

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Number.NaN;
}

function mapModels(rawModels: RawOpenRouterModel[]): OpenRouterModel[] {
  return rawModels
    .map((model) => {
      const id = typeof model.id === "string" ? model.id : "";
      const name = typeof model.name === "string" ? model.name : id;
      const promptPrice = toNumber(model.pricing?.prompt);
      const completionPrice = toNumber(model.pricing?.completion);
      const contextLength =
        typeof model.context_length === "number" ? model.context_length : 0;
      const created = typeof model.created === "number" ? model.created : 0;
      const isZeroPrice = promptPrice === 0 && completionPrice === 0;
      const isFreeSuffix = id.toLowerCase().includes(":free");

      return {
        id,
        name,
        promptPrice,
        completionPrice,
        contextLength,
        created,
        isFree: isZeroPrice || isFreeSuffix,
      };
    })
    .filter((model) => model.id.length > 0);
}

export function filterFreeModels(
  rawModels: RawOpenRouterModel[],
): OpenRouterModel[] {
  return mapModels(rawModels).filter((model) => model.isFree);
}

export function sortOpenRouterModels(
  models: OpenRouterModel[],
  order: "newest" | "oldest" | "name-asc" | "name-desc",
): OpenRouterModel[] {
  const next = [...models];
  if (order === "newest") {
    return next.sort((a, b) => b.created - a.created);
  }
  if (order === "oldest") {
    return next.sort((a, b) => a.created - b.created);
  }
  if (order === "name-desc") {
    return next.sort((a, b) => b.name.localeCompare(a.name));
  }
  return next.sort((a, b) => a.name.localeCompare(b.name));
}

function getOpenRouterApiKey(): string {
  return (import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined) ?? "";
}

function getSiteTitle(): string {
  return (
    (import.meta.env.VITE_OPENROUTER_SITE_NAME as string | undefined) ??
    "IDX Saham"
  );
}

function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_OPENROUTER_SITE_URL as
    | string
    | undefined;
  if (fromEnv && fromEnv.trim()) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:8080";
}

function createOpenRouterClient() {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey.trim()) {
    throw new Error("OPENROUTER_API_KEY belum diisi di .env");
  }

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      "HTTP-Referer": getSiteUrl(),
      "X-Title": getSiteTitle(),
    },
  });
}

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey.trim()) {
    throw new Error("OPENROUTER_API_KEY belum diisi di .env");
  }

  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": getSiteUrl(),
      "X-Title": getSiteTitle(),
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil model OpenRouter (${response.status})`);
  }

  const payload = (await response.json()) as RawModelsResponse;
  return mapModels(payload.data ?? []);
}

export async function fetchOpenRouterFreeModels(): Promise<OpenRouterModel[]> {
  const allModels = await fetchOpenRouterModels();
  return allModels.filter((model) => model.isFree);
}

export async function analyzeStockWithOpenRouter(params: {
  stock: Stock;
  model: string;
  userPrompt: string;
}): Promise<string> {
  const client = createOpenRouterClient();
  const { stock, model, userPrompt } = params;

  const prompt = `Analisis saham Indonesia berikut secara ringkas dan praktis.
Ticker: ${stock.ticker}
Nama: ${stock.name}
Sektor: ${stock.sector}
Harga: ${stock.price}
Perubahan: ${stock.changePercent.toFixed(2)}%
Volume: ${stock.volume}
Market Cap: ${stock.marketCap}
P/E: ${stock.pe}
PBV: ${stock.pbv}
ROE: ${stock.roe}
Dividend Yield: ${stock.dividendYield}
Beta: ${stock.beta}
D/E: ${stock.debtToEquity}
52W High: ${stock.high52w}
52W Low: ${stock.low52w}

Instruksi user: ${userPrompt}

Format jawaban:
1) Ringkasan kondisi (2-3 poin)
2) Bull case
3) Bear case
4) Level yang perlu diperhatikan
5) Risiko utama
6) Kesimpulan netral (bukan saran finansial pasti).`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "Kamu analis pasar saham Indonesia. Gunakan bahasa Indonesia, ringkas, objektif, dan sertakan disclaimer bahwa ini bukan nasihat keuangan personal.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return (
    completion.choices[0]?.message?.content?.trim() ??
    "Model tidak mengembalikan jawaban."
  );
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function chatWithOpenRouter(params: {
  model: string;
  systemPrompt: string;
  messages: ChatMessage[];
}): Promise<string> {
  const client = createOpenRouterClient();
  const completion = await client.chat.completions.create({
    model: params.model,
    messages: [
      { role: "system", content: params.systemPrompt },
      ...params.messages,
    ],
  });

  return (
    completion.choices[0]?.message?.content?.trim() ??
    "Model tidak mengembalikan jawaban."
  );
}
