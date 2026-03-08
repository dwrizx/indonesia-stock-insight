import { describe, expect, it } from "vitest";
import { getMarketIndexUrl } from "@/lib/marketIndex";

describe("market index symbols", () => {
  it("uses IDX30.JK symbol for IDX30 URL", () => {
    expect(getMarketIndexUrl("IDX30")).toContain(
      encodeURIComponent("IDX30.JK"),
    );
  });
});
