import { Suspense } from "react";
import { getSiteConfig } from "@/actions/admin/site-config.actions";
import { SiteConfigForm } from "@/components/admin/settings/site-config-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Site Settings - Admin",
  description: "Manage site configuration and settings",
};

export default async function SettingsPage() {
  // Protect page - only admins can access
  // await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage shipping, tax, invoice, and announcement settings
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </CardContent>
          </Card>
        }
      >
        <SettingsContent />
      </Suspense>
    </div>
  );
}

async function SettingsContent() {
  const configResult = await getSiteConfig();

  if (!configResult.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription className="text-red-500">{configResult.error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Shipping Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Store Configuration</CardTitle>
          <CardDescription>Manage shipping, tax, invoice, and announcement settings</CardDescription>
        </CardHeader>
        <CardContent>
          <SiteConfigForm config={configResult.data!} />
        </CardContent>
      </Card>
    </div>
  );
}
