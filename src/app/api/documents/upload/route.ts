import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';
import { uploadDocument, deleteDocument } from '@/lib/storage';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

// POST /api/documents/upload - Upload a document for an application
export async function POST(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!session) return errorResponse('Not authenticated', 401);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const applicationId = formData.get('application_id') as string;
    const programDocumentId = formData.get('program_document_id') as string;
    const documentName = formData.get('document_name') as string;

    if (!file || !applicationId) {
      return errorResponse('File and application ID are required');
    }

    const db = getDb();

    // Verify application belongs to user
    const { data: app, error: appError } = await db
      .from('applications')
      .select('id, is_draft, status')
      .eq('id', applicationId)
      .eq('user_id', session.userId)
      .maybeSingle();

    if (appError || !app) {
      return errorResponse('Application not found', 404);
    }

    // Check file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Allowed: JPEG, PNG, WebP, PDF');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return errorResponse('File size exceeds 5MB limit');
    }

    // Generate unique filename and storage path
    const ext = file.name.split('.').pop() || 'bin';
    const storedFilename = `${uuidv4()}.${ext}`;
    const storagePath = `applications/${applicationId}/${programDocumentId || 'general'}/${storedFilename}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Upload to Supabase Storage
    const { path: uploadedPath, error: uploadErr } = await uploadDocument(buffer, storagePath, file.type);

    // Also write to local disk as fallback if local directory exists / for local dev
    try {
      ensureUploadDir();
      fs.writeFileSync(path.join(UPLOAD_DIR, storedFilename), buffer);
    } catch {
      // Ephemeral disk on Vercel is fine to ignore
    }

    // 2. Remove existing document for same program_document_id if exists
    if (programDocumentId) {
      const { data: existingDoc } = await db
        .from('uploaded_documents')
        .select('id, stored_filename, storage_path')
        .eq('application_id', applicationId)
        .eq('program_document_id', programDocumentId)
        .maybeSingle();

      if (existingDoc) {
        if (existingDoc.storage_path) {
          await deleteDocument(existingDoc.storage_path);
        }
        try {
          const oldPath = path.join(UPLOAD_DIR, existingDoc.stored_filename);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch {}

        await db
          .from('uploaded_documents')
          .delete()
          .eq('application_id', applicationId)
          .eq('program_document_id', programDocumentId);
      }
    }

    const docId = uuidv4();
    const finalStoragePath = uploadedPath || storagePath;

    const { error: insertError } = await db.from('uploaded_documents').insert({
      id: docId,
      application_id: applicationId,
      program_document_id: programDocumentId || null,
      document_name: documentName || file.name,
      original_filename: file.name,
      stored_filename: storedFilename,
      storage_path: finalStoragePath,
      file_size: file.size,
      mime_type: file.type,
      verification_status: 'pending',
    });

    if (insertError) {
      console.error('Error inserting document record:', insertError);
      return errorResponse('Failed to record document metadata', 500);
    }

    return successResponse({
      id: docId,
      document_name: documentName || file.name,
      original_filename: file.name,
      stored_filename: storedFilename,
      storage_path: finalStoragePath,
      file_size: file.size,
      mime_type: file.type,
    }, 201);
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse('Failed to upload document', 500);
  }
}

// DELETE /api/documents/upload - Delete a document
export async function DELETE(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!session) return errorResponse('Not authenticated', 401);

    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('id');

    if (!docId) return errorResponse('Document ID is required');

    const db = getDb();

    // Verify document belongs to user's application
    const { data: doc, error: docError } = await db
      .from('uploaded_documents')
      .select('id, stored_filename, storage_path, application:applications!inner(user_id)')
      .eq('id', docId)
      .maybeSingle();

    if (docError || !doc) {
      return errorResponse('Document not found', 404);
    }

    const appData = doc.application as unknown as { user_id: string } | null;
    if (!appData || appData.user_id !== session.userId) {
      return errorResponse('Access denied', 403);
    }

    // Delete from Supabase Storage
    if (doc.storage_path) {
      await deleteDocument(doc.storage_path);
    }

    // Delete from local filesystem if present
    try {
      const filePath = path.join(UPLOAD_DIR, doc.stored_filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {}

    const { error: delError } = await db
      .from('uploaded_documents')
      .delete()
      .eq('id', docId);

    if (delError) {
      console.error('Document delete error:', delError);
      return errorResponse('Failed to delete document record', 500);
    }

    return successResponse({ message: 'Document deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    return errorResponse('Failed to delete document', 500);
  }
}
