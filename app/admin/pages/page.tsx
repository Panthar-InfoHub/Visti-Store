import { getAllCMSPages } from "@/actions/admin/cms.actions";
import { CMSPagesTable } from "@/components/admin/pages/cms-pages-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "CMS Pages | Admin",
  description: "Manage your website content pages",
};

export default async function AdminPagesPage() {
  const pagesResult = await getAllCMSPages();

  if (!pagesResult.success || !pagesResult.data) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Failed to load pages</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pages</h1>
        <p className="text-muted-foreground mt-2">Manage your website content pages</p>
      </div>

      <CMSPagesTable pages={pagesResult.data} />
    </div>
  );
}
