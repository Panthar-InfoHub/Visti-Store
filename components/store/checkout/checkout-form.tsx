"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/utils/format";
import { Loader2, CheckCircle2, MapPin, ShoppingBag, User } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { PhoneInput } from "@/components/ui/phone-input";
import Script from "next/script";
import { checkoutFormSchema, type CheckoutFormData } from "@/lib/zod-schema";
import { z } from "zod";
import { validateCoupon } from "@/actions/admin/coupon.actions";
import { calculateTaxBreakdown } from "@/utils/order-helpers";
import { initiateOrder } from "@/actions/payment/initiate-order";
import { confirmOrder } from "@/actions/payment/confirm-order";
import { DeletePendingOrder } from "@/actions/payment/delete-pending-order";
import { FailedOrder } from "@/actions/payment/failed-order";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  address: string;
  apartment: string | null;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  isDefault: boolean;
}

interface CheckoutFormProps {
  userEmail: string | undefined;
  savedAddresses: SavedAddress[];
  initialCartItems: any[];
  initialShippingConfig: {
    shippingCharge: number | null;
    freeShippingMinOrder: number | null;
    cgstRate: number;
    sgstRate: number;
  } | null;
}

export function CheckoutForm({
  userEmail,
  savedAddresses,
  initialCartItems,
  initialShippingConfig,
}: CheckoutFormProps) {
  const router = useRouter();
  const {
    items,
    getSubtotal,
    getShipping,
    clearCart,
    isLoading,
    isInitialized,
    setShippingConfig,
    setItems,
  } = useCart();

  useEffect(() => {
    if (initialShippingConfig) {
      setShippingConfig(initialShippingConfig);
    }
    if (initialCartItems && initialCartItems.length > 0) {
      setItems(initialCartItems);
    }
  }, [initialShippingConfig, initialCartItems, setShippingConfig, setItems]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCouponApplying, setIsCouponApplying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "initiating" | "verifying" | "success"
  >("idle");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const defaultAddress = savedAddresses.find((addr) => addr.isDefault);
    return defaultAddress
      ? defaultAddress.id
      : savedAddresses.length > 0
        ? savedAddresses[0].id
        : "new";
  });

  const [useSameBillingAddress, setUseSameBillingAddress] = useState(true);
  const [billingErrors, setBillingErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [billingFormData, setBillingFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: userEmail || "",
    address: "",
    apartment: "",
    country: "India",
    state: "",
    city: "",
    pinCode: "",
    coupon: "",
    gstNumber: "",
  });

  // Form state - Initialize with default/first address if available
  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    const defaultAddress = savedAddresses.find((addr) => addr.isDefault) || savedAddresses[0];

    if (defaultAddress) {
      return {
        firstName: defaultAddress.firstName,
        lastName: defaultAddress.lastName,
        phone: defaultAddress.phone,
        email: defaultAddress.email || userEmail || "",
        address: defaultAddress.address,
        apartment: defaultAddress.apartment || "",
        country: defaultAddress.country,
        state: defaultAddress.state,
        city: defaultAddress.city,
        pinCode: defaultAddress.pinCode,
        coupon: "",
        gstNumber: "",
      };
    }

    return {
      firstName: "",
      lastName: "",
      phone: "",
      email: userEmail || "",
      address: "",
      apartment: "",
      country: "India",
      state: "",
      city: "",
      pinCode: "",
      coupon: "",
      gstNumber: "",
    };
  });

  // Use client items if initialized, otherwise fall back to server items
  const displayItems = isInitialized ? items : initialCartItems;

  // Show empty cart if no items
  if (displayItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-full bg-muted p-6 mb-4 inline-block">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items to your cart to checkout</p>
          <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  // Handle address selection - memoized to prevent unnecessary re-renders
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);

    if (addressId === "new") {
      // Clear form for new address
      setFormData((prev) => ({
        firstName: "",
        lastName: "",
        phone: "",
        email: userEmail || "",
        address: "",
        apartment: "",
        country: "India",
        state: "",
        city: "",
        pinCode: "",
        coupon: prev.coupon, // Keep coupon
        gstNumber: prev.gstNumber,
      }));
    } else {
      // Pre-fill form with selected address
      const address = savedAddresses.find((addr) => addr.id === addressId);
      if (address) {
        setFormData((prev) => ({
          ...prev,
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          email: address.email || prev.email,
          address: address.address,
          apartment: address.apartment || "",
          city: address.city,
          state: address.state,
          pinCode: address.pinCode,
          country: address.country,
        }));
      }
    }
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBillingInputChange = (field: keyof CheckoutFormData, value: string) => {
    setBillingFormData((prev) => ({ ...prev, [field]: value }));
    if (billingErrors[field]) {
      setBillingErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    try {
      checkoutFormSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof CheckoutFormData;
          if (!fieldErrors[field]) {
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      isValid = false;
    }

    if (!useSameBillingAddress) {
      try {
        checkoutFormSchema.parse(billingFormData);
        setBillingErrors({});
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
          error.errors.forEach((err) => {
            const field = err.path[0] as keyof CheckoutFormData;
            if (!fieldErrors[field]) {
              fieldErrors[field] = err.message;
            }
          });
          setBillingErrors(fieldErrors);
        }
        isValid = false;
      }
    }

    if (!isValid) {
      toast.error("Please fix the errors in the form");
    }
    return isValid;
  };

  const handleApplyCoupon = async () => {
    if (!formData.coupon || formData.coupon.trim() === "") {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsCouponApplying(true);
    try {
      const result = await validateCoupon(formData.coupon, getSubtotal(), undefined);

      if (result.success && result.data) {
        setAppliedCoupon({
          code: result.data.code,
          discount: result.data.discount,
        });
        toast.success(
          `Coupon "${result.data.code}" applied! You saved ${formatPrice(result.data.discount)}`
        );
      } else {
        toast.error(result.error || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Failed to validate coupon. Please try again.");
    } finally {
      setIsCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setFormData((prev) => ({ ...prev, coupon: "" }));
    toast.success("Coupon removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Auto-clear coupon if typed but not applied
    if (formData.coupon && formData.coupon.trim() !== "" && !appliedCoupon) {
      setFormData((prev) => ({ ...prev, coupon: "" }));
      toast.info("Unapplied coupon code was cleared");
    }

    setIsProcessing(true);
    setPaymentStatus("initiating");

    try {
      const addressDetails = {
        country: formData.country,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        apartment: formData.apartment || undefined,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        phone: formData.phone,
        email: formData.email || undefined,
      };

      const billingAddressDetails = {
        ...(useSameBillingAddress ? addressDetails : {
          country: billingFormData.country,
          firstName: billingFormData.firstName,
          lastName: billingFormData.lastName,
          address: billingFormData.address,
          apartment: billingFormData.apartment || undefined,
          city: billingFormData.city,
          state: billingFormData.state,
          pinCode: billingFormData.pinCode,
          phone: billingFormData.phone,
          email: billingFormData.email || undefined,
        }),
        gstNumber: formData.gstNumber?.trim().toUpperCase() || undefined,
      };

      const orderItems = displayItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));

      const orderData = {
        couponCode: appliedCoupon?.code || undefined,
        items: orderItems,
        shippingAddress: addressDetails,
        billingAddress: billingAddressDetails,
      };

      const res = await initiateOrder(orderData);

      if (!res.success || !res.data) {
        throw new Error("Failed to initiate payment");
      }

      const { orderId, razorpayOrderId, key, amount } = res.data;

      let paymentAttempted = false;

      const options = {
        key,
        amount: amount * 100,
        order_id: razorpayOrderId,
        retry: false,
        handler: async (response: any) => {
          try {
            paymentAttempted = true;
            setPaymentStatus("verifying");
            const result = await confirmOrder({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (result.success) {
              setPaymentStatus("success");
              toast.success("Payment successful!", { id: "payment" });
              clearCart();
              router.push("/account/orders");
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error: any) {
            console.error("Error confirming order:", error);
            toast.error("Payment verification failed. Please contact support.", {
              id: "payment",
            });
            setPaymentStatus("idle");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: async () => {
            if (!paymentAttempted) {
              console.log("User cancelled payment before attempting - deleting order");
              const result = await DeletePendingOrder(orderId);
              if (result.success) {
                toast.error("Payment cancelled", { id: "payment" });
              } else {
                toast.error("Payment cancelled", { id: "payment" });
              }
            } else {
              console.log("Payment was attempted - keeping order for records");
              toast.error("Payment window closed. Check your orders for status.", {
                id: "payment",
              });
            }
            setPaymentStatus("idle");
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async function (response: any) {
        paymentAttempted = true;
        console.log("Payment failed, marking order as FAILED");
        await FailedOrder(orderId);
        toast.error("Payment failed.", { id: "payment" });
        setPaymentStatus("idle");
        setIsProcessing(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error("Error processing order:", error);
      // Show user-friendly error message, not technical details
      const userMessage =
        error.message && !error.message.includes("digest")
          ? error.message
          : "Unable to process your order. Please try again or contact support.";
      toast.error(userMessage, { id: "payment" });
      setPaymentStatus("idle");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-[1fr_480px] gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Delivery Form */}
          <div className="space-y-4 sm:space-y-6 min-w-0">
            {/* Saved Addresses Section */}
            {savedAddresses.length > 0 && (
              <Card className="p-4 sm:p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <h2 className="text-lg sm:text-xl font-semibold">Select Delivery Address</h2>
                </div>

                <RadioGroup value={selectedAddressId} onValueChange={handleAddressSelect}>
                  <div className="space-y-3">
                    {savedAddresses.map((address) => (
                      <Label
                        key={address.id}
                        htmlFor={address.id}
                        className={`flex items-start space-x-2 sm:space-x-3 rounded-lg border p-3 sm:p-4 cursor-pointer transition-colors ${selectedAddressId === address.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                          }`}
                      >
                        <RadioGroupItem
                          value={address.id}
                          id={address.id}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm sm:text-base break-words">
                              {address.firstName} {address.lastName}
                            </p>
                            {address.isDefault && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">
                            {address.address}
                            {address.apartment && `, ${address.apartment}`}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.pinCode}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {address.phone}
                          </p>
                        </div>
                      </Label>
                    ))}

                    {/* Use New Address Option */}
                    <Label
                      htmlFor="new"
                      className={`flex items-start space-x-2 sm:space-x-3 rounded-lg border p-3 sm:p-4 cursor-pointer transition-colors ${selectedAddressId === "new"
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                        }`}
                    >
                      <RadioGroupItem value="new" id="new" className="mt-0.5 shrink-0" />
                      <div className="flex-1 cursor-pointer">
                        <p className="font-medium text-sm sm:text-base">Use a new address</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Enter a new delivery address below
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </Card>
            )}

            {/* Delivery Form */}
            <Card className="p-6 sm:p-8 md:p-10 space-y-6 rounded-[32px] border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-[#284239]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#284239]">
                  {selectedAddressId === "new" || savedAddresses.length === 0
                    ? "Delivery Address"
                    : "Edit Delivery Details"}
                </h2>
              </div>

              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">First name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30 ${errors.firstName ? "ring-1 ring-red-500" : ""}`}
                  />
                  {errors.firstName && <p className="text-xs text-red-500 ml-1">{errors.firstName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Last name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30 ${errors.lastName ? "ring-1 ring-red-500" : ""}`}
                  />
                  {errors.lastName && <p className="text-xs text-red-500 ml-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone number</Label>
                  <div className="phone-input-wrapper">
                    <PhoneInput
                      id="phone"
                      value={formData.phone}
                      defaultCountry="IN"
                      onChange={(value) => handleInputChange("phone", value)}
                      required
                      className="[&_input]:bg-[#F4F4F4] [&_input]:hover:bg-[#EBEBEB] [&_input]:transition-colors [&_input]:border-0 [&_input]:rounded-r-full [&_input]:h-[48px] [&_input]:px-5 [&_input]:focus-visible:ring-1 [&_input]:focus-visible:ring-[#284239]/30 [&_button]:bg-[#F4F4F4] [&_button]:hover:bg-[#EBEBEB] [&_button]:border-0 [&_button]:rounded-l-full [&_button]:h-[48px] [&_button]:pl-5"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Address</Label>
                <Input
                  id="address"
                  placeholder="House number and street name"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                  className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                />
              </div>

              {/* Apartment */}
              <div className="space-y-1.5">
                <Label htmlFor="apartment" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Apartment, suite, etc.</Label>
                <Input
                  id="apartment"
                  value={formData.apartment}
                  onChange={(e) => handleInputChange("apartment", e.target.value)}
                  className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                    className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                    className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                  />
                </div>
              </div>

              {/* Country & PIN code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Country / Region</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    defaultValue={"India"}
                    required
                    className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pinCode" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">PIN code</Label>
                  <Input
                    id="pinCode"
                    value={formData.pinCode}
                    onChange={(e) => handleInputChange("pinCode", e.target.value)}
                    required
                    className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                  />
                </div>
              </div>
            </Card>

            {/* Use Same Billing Address Checkbox */}
            <div className="flex items-center space-x-2 pt-2 pb-2">
              <Checkbox
                id="useSameBillingAddress"
                checked={useSameBillingAddress}
                onCheckedChange={(checked) => setUseSameBillingAddress(checked as boolean)}
              />
              <Label htmlFor="useSameBillingAddress" className="text-sm font-medium leading-none cursor-pointer">
                Use the same address as billing address
              </Label>
            </div>

            {/* GST Number (optional) */}
            <div className="space-y-2 pb-2">
              <Label htmlFor="gstNumber">GST Number (optional)</Label>
              <Input
                id="gstNumber"
                placeholder="e.g. 22AAAAA0000A1Z5"
                value={formData.gstNumber || ""}
                onChange={(e) => handleInputChange("gstNumber", e.target.value.toUpperCase().trim())}
                className={errors.gstNumber ? "border-red-500 uppercase" : "uppercase"}
                maxLength={15}
              />
              {errors.gstNumber && <p className="text-xs text-red-500">{errors.gstNumber}</p>}
            </div>

            {/* Billing Form */}
            {!useSameBillingAddress && (
              <Card className="p-6 sm:p-8 md:p-10 space-y-6 rounded-[32px] border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-[#284239]" />
                  <h2 className="text-xl sm:text-2xl font-bold text-[#284239]">Billing Address</h2>
                </div>

                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="billingFirstName" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">First name</Label>
                    <Input
                      id="billingFirstName"
                      value={billingFormData.firstName}
                      onChange={(e) => handleBillingInputChange("firstName", e.target.value)}
                      className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30 ${billingErrors.firstName ? "ring-1 ring-red-500" : ""}`}
                    />
                    {billingErrors.firstName && <p className="text-xs text-red-500 ml-1">{billingErrors.firstName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="billingLastName" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Last name</Label>
                    <Input
                      id="billingLastName"
                      value={billingFormData.lastName}
                      onChange={(e) => handleBillingInputChange("lastName", e.target.value)}
                      className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30 ${billingErrors.lastName ? "ring-1 ring-red-500" : ""}`}
                    />
                    {billingErrors.lastName && <p className="text-xs text-red-500 ml-1">{billingErrors.lastName}</p>}
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="billingEmail" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email address</Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      value={billingFormData.email}
                      onChange={(e) => handleBillingInputChange("email", e.target.value)}
                      className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="billingPhone" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone number</Label>
                    <div className="phone-input-wrapper">
                      <PhoneInput
                        id="billingPhone"
                        value={billingFormData.phone}
                        defaultCountry="IN"
                        onChange={(value) => handleBillingInputChange("phone", value)}
                        required
                        className="[&_input]:bg-[#F4F4F4] [&_input]:hover:bg-[#EBEBEB] [&_input]:transition-colors [&_input]:border-0 [&_input]:rounded-r-full [&_input]:h-[48px] [&_input]:px-5 [&_input]:focus-visible:ring-1 [&_input]:focus-visible:ring-[#284239]/30 [&_button]:bg-[#F4F4F4] [&_button]:hover:bg-[#EBEBEB] [&_button]:border-0 [&_button]:rounded-l-full [&_button]:h-[48px] [&_button]:pl-5"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="billingAddress" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Address</Label>
                  <Input
                    id="billingAddress"
                    placeholder="House number and street name"
                    value={billingFormData.address}
                    onChange={(e) => handleBillingInputChange("address", e.target.value)}
                    required
                    className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                  />
                </div>

                {/* Apartment */}
                <div className="space-y-1.5">
                  <Label htmlFor="billingApartment" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Apartment, suite, etc. (optional)</Label>
                  <Input
                    id="billingApartment"
                    value={billingFormData.apartment}
                    onChange={(e) => handleBillingInputChange("apartment", e.target.value)}
                    className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="billingCity" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">City</Label>
                    <Input
                      id="billingCity"
                      value={billingFormData.city}
                      onChange={(e) => handleBillingInputChange("city", e.target.value)}
                      required
                      className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="billingState" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">State</Label>
                    <Input
                      id="billingState"
                      value={billingFormData.state}
                      onChange={(e) => handleBillingInputChange("state", e.target.value)}
                      required
                      className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                    />
                  </div>
                </div>

                {/* Country & PIN code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="billingCountry" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Country / Region</Label>
                    <Input
                      id="billingCountry"
                      value={billingFormData.country}
                      onChange={(e) => handleBillingInputChange("country", e.target.value)}
                      defaultValue={"India"}
                      required
                      className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="billingPinCode" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">PIN code</Label>
                    <Input
                      id="billingPinCode"
                      value={billingFormData.pinCode}
                      onChange={(e) => handleBillingInputChange("pinCode", e.target.value)}
                      required
                      className={`bg-[#F4F4F4] hover:bg-[#EBEBEB] transition-colors border-0 rounded-full h-[48px] px-5 focus-visible:ring-1 focus-visible:ring-[#284239]/30`}
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit space-y-4 sm:space-y-6 min-w-0">
            <Card className="p-6 sm:p-8 md:p-10 space-y-6 rounded-[32px] border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-[#FCFCFC]">
              <h2 className="text-xl sm:text-2xl font-bold text-[#284239] mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 max-h-[250px] sm:max-h-[300px] lg:max-h-none overflow-y-auto pr-2">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-muted shrink-0 border-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 640px) 64px, 80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm sm:text-base font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.mrp && item.mrp > item.price && (
                        <div className="text-sm text-gray-400 line-through">
                          {formatPrice(item.mrp * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="pt-2">
                {appliedCoupon ? (
                  <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-bold text-green-900 dark:text-green-100">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            Discount: {formatPrice(appliedCoupon.discount)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-green-700 hover:text-green-900 font-bold"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex items-center w-full">
                    <Input
                      placeholder="COUPONS"
                      value={formData.coupon}
                      onChange={(e) => handleInputChange("coupon", e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      disabled={isCouponApplying}
                      className="rounded-full bg-white border-0 h-[52px] pl-6 pr-24 text-sm font-semibold tracking-wider placeholder:text-gray-400 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus-visible:ring-1 focus-visible:ring-[#284239]/20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 uppercase hover:text-[#284239] hover:bg-transparent"
                      onClick={handleApplyCoupon}
                      disabled={isCouponApplying || !formData.coupon}
                    >
                      {isCouponApplying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-4 text-sm">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(
                      isInitialized
                        ? getSubtotal()
                        : displayItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
                    )}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-medium">Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">-{formatPrice(appliedCoupon.discount)}</span>
                  </div>
                )}

                {(() => {
                  const sub = isInitialized
                    ? getSubtotal()
                    : displayItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
                  const disc = appliedCoupon?.discount || 0;
                  const cgstRate = initialShippingConfig?.cgstRate ?? 9;
                  const sgstRate = initialShippingConfig?.sgstRate ?? 9;
                  const { taxableAmount, cgstAmount, sgstAmount, taxAmount } = calculateTaxBreakdown(sub, disc, cgstRate, sgstRate);
                  
                  if (taxAmount > 0) {
                    return (
                      <>
                        <div className="flex justify-between items-center text-gray-500">
                          <span className="font-medium">Taxable Amount</span>
                          <span className="font-semibold text-gray-900">{formatPrice(taxableAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-500">
                          <span className="font-medium">CGST ({cgstRate}%)</span>
                          <span className="font-semibold text-gray-900">{formatPrice(cgstAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-500">
                          <span className="font-medium">SGST ({sgstRate}%)</span>
                          <span className="font-semibold text-gray-900">{formatPrice(sgstAmount)}</span>
                        </div>
                      </>
                    );
                  }
                  return null;
                })()}

                <div className="flex justify-between items-center text-gray-500">
                  <span className="font-medium">Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {(() => {
                      const sub = isInitialized
                        ? getSubtotal()
                        : displayItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
                      const ship = isInitialized
                        ? getShipping()
                        : initialShippingConfig
                          ? initialShippingConfig.shippingCharge !== null &&
                            (initialShippingConfig.freeShippingMinOrder === null ||
                              sub < initialShippingConfig.freeShippingMinOrder)
                            ? initialShippingConfig.shippingCharge
                            : 0
                          : 0;
                      return ship === 0 ? "FREE" : formatPrice(ship);
                    })()}
                  </span>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {(() => {
                      const sub = isInitialized
                        ? getSubtotal()
                        : displayItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
                      const ship = isInitialized
                        ? getShipping()
                        : initialShippingConfig
                          ? initialShippingConfig.shippingCharge !== null &&
                            (initialShippingConfig.freeShippingMinOrder === null ||
                              sub < initialShippingConfig.freeShippingMinOrder)
                            ? initialShippingConfig.shippingCharge
                            : 0
                          : 0;
                      const disc = appliedCoupon?.discount || 0;
                      const cgstRate = initialShippingConfig?.cgstRate ?? 9;
                      const sgstRate = initialShippingConfig?.sgstRate ?? 9;
                      const { taxAmount } = calculateTaxBreakdown(sub, disc, cgstRate, sgstRate);
                      return formatPrice(sub - disc + taxAmount + ship);
                    })()}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#284239] hover:bg-[#284239]/90 text-white rounded-full h-[56px] text-base font-bold tracking-wide transition-all shadow-md hover:-translate-y-0.5"
                >
                  {paymentStatus === "initiating" && (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Initiating Payment...
                    </>
                  )}
                  {paymentStatus === "verifying" && (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying Payment...
                    </>
                  )}
                  {paymentStatus === "success" && (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Success! Redirecting...
                    </>
                  )}
                  {paymentStatus === "idle" && "PAY NOW"}
                </Button>
                <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider mt-5 font-medium">
                  Tax included. Secure checkout.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </form>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </>
  );
}
