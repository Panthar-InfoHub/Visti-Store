"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { ImageIcon, FileText, Info, Upload } from "lucide-react";
import {
  createHeroSlide,
  updateHeroSlide,
  getHeroSlides,
} from "@/actions/admin/hero-slide.actions";
import { toast } from "sonner";
import type { HeroSlide } from "@/prisma/generated/prisma";
import Image from "next/image";
import { uploadToCloud } from "@/lib/upload-to-cloud";

interface HeroSlideFormProps {
  slide: HeroSlide | null;
  onClose: () => void;
  onSuccess: (slides: HeroSlide[]) => void;
}

export function HeroSlideForm({ slide, onClose, onSuccess }: HeroSlideFormProps) {
  const [slideType, setSlideType] = useState<"IMAGE_ONLY" | "IMAGE_WITH_CONTENT">(
    slide?.slideType || "IMAGE_WITH_CONTENT"
  );
  const [order, setOrder] = useState(slide?.order || 0);
  const [isActive, setIsActive] = useState(slide?.isActive ?? true);
  const [image, setImage] = useState(slide?.image || "");
  const [imageAlt, setImageAlt] = useState(slide?.imageAlt || "");
  const [title, setTitle] = useState(slide?.title || "");
  const [subtitle, setSubtitle] = useState(slide?.subtitle || "");
  const [description, setDescription] = useState(slide?.description || "");
  const [buttonText, setButtonText] = useState(slide?.buttonText || "");
  const [buttonLink, setButtonLink] = useState(slide?.buttonLink || "");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const result = await uploadToCloud(file, "hero-slides");
      if (result.success && result.url) {
        setImage(result.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!image) {
      setError("Image is required");
      return;
    }

    if (slideType === "IMAGE_WITH_CONTENT" && !title) {
      setError("Title is required for slides with content");
      return;
    }

    setIsSaving(true);

    const data = {
      slideType,
      order,
      isActive,
      image,
      imageAlt,
      title: slideType === "IMAGE_WITH_CONTENT" ? title : undefined,
      subtitle: slideType === "IMAGE_WITH_CONTENT" ? subtitle : undefined,
      description: slideType === "IMAGE_WITH_CONTENT" ? description : undefined,
      buttonText: slideType === "IMAGE_WITH_CONTENT" ? buttonText : undefined,
      buttonLink: buttonLink || undefined,
    };

    const result = slide ? await updateHeroSlide(slide.id, data) : await createHeroSlide(data);

    if (result.success) {
      toast.success(slide ? "Slide updated successfully" : "Slide created successfully");
      const slidesResult = await getHeroSlides();
      if (slidesResult.success) {
        onSuccess(slidesResult.data || []);
      }
      onClose();
    } else {
      setError(result.error || "Failed to save slide");
    }

    setIsSaving(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{slide ? "Edit Hero Slide" : "Create Hero Slide"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Slide Type Selection */}
          <div className="space-y-3">
            <Label>Slide Type</Label>
            <RadioGroup
              value={slideType}
              onValueChange={(value) => setSlideType(value as typeof slideType)}
            >
              <Card
                className={`p-4 cursor-pointer transition-all ${slideType === "IMAGE_WITH_CONTENT"
                  ? "border-primary bg-primary/5"
                  : "hover:border-muted-foreground/20"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="IMAGE_WITH_CONTENT" id="with-content" />
                  <div className="flex-1">
                    <Label
                      htmlFor="with-content"
                      className="cursor-pointer font-semibold flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Image + Content (Default)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Display image alongside title, subtitle, description, and call-to-action
                      button
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground bg-background px-3 py-2 rounded border">
                      <Info className="h-3 w-3 inline mr-1" />
                      <strong>Recommended:</strong> 1200×800px (3:2 ratio) - Landscape images work
                      best
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-all ${slideType === "IMAGE_ONLY"
                  ? "border-primary bg-primary/5"
                  : "hover:border-muted-foreground/20"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="IMAGE_ONLY" id="image-only" />
                  <div className="flex-1">
                    <Label
                      htmlFor="image-only"
                      className="cursor-pointer font-semibold flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Image Only
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Full-width hero image without text overlay
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground bg-background px-3 py-2 rounded border">
                      <Info className="h-3 w-3 inline mr-1" />
                      <strong>Recommended:</strong> 1920×650px (16:5 ratio) - Wide banner format
                    </div>
                  </div>
                </div>
              </Card>
            </RadioGroup>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label htmlFor="image">
              Hero Image <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-3">
              {image && (
                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={image}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="flex-1"
                />
                <Button type="button" variant="outline" disabled={isUploading}>
                  {isUploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Max file size: 5MB. Supported formats: JPG, PNG, WebP
              </p>
            </div>
          </div>

          {/* Image Alt Text */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageAlt">Image Alt Text (for SEO)</Label>
              <Input
                id="imageAlt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Describe the image for accessibility"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroSlideLink">Slide Link (Entire slide becomes clickable)</Label>
              <Input
                id="heroSlideLink"
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                placeholder="/products or https://..."
              />
              <p className="text-xs text-muted-foreground">
                Optional: Enter a URL to make the entire slide a clickable link.
              </p>
            </div>
          </div>

          {/* Content Fields - Only for IMAGE_WITH_CONTENT */}
          {slideType === "IMAGE_WITH_CONTENT" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Power Your Projects"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="with Raspberry Pi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Experience next-level performance..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Shop Now"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buttonLink">Button Link</Label>
                  <Input
                    id="buttonLink"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="/products"
                  />
                </div>
              </div>
            </>
          )}

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (Show on homepage)
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving ? "Saving..." : slide ? "Update Slide" : "Create Slide"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
