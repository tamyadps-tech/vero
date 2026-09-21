import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { WhyItMatters } from "@/components/WhyItMatters";
import { DesiredState } from "@/components/DesiredState";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { VettingProcess } from "@/components/VettingProcess";
import { SecuritySection } from "@/components/SecuritySection";
import { ProfessionalPainPoints } from "@/components/ProfessionalPainPoints";
import { ForProfessionals } from "@/components/ForProfessionals";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <WhyItMatters />
        <DesiredState />
        <Features />
        <HowItWorks />
        <VettingProcess />
        <SecuritySection />
        <ProfessionalPainPoints />
        <ForProfessionals />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
