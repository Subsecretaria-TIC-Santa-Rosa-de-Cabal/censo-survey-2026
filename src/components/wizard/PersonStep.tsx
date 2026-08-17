"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/lib/store";
import { personSchema, PersonData, documentTypeOptions, genderIdentityOptions, ethnicAffiliationOptions } from "@/lib/schemas";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";

export function PersonStep() {
  const { stepIndex, people, setPeople, next, back } = useWizardStore();
  const person = people[stepIndex];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PersonData>({
    resolver: zodResolver(personSchema),
    defaultValues: person,
  });

  useEffect(() => {
    reset(person);
  }, [person, reset]);

  const onSubmit: SubmitHandler<PersonData> = (data) => {
    const updated = [...people];
    updated[stepIndex] = data;
    setPeople(updated);
    next();
  };

  return (
    <Card className="border-none shadow-none ring-0 bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl sm:text-2xl font-semibold text-[#2d4f3a]">
          Datos del integrante {stepIndex + 1}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="px-0 grid gap-5 grid-cols-1">
          <FormInput
            id="firstNames"
            label="Nombres"
            {...register("firstNames")}
            error={errors.firstNames?.message}
            required
          />

          <FormInput
            id="lastNames"
            label="Apellidos"
            {...register("lastNames")}
            error={errors.lastNames?.message}
            required
          />

          <FormSelect
            id="documentType"
            label="Tipo de documento"
            value={watch("documentType")}
            onChange={(value) =>
              setValue("documentType", value as PersonData["documentType"], {
                shouldValidate: true,
              })
            }
            options={documentTypeOptions.map((o) => ({ value: o.value, label: o.label }))}
            error={errors.documentType?.message}
            required
          />

          <FormInput
            id="documentNumber"
            label="Número de documento"
            {...register("documentNumber")}
            error={errors.documentNumber?.message}
            required
          />

          <FormSelect
            id="genderIdentity"
            label="Identidad de género"
            value={watch("genderIdentity")}
            onChange={(value) =>
              setValue("genderIdentity", value as PersonData["genderIdentity"], {
                shouldValidate: true,
              })
            }
            options={genderIdentityOptions.map((o) => ({ value: o.value, label: o.label }))}
            error={errors.genderIdentity?.message}
            required
          />

          <FormInput
            id="birthDate"
            label="Fecha de nacimiento"
            type="date"
            {...register("birthDate")}
            error={errors.birthDate?.message}
            required
          />

          <FormSelect
            id="ethnicAffiliation"
            label="Pertenencia étnica"
            value={watch("ethnicAffiliation")}
            onChange={(value) =>
              setValue("ethnicAffiliation", value as PersonData["ethnicAffiliation"], {
                shouldValidate: true,
              })
            }
            options={ethnicAffiliationOptions.map((o) => ({ value: o.value, label: o.label }))}
            error={errors.ethnicAffiliation?.message}
            required
          />

          <FormInput
            id="phoneNumber"
            label="Número de teléfono"
            type="tel"
            {...register("phoneNumber")}
            error={errors.phoneNumber?.message}
            required
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
