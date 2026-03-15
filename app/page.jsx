import HeroSection from "./sections/HeroSection";
import AboutSection from "./sections/AboutSection";
import ProductSearch from "./sections/ProductSearch";
import GroceriesPreview from "./sections/GroceriesPreview";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ProductSearch />
      <GroceriesPreview />
    </main>
  );
}
