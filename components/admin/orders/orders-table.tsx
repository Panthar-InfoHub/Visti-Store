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
import { MoreHorizontal, Eye, Truck, CreditCard, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/format";
import { OrderDetailsDialog } from "./order-details-dialog";
import { OrderStatusDialog } from "./order-status-dialog";
import { PaymentStatusDialog } from "./payment-status-dialog";
import { OrderStatus } from "@/prisma/generated/prisma";
import { deleteOrder } from "@/actions/admin/order.actions";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/admin/shared/delete-confirm-dialog";

interface Order {
  id: string;
  orderNumber: string;
  createdAt: Date;
  total: number;
  status: OrderStatus;
  paymentStatus: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
  }>;
}

interface OrdersTableProps {
  orders: Order[];
  currentPage: number;
  totalPages: number;
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
    case "FAILED":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "SUCCESS":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "FAILED":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    case "REFUNDED":
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

export function OrdersTable({ orders, currentPage, totalPages }: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false);
  const [isPaymentStatusOpen, setIsPaymentStatusOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDetailsOpen(true);
  };

  const handleUpdateOrderStatus = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOrderStatusOpen(true);
  };

  const handleUpdatePaymentStatus = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsPaymentStatusOpen(true);
  };

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    const result = await deleteOrder(orderToDelete);
    if (result.success) {
      toast.success("Order cancelled successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to cancel order");
    }
    setIsDeleteOpen(false);
    setOrderToDelete(null);
  };

  const totalItems = (items: Array<{ quantity: number }>) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user.name}</div>
                      <div className="text-sm text-muted-foreground">{order.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{totalItems(order.items)}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(order.status)}>
                      {order.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getPaymentStatusColor(order.paymentStatus)}
                    >
                      {order.paymentStatus.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(order.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id)}>
                          <Truck className="h-4 w-4 mr-2" />
                          Update Order Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdatePaymentStatus(order.id)}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Update Payment Status
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(order.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <OrderDetailsDialog
        orderId={selectedOrderId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <OrderStatusDialog
        orderId={selectedOrderId}
        open={isOrderStatusOpen}
        onOpenChange={setIsOrderStatusOpen}
      />

      <PaymentStatusDialog
        orderId={selectedOrderId}
        open={isPaymentStatusOpen}
        onOpenChange={setIsPaymentStatusOpen}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
      />
    </>
  );
}
