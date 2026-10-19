/**
 * Mock settings service. Mirrors the public signatures of
 * `src/services/settingsService.ts`.
 */
import { type ServiceResult, success, failure } from "@/lib/errors";
import type { AppSettings } from "@/services/settingsService";
import { mockStore } from "./store";

export type Unsubscribe = () => void;

export async function getSettings(): Promise<AppSettings> {
  return mockStore.getSnapshot("settings");
}

export function subscribeToSettings(
  onData: (settings: AppSettings) => void,
  _onError: (error: string) => void
): Unsubscribe {
  return mockStore.subscribe("settings", () => {
    onData(mockStore.getSnapshot("settings"));
  });
}

export async function updateSettings(
  input: Partial<AppSettings>
): Promise<ServiceResult<AppSettings>> {
  try {
    const current = mockStore.getSnapshot("settings");
    const merged: AppSettings = {
      ...current,
      ...input,
      theme: { ...current.theme, ...(input.theme ?? {}) },
      seo: { ...current.seo, ...(input.seo ?? {}) },
      social: { ...current.social, ...(input.social ?? {}) },
    };
    mockStore.setSettings(merged);
    return success(merged);
  } catch (error) {
    return failure(error, "Failed to update settings");
  }
}
