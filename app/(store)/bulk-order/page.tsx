"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/site.config";

export default function BulkOrderPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        organization: "",
        productDetails: "",
        quantity: "",
        deliveryLocation: "",
        additionalRequirements: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate required fields
        if (!formData.name || !formData.phone || !formData.productDetails || !formData.quantity) {
            toast.error("Please fill in all required fields");
            setIsSubmitting(false);
            return;
        }

        // Create WhatsApp message
        const message = `*Bulk Order Request*

*Contact Information:*
Name: ${formData.name}
Email: ${formData.email || "Not provided"}
Phone: ${formData.phone}
Organization: ${formData.organization || "Not provided"}

*Order Details:*
Product Details: ${formData.productDetails}
Quantity: ${formData.quantity}
Delivery Location: ${formData.deliveryLocation || "Not provided"}

*Additional Requirements:*
${formData.additionalRequirements || "None"}`;

        // Encode message for WhatsApp URL
        const encodedMessage = encodeURIComponent(message);

        // Get WhatsApp number from site config
        const whatsappNumber = siteConfig.contact.whatsapp;

        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        // Open WhatsApp in new tab
        window.open(whatsappUrl, "_blank");

        // Show success message
        toast.success("Redirecting to WhatsApp...");

        // Reset form
        setTimeout(() => {
            setFormData({
                name: "",
                email: "",
                phone: "",
                organization: "",
                productDetails: "",
                quantity: "",
                deliveryLocation: "",
                additionalRequirements: "",
            });
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div 
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                      style={{ backgroundColor: siteConfig.colors.primary }}
                    >
                        <Package className="w-8 h-8 text-white" />
                    </div>
                    <h1 
                      className="text-4xl font-bold mb-4"
                      style={{ color: siteConfig.colors.secondary }}
                    >
                      Bulk Order Request
                    </h1>
                    <p 
                      className="text-lg max-w-2xl mx-auto font-light"
                      style={{ color: siteConfig.colors.secondary }}
                    >
                        Need to order in bulk? Fill out the form below and we'll get back to you with a custom quote
                        tailored to your requirements.
                    </p>
                </div>

                {/* Form Card */}
                <Card className="shadow-xl border-gray-200">
                    <CardHeader className="border-b bg-gray-50">
                        <CardTitle 
                          className="text-2xl"
                          style={{ color: siteConfig.colors.secondary }}
                        >
                          Order Information
                        </CardTitle>
                        <CardDescription
                          style={{ color: siteConfig.colors.primary }}
                        >
                            Please provide detailed information about your bulk order requirements
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h3 
                                  className="text-lg font-semibold border-b pb-2"
                                  style={{ color: siteConfig.colors.secondary }}
                                >
                                    Contact Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium" style={{ color: siteConfig.colors.primary }}>
                                            Full Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium" style={{ color: siteConfig.colors.primary }}>
                                            Phone Number <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium" style={{ color: siteConfig.colors.primary }}>
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="organization" className="text-sm font-medium" style={{ color: siteConfig.colors.primary }}>
                                            Organization/Company
                                        </Label>
                                        <Input
                                            id="organization"
                                            name="organization"
                                            placeholder="Company Name"
                                            value={formData.organization}
                                            onChange={handleChange}
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="space-y-4">
                                <h3 
                                  className="text-lg font-semibold border-b pb-2"
                                  style={{ color: siteConfig.colors.secondary }}
                                >
                                    Order Details
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="productDetails" className="text-sm font-medium" style={{ color: siteConfig.colors.primary }}>
                                        Product Details <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="productDetails"
                                        name="productDetails"
                                        placeholder="Describe the products you need (e.g., Arduino Uno R3, Raspberry Pi 4, Sensors, etc.)"
                                        value={formData.productDetails}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className="resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity" className="text-sm font-medium" style={{ color: siteConfig.colors.primary }}>
                                            Estimated Quantity <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="quantity"
                                            name="quantity"
                                            placeholder="e.g., 100 units, 50 kits"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deliveryLocation" className="text-sm font-medium" style={{ color: siteConfig.colors.primary }}>
                                            Delivery Location
                                        </Label>
                                        <Input
                                            id="deliveryLocation"
                                            name="deliveryLocation"
                                            placeholder="City, State"
                                            value={formData.deliveryLocation}
                                            onChange={handleChange}
                                            className="h-11"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="additionalRequirements" className="text-sm font-medium" style={{ color: siteConfig.colors.primary }}>
                                        Additional Requirements
                                    </Label>
                                    <Textarea
                                        id="additionalRequirements"
                                        name="additionalRequirements"
                                        placeholder="Any specific requirements, customizations, or questions?"
                                        value={formData.additionalRequirements}
                                        onChange={handleChange}
                                        rows={4}
                                        className="resize-none"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 text-base font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90 rounded-md"
                                    style={{ backgroundColor: siteConfig.colors.secondary }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Send Request via WhatsApp
                                        </>
                                    )}
                                </Button>
                                <p 
                                  className="text-xs text-center mt-3 font-light"
                                  style={{ color: siteConfig.colors.primary }}
                                >
                                    By submitting this form, you'll be redirected to WhatsApp to complete your request
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">💬</span>
                        </div>
                        <h4 
                          className="font-semibold mb-2"
                          style={{ color: siteConfig.colors.secondary }}
                        >
                          Quick Response
                        </h4>
                        <p 
                          className="text-sm font-light"
                          style={{ color: siteConfig.colors.primary }}
                        >
                          Get instant confirmation via WhatsApp
                        </p>
                    </div>

                    <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">💰</span>
                        </div>
                        <h4 
                          className="font-semibold mb-2"
                          style={{ color: siteConfig.colors.secondary }}
                        >
                          Best Pricing
                        </h4>
                        <p 
                          className="text-sm font-light"
                          style={{ color: siteConfig.colors.primary }}
                        >
                          Competitive rates for bulk orders
                        </p>
                    </div>

                    <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">🚚</span>
                        </div>
                        <h4 
                          className="font-semibold mb-2"
                          style={{ color: siteConfig.colors.secondary }}
                        >
                          Fast Delivery
                        </h4>
                        <p 
                          className="text-sm font-light"
                          style={{ color: siteConfig.colors.primary }}
                        >
                          Timely delivery across India
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
