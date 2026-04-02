/**
 * MultiFileUploadArea — Reusable multi-file attachment upload component
 *
 * Supports up to MAX_FILES (5) attachments per record.
 * Each file is uploaded individually via a provided upload mutation.
 * Displays existing attachments as a list with view/remove actions.
 * Compatible with both admin and portal pages.
 */

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Paperclip, Upload, FileText, X, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export interface AttachmentItem {
  url: string;
  fileKey: string;
  fileName: string;
  fileSize?: number;
}

interface MultiFileUploadAreaProps {
  /** Current list of attachments */
  attachments: AttachmentItem[];
  /** Callback when attachments change (add/remove) */
  onChange: (attachments: AttachmentItem[]) => void;
  /** Upload function — takes base64 + fileName + mimeType, returns { url, fileKey } */
  onUpload: (params: { fileBase64: string; fileName: string; mimeType: string }) => Promise<{ url: string; fileKey: string }>;
  /** Label text */
  label?: string;
  /** Hint text */
  hint?: string;
  /** Upload button text */
  uploadText?: string;
  /** Uploading text */
  uploadingText?: string;
  /** View button text */
  viewText?: string;
  /** Max files reached text */
  maxFilesText?: string;
  /** File too large text */
  fileTooLargeText?: string;
  /** Upload failed text */
  uploadFailedText?: string;
  /** Whether the field is disabled (e.g., locked record) */
  disabled?: boolean;
  /** Accepted file types */
  accept?: string;
}

export default function MultiFileUploadArea({
  attachments,
  onChange,
  onUpload,
  label = "Attachments",
  hint = "Max 20MB per file, up to 5 files",
  uploadText = "Upload File",
  uploadingText = "Uploading...",
  viewText = "View",
  maxFilesText = "Maximum 5 files reached",
  fileTooLargeText = "File size must be under 20MB",
  uploadFailedText = "Upload failed",
  disabled = false,
  accept = ".pdf,.jpg,.jpeg,.png,.gif,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx",
}: MultiFileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Reset input so the same file can be selected again
    e.target.value = "";

    const remainingSlots = MAX_FILES - attachments.length;
    if (remainingSlots <= 0) {
      toast.error(maxFilesText);
      return;
    }

    // Take up to remaining slots
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setIsUploading(true);
    const newAttachments: AttachmentItem[] = [];

    for (const file of filesToUpload) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: ${fileTooLargeText}`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        const result = await onUpload({
          fileBase64: base64,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
        });
        newAttachments.push({
          url: result.url,
          fileKey: result.fileKey,
          fileName: file.name,
          fileSize: file.size,
        });
      } catch (err: any) {
        toast.error(`${file.name}: ${uploadFailedText}`);
        console.error("Upload failed:", err);
      }
    }

    if (newAttachments.length > 0) {
      onChange([...attachments, ...newAttachments]);
    }
    setIsUploading(false);
  };

  const handleRemove = (index: number) => {
    const updated = [...attachments];
    updated.splice(index, 1);
    onChange(updated);
  };

  const canAddMore = attachments.length < MAX_FILES && !disabled;

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        <Paperclip className="w-3.5 h-3.5" />
        {label}
      </Label>

      {/* Existing attachments list */}
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          {attachments.map((att, idx) => (
            <div
              key={`${att.fileKey}-${idx}`}
              className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md text-sm"
            >
              <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="flex-1 truncate text-emerald-700" title={att.fileName}>
                {att.fileName}
              </span>
              {att.fileSize && (
                <span className="text-xs text-emerald-600 flex-shrink-0">
                  {formatFileSize(att.fileSize)}
                </span>
              )}
              {att.url && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => window.open(att.url, "_blank")}
                  title={viewText}
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              )}
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => handleRemove(idx)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      {canAddMore && (
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="w-full"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {uploadingText}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {uploadText}
              {attachments.length > 0 && (
                <span className="ml-1 text-muted-foreground">
                  ({attachments.length}/{MAX_FILES})
                </span>
              )}
            </>
          )}
        </Button>
      )}

      {/* Max reached hint */}
      {attachments.length >= MAX_FILES && !disabled && (
        <p className="text-xs text-muted-foreground">{maxFilesText}</p>
      )}

      {/* Hint */}
      {hint && attachments.length < MAX_FILES && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
