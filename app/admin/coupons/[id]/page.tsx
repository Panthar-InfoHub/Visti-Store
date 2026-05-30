import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCoupon } from "@/actions/admin/coupon.actions";
import { CouponFormDefault as CouponForm } from "@/components/admin/coupons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Edit Coupon",
  description: "Edit coupon details",
};

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  // Protect page - only admins can access
  await requireAdmin();

  const { id } = await params;
  const result = await getCoupon(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Coupon</h1>
        <p className="text-muted-foreground">Update coupon details and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupon Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CouponForm mode="edit" initialData={result.data} />
        </CardContent>
      </Card>
    </div>
  );
}
