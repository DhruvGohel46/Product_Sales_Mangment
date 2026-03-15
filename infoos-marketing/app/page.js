"use client";

import Navbar from '../components/layout/Navbar';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import Showcase from '../components/sections/Showcase';
import HowItWorks from '../components/sections/HowItWorks';
import Pricing from '../components/sections/Pricing';
import Footer from '../components/sections/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Showcase />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  );
}
