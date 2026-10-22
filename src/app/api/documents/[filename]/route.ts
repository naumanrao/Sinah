import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession, requireRole } from '@/lib/auth';
import { ensureDbInitialized, errorResponse } from '@/lib/api-utils';
import { getSignedUrl } from '@/lib/storage';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

// GET /api/documents/[filename] - Serve a document securely
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!session) return errorResponse('Not authenticated', 401);

    const { filename } = await params;
    const db = getDb();

    // Find the document by stored_filename or id
    const { data: doc, error: docError } = await db
      .from('uploaded_documents')
      .select('*, application:applications!inner(user_id)')
      .or(`stored_filename.eq.${filename},id.eq.${filename}`)
      .maybeSingle();

    if (docError || !doc) {
      return errorResponse('Document not found', 404);
    }

    const appData = doc.application as unknown as { user_id: string } | null;
    const ownerUserId = appData?.user_id;

    // Check access: owner or admin
    const isOwner = ownerUserId === session.userId;
    const isAdmin = requireRole(session, [
      'super_admin',
      'admission_manager',
      'admission_officer',
      'finance_officer',
      'readonly_staff',
    ]);

    if (!isOwner && !isAdmin) {
      return errorResponse('Access denied', 403);
    }

    // Try generating signed URL from Supabase Storage
    const storagePath = doc.storage_path || filename;
    const { signedUrl } = await getSignedUrl(storagePath, 3600);

    if (signedUrl) {
      return NextResponse.redirect(signedUrl);
    }

    // Fallback: check local filesystem
    const filePath = path.join(UPLOAD_DIR, doc.stored_filename || filename);
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': doc.mime_type || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${doc.original_filename || filename}"`,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

    return errorResponse('File not found in storage', 404);
  } catch (error) {
    console.error('Document serve error:', error);
    return errorResponse('Failed to serve document', 500);
  }
}
