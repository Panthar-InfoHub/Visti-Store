"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Info, ArrowLeft } from "lucide-react";
import { createHeroSlide, updateHeroSlide } from "@/actions/admin/hero-slide.actions";
import { toast } from "sonner";
import type { HeroSlide } from "@/prisma/generated/prisma";
import Image from "next/image";
import { uploadToCloud } from "@/lib/upload-to-cloud";
import Link from "next/link";

interface HeroSlideFormPageProps {
  slide: HeroSlide | null;
}

export function HeroSlideFormPage({ slide }: HeroSlideFormPageProps) {
  const router = useRouter();
  const [order, setOrder] = useState(slide?.order || 0);
  const [isActive, setIsActive] = useState(slide?.isActive ?? true);
  const [image, setImage] = useState(slide?.image || "");
  const [imageAlt, setImageAlt] = useState(slide?.imageAlt || "");
  const [buttonLink, setButtonLink] = useState(slide?.buttonLink || "");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

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

    if (!image) {
      setError("Image is required");
      return;
    }

    setIsSaving(true);

    const data = {
      slideType: "IMAGE_ONLY" as const,
      order,
      isActive,
      image,
      imageAlt,
      buttonLink: buttonLink || undefined,
    };

    const result = slide ? await updateHeroSlide(slide.id, data) : await createHeroSlide(data);

    if (result.success) {
      toast.success(slide ? "Slide updated successfully" : "Slide created successfully");
      router.push("/admin/hero-slides");
    } else {
      setError(result.error || "Failed to save slide");
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/hero-slides">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{slide ? "Edit Hero Slide" : "Create Hero Slide"}</h1>
          <p className="text-sm text-muted-foreground">
            {slide ? "Update your hero slide details" : "Add a new slide to your homepage carousel"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="p-6">
          {/* Info Banner */}
          <div className="mb-6 text-sm bg-muted/50 px-4 py-3 rounded-lg">
            <Info className="h-4 w-4 inline mr-2" />
            <strong>Image Guidelines:</strong> Upload landscape images (recommended: 1920×600px or
            similar ratio). Images will be displayed at full width on normal screens and with a
            maximum width on ultra-wide displays.
          </div>

          {/* Image Upload */}
          <div className="space-y-3 mb-6">
            <Label htmlFor="image">
              Hero Image <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-3">
              {image && (
                <div className="relative aspect-[3/1] w-full max-w-3xl rounded-lg overflow-hidden bg-muted border">
                  <Image src={image} alt="Preview" fill className="object-contain" sizes="800px" />
                </div>
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              {isUploading && <p className="text-sm text-muted-foreground">Uploading image...</p>}
              <p className="text-xs text-muted-foreground">
                Max file size: 5MB. Supported formats: JPG, PNG, WebP. Landscape orientation
                recommended.
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
              <Label htmlFor="buttonLink">Slide Link (Entire slide becomes clickable)</Label>
              <Input
                id="buttonLink"
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                placeholder="/products or https://..."
              />
              <p className="text-xs text-muted-foreground">
                Optional: Enter a URL to make the entire slide a clickable link.
              </p>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Settings</h3>
          <div className="grid grid-cols-2 gap-6">
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
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/hero-slides")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || isUploading}>
            {isSaving ? "Saving..." : slide ? "Update Slide" : "Create Slide"}
          </Button>
        </div>
      </form>
    </div>
  );
}
