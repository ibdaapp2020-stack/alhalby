import { describe, expect, it } from "vitest";
import { hasRealProductImage, isBrandLogoUrl } from "@/lib/menu/placeholders";

describe("product images", () => {
  it("does not treat the store logo as a product photo", () => {
    expect(isBrandLogoUrl("/logo.png")).toBe(true);
    expect(isBrandLogoUrl("/logo.svg")).toBe(true);
    expect(hasRealProductImage("/logo.png")).toBe(false);
    expect(hasRealProductImage("")).toBe(false);
    expect(hasRealProductImage(null)).toBe(false);
  });

  it("keeps a real uploaded product image", () => {
    expect(hasRealProductImage("/products/baklava.jpg")).toBe(true);
    expect(
      hasRealProductImage(
        "https://firebasestorage.googleapis.com/v0/b/alhalby-3c35d.firebasestorage.app/o/products%2Fbaklava.png?alt=media"
      )
    ).toBe(true);
  });
});
