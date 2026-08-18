"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/lib/store";
import {
  personSchema,
  PersonData,
  documentTypeOptions,
  genderIdentityOptions,
  ethnicAffiliationOptions,
  disabilityConditionOptions,
  relationshipOptions,
  OTHER_EPS_VALUE,
} from "@/lib/schemas";
import { getEps } from "@/app/actions";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { FormSearchableSelect } from "./FormSearchableSelect";

export function PersonStep() {
  const { stepIndex, people, setPeople, next, back } = useWizardStore();
  const person = people[stepIndex];

  const [epsOptions, setEpsOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingEps, setLoadingEps] = useState(true);

  useEffect(() => {
    setLoadingEps(true);
    getEps().then((list) => {
      setEpsOptions(list.map((item) => ({ value: item.id, label: item.name })));
      setLoadingEps(false);
    });
  }, []);

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

  const disabilityCondition = watch("disabilityCondition");
  const epsId = watch("epsId");
  const epsSelectValue = epsId || "";

  const onSubmit: SubmitHandler<PersonData> = (data) => {
    const finalData = data.epsId
      ? { ...data, epsOther: "" }
      : { ...data, epsId: OTHER_EPS_VALUE, epsOther: data.epsOther?.trim() ?? "" };
    const updated = [...people];
    updated[stepIndex] = finalData;
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
            id="relationship"
            label="Parentesco"
            value={watch("relationship")}
            onChange={(value) =>
              setValue("relationship", value as PersonData["relationship"], {
                shouldValidate: true,
              })
            }
            options={relationshipOptions.map((o) => ({ value: o.value, label: o.label }))}
            error={errors.relationship?.message}
            required
          />

          <FormSearchableSelect
            id="epsId"
            label="EPS"
            value={epsSelectValue}
            onChange={(value) => {
              if (value === OTHER_EPS_VALUE) {
                setValue("epsId", OTHER_EPS_VALUE, { shouldValidate: true });
              } else {
                setValue("epsId", value ?? "", { shouldValidate: true });
                setValue("epsOther", "", { shouldValidate: true });
              }
            }}
            options={epsOptions}
            placeholder="Seleccione una EPS..."
            searchPlaceholder="Buscar EPS..."
            otherValue={OTHER_EPS_VALUE}
            loading={loadingEps}
            loadingMessage="Cargando EPS..."
            error={errors.epsId?.message}
            required
          />

          {epsSelectValue === OTHER_EPS_VALUE && (
            <FormInput
              id="epsOther"
              label="Escriba el nombre de la EPS"
              {...register("epsOther")}
              error={errors.epsOther?.message}
              required
            />
          )}

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

          <FormSelect
            id="disabilityCondition"
            label="Condición de discapacidad"
            value={disabilityCondition}
            onChange={(value) =>
              setValue("disabilityCondition", value as PersonData["disabilityCondition"], {
                shouldValidate: true,
              })
            }
            options={disabilityConditionOptions.map((o) => ({ value: o.value, label: o.label }))}
            error={errors.disabilityCondition?.message}
            required
          />

          {disabilityCondition === "other" && (
            <FormInput
              id="disabilityConditionOther"
              label="Especifique la condición de discapacidad"
              {...register("disabilityConditionOther")}
              error={errors.disabilityConditionOther?.message}
              required
            />
          )}

          <FormInput
            id="phoneNumber"
            label="Número de teléfono"
            type="tel"
            {...register("phoneNumber")}
            error={errors.phoneNumber?.message}
          />

          <FormInput
            id="email"
            label="Correo electrónico"
            type="email"
            {...register("email")}
            error={errors.email?.message}
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
