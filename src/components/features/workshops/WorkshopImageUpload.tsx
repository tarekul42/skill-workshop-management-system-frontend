"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import Image from "next/image";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SectionCard } from "./WorkshopFormSectionCard";

export interface WorkshopImageUploadHandle {
  getFiles: () => File[];
  cleanup: () => void;
}

interface WorkshopImageUploadProps {
  existingImages: string[];
  onExistingImagesChange: (images: string[]) => void;
  imagesToDelete: string[];
  onImagesToDeleteChange: (urls: string[]) => void;
}

const WorkshopImageUpload = forwardRef<WorkshopImageUploadHandle, WorkshopImageUploadProps>(
  ({ existingImages, onExistingImagesChange, imagesToDelete, onImagesToDeleteChange }, ref) => {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const previewUrlsRef = useRef<string[]>([]);
    useEffect(() => {
      previewUrlsRef.current = imagePreviews;
    }, [imagePreviews]);

    useEffect(() => {
      return () => {
        previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        getFiles: () => imageFiles,
        cleanup: () => {
          imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        },
      }),
      [imageFiles, imagePreviews]
    );

    const handleFiles = (files: File[]) => {
      const newFiles = files.filter((file) => file.type.startsWith("image/"));

      if (newFiles.length === 0) {
        toast.error("Please select valid image files");
        return;
      }

      if (imageFiles.length + newFiles.length + existingImages.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      setImageFiles((prev) => [...prev, ...newFiles]);
      const previews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(Array.from(e.target.files));
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
      else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    };

    const handleRemoveNewImage = (index: number) => {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => {
        const preview = prev[index];
        URL.revokeObjectURL(preview);
        return prev.filter((_, i) => i !== index);
      });
    };

    const handleRemoveExistingImage = (url: string) => {
      onExistingImagesChange(existingImages.filter((img) => img !== url));
      onImagesToDeleteChange([...imagesToDelete, url]);
    };

    return (
      <SectionCard title="Workshop Media" icon={<ImageIcon className="size-5" />}>
        <div className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed p-10 transition-all",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-surface-2"
            )}
          >
            <input
              id="workshop-images"
              type="file"
              accept="image/*"
              multiple
              aria-label="Upload workshop images"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleImageChange}
            />
            <div className="bg-primary/10 text-primary mb-4 flex size-14 items-center justify-center rounded-full">
              <Plus className="size-7" />
            </div>
            <p className="text-foreground mb-1 text-sm font-bold">Drag & drop images here</p>
            <p className="text-muted-foreground text-xs">
              or <span className="text-primary font-bold">click to browse</span>
            </p>
            <p className="text-muted-foreground mt-4 text-[11px] font-bold tracking-widest uppercase">
              Max 5 images • JPG, PNG, WebP
            </p>
          </div>

          {(existingImages.length > 0 || imagePreviews.length > 0) && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {existingImages.map((url, idx) => (
                <div
                  key={`existing-${idx}`}
                  className="group border-border relative aspect-video overflow-hidden rounded-xl border shadow-sm"
                >
                  <Image
                    src={url}
                    alt="Workshop"
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label="Remove existing image"
                      onClick={() => handleRemoveExistingImage(url)}
                      className="bg-destructive flex size-9 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {idx === 0 && (
                    <div className="bg-primary absolute top-2 left-2 rounded-md px-2 py-1 text-[9px] font-bold text-white uppercase shadow-sm">
                      Cover
                    </div>
                  )}
                </div>
              ))}
              {imagePreviews.map((src, idx) => (
                <div
                  key={`new-${idx}`}
                  className="group border-border relative aspect-video overflow-hidden rounded-xl border shadow-sm"
                >
                  <Image
                    src={src}
                    alt="New Image"
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label="Remove new image"
                      onClick={() => handleRemoveNewImage(idx)}
                      className="bg-destructive flex size-9 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {existingImages.length === 0 && idx === 0 && (
                    <div className="bg-primary absolute top-2 left-2 rounded-md px-2 py-1 text-[9px] font-bold text-white uppercase shadow-sm">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    );
  }
);

WorkshopImageUpload.displayName = "WorkshopImageUpload";

export default WorkshopImageUpload;
