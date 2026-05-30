import { getCMSPageBySlug } from "@/actions/admin/cms.actions";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const result = await getCMSPageBySlug("terms-and-conditions");

  if (!result.success || !result.data) {
    return {
      title: "Terms and Conditions",
    };
  }

  const page = result.data;

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  };
}

export default async function TermsAndConditionsPage() {
  const result = await getCMSPageBySlug("terms-and-conditions");

  if (!result.success || !result.data) {
    notFound();
  }

  const page = result.data;

  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{page.title}</h1>
        </div>

        <div
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
