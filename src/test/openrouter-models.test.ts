import { describe, expect, it } from "vitest";
import { filterFreeModels, sortOpenRouterModels } from "@/lib/openrouter";

describe("filterFreeModels", () => {
  it("keeps only free or zero-priced models", () => {
    const models = [
      {
        id: "openai/gpt-oss-20b:free",
        name: "GPT OSS Free",
        pricing: { prompt: "0", completion: "0" },
      },
      {
        id: "meta-llama/llama-3.3",
        name: "Llama Paid",
        pricing: { prompt: "0.1", completion: "0.2" },
      },
      {
        id: "another/free-by-price",
        name: "Zero Price",
        pricing: { prompt: 0, completion: 0 },
      },
    ];

    const result = filterFreeModels(models);
    const ids = result.map((m) => m.id);

    expect(ids).toContain("openai/gpt-oss-20b:free");
    expect(ids).toContain("another/free-by-price");
    expect(ids).not.toContain("meta-llama/llama-3.3");
  });

  it("sorts models by newest and oldest", () => {
    const models = [
      {
        id: "model-old",
        name: "Model Old",
        pricing: { prompt: "0", completion: "0" },
        created: 100,
      },
      {
        id: "model-new",
        name: "Model New",
        pricing: { prompt: "0", completion: "0" },
        created: 300,
      },
      {
        id: "model-mid",
        name: "Model Mid",
        pricing: { prompt: "0", completion: "0" },
        created: 200,
      },
    ];

    const free = filterFreeModels(models);
    const newest = sortOpenRouterModels(free, "newest").map((m) => m.id);
    const oldest = sortOpenRouterModels(free, "oldest").map((m) => m.id);

    expect(newest[0]).toBe("model-new");
    expect(oldest[0]).toBe("model-old");
  });
});
