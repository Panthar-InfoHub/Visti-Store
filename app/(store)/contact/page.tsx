import { ContactForm } from "@/components/store/contact/contact-form";
import { generatePageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/site.config";

export const metadata = generatePageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Vishti Store. We're here to help with jewelry and other related solutions.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="border-b">
        <div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl">
          <div className="text-center space-y-5">
            <h1 
              className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight"
              style={{ color: siteConfig.colors.secondary }}
            >
              Contact Us
            </h1>
            <p 
              className="text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto"
              style={{ color: siteConfig.colors.secondary }}
            >
              We're here to help you with Furniture, Interior Design, and other related solutions. Reach out to us
              anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 
                  className="text-2xl md:text-3xl font-semibold mb-3"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  Get in touch
                </h2>
                <p 
                  className="text-base leading-relaxed"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-8">
                {/* Phone */}
                <div>
                  <h3 
                    className="text-sm font-medium uppercase tracking-wider mb-3"
                    style={{ color: siteConfig.colors.primary }}
                  >
                    Phone
                  </h3>
                  <div className="space-y-2">
                    <a 
                      href={`tel:${siteConfig.contact.phone}`} 
                      className="text-base block"
                      style={{ color: siteConfig.colors.secondary }}
                    >
                      {siteConfig.contact.phone}
                    </a>
                    <a
                      href={`tel:${siteConfig.contact.alternatePhone}`}
                      className="text-base block"
                      style={{ color: siteConfig.colors.secondary }}
                    >
                      {siteConfig.contact.alternatePhone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <h3 
                    className="text-sm font-medium uppercase tracking-wider mb-3"
                    style={{ color: siteConfig.colors.primary }}
                  >
                    Email
                  </h3>
                  <div className="space-y-2">
                    <p className="text-base" style={{ color: siteConfig.colors.secondary }}></p>
                    {/* <p className="text-base" style={{ color: siteConfig.colors.secondary }}>Kjenterprise@gmail.com</p> */}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 
                    className="text-sm font-medium uppercase tracking-wider mb-3"
                    style={{ color: siteConfig.colors.primary }}
                  >
                    Visit Us
                  </h3>
                  <p 
                    className="text-base leading-relaxed"
                    style={{ color: siteConfig.colors.secondary }}
                  >
                    Vishti Store
                    <br />
                  Rise Jhansi Nagar Nigam premise, near Elite Circle, Jhansi, Uttar Pradesh 284001
                  </p>
                </div>

                {/* Business Hours */}
                <div>
                  <h3 
                    className="text-sm font-medium uppercase tracking-wider mb-3"
                    style={{ color: siteConfig.colors.primary }}
                  >
                    Business Hours
                  </h3>
                  <div className="space-y-1 text-base">
                    <p style={{ color: siteConfig.colors.secondary }}>Monday – Saturday: 9:00 AM - 7:00 PM</p>
                    <p style={{ color: siteConfig.colors.secondary }}>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h3 
                  className="text-xl md:text-2xl font-semibold mb-2"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  Send us a message
                </h3>
                <p 
                  className="text-base"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  We'll receive your message via WhatsApp.
                </p>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-8">
            <h2 
              className="text-2xl md:text-3xl font-semibold mb-3"
              style={{ color: siteConfig.colors.secondary }}
            >
              Visit Our Location
            </h2>
            <p 
              className="text-base"
              style={{ color: siteConfig.colors.secondary }}
            >
              Find us at Jhansi, Uttar Pradesh
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d297.859866182962!2d78.53218295734656!3d25.456223070492413!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39777100748511c1%3A0xdd4cb4bbfdb443cf!2sj%20p%20Interio!5e1!3m2!1sen!2sin!4v1779802252806!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
