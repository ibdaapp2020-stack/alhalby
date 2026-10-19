/**
 * Mock storage service — stores uploaded images as data URLs on the
 * client. Server-side `uploadTestImage` returns a stub URL so admin
 * connection checks pass in mock mode.
 */
import { type ServiceResult, success, failure } from "@/lib/errors";

async function fileToDataUrl(file: File): Promise<string> {
  if (typeof FileReader === "undefined") {
    return "";
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

export async function uploadImageWithProgress(
  file: File,
  _path: string,
  onProgress?: (percent: number) => void
): Promise<ServiceResult<string>> {
  try {
    onProgress?.(10);
    const url = await fileToDataUrl(file);
    onProgress?.(100);
    return success(url);
  } catch (error) {
    return failure(error, "Failed to upload image");
  }
}

export async function uploadProductImage(
  file: File,
  _productId: string,
  onProgress?: (percent: number) => void
): Promise<ServiceResult<string>> {
  return uploadImageWithProgress(file, "", onProgress);
}

export async function uploadCategoryImage(
  file: File,
  _categoryId: string,
  onProgress?: (percent: number) => void
): Promise<ServiceResult<string>> {
  return uploadImageWithProgress(file, "", onProgress);
}

export async function uploadBannerImage(
  file: File,
  _bannerId: string,
  onProgress?: (percent: number) => void
): Promise<ServiceResult<string>> {
  return uploadImageWithProgress(file, "", onProgress);
}

export async function uploadModifierOptionImage(
  file: File,
  _groupId: string,
  _optionId: string,
  onProgress?: (percent: number) => void
): Promise<ServiceResult<string>> {
  return uploadImageWithProgress(file, "", onProgress);
}

export async function uploadSettingsImage(
  file: File,
  _type: "logo" | "store",
  onProgress?: (percent: number) => void
): Promise<ServiceResult<string>> {
  return uploadImageWithProgress(file, "", onProgress);
}

export async function deleteImageByUrl(_imageUrl: string): Promise<ServiceResult<void>> {
  return success(undefined);
}

export async function deleteImage(_path: string): Promise<ServiceResult<void>> {
  return success(undefined);
}

export function storagePathFromUrl(_url: string): string | null {
  return null;
}

export async function uploadTestImage(): Promise<
  ServiceResult<{ url: string; path: string }>
> {
  return success({
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    path: "mock/connection-test.png",
  });
}
