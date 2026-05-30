"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createCoupon, updateCoupon } from "@/actions/admin/coupon.actions";
import type { CouponFormData } from "@/lib/zod-schema";
import { Loader2 } from "lucide-react";

interface CouponFormProps {
  mode: "create" | "edit";
  initialData?: any;
}

export function CouponForm({ mode, initialData }: CouponFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasGlobalLimit, setHasGlobalLimit] = useState(!!initialData?.globalUsageLimit);
  const [hasPerUserLimit, setHasPerUserLimit] = useState(!!initialData?.perUserLimit);
  const [hasExpiry, setHasExpiry] = useState(!!initialData?.expiresAt);
  const [formData, setFormData] = useState<CouponFormData>({
    code: initialData?.code || "",
    type: initialData?.type || "PERCENTAGE",
    value: initialData?.value || 0,
    minOrderValue: initialData?.minOrderValue || null,
    maxDiscount: initialData?.maxDiscount || null,
    isActive: initialData?.isActive ?? true,
    expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt) : null,
    globalUsageLimit: initialData?.globalUsageLimit || null,
    perUserLimit: initialData?.perUserLimit || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result =
        mode === "create"
          ? await createCoupon(formData)
          : await updateCoupon(initialData.id, formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/coupons");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex justify-center">
      <Card className="p-6 space-y-6 max-w-2xl w-full">
        {/* Code */}
        <div className="space-y-2">
          <Label htmlFor="code">Coupon Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g., SAVE20"
            required
          />
          <p className="text-xs text-muted-foreground">
            Use uppercase letters, numbers, hyphens, and underscores only
          </p>
        </div>

        {/* Type and Value */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Discount Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "PERCENTAGE" | "FLAT") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                <SelectItem value="FLAT">Flat Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              {formData.type === "PERCENTAGE" ? "Percentage (%)" : "Amount (₹)"} *
            </Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0"
              max={formData.type === "PERCENTAGE" ? "100" : undefined}
              value={formData.value || ""}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
              required
            />
          </div>
        </div>

        {/* Min Order and Max Discount */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minOrderValue">Minimum Order Value (₹)</Label>
            <Input
              id="minOrderValue"
              type="number"
              min="0"
              value={formData.minOrderValue || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minOrderValue: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
          </div>

          {formData.type === "PERCENTAGE" && (
            <div className="space-y-2">
              <Label htmlFor="maxDiscount">Max Discount Amount (₹)</Label>
              <Input
                id="maxDiscount"
                type="number"
                min="0"
                value={formData.maxDiscount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxDiscount: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>
          )}
        </div>

        {/* Usage Limits */}
        <div className="space-y-4">
          {/* Global Usage Limit Toggle */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hasGlobalLimit" className="text-base cursor-pointer">
                  Set Total Usage Limit
                </Label>
                <p className="text-sm text-muted-foreground">
                  Limit how many times this coupon can be used in total across all users
                </p>
              </div>
              <Switch
                id="hasGlobalLimit"
                checked={hasGlobalLimit}
                onCheckedChange={(checked) => {
                  setHasGlobalLimit(checked);
                  if (!checked) {
                    setFormData({ ...formData, globalUsageLimit: null });
                  } else {
                    setFormData({ ...formData, globalUsageLimit: 1 });
                  }
                }}
              />
            </div>
            {hasGlobalLimit && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="globalUsageLimit" className="text-sm">
                  Maximum Total Uses
                </Label>
                <Input
                  id="globalUsageLimit"
                  type="number"
                  min="1"
                  value={formData.globalUsageLimit || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      globalUsageLimit: e.target.value ? parseInt(e.target.value) : 1,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Leave unlimited if disabled or set a specific number of total uses
                </p>
              </div>
            )}
          </div>

          {/* Per User Limit Toggle */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hasPerUserLimit" className="text-base cursor-pointer">
                  Set Per User Limit
                </Label>
                <p className="text-sm text-muted-foreground">
                  Limit how many times each individual user can use this coupon (Default: 1 per
                  user)
                </p>
              </div>
              <Switch
                id="hasPerUserLimit"
                checked={hasPerUserLimit}
                onCheckedChange={(checked) => {
                  setHasPerUserLimit(checked);
                  if (!checked) {
                    setFormData({ ...formData, perUserLimit: null });
                  } else {
                    setFormData({ ...formData, perUserLimit: 1 });
                  }
                }}
              />
            </div>
            {hasPerUserLimit && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="perUserLimit" className="text-sm">
                  Maximum Uses Per User
                </Label>
                <Input
                  id="perUserLimit"
                  type="number"
                  min="1"
                  value={formData.perUserLimit || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      perUserLimit: e.target.value ? parseInt(e.target.value) : 1,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Each user can use this coupon this many times (recommended: 1)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Expiry Date */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hasExpiry" className="text-base cursor-pointer">
                Set Expiry Date
              </Label>
              <p className="text-sm text-muted-foreground">
                Set an expiration date for this coupon (leave disabled for infinite validity)
              </p>
            </div>
            <Switch
              id="hasExpiry"
              checked={hasExpiry}
              onCheckedChange={(checked) => {
                setHasExpiry(checked);
                if (!checked) {
                  setFormData({ ...formData, expiresAt: null });
                }
              }}
            />
          </div>
          {hasExpiry && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="expiresAt" className="text-sm">
                Expiration Date
              </Label>
              <Input
                id="expiresAt"
                type="date"
                value={
                  formData.expiresAt ? new Date(formData.expiresAt).toISOString().slice(0, 10) : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expiresAt: e.target.value ? new Date(e.target.value) : null,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Coupon will expire at the end of this date
              </p>
            </div>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : mode === "create" ? (
              "Create Coupon"
            ) : (
              "Update Coupon"
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}

export default CouponForm;
