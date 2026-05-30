"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateSiteConfig } from "@/actions/admin/site-config.actions";
import { Loader2 } from "lucide-react";

const siteConfigSchema = z.object({
  shippingCharge: z.number().min(0, "Shipping charge must be 0 or greater").nullable(),
  freeShippingMinOrder: z.number().min(0, "Minimum order value must be 0 or greater").nullable(),
  showAnnouncementBar: z.boolean(),
  announcementText: z.string().max(200, "Text is too long"),
  cgstRate: z.number().min(0).max(100, "Rate must be between 0 and 100"),
  sgstRate: z.number().min(0).max(100, "Rate must be between 0 and 100"),
  businessName: z.string().max(200).optional(),
  businessAddress: z.string().max(500).optional(),
  businessGstin: z.string().optional().refine(val => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val), "Invalid GSTIN format"),
  businessPan: z.string().optional().refine(val => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val), "Invalid PAN format"),
  businessCin: z.string().max(21).optional(),
  businessPhone: z.string().optional().refine(val => !val || /^[6-9]\d{9}$/.test(val), "Invalid phone number"),
  businessEmail: z.string().optional().refine(val => !val || z.string().email().safeParse(val).success, "Invalid email address"),
  invoicePrefix: z.string().max(10).optional().transform(val => val ? val.trim().toUpperCase() : "INV"),
});

type SiteConfigFormData = z.infer<typeof siteConfigSchema>;

interface SiteConfigFormProps {
  config: {
    id: string;
    shippingCharge: number | null;
    freeShippingMinOrder: number | null;
    showAnnouncementBar: boolean;
    announcementText: string;
    cgstRate: number;
    sgstRate: number;
    businessName: string | null;
    businessAddress: string | null;
    businessGstin: string | null;
    businessPan: string | null;
    businessCin: string | null;
    businessPhone: string | null;
    businessEmail: string | null;
    invoicePrefix: string | null;
  };
}

export function SiteConfigForm({ config }: SiteConfigFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SiteConfigFormData>({
    resolver: zodResolver(siteConfigSchema),
    defaultValues: {
      shippingCharge: config.shippingCharge,
      freeShippingMinOrder: config.freeShippingMinOrder,
      showAnnouncementBar: config.showAnnouncementBar,
      announcementText: config.announcementText,
      cgstRate: config.cgstRate ?? 9,
      sgstRate: config.sgstRate ?? 9,
      businessName: config.businessName ?? "",
      businessAddress: config.businessAddress ?? "",
      businessGstin: config.businessGstin ?? "",
      businessPan: config.businessPan ?? "",
      businessCin: config.businessCin ?? "",
      businessPhone: config.businessPhone ?? "",
      businessEmail: config.businessEmail ?? "",
      invoicePrefix: config.invoicePrefix ?? "INV",
    },
  });

  async function onSubmit(data: SiteConfigFormData) {
    setIsLoading(true);
    try {
      const submitData = {
        ...data,
        businessName: data.businessName || null,
        businessAddress: data.businessAddress || null,
        businessGstin: data.businessGstin || null,
        businessPan: data.businessPan || null,
        businessCin: data.businessCin || null,
        businessPhone: data.businessPhone || null,
        businessEmail: data.businessEmail || null,
        invoicePrefix: data.invoicePrefix || "INV",
      };
      const result = await updateSiteConfig(submitData);

      if (result.success) {
        toast.success("Settings updated successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    } catch (error) {
      toast.error("An error occurred while updating settings");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Shipping Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Shipping Settings</h3>

          <FormField
            control={form.control}
            name="shippingCharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Charge (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Leave empty to disable shipping charges"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Shipping charge per order. Leave empty to disable shipping charges.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="freeShippingMinOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Free Shipping Minimum Order (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Leave empty to disable free shipping"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Orders above this amount get free shipping. Leave empty to disable free shipping.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tax Settings */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-semibold">Tax Settings</h3>

          <FormField
            control={form.control}
            name="cgstRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CGST Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 9"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Central GST rate applied on taxable amount</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sgstRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SGST Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 9"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>State GST rate applied on taxable amount</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Invoice Details Settings */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-semibold">Invoice Details</h3>

          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your business legal name" {...field} />
                </FormControl>
                <FormDescription>Legal name of the business as on GST registration</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Address</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Registered business address"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Full registered address for invoices</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="businessGstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSTIN</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. 22AAAAA0000A1Z5" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>15-digit GST Identification Number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessPan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. AAAAA0000A" 
                      maxLength={10}
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>Permanent Account Number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessCin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CIN</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. U12345MH2000PTC123456" 
                      maxLength={21}
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>Corporate Identification Number (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Phone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. 9876543210" 
                      maxLength={10}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Business contact phone number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="e.g. billing@yourbusiness.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Business contact email for invoices</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoicePrefix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Prefix</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="INV" 
                      maxLength={10}
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>Prefix for invoice numbers (e.g. INV-0001). Defaults to INV.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Announcement Bar Settings */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-semibold">Announcement Bar</h3>

          <FormField
            control={form.control}
            name="showAnnouncementBar"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show Announcement Bar</FormLabel>
                  <FormDescription>Display announcement bar at the top of the site</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="announcementText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Announcement Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Free shipping on orders above ₹500!"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Text to display in the announcement bar (max 200 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isLoading}>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
