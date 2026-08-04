import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Separator from "@/components/Separator";
import { WaveGridCanvas, FloatingCubesCanvas } from "@/components/ThreeScenes";
import PhotoSection from "@/components/PhotoSection";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Why from "@/components/Why";
import Certifications from "@/components/Certifications";
import Interests from "@/components/Interests";
import Education from "@/components/Education";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollFade from "@/components/ScrollFade";

export default function Home() {
  return (
    <>
      <ScrollFade />
      <Nav />
      <Hero />
      <About />

      <Separator>
        <WaveGridCanvas id="sep1-canvas" />
      </Separator>

      <PhotoSection />
      <Projects />

      <Separator>
        <FloatingCubesCanvas id="sep2-canvas" />
      </Separator>

      <Skills />
      <Why />
      <Certifications />
      <Interests />
      <Education />
      <Contact />
      <Footer />
    </>
  );
}
