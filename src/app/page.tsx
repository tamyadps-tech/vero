import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
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
        <Reveal>
          <WhyItMatters />
        </Reveal>
        <Reveal>
          <DesiredState />
        </Reveal>
        <Reveal>
          <Features />
        </Reveal>
        <Reveal>
          <HowItWorks />
        </Reveal>
        <Reveal>
          <VettingProcess />
        </Reveal>
        <Reveal>
          <SecuritySection />
        </Reveal>
        <Reveal>
          <ProfessionalPainPoints />
        </Reveal>
        <Reveal>
          <ForProfessionals />
        </Reveal>
        <Reveal>
          <FAQ />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
