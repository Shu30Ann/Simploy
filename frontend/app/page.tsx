import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";
import HowItWorks from "@/components/landing/HowItWorks";
import ForEmployees from "@/components/landing/ForEmployees";
import ForEmployers from "@/components/landing/ForEmployers";
import Pricing from "@/components/landing/Pricing";
import About from "@/components/landing/About";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <HowItWorks />
        <ForEmployees />
        <ForEmployers />
        <Pricing />
        <About />
      </main>
      <Footer />
    </>
  );
}
