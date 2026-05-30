"use client";

import { useState, useCallback, useEffect, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Upload, Loader2, ImagePlus, FileWarning, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { uploadFilesToCloud } from "@/lib/upload-to-cloud";

interface MediaSectionProps {
  media?: string[]; // already uploaded media paths (for edit mode)
  onChange?: (mediaPaths: string[]) => void; // gets updated array after upload/delete
  maxFiles?: number;
  maxSizeMB?: number; // max file size in MB
}

interface PreviewFile {
  file: File;
  preview: string;
  id: string;
}

export function MediaSection({
  media = [],
  onChange,
  maxFiles = 10,
  maxSizeMB = 5,
}: MediaSectionProps) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localPreviews, setLocalPreviews] = useState<PreviewFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [videoPlayUrl, setVideoPlayUrl] = useState<string | null>(null);

  // Sync uploadedFiles when media prop changes
  useEffect(() => {
    setUploadedFiles(media);
  }, [media]);

  // Initialize preview URLs for existing media
  // Media paths from edit forms already have signed URLs from server actions
  useEffect(() => {
    async function initializeUrls() {
      if (media.length === 0) {
        setLoadingUrls(false);
        return;
      }

      try {
        // All paths are now full ImageKit URLs - just map them directly
        const map: Record<string, string> = {};
        media.forEach((path) => {
          map[path] = path;
        });
        setPreviewUrls(map);
      } catch (error) {
        toast.error("Failed to load some media files");
      } finally {
        setLoadingUrls(false);
      }
    }
    initializeUrls();
  }, [media]);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      localPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.preview);
      });
    };
  }, [localPreviews]);

  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `${file.name} is too large. Max size is ${maxSizeMB}MB`;
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];
    if (!validTypes.includes(file.type)) {
      return `${file.name} is not a supported format`;
    }

    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - uploadedFiles.length - localPreviews.length;

    if (fileArray.length > remainingSlots) {
      toast.error(`You can only add ${remainingSlots} more file(s)`);
      return;
    }

    const validFiles: PreviewFile[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push({
          file,
          preview: URL.createObjectURL(file),
          id: `${Date.now()}-${Math.random()}`,
        });
      }
    });

    if (errors.length > 0) {
      toast.error(errors.join(". "));
    }

    if (validFiles.length > 0) {
      setLocalPreviews((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeLocalPreview = (id: string) => {
    setLocalPreviews((prev) => {
      const file = prev.find((p) => p.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleUploadToCloud = async () => {
    if (localPreviews.length === 0) return;

    setUploading(true);
    try {
      const files = localPreviews.map((p) => p.file);
      const { success, failed } = await uploadFilesToCloud({ files });

      if (failed.length > 0) {
        toast.error(`Failed to upload ${failed.length} file(s)`);
      }

      if (success.length > 0) {
        const newPaths = success.map((s: { path: string }) => s.path);
        const updated = [...uploadedFiles, ...newPaths];
        setUploadedFiles(updated);
        onChange?.(updated);

        // Add new full URLs to preview map (they're already full ImageKit URLs)
        const newMap = { ...previewUrls };
        for (const path of newPaths) {
          newMap[path] = path; // path is already a full URL from ImageKit
        }
        setPreviewUrls(newMap);

        toast.success(`Uploaded ${success.length} file(s) successfully`);

        // Clear local previews
        localPreviews.forEach((preview) => {
          URL.revokeObjectURL(preview.preview);
        });
        setLocalPreviews([]);
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast.error("Error uploading files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveUploaded = useCallback(
    (path: string) => {
      const updated = uploadedFiles.filter((p) => p !== path);
      setUploadedFiles(updated);
      onChange?.(updated);

      toast.success("Media removed");
    },
    [uploadedFiles, onChange, toast]
  );

  return (
    <div className="space-y-4">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Media</h3>
        <Button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Media
        </Button>
      </div>

      {/* Uploaded Media Display */}
      {loadingUrls ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: Math.min(media.length, 4) }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <div className="w-full h-40 bg-muted animate-pulse" />
            </Card>
          ))}
        </div>
      ) : uploadedFiles.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <ImagePlus className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No media found</p>
            <p className="text-xs text-muted-foreground">
              Click &quot;Upload Media&quot; to add files
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {uploadedFiles.map((path) => {
            const url = previewUrls[path];
            // Detect video from both path and URL (handle both raw paths and signed URLs)
            const isVideo =
              path?.match(/\.(mp4|mov|webm|avi|MOV|MP4|WEBM|AVI)($|\?)/i) ||
              url?.match(/\.(mp4|mov|webm|avi|MOV|MP4|WEBM|AVI)($|\?)/i);

            return (
              <Card key={path} className="relative overflow-hidden group aspect-square p-0">
                {url ? (
                  isVideo ? (
                    <div
                      className="w-full h-full relative cursor-pointer flex items-center justify-center bg-black"
                      onClick={() => setVideoPlayUrl(url)}
                    >
                      <video src={url} className="max-w-full max-h-full object-contain" muted />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <Play className="h-5 w-5 text-black fill-black" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted p-2">
                      <img src={url} alt="Media" className="max-w-full max-h-full object-contain" />
                    </div>
                  )
                ) : (
                  <div className="w-full h-full bg-muted animate-pulse" />
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveUploaded(path);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Add up to {maxFiles - uploadedFiles.length} more file(s). Max size: {maxSizeMB}MB per
              file.
            </DialogDescription>
          </DialogHeader>

          {/* Drag and Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              uploading && "opacity-50 cursor-not-allowed"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => {
              if (!uploading) {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*,video/*";
                input.multiple = true;
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  handleFiles(target.files);
                };
                input.click();
              }
            }}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {dragActive ? "Drop files here" : "Click or drag files to upload"}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPEG, PNG, GIF, WebP, MP4, WebM
            </p>
          </div>

          {/* Local Preview Grid */}
          {localPreviews.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Files ({localPreviews.length})</h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {localPreviews.map((preview) => {
                  const isVideo = preview.file.type.startsWith("video/");
                  return (
                    <Card key={preview.id} className="relative overflow-hidden group aspect-square">
                      {isVideo ? (
                        <div className="w-full h-full relative">
                          <video
                            src={preview.preview}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="bg-white/80 rounded-full p-1.5">
                              <Play className="h-3 w-3 text-black fill-black" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={preview.preview}
                          alt={preview.file.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-0.5">
                        <p className="text-[9px] text-white truncate px-1">{preview.file.name}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-0.5 right-0.5 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLocalPreview(preview.id);
                        }}
                        disabled={uploading}
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {localPreviews.length === 0 && (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              <FileWarning className="h-5 w-5 mr-2" />
              No files selected
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                localPreviews.forEach((preview) => {
                  URL.revokeObjectURL(preview.preview);
                });
                setLocalPreviews([]);
                setIsDialogOpen(false);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUploadToCloud}
              disabled={localPreviews.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to Cloud
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Play Modal */}
      <Dialog open={!!videoPlayUrl} onOpenChange={(open) => !open && setVideoPlayUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video Preview</DialogTitle>
          </DialogHeader>
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            {videoPlayUrl && (
              <video src={videoPlayUrl} className="w-full h-full" controls autoPlay />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
