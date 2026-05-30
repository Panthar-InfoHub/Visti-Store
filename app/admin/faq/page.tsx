import { getAllFAQs } from "@/actions/admin/cms.actions";
import { FAQManager } from "@/components/admin/faq/faq-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FAQ Management | Admin",
  description: "Manage frequently asked questions",
};

export default async function AdminFAQPage() {
  const faqsResult = await getAllFAQs();

  if (!faqsResult.success) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Failed to load FAQs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div>
        <h1 className="text-3xl font-bold">FAQ Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage frequently asked questions for your customers
        </p>
      </div>

      <FAQManager faqs={faqsResult.data || []} />
    </div>
  );
}
