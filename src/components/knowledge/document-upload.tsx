// ═══════════════════════════════════════════════════════════
// Document Upload Component
// Visual dropzone for PDFs and text documents
// ═══════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { UploadDropzone } from "@/lib/uploadthing";

interface DocumentUploadProps {
  workspaceId: string;
  onUploadSuccess: () => void;
}

export function DocumentUpload({ workspaceId, onUploadSuccess }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-card/60">
      <UploadDropzone
        endpoint="documentUploader"
        input={{ workspaceId }}
        onUploadBegin={() => {
          setIsUploading(true);
        }}
        onClientUploadComplete={(res) => {
          setIsUploading(false);
          toast.success("Document uploaded successfully!");
          onUploadSuccess();
        }}
        onUploadError={(error) => {
          setIsUploading(false);
          toast.error(`Upload failed: ${error.message}`);
        }}
        content={{
          label({ isDragActive }) {
            return isDragActive ? (
              <span className="text-primary font-medium animate-pulse">Drop documents here!</span>
            ) : (
              <span className="text-muted-foreground text-sm">Drag & drop files, or click to upload</span>
            );
          },
          allowedContent() {
            return <span className="text-xs text-muted-foreground/60">PDF or TXT up to 16MB</span>;
          },
        }}
        className="ut-ready:border-0 ut-uploading:opacity-50 ut-button:bg-primary ut-button:hover:bg-primary/90 ut-button:text-white ut-button:shadow-lg ut-button:shadow-primary/20 ut-button:transition-all"
      />

      {isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="mt-4 text-sm font-medium text-foreground">Processing document content...</p>
        </div>
      )}
    </div>
  );
}
