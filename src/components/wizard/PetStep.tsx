"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/lib/store";
import { petSchema, PetData, petTypeOptions } from "@/lib/schemas";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";

export function PetStep() {
  const { stepIndex, pets, setPets, next, back } = useWizardStore();
  const pet = pets[stepIndex];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PetData>({
    resolver: zodResolver(petSchema),
    defaultValues: pet,
  });

  useEffect(() => {
    reset(pet);
  }, [pet, reset]);

  const onSubmit: SubmitHandler<PetData> = (data) => {
    const updated = [...pets];
    updated[stepIndex] = data;
    setPets(updated);
    next();
  };

  return (
    <Card className="border-none shadow-none ring-0 bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl sm:text-2xl font-semibold text-[#2d4f3a]">
          Datos de la mascota {stepIndex + 1}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="px-0 grid gap-5 grid-cols-1">
          <FormSelect
            id="petType"
            label="Tipo de mascota"
            value={watch("petType")}
            onChange={(value) =>
              setValue("petType", value as PetData["petType"], { shouldValidate: true })
            }
            options={petTypeOptions.map((o) => ({ value: o.value, label: o.label }))}
            error={errors.petType?.message}
            required
          />

          <FormInput
            id="name"
            label="Nombre de la mascota"
            {...register("name")}
            error={errors.name?.message}
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
  );
}
