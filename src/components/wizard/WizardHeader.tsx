"use client";

import { useWizardStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";

export function WizardHeader() {
  const { step, stepIndex, people, pets } = useWizardStore();

  let label = "";
  let progress = 0;

  if (step === "welcome") {
    label = "Bienvenida";
    progress = 5;
  } else if (step === "housing") {
    label = "Datos de la vivienda";
    progress = 15;
  } else if (step === "person") {
    label = `Integrante ${stepIndex + 1} de ${people.length}`;
    progress = 15 + ((stepIndex + 1) / Math.max(people.length, 1)) * 35;
  } else if (step === "pet") {
    label = `Mascota ${stepIndex + 1} de ${pets.length}`;
    progress = 50 + ((stepIndex + 1) / Math.max(pets.length, 1)) * 35;
  } else if (step === "review") {
    label = "Resumen y envío";
    progress = 95;
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
