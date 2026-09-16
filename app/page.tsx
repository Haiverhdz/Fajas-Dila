import Hero from "@/components/marketing/Hero";
import ProductSection from "@/components/marketing/ProductSection";
import { getFeaturedProduct } from "@/lib/products";
import Benefits from "@/components/marketing/Benefits";
import Testimonials from "@/components/marketing/Testimonials";
import Faq from "@/components/marketing/Faq";

export default function Home() {
  return (
    <>
      <Hero />
      <ProductSection product={getFeaturedProduct()} />
      <Benefits />
      <Testimonials />
      <Faq />
    </>
  );
}
