"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/utils/format";
import { Mail, Calendar, ShoppingBag, DollarSign } from "lucide-react";
import { getUser } from "@/actions/admin/user.actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { USER_ROLE, OrderStatus } from "@/prisma/generated/prisma";

interface UserDetailsDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: USER_ROLE;
  emailVerified: boolean;
  createdAt: Date;
  _count: {
    orders: number;
  };
  totalSpent: number;
  orders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: OrderStatus;
    createdAt: Date;
  }>;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "PROCESSING":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "SHIPPED":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
    case "DELIVERED":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "CANCELLED":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

export function UserDetailsDialog({ userId, open, onOpenChange }: UserDetailsDialogProps) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && open) {
      setLoading(true);
      getUser(userId).then((result) => {
        if (result.success && result.data) {
          setUser(result.data as UserDetails);
        }
        setLoading(false);
      });
    }
  }, [userId, open]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <Badge
                variant={user.role === USER_ROLE.ADMIN ? "default" : "secondary"}
                className="capitalize"
              >
                {user.role.toLowerCase()}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Joined Date</span>
                </div>
                <p className="font-semibold">{formatDate(user.createdAt)}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Email Status</span>
                </div>
                <p className="font-semibold">{user.emailVerified ? "Verified" : "Not Verified"}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-sm">Total Orders</span>
                </div>
                <p className="font-semibold">{user._count.orders}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Total Spent</span>
                </div>
                <p className="font-semibold">{formatCurrency(user.totalSpent)}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Recent Orders</h4>
              {user.orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No orders yet</p>
              ) : (
                <div className="space-y-2">
                  {user.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.total)}</p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getStatusColor(order.status)}`}
                        >
                          {order.status.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">User not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
