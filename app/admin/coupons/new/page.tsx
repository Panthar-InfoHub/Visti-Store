import { CouponFormDefault as CouponForm } from "@/components/admin/coupons";
import { requireAdmin } from "@/lib/admin-auth";

export default async function NewCouponPage() {
  // Protect page - only admins can access
  await requireAdmin();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Create Coupon</h1>
        <p className="text-muted-foreground mt-1">Add a new discount coupon</p>
      </div>

      <CouponForm mode="create" />
    </div>
  );
}
