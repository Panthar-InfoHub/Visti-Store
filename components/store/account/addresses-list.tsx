"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLenis } from "@/components/shared/lenis";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/actions/store/address.actions";
import { siteConfig } from "@/site.config";

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  address: string;
  apartment?: string | null;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  isDefault: boolean;
}

export function AddressesList() {
  const lenis = useLenis();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!lenis) return;

    if (isAddDialogOpen) {
      lenis.stop();
      return () => lenis.start();
    }

    lenis.start();
  }, [isAddDialogOpen, lenis]);

  async function fetchAddresses() {
    setIsLoading(true);
    const result = await getAddresses();
    if (result.success && result.data) {
      setAddresses(result.data);
    }
    setIsLoading(false);
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      pinCode: "",
      country: "India",
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        email: address.email || "",
        address: address.address,
        apartment: address.apartment || "",
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      resetForm();
    }
    setIsAddDialogOpen(true);
  };

  const handleSave = async () => {
    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.pinCode
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    const result = editingAddress
      ? await updateAddress(editingAddress.id, formData)
      : await addAddress(formData);

    setIsSaving(false);

    if (result.success) {
      toast.success(editingAddress ? "Address updated" : "Address added");
      setIsAddDialogOpen(false);
      resetForm();
      fetchAddresses();
    } else {
      toast.error(result.error || "Failed to save address");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteAddress(id);
    if (result.success) {
      toast.success("Address deleted");
      fetchAddresses();
    } else {
      toast.error(result.error || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    const result = await setDefaultAddress(id);
    if (result.success) {
      toast.success("Default address updated");
      fetchAddresses();
    } else {
      toast.error(result.error || "Failed to set default address");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Saved Address
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-2xl">
          Check your previous interior item purchases and monitor your current home decor deliveries.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => handleOpenDialog()}
              className="flex flex-col items-center justify-center min-h-[280px] rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors gap-4 w-full"
            >
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: siteConfig.colors.bgColor, color: siteConfig.colors.primary }}
              >
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-semibold" style={{ color: siteConfig.colors.secondary }}>Add New Address</span>
            </button>
          </DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-xl max-h-[85vh] p-0 overflow-hidden sm:rounded-[1.5rem] border-none shadow-2xl gap-0">
              <div
                data-lenis-prevent
                className="max-h-[85vh] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-5 sm:p-7 flex flex-col"
              >
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold" style={{ color: siteConfig.colors.secondary }}>
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-2">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Julianne"
                      className="bg-[#F5F5F5] border-none rounded-2xl px-5 py-6 text-sm text-gray-900 w-full placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Reed"
                      className="bg-[#F5F5F5] border-none rounded-2xl px-5 py-6 text-sm text-gray-900 w-full placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="julianne.r@elixir.co"
                      className="bg-[#F5F5F5] border-none rounded-2xl px-5 py-6 text-sm text-gray-900 w-full placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 012-3456"
                      className="bg-[#F5F5F5] border-none rounded-2xl px-5 py-6 text-sm text-gray-900 w-full placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House number and street"
                    className="bg-[#F5F5F5] border-none rounded-2xl px-5 py-6 text-sm text-gray-900 w-full placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor="apartment" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Apartment, Suite, Etc.</Label>
                  <Input
                    id="apartment"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    placeholder=""
                    className="bg-[#F5F5F5] border-none rounded-2xl px-5 py-6 text-sm text-gray-900 w-full placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="city" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder=""
                      className="bg-[#F5F5F5] border-none rounded-2xl px-5 py-6 text-sm text-gray-900 w-full placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder=""
                      className="bg-[#F5F5F5] border-none rounded-2xl px-5 py-6 text-sm text-gray-900 w-full placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="pinCode" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Pin Code</Label>
                    <Input
                      id="pinCode"
                      value={formData.pinCode}
                      onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                      placeholder=""
                      className="bg-[#F5F5F5] border-none rounded-2xl px-5 py-6 text-sm text-gray-900 w-full placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="India"
                      className="bg-[#F5F5F5] border-none rounded-2xl px-5 py-6 text-sm text-gray-900 w-full placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 cursor-pointer"
                    style={{ accentColor: siteConfig.colors.primary }}
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer font-bold text-sm text-gray-900">
                    Set as default address
                  </Label>
                </div>
              </div>
              <DialogFooter className="mt-8 flex gap-4 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isSaving}
                  className="rounded-full px-10 py-6 border border-gray-200 text-gray-500 font-bold hover:bg-black/5 bg-transparent w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-full px-10 py-6 text-white font-bold w-full sm:w-auto hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: siteConfig.colors.primary }}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Address"
                  )}
                </Button>
              </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

        {addresses.map((address) => (
          <div key={address.id} className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col min-h-[280px] relative">
            <div className="mb-6">
              {address.isDefault ? (
                <div
                  className="inline-block text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-5"
                  style={{ backgroundColor: siteConfig.colors.primary }}
                >
                  Default
                </div>
              ) : (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-5 transition-colors"
                >
                  Set Default
                </button>
              )}
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {address.isDefault ? "Home" : "Address"}
              </h3>
              
              <div className="space-y-1 text-sm text-gray-500">
                <p className="text-gray-700">{address.firstName} {address.lastName}</p>
                <p>{address.address}{address.apartment ? `, ${address.apartment}` : ""}</p>
                <p>{address.city}, {address.state} {address.pinCode}</p>
                <p>{address.country}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-transparent">
              <div className="flex gap-4">
                <button
                  onClick={() => handleOpenDialog(address)}
                  className="text-xs font-bold text-gray-600 hover:text-gray-900 uppercase tracking-wider"
                >
                  Edit
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-xs font-bold text-gray-600 hover:text-red-600 uppercase tracking-wider">
                      Delete
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Address</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this address? This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(address.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <span className="text-xs text-gray-400 font-medium">{address.phone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

