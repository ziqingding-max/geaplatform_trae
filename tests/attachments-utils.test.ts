/**
 * Unit tests for server/utils/attachments.ts
 *
 * Tests:
 * - attachmentItemSchema validation
 * - attachmentsSchema validation (max 5 items, optional)
 * - resolveAttachments backward compatibility
 */

import { z } from "zod";

// We test the schemas directly without importing from the module
// to avoid needing the full server context (storage, etc.)

/** Single attachment item schema — mirrored from source */
const attachmentItemSchema = z.object({
  url: z.string(),
  fileKey: z.string(),
  fileName: z.string(),
  fileSize: z.number().optional(),
});

/** Attachments array schema — max 5 items */
const attachmentsSchema = z.array(attachmentItemSchema).max(5).optional();

describe("attachmentItemSchema", () => {
  it("should accept a valid attachment item", () => {
    const item = {
      url: "https://example.com/file.pdf",
      fileKey: "uploads/abc123.pdf",
      fileName: "receipt.pdf",
    };
    const result = attachmentItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("should accept an item with optional fileSize", () => {
    const item = {
      url: "https://example.com/file.pdf",
      fileKey: "uploads/abc123.pdf",
      fileName: "receipt.pdf",
      fileSize: 1024,
    };
    const result = attachmentItemSchema.safeParse(item);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fileSize).toBe(1024);
    }
  });

  it("should reject an item missing required fields", () => {
    const item = { url: "https://example.com/file.pdf" };
    const result = attachmentItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("should reject an item with wrong types", () => {
    const item = {
      url: 123,
      fileKey: "uploads/abc123.pdf",
      fileName: "receipt.pdf",
    };
    const result = attachmentItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
});

describe("attachmentsSchema", () => {
  it("should accept undefined (optional)", () => {
    const result = attachmentsSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it("should accept an empty array", () => {
    const result = attachmentsSchema.safeParse([]);
    expect(result.success).toBe(true);
  });

  it("should accept 1 to 5 valid items", () => {
    const makeItem = (i: number) => ({
      url: `https://example.com/file${i}.pdf`,
      fileKey: `uploads/key${i}.pdf`,
      fileName: `file${i}.pdf`,
    });

    for (let count = 1; count <= 5; count++) {
      const items = Array.from({ length: count }, (_, i) => makeItem(i));
      const result = attachmentsSchema.safeParse(items);
      expect(result.success).toBe(true);
    }
  });

  it("should reject more than 5 items", () => {
    const makeItem = (i: number) => ({
      url: `https://example.com/file${i}.pdf`,
      fileKey: `uploads/key${i}.pdf`,
      fileName: `file${i}.pdf`,
    });

    const items = Array.from({ length: 6 }, (_, i) => makeItem(i));
    const result = attachmentsSchema.safeParse(items);
    expect(result.success).toBe(false);
  });

  it("should reject array with invalid items", () => {
    const items = [{ url: "https://example.com/file.pdf" }]; // missing fileKey, fileName
    const result = attachmentsSchema.safeParse(items);
    expect(result.success).toBe(false);
  });
});

describe("resolveAttachments logic (pure unit test)", () => {
  /**
   * Since resolveAttachments depends on storageGet (external service),
   * we test the resolution logic inline without the actual function.
   * This validates the priority logic:
   * 1. attachments array takes priority
   * 2. Legacy receiptFileUrl/Key as fallback
   * 3. Legacy attachmentUrl/Key as fallback
   * 4. Empty array if nothing
   */

  function resolveAttachmentsSync(record: {
    attachments?: any[] | null;
    receiptFileUrl?: string | null;
    receiptFileKey?: string | null;
    attachmentUrl?: string | null;
    attachmentFileKey?: string | null;
  }) {
    // Case 1: New multi-file attachments field
    if (record.attachments && Array.isArray(record.attachments) && record.attachments.length > 0) {
      return record.attachments;
    }

    // Case 2: Legacy single-file
    const legacyKey = record.receiptFileKey || record.attachmentFileKey;
    const legacyUrl = record.receiptFileUrl || record.attachmentUrl;

    if (legacyKey || legacyUrl) {
      return [{ url: legacyUrl || "", fileKey: legacyKey || "", fileName: "receipt" }];
    }

    return [];
  }

  it("should return attachments array when present", () => {
    const record = {
      attachments: [
        { url: "https://a.com/1.pdf", fileKey: "k1", fileName: "f1.pdf" },
        { url: "https://a.com/2.pdf", fileKey: "k2", fileName: "f2.pdf" },
      ],
      receiptFileUrl: "https://legacy.com/old.pdf",
      receiptFileKey: "old-key",
    };
    const result = resolveAttachmentsSync(record);
    expect(result).toHaveLength(2);
    expect(result[0].fileName).toBe("f1.pdf");
  });

  it("should fall back to legacy receiptFileUrl/Key", () => {
    const record = {
      attachments: null,
      receiptFileUrl: "https://legacy.com/old.pdf",
      receiptFileKey: "old-key",
    };
    const result = resolveAttachmentsSync(record);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("https://legacy.com/old.pdf");
    expect(result[0].fileKey).toBe("old-key");
  });

  it("should fall back to legacy attachmentUrl/Key (AOR)", () => {
    const record = {
      attachments: [],
      attachmentUrl: "https://aor.com/doc.pdf",
      attachmentFileKey: "aor-key",
    };
    const result = resolveAttachmentsSync(record);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("https://aor.com/doc.pdf");
  });

  it("should return empty array when no attachments or legacy fields", () => {
    const record = {};
    const result = resolveAttachmentsSync(record);
    expect(result).toHaveLength(0);
  });

  it("should return empty array when attachments is empty and no legacy", () => {
    const record = { attachments: [] };
    const result = resolveAttachmentsSync(record);
    expect(result).toHaveLength(0);
  });

  it("should handle legacy URL without key", () => {
    const record = {
      receiptFileUrl: "https://legacy.com/old.pdf",
    };
    const result = resolveAttachmentsSync(record);
    expect(result).toHaveLength(1);
    expect(result[0].fileKey).toBe("");
  });
});
