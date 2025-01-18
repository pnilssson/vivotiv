import Header from "@/components/header";
import Footer from "@/components/lading-page/footer";
import Pricing from "@/components/lading-page/pricing";
import Hero from "@/components/lading-page/hero";
import HowItWorks from "@/components/lading-page/how-it-works";
import React from "react";
import KeyFeatures from "@/components/lading-page/key-features";
import { Banner } from "@/components/lading-page/banner";
import { Benefits } from "@/components/lading-page/benefits";

export default async function Page() {
  return (
    <React.Fragment>
      <Banner />
      <Header />
      <Hero />
      <KeyFeatures />
      <HowItWorks />
      <Benefits />
      <Pricing />
      <Footer />
    </React.Fragment>
  );
}
