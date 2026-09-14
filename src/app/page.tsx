import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { VettingProcess } from "@/components/VettingProcess";
import { SecuritySection } from "@/components/SecuritySection";
import { ForProfessionals } from "@/components/ForProfessionals";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <VettingProcess />
        <SecuritySection />
        <ForProfessionals />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
