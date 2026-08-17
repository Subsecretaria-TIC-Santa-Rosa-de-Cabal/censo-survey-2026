"use client";

import { useWizardStore } from "@/lib/store";
import { WelcomeStep } from "./WelcomeStep";
import { HousingStep } from "./HousingStep";
import { PersonStep } from "./PersonStep";
import { PetStep } from "./PetStep";
import { ReviewStep } from "./ReviewStep";
import { WizardHeader } from "./WizardHeader";

export function WizardContainer() {
  const { step } = useWizardStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4faf6] via-white to-[#eef7f1] pb-20">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-sm sm:p-10 mb-8">
          {step !== "welcome" && <WizardHeader />}
          <StepRenderer />
        </div>
      </div>
    </div>
  );
}

function StepRenderer() {
  const { step } = useWizardStore();

  switch (step) {
    case "welcome":
      return <WelcomeStep />;
    case "housing":
      return <HousingStep />;
    case "person":
      return <PersonStep />;
    case "pet":
      return <PetStep />;
    case "review":
      return <ReviewStep />;
    default:
      return <WelcomeStep />;
  }
}
