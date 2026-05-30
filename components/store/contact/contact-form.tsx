"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, User, Mail, Send } from "lucide-react";
import { siteConfig } from "@/site.config";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", message: "" };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Format the WhatsApp message
    const whatsappMessage = `
*New Contact Form Submission*

*Name:* ${formData.name}
*Email:* ${formData.email}

*Message:*
${formData.message}
    `.trim();

    const encodedMessage = encodeURIComponent(whatsappMessage);

    const whatsappNumber = siteConfig.contact.whatsapp;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    console.log(whatsappUrl);
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank");

    // Reset form
    setFormData({
      name: "",
      email: "",
      message: "",
    });
    setErrors({
      name: "",
      email: "",
      message: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            className={`h-12 rounded-xl bg-white border-gray-200 focus:border-gray-400 focus:ring-0 transition-all ${errors.name ? "border-destructive" : ""}`}
          />
          {errors.name && <p className="text-sm text-destructive font-medium">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            className={`h-12 rounded-xl bg-white border-gray-200 focus:border-gray-400 focus:ring-0 transition-all ${errors.email ? "border-destructive" : ""}`}
          />
          {errors.email && <p className="text-sm text-destructive font-medium">{errors.email}</p>}
        </div>
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium text-gray-700">
          Message
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us about your project..."
          value={formData.message}
          onChange={handleChange}
          rows={6}
          aria-invalid={!!errors.message}
          className={`min-h-[150px] rounded-xl bg-white border-gray-200 focus:border-gray-400 focus:ring-0 transition-all resize-none ${errors.message ? "border-destructive" : ""}`}
        />
        {errors.message && <p className="text-sm text-destructive font-medium">{errors.message}</p>}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full h-12 text-base font-medium rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-none transition-all duration-300" size="lg">
        Send Message
      </Button>
    </form>
  );
}
