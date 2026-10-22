import { getDb, STORAGE_BUCKET } from '@/lib/db';

/**
 * Storage service for admission documents using Supabase Storage.
 * Uses the service role client so API routes can manage private buckets securely.
 */

export async function uploadDocument(
  fileBuffer: Buffer,
  storagePath: string,
  mimeType: string
): Promise<{ path: string; error?: string }> {
  try {
    const supabase = getDb();

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return { path: '', error: error.message };
    }

    return { path: data.path };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown storage error';
    console.error('Storage upload exception:', message);
    return { path: '', error: message };
  }
}

export async function getSignedUrl(
  storagePath: string,
  expiresInSeconds: number = 3600
): Promise<{ signedUrl: string | null; error?: string }> {
  try {
    const supabase = getDb();

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data) {
      console.error('Supabase signed URL error:', error);
      return { signedUrl: null, error: error?.message || 'Failed to generate signed URL' };
    }

    return { signedUrl: data.signedUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown storage error';
    return { signedUrl: null, error: message };
  }
}

export async function deleteDocument(storagePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getDb();

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown storage error';
    return { success: false, error: message };
  }
}
