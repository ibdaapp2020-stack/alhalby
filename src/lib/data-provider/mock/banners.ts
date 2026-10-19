/**
 * Mock banner service. Mirrors the public signatures of
 * `src/services/bannerService.ts`.
 */
import { type ServiceResult, success, failure } from "@/lib/errors";
import { bannerSchema, type BannerInput } from "@/lib/validation/schemas";
import { isBannerLive } from "@/lib/mappers";
import type { BannerSlide } from "@/types";
import { mockStore, mockId } from "./store";

export type Unsubscribe = () => void;

function readAll(): BannerSlide[] {
  return mockStore.getSnapshot("banners");
}

function writeAll(next: BannerSlide[]): void {
  mockStore.setCollection("banners", next);
}

function sorted(banners: BannerSlide[]): BannerSlide[] {
  return [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getBanners(): Promise<BannerSlide[]> {
  return sorted(readAll()).filter(isBannerLive);
}

export function subscribeToBanners(
  onData: (banners: BannerSlide[]) => void,
  _onError: (error: string) => void
): Unsubscribe {
  return mockStore.subscribe("banners", () => {
    onData(sorted(readAll()).filter(isBannerLive));
  });
}

export function subscribeToAllBanners(
  onData: (banners: BannerSlide[]) => void,
  _onError: (error: string) => void
): Unsubscribe {
  return mockStore.subscribe("banners", () => {
    onData(sorted(readAll()));
  });
}

export async function reorderBanners(
  orderedIds: string[]
): Promise<ServiceResult<void>> {
  try {
    const map = new Map(readAll().map((b) => [b.id, b]));
    const next: BannerSlide[] = [];
    orderedIds.forEach((id, index) => {
      const existing = map.get(id);
      if (existing) {
        next.push({ ...existing, sortOrder: index + 1 });
        map.delete(id);
      }
    });
    for (const remaining of map.values()) next.push(remaining);
    writeAll(next);
    return success(undefined);
  } catch (error) {
    return failure(error, "Failed to reorder banners");
  }
}

function mapInput(input: BannerInput | Partial<BannerInput>): Partial<BannerSlide> {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
    ...(input.titleHe !== undefined ? { title_he: input.titleHe } : {}),
    ...(input.titleAr !== undefined ? { title_ar: input.titleAr } : {}),
    ...(input.titleEn !== undefined ? { title_en: input.titleEn } : {}),
    ...(input.subtitleHe !== undefined ? { subtitle_he: input.subtitleHe } : {}),
    ...(input.subtitleAr !== undefined ? { subtitle_ar: input.subtitleAr } : {}),
    ...(input.subtitleEn !== undefined ? { subtitle_en: input.subtitleEn } : {}),
    ...(input.buttonHe !== undefined ? { button_he: input.buttonHe } : {}),
    ...(input.buttonAr !== undefined ? { button_ar: input.buttonAr } : {}),
    ...(input.buttonEn !== undefined ? { button_en: input.buttonEn } : {}),
    ...(input.imageUrl !== undefined ? { image: input.imageUrl } : {}),
    ...(input.mobileImageUrl !== undefined
      ? { mobileImage: input.mobileImageUrl || undefined }
      : {}),
    ...(input.cta !== undefined ? { cta: input.cta } : {}),
    ...(input.ctaUrl !== undefined ? { ctaUrl: input.ctaUrl } : {}),
    ...(input.ctaAction !== undefined ? { ctaAction: input.ctaAction } : {}),
    ...(input.ctaTargetId !== undefined ? { ctaTargetId: input.ctaTargetId } : {}),
    ...(input.desktopPositionX !== undefined
      ? { desktopPositionX: input.desktopPositionX }
      : {}),
    ...(input.desktopPositionY !== undefined
      ? { desktopPositionY: input.desktopPositionY }
      : {}),
    ...(input.mobilePositionX !== undefined
      ? { mobilePositionX: input.mobilePositionX }
      : {}),
    ...(input.mobilePositionY !== undefined
      ? { mobilePositionY: input.mobilePositionY }
      : {}),
    ...(input.desktopZoom !== undefined ? { desktopZoom: input.desktopZoom } : {}),
    ...(input.mobileZoom !== undefined ? { mobileZoom: input.mobileZoom } : {}),
    ...(input.active !== undefined ? { active: input.active } : {}),
    ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
    ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
  };
}

export async function createBanner(
  input: BannerInput
): Promise<ServiceResult<BannerSlide>> {
  try {
    const parsed = bannerSchema.parse(input);
    const banner: BannerSlide = {
      id: mockId("banner"),
      title: parsed.title,
      subtitle: parsed.subtitle,
      image: parsed.imageUrl,
      mobileImage: parsed.mobileImageUrl || undefined,
      ...mapInput(parsed),
      active: parsed.active,
      sortOrder: parsed.sortOrder,
    } as BannerSlide;
    writeAll([...readAll(), banner]);
    return success(banner);
  } catch (error) {
    return failure(error, "Failed to create banner");
  }
}

export async function updateBanner(
  id: string,
  input: Partial<BannerInput>
): Promise<ServiceResult<void>> {
  try {
    const list = readAll();
    const index = list.findIndex((b) => b.id === id);
    if (index === -1) return failure(new Error("Banner not found"), "NOT_FOUND");
    list[index] = { ...list[index]!, ...mapInput(input) } as BannerSlide;
    writeAll(list);
    return success(undefined);
  } catch (error) {
    return failure(error, "Failed to update banner");
  }
}

export async function deleteBanner(id: string): Promise<ServiceResult<void>> {
  try {
    writeAll(readAll().filter((b) => b.id !== id));
    return success(undefined);
  } catch (error) {
    return failure(error, "Failed to delete banner");
  }
}
