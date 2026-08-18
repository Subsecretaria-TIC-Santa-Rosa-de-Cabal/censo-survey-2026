"use client";

import { useEffect, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { CircleCheckIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWizardStore } from "@/lib/store";
import { getNeighborhoods, getEps, submitSurvey } from "@/app/actions";
import { ConfirmDialog } from "./ConfirmDialog";
import { SubmittingOverlay } from "./SubmittingOverlay";
import {
  sectorTypeOptions,
  tenureTypeOptions,
  propertyStatusOptions,
  propertyTypeOptions,
  documentTypeOptions,
  genderIdentityOptions,
  ethnicAffiliationOptions,
  disabilityConditionOptions,
  relationshipOptions,
  petTypeOptions,
} from "@/lib/schemas";

function findLabel(
  value: string,
  options: readonly { value: string; label: string }[]
) {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function ReviewStep() {
  const { housing, people, pets, back, reset } = useWizardStore();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [neighborhoodName, setNeighborhoodName] = useState<string | null>(null);
  const [epsNames, setEpsNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (housing?.neighborhoodId) {
      getNeighborhoods().then((neighborhoods) => {
        const found = neighborhoods.find((n) => n.id === housing.neighborhoodId);
        if (found) setNeighborhoodName(found.name);
      });
    }
  }, [housing?.neighborhoodId]);

  useEffect(() => {
    const epsIds = people.map((p) => p.epsId).filter((id): id is string => !!id);
    if (epsIds.length > 0) {
      getEps().then((list) => {
        const map: Record<string, string> = {};
        for (const item of list) {
          map[item.id] = item.name;
        }
        setEpsNames(map);
      });
    }
  }, [people]);

  if (!housing) return null;

  const handleSubmit = async () => {
    if (!executeRecaptcha) {
      setResult({
        success: false,
        message: "No se pudo inicializar la verificación de seguridad. Intente de nuevo.",
      });
      setShowConfirm(false);
      return;
    }

    setShowConfirm(false);
    setSubmitting(true);
    try {
      const recaptchaToken = await executeRecaptcha("submit_survey");
      const response = await submitSurvey({ housing, people, pets, recaptchaToken });

      if (response.success) {
        setShowSuccessModal(true);
      } else {
        setResult({ success: false, message: response.error });
      }
    } catch {
      setResult({
        success: false,
        message: "Ocurrió un error al verificar el envío. Intente de nuevo.",
      });
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    reset();
  };

  return (
    <>
      <Card className="border-none shadow-none ring-0 bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl sm:text-2xl font-semibold text-[#2d4f3a]">
            Resumen del censo
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          {result && !result.success && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {result.message}
            </div>
          )}

          <section className="space-y-3">
            <h3 className="font-medium text-[#2d4f3a]">Datos de la vivienda</h3>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <ReviewItem
                label="Barrio/Sector"
                value={neighborhoodName ?? housing.neighborhoodOrSector ?? undefined}
              />
              <ReviewItem label="Dirección" value={housing.address} />
              <ReviewItem label="Sector" value={findLabel(housing.sectorType, sectorTypeOptions)} />
              {housing.sectorType === "rural" && (
                <ReviewItem label="Finca/Referencia" value={housing.farmNameOrReference} />
              )}
              <ReviewItem label="Estrato" value={housing.stratum.toString()} />
              <ReviewItem label="Tenencia" value={findLabel(housing.tenureType, tenureTypeOptions)} />
              <ReviewItem label="Estado" value={findLabel(housing.propertyStatus, propertyStatusOptions)} />
              <ReviewItem label="¿Evacuado?" value={housing.wasEvacuated === "yes" ? "Sí" : "No"} />
              <ReviewItem
                label="Tipo de inmueble"
                value={
                  housing.propertyType === "other"
                    ? housing.propertyTypeOther
                    : findLabel(housing.propertyType, propertyTypeOptions)
                }
              />
              <ReviewItem label="Familias" value={housing.totalFamilies.toString()} />
              <ReviewItem label="Núcleo familiar" value={housing.householdMembersCount.toString()} />
              <ReviewItem label="Personas a registrar" value={housing.peopleToRegister.toString()} />
              <ReviewItem label="Mascotas a registrar" value={housing.petsToRegister.toString()} />
              <ReviewItem label="Número de contacto" value={housing.contactNumber} />
            </div>
            {housing.damageDescription && (
              <ReviewItem label="Descripción de daños" value={housing.damageDescription} />
            )}
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="font-medium text-[#2d4f3a]">
              Integrantes ({people.length})
            </h3>
            <div className="space-y-3">
              {people.map((person, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#49805e]/10 bg-[#f8fbf9] p-3 text-sm space-y-1"
                >
                  <ReviewItem
                    label="Nombre"
                    value={`${person.firstNames} ${person.lastNames}`}
                  />
                  <ReviewItem
                    label="Documento"
                    value={`${findLabel(person.documentType, documentTypeOptions)} ${person.documentNumber}`}
                  />
                  <ReviewItem
                    label="Parentesco"
                    value={findLabel(person.relationship, relationshipOptions)}
                  />
                  <ReviewItem
                    label="EPS"
                    value={
                      person.epsId && person.epsId !== "__OTHER_EPS__"
                        ? epsNames[person.epsId]
                        : person.epsOther
                    }
                  />
                  <ReviewItem
                    label="Género"
                    value={findLabel(person.genderIdentity, genderIdentityOptions)}
                  />
                  <ReviewItem label="Fecha de nacimiento" value={person.birthDate} />
                  <ReviewItem
                    label="Pertenencia étnica"
                    value={findLabel(person.ethnicAffiliation, ethnicAffiliationOptions)}
                  />
                  <ReviewItem
                    label="Condición de discapacidad"
                    value={
                      person.disabilityCondition === "other"
                        ? person.disabilityConditionOther
                        : findLabel(person.disabilityCondition, disabilityConditionOptions)
                    }
                  />
                  <ReviewItem label="Teléfono" value={person.phoneNumber} />
                  <ReviewItem label="Correo electrónico" value={person.email} />
                </div>
              ))}
            </div>
          </section>

          {pets.length > 0 && (
            <>
              <Separator />
              <section className="space-y-3">
                <h3 className="font-medium text-[#2d4f3a]">Mascotas ({pets.length})</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {pets.map((pet, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-[#49805e]/10 bg-[#f8fbf9] p-3 text-sm"
                    >
                      <span className="font-medium text-[#2d4f3a]">{pet.name}</span>
                      <span className="mx-2 text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        {findLabel(pet.petType, petTypeOptions)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </CardContent>
        <CardFooter className="px-0 pt-6 flex flex-col-reverse sm:flex-row gap-3 bg-transparent border-none">
          <Button type="button" variant="outline" onClick={back} className="w-full sm:w-auto">
            Atrás
          </Button>
          <Button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="w-full sm:w-auto bg-[#49805e] hover:bg-[#3a6a4b] text-white"
          >
            {submitting ? "Enviando..." : "Enviar censo"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="text-center sm:max-w-sm">
          <DialogHeader className="items-center">
            <div className="flex justify-center mb-4">
              <CircleCheckIcon className="h-16 w-16 text-[#49805e]" />
            </div>
            <DialogTitle className="text-xl text-[#2d4f3a]">
              ¡Censo enviado!
            </DialogTitle>
            <DialogDescription>
              El formulario se envió correctamente. Gracias por participar.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={handleCloseSuccessModal}
            className="w-full bg-[#49805e] hover:bg-[#3a6a4b] text-white"
          >
            Volver al inicio
          </Button>
        </DialogContent>
      </Dialog>

      {submitting && <SubmittingOverlay />}

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="¿Enviar el censo?"
        description="Antes de enviar, revise que toda la información esté correcta. Una vez enviada, no podrá rectificar los datos."
        confirmText="Enviar"
        cancelText="Rectificar"
        onConfirm={handleSubmit}
      />
    </>
  );
}

function ReviewItem({ label, value }: { label: string; value?: string | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
