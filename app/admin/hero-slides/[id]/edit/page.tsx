import { getHeroSlide } from "@/actions/admin/hero-slide.actions";
import { HeroSlideFormPage } from "@/components/admin/hero-slides/hero-slide-form-page";
import { notFound } from "next/navigation";

interface EditHeroSlidePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHeroSlidePage({ params }: EditHeroSlidePageProps) {
  const { id } = await params;
  const result = await getHeroSlide(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <HeroSlideFormPage slide={result.data} />;
}
