/**
 * Shared attachment utilities for multi-file upload support.
 *
 * Provides:
 * - Zod schema for attachment validation (max 5 files)
 * - Helper to resolve attachments from new jsonb field or legacy scalar fields
 */

import { z } from "zod";
import { storageGet } from "../storage";

/** Single attachment item schema */
export const attachmentItemSchema = z.object({
  url: z.string(),
  fileKey: z.string(),
  fileName: z.string(),
  fileSize: z.number().optional(),
});

/** Attachments array schema — max 5 items */
export const attachmentsSchema = z.array(attachmentItemSchema).max(5).optional();

export type AttachmentItem = z.infer<typeof attachmentItemSchema>;

/**
 * Resolve attachments for a record, providing backward compatibility
 * with legacy single-file fields.
 *
 * Priority:
 * 1. If `attachments` jsonb field has data, use it (re-sign URLs from fileKeys).
 * 2. Otherwise, fall back to legacy scalar fields (receiptFileUrl/receiptFileKey
 *    or attachmentUrl/attachmentFileKey).
 *
 * @param record - A DB record that may have attachments, receiptFileUrl/Key, or attachmentUrl/Key
 * @returns Resolved attachments array with signed URLs
 */
export async function resolveAttachments(record: {
  attachments?: AttachmentItem[] | null;
  receiptFileUrl?: string | null;
  receiptFileKey?: string | null;
  attachmentUrl?: string | null;
  attachmentFileKey?: string | null;
}): Promise<AttachmentItem[]> {
  // Case 1: New multi-file attachments field
  if (record.attachments && Array.isArray(record.attachments) && record.attachments.length > 0) {
    const resolved = await Promise.all(
      record.attachments.map(async (att) => {
        if (att.fileKey) {
          try {
            const { url } = await storageGet(att.fileKey);
            return { ...att, url };
          } catch {
            return att;
          }
        }
        return att;
      })
    );
    return resolved;
  }

  // Case 2: Legacy single-file — receiptFileUrl / receiptFileKey
  const legacyKey = record.receiptFileKey || record.attachmentFileKey;
  const legacyUrl = record.receiptFileUrl || record.attachmentUrl;

  if (legacyKey) {
    try {
      const { url } = await storageGet(legacyKey);
      return [{ url, fileKey: legacyKey, fileName: "receipt" }];
    } catch {
      if (legacyUrl) {
        return [{ url: legacyUrl, fileKey: legacyKey, fileName: "receipt" }];
      }
    }
  } else if (legacyUrl) {
    return [{ url: legacyUrl, fileKey: "", fileName: "receipt" }];
  }

  return [];
}
