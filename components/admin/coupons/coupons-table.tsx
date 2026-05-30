"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate, formatPrice } from "@/utils/format";
import { deleteCoupon, toggleCouponStatus } from "@/actions/admin/coupon.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/admin/shared/delete-confirm-dialog";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  isActive: boolean;
  expiresAt: Date | null;
  globalUsageLimit: number | null;
  totalUsed: number;
  createdAt: Date;
}

interface CouponsTableProps {
  coupons: Coupon[];
}

export function CouponsTable({ coupons }: CouponsTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<{ id: string; code: string } | null>(null);

  const handleToggleStatus = async (id: string) => {
    setLoadingId(id);
    try {
      const result = await toggleCouponStatus(id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to update coupon status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteClick = (id: string, code: string) => {
    setCouponToDelete({ id, code });
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;

    setLoadingId(couponToDelete.id);
    try {
      const result = await deleteCoupon(couponToDelete.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete coupon");
    } finally {
      setLoadingId(null);
      setIsDeleteOpen(false);
      setCouponToDelete(null);
    }
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.type === "PERCENTAGE") {
      return `${coupon.value}% OFF`;
    }
    return formatPrice(coupon.value);
  };

  const isExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Min. Order</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No coupons found
              </TableCell>
            </TableRow>
          ) : (
            coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                <TableCell>{getDiscountDisplay(coupon)}</TableCell>
                <TableCell>
                  {coupon.minOrderValue ? formatPrice(coupon.minOrderValue) : "—"}
                </TableCell>
                <TableCell>
                  {coupon.totalUsed}
                  {coupon.globalUsageLimit && ` / ${coupon.globalUsageLimit}`}
                </TableCell>
                <TableCell>
                  {coupon.expiresAt ? (
                    <span className={isExpired(coupon.expiresAt) ? "text-red-600" : ""}>
                      {formatDate(coupon.expiresAt)}
                    </span>
                  ) : (
                    "Never"
                  )}
                </TableCell>
                <TableCell>
                  {isExpired(coupon.expiresAt) ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : coupon.isActive ? (
                    <Badge variant="default" className="bg-green-600">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={loadingId === coupon.id}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/admin/coupons/${coupon.id}`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(coupon.id)}>
                        {coupon.isActive ? (
                          <>
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClick(coupon.id, coupon.code)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Coupon"
        description={
          couponToDelete
            ? `Are you sure you want to delete coupon "${couponToDelete.code}"? This action cannot be undone.`
            : "Are you sure you want to delete this coupon?"
        }
      />
    </div>
  );
}
