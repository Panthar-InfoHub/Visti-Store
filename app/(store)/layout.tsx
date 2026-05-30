import { AnnouncementBar } from "@/components/store/common/announcement-bar";
import { Footer } from "@/components/store/common/footer";
import { Header } from "@/components/store/common/header";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { StoreSync } from "@/components/store/common/store-sync";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider forcedTheme="light" attribute="class" defaultTheme="light">
      <StoreSync />
      <div className="min-h-screen flex flex-col bg-background">
        <AnnouncementBar />
        <Header />
        <main className="grow flex-1">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
