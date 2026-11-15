/**
 * Storage URLs that belong to a different Firebase project are left in place
 * on the server. The site stops requesting them so the browser does not get
 * a 403, and deletion is skipped so the other project's files stay intact.
 */

function configuredBucket(): string {
  return process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? "";
}

export function bucketFromStorageUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const pathBucket = parsed.pathname.match(/\/b\/([^/]+)\/o\//);
    if (pathBucket?.[1]) return decodeURIComponent(pathBucket[1]);
    const host = parsed.hostname;
    if (host.endsWith(".firebasestorage.app")) {
      return host.slice(0, -".firebasestorage.app".length);
    }
    return null;
  } catch {
    return null;
  }
}

/** True when the URL is this store's bucket, or when no bucket is configured yet. */
export function storageUrlBelongsToCurrentProject(url: string): boolean {
  const bucket = configuredBucket();
  if (!bucket) return true;
  const found = bucketFromStorageUrl(url);
  if (!found) return false;
  return found === bucket;
}
