import { getCMSPageById } from "@/actions/admin/cms.actions";
import { CMSPageForm } from "@/components/admin/pages/cms-page-form";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Page | Admin",
  description: "Edit website content page",
};

export default async function EditCMSPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCMSPageById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const page = result.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Page</h1>
        <p className="text-muted-foreground mt-2">Update your page content and settings</p>
      </div>

      <CMSPageForm page={page} />
    </div>
  );
}
