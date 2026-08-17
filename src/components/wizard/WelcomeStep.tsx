"use client";

import Image from "next/image";
import { CircleCheckIcon, XIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useWizardStore } from "@/lib/store";

export function WelcomeStep() {
  const {
    acceptedDataTreatment,
    setAcceptedDataTreatment,
    next,
    surveySubmitted,
    setSurveySubmitted,
  } = useWizardStore();

  return (
    <Card className="border-none shadow-none ring-0 bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="Logo censo"
            width={160}
            height={80}
            className="h-20 w-auto object-contain"
            priority
          />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-semibold text-[#2d4f3a]">
          Bienvenido al censo
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-4 text-muted-foreground">
        {surveySubmitted && (
          <div className="rounded-xl border border-[#49805e]/20 bg-[#e8f3ec] p-4">
            <div className="flex items-start gap-3">
              <CircleCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#49805e]" />
              <div className="flex-1">
                <p className="font-medium text-[#2d4f3a]">
                  ¡Formulario enviado correctamente!
                </p>
                <p className="text-sm text-[#2d4f3a]/80">
                  Gracias por participar en el censo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSurveySubmitted(false)}
                className="text-[#2d4f3a]/70 hover:text-[#2d4f3a]"
                aria-label="Cerrar mensaje"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <p>
          Este formulario tiene como objetivo recopilar información actualizada sobre las
          viviendas, los integrantes de los hogares y las mascotas que habitan en ellas.
        </p>
        <p>
          La información que nos proporcione será tratada de manera confidencial y solo se
          utilizará con fines estadísticos y de planificación.
        </p>
        <p>
          El formulario se divide en varias tarjetas. Puede avanzar con el botón{" "}
          <strong>Siguiente</strong> y retroceder cuando lo necesite. Una vez complete toda la
          información, podrá enviar el censo.
        </p>

        <div className="flex items-start gap-3 rounded-xl border border-[#49805e]/20 bg-[#f4faf6] p-4 mt-4">
          <Checkbox
            id="data-treatment"
            checked={acceptedDataTreatment}
            onCheckedChange={(checked) => setAcceptedDataTreatment(checked === true)}
            className="mt-0.5 border-[#49805e]/50 data-[state=checked]:bg-[#49805e] data-[state=checked]:border-[#49805e]"
          />
          <div className="space-y-1">
            <Label htmlFor="data-treatment" className="text-sm font-medium text-foreground">
              Acepto el tratamiento de mis datos personales
            </Label>
            <p className="text-sm">
              Para continuar debe leer y aceptar la{" "}
              <a
                href="/politica-tratamiento-datos.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#49805e] underline underline-offset-2 font-medium hover:text-[#3a6a4b]"
              >
                política de tratamiento de datos personales
              </a>
              .
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-0 pt-6 bg-transparent border-none">
        <Button
          onClick={next}
          disabled={!acceptedDataTreatment}
          className="w-full sm:w-auto bg-[#49805e] hover:bg-[#3a6a4b] text-white"
        >
          Comenzar
        </Button>
      </CardFooter>
    </Card>
  );
}
