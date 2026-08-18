"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/lib/store";
import {
  housingDataSchema,
  HousingData,
  OTHER_NEIGHBORHOOD_VALUE,
  sectorTypeOptions,
  tenureTypeOptions,
  propertyStatusOptions,
  propertyTypeOptions,
} from "@/lib/schemas";
import { getNeighborhoods } from "@/app/actions";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { FormSearchableSelect } from "./FormSearchableSelect";
import { FormTextarea } from "./FormTextarea";
import { ConfirmDialog } from "./ConfirmDialog";

const emptyHousing: HousingData = {
  neighborhoodId: "",
  neighborhoodOrSector: "",
  customNeighborhood: "",
  address: "",
  sectorType: undefined as unknown as HousingData["sectorType"],
  farmNameOrReference: "",
  stratum: "",
  tenureType: undefined as unknown as HousingData["tenureType"],
  propertyStatus: undefined as unknown as HousingData["propertyStatus"],
  damageDescription: "",
  wasEvacuated: undefined as unknown as "yes" | "no",
  propertyType: undefined as unknown as HousingData["propertyType"],
  propertyTypeOther: "",
  totalFamilies: "",
  householdMembersCount: "",
  peopleToRegister: "",
  petsToRegister: "0",
  longitude: "",
  latitude: "",
};

export function HousingStep() {
  const { housing, setHousing, next, back, people, pets, syncPeopleCount, syncPetsCount } =
    useWizardStore();

  const [pendingPeopleCount, setPendingPeopleCount] = useState<number | null>(null);
  const [pendingPetsCount, setPendingPetsCount] = useState<number | null>(null);
  const [showPeopleDialog, setShowPeopleDialog] = useState(false);
  const [showPetsDialog, setShowPetsDialog] = useState(false);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(true);

  useEffect(() => {
    setLoadingNeighborhoods(true);
    getNeighborhoods().then((neighborhoods) => {
      setNeighborhoodOptions(
        neighborhoods.map((n) => ({ value: n.id, label: n.name }))
      );
      setLoadingNeighborhoods(false);
    });
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HousingData>({
    resolver: zodResolver(housingDataSchema),
    defaultValues: housing ?? emptyHousing,
  });

  const neighborhoodId = watch("neighborhoodId");
  const isOtherNeighborhood = !neighborhoodId && watch("neighborhoodOrSector") === OTHER_NEIGHBORHOOD_VALUE;
  const neighborhoodSelectValue = neighborhoodId || (isOtherNeighborhood ? OTHER_NEIGHBORHOOD_VALUE : "");
  const sectorType = watch("sectorType");
  const propertyType = watch("propertyType");
  const peopleToRegister = watch("peopleToRegister");
  const petsToRegister = watch("petsToRegister");
  const peopleToRegisterNum = peopleToRegister ? Number(peopleToRegister) : 0;
  const petsToRegisterNum = petsToRegister ? Number(petsToRegister) : 0;

  useEffect(() => {
    if (peopleToRegisterNum > 0 && peopleToRegisterNum !== people.length) {
      if (peopleToRegisterNum < people.length) {
        setPendingPeopleCount(peopleToRegisterNum);
        setShowPeopleDialog(true);
      } else {
        syncPeopleCount(peopleToRegisterNum);
      }
    }
  }, [peopleToRegisterNum, people.length, syncPeopleCount]);

  useEffect(() => {
    if (petsToRegisterNum !== pets.length) {
      if (petsToRegisterNum < pets.length) {
        setPendingPetsCount(petsToRegisterNum);
        setShowPetsDialog(true);
      } else {
        syncPetsCount(petsToRegisterNum);
      }
    }
  }, [petsToRegisterNum, pets.length, syncPetsCount]);

  const onSubmit: SubmitHandler<HousingData> = (data) => {
    const finalData = data.neighborhoodId
      ? {
          ...data,
          neighborhoodOrSector: "",
          customNeighborhood: "",
        }
      : {
          ...data,
          neighborhoodId: "",
          neighborhoodOrSector: data.customNeighborhood?.trim() ?? "",
        };
    setHousing(finalData);
    next();
  };

  return (
    <>
      <Card className="border-none shadow-none ring-0 bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl sm:text-2xl font-semibold text-[#2d4f3a]">
            Datos de la vivienda
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="px-0 grid gap-5 grid-cols-1">
            <FormSearchableSelect
              id="neighborhoodId"
              label="Barrio / Corregimiento / Vereda / Sector"
              value={neighborhoodSelectValue}
              onChange={(value) => {
                if (value === OTHER_NEIGHBORHOOD_VALUE) {
                  setValue("neighborhoodId", "", { shouldValidate: true });
                  setValue("neighborhoodOrSector", OTHER_NEIGHBORHOOD_VALUE, {
                    shouldValidate: true,
                  });
                } else {
                  setValue("neighborhoodId", value ?? "", {
                    shouldValidate: true,
                  });
                  setValue("neighborhoodOrSector", "", { shouldValidate: true });
                  setValue("customNeighborhood", "", { shouldValidate: true });
                }
              }}
              options={neighborhoodOptions}
              placeholder="Seleccione un barrio..."
              searchPlaceholder="Buscar barrio..."
              loading={loadingNeighborhoods}
              loadingMessage="Cargando barrios..."
              error={errors.neighborhoodOrSector?.message}
              required
            />

            {isOtherNeighborhood && (
              <FormInput
                id="customNeighborhood"
                label="Escriba el nombre del barrio"
                {...register("customNeighborhood")}
                error={errors.customNeighborhood?.message}
                required
              />
            )}

            <FormInput
              id="address"
              label="Dirección"
              {...register("address")}
              error={errors.address?.message}
              required
            />

            <FormSelect
              id="sectorType"
              label="Sector"
              value={sectorType}
              onChange={(value) =>
                setValue("sectorType", value as HousingData["sectorType"], {
                  shouldValidate: true,
                })
              }
              options={sectorTypeOptions.map((o) => ({ value: o.value, label: o.label }))}
              error={errors.sectorType?.message}
              required
            />

            {sectorType === "rural" && (
              <FormInput
                id="farmNameOrReference"
                label="Nombre de la finca o punto de referencia"
                {...register("farmNameOrReference")}
                error={errors.farmNameOrReference?.message}
                required
              />
            )}

            <FormSelect
              id="stratum"
              label="Estrato"
              value={watch("stratum")}
              onChange={(value) =>
                setValue("stratum", value ?? "", {
                  shouldValidate: true,
                })
              }
              options={[
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
                { value: "5", label: "5" },
                { value: "6", label: "6" },
              ]}
              error={errors.stratum?.message}
              required
            />

            <FormSelect
              id="tenureType"
              label="Forma de tenencia"
              value={watch("tenureType")}
              onChange={(value) =>
                setValue("tenureType", value as HousingData["tenureType"], {
                  shouldValidate: true,
                })
              }
              options={tenureTypeOptions.map((o) => ({ value: o.value, label: o.label }))}
              error={errors.tenureType?.message}
              required
            />

            <FormSelect
              id="propertyStatus"
              label="Estado del inmueble"
              value={watch("propertyStatus")}
              onChange={(value) =>
                setValue("propertyStatus", value as HousingData["propertyStatus"], {
                  shouldValidate: true,
                })
              }
              options={propertyStatusOptions.map((o) => ({ value: o.value, label: o.label }))}
              error={errors.propertyStatus?.message}
              required
            />

            <FormTextarea
              id="damageDescription"
              label="Descripción breve de los daños"
              {...register("damageDescription")}
              error={errors.damageDescription?.message}
              rows={3}
              required
            />

            <FormSelect
              id="wasEvacuated"
              label="¿Ha sido evacuado?"
              value={watch("wasEvacuated")}
              onChange={(value) =>
                setValue("wasEvacuated", value as "yes" | "no", { shouldValidate: true })
              }
              options={[
                { value: "yes", label: "Sí" },
                { value: "no", label: "No" },
              ]}
              error={errors.wasEvacuated?.message}
              required
            />

            <FormSelect
              id="propertyType"
              label="Tipo de inmueble"
              value={propertyType}
              onChange={(value) =>
                setValue("propertyType", value as HousingData["propertyType"], {
                  shouldValidate: true,
                })
              }
              options={propertyTypeOptions.map((o) => ({ value: o.value, label: o.label }))}
              error={errors.propertyType?.message}
              required
            />

            {propertyType === "other" && (
              <FormInput
                id="propertyTypeOther"
                label="Especifique el tipo de inmueble"
                {...register("propertyTypeOther")}
                error={errors.propertyTypeOther?.message}
                required
              />
            )}

            <FormInput
              id="totalFamilies"
              label="Total de familias que habitan el inmueble"
              type="number"
              min={1}
              {...register("totalFamilies")}
              error={errors.totalFamilies?.message}
              required
            />

            <FormInput
              id="householdMembersCount"
              label="Personas que conforman el núcleo familiar"
              type="number"
              min={1}
              {...register("householdMembersCount")}
              error={errors.householdMembersCount?.message}
              required
            />

            <FormInput
              id="peopleToRegister"
              label="Número de personas que registrará en este censo"
              type="number"
              min={1}
              {...register("peopleToRegister")}
              error={errors.peopleToRegister?.message}
              required
            />

            <FormInput
              id="petsToRegister"
              label="Número de mascotas que registrará en este censo"
              type="number"
              min={0}
              {...register("petsToRegister")}
              error={errors.petsToRegister?.message}
            />
          </CardContent>
          <CardFooter className="px-0 pt-6 flex flex-col-reverse sm:flex-row gap-3 bg-transparent border-none">
            <Button type="button" variant="outline" onClick={back} className="w-full sm:w-auto">
              Atrás
            </Button>
            <Button type="submit" className="w-full sm:w-auto bg-[#49805e] hover:bg-[#3a6a4b] text-white">
              Siguiente
            </Button>
          </CardFooter>
        </form>
      </Card>

      <ConfirmDialog
        open={showPeopleDialog}
        onOpenChange={setShowPeopleDialog}
        title="¿Eliminar tarjetas de personas?"
        description={`Si reduce el número de personas a ${pendingPeopleCount}, se borrarán ${
          people.length - (pendingPeopleCount ?? 0)
        } tarjeta(s) del censo. ¿Desea continuar?`}
        confirmText="Continuar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={() => {
          if (pendingPeopleCount !== null) {
            syncPeopleCount(pendingPeopleCount);
          }
        }}
      />

      <ConfirmDialog
        open={showPetsDialog}
        onOpenChange={setShowPetsDialog}
        title="¿Eliminar tarjetas de mascotas?"
        description={`Si reduce el número de mascotas a ${pendingPetsCount}, se borrarán ${
          pets.length - (pendingPetsCount ?? 0)
        } tarjeta(s) del censo. ¿Desea continuar?`}
        confirmText="Continuar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={() => {
          if (pendingPetsCount !== null) {
            syncPetsCount(pendingPetsCount);
          }
        }}
      />
    </>
  );
}
