import { z } from "zod";

export const OTHER_NEIGHBORHOOD_VALUE = "__OTHER__";
export const OTHER_EPS_VALUE = "__OTHER_EPS__";

export const sectorTypeOptions = [
  { value: "urban", label: "Urbano" },
  { value: "rural", label: "Rural" },
] as const;

export const tenureTypeOptions = [
  { value: "owner", label: "Propietario" },
  { value: "tenant", label: "Arrendatario" },
  { value: "occupant", label: "Ocupante" },
  { value: "possessor", label: "Poseedor" },
  { value: "not_informed", label: "No informa" },
] as const;

export const propertyStatusOptions = [
  { value: "habitable", label: "Habitable" },
  { value: "uninhabitable", label: "No habitable" },
  { value: "destroyed", label: "Destruido" },
  { value: "damaged", label: "Averiado" },
] as const;

export const propertyTypeOptions = [
  { value: "housing", label: "Vivienda" },
  { value: "farm", label: "Finca" },
  { value: "commercial_premises", label: "Local comercial" },
  { value: "factory", label: "Fábrica" },
  { value: "warehouse", label: "Bodega" },
  { value: "lot", label: "Lote" },
  { value: "wellness_center", label: "Centro de bienestar" },
  { value: "educational_center", label: "Centro educativo o escuela" },
  { value: "senior_center", label: "Centro de bienestar adulto mayor" },
  { value: "hospital", label: "Hospital" },
  { value: "stadium", label: "Estadio" },
  { value: "church", label: "Iglesia o institución religiosa" },
  { value: "municipality", label: "Alcaldía municipal" },
  { value: "police_station", label: "Estación de policía" },
  { value: "other", label: "Otro" },
] as const;

export const documentTypeOptions = [
  { value: "citizenship_id", label: "Cédula de ciudadanía" },
  { value: "identity_card", label: "Tarjeta de identidad" },
  { value: "birth_certificate", label: "Registro civil" },
  { value: "passport", label: "Pasaporte" },
  { value: "ppt", label: "Permiso de protección temporal (PPT)" },
  { value: "pep", label: "Permiso especial de permanencia (PEP)" },
  { value: "foreign_id", label: "Cédula de extranjería" },
  { value: "nit", label: "NIT" },
] as const;

export const genderIdentityOptions = [
  { value: "woman", label: "Mujer" },
  { value: "man", label: "Hombre" },
  { value: "transgender", label: "Transgénero" },
  { value: "other", label: "Otro" },
  { value: "prefer_not_to_say", label: "Prefiero no responder" },
] as const;

export const ethnicAffiliationOptions = [
  { value: "indigenous", label: "Indígena" },
  { value: "gitano_rom", label: "Gitano(a) - ROM" },
  { value: "raizal", label: "Raizal" },
  { value: "palenquero", label: "Palenquero(a)" },
  { value: "negro", label: "Negro(a)" },
  { value: "mulato", label: "Mulato(a)" },
  { value: "afrodescendant", label: "Afrodescendiente(a)" },
  { value: "afrocolombian", label: "Afrocolombiano(a)" },
  { value: "not_applicable", label: "No aplica" },
] as const;

export const disabilityConditionOptions = [
  { value: "visual", label: "Visual" },
  { value: "auditory", label: "Auditiva" },
  { value: "physical", label: "Física" },
  { value: "cognitive", label: "Cognitiva" },
  { value: "none", label: "Ninguna" },
  { value: "other", label: "Otro" },
] as const;

export const relationshipOptions = [
  { value: "head_of_household", label: "Jefe(a) o cabeza de hogar" },
  { value: "partner", label: "Pareja" },
  { value: "spouse", label: "Esposo(a)" },
  { value: "son_daughter", label: "Hijo(a)" },
  { value: "stepchild", label: "Hijastro(a)" },
  { value: "grandparent", label: "Abuelo(a)" },
  { value: "nephew_niece", label: "Sobrino(a)" },
  { value: "grandchild", label: "Nieto(a)" },
  { value: "uncle_aunt", label: "Tio(a)" },
  { value: "father", label: "Padre" },
  { value: "mother", label: "Madre" },
  { value: "father_in_law_mother_in_law", label: "Suegro(a)" },
  { value: "brother_sister", label: "Hermano(a)" },
  { value: "half_brother_half_sister", label: "Hermanastro(a)" },
  { value: "son_in_law", label: "Yerno" },
  { value: "daughter_in_law", label: "Nuera" },
  { value: "brother_in_law_sister_in_law", label: "Cuñado(a)" },
  { value: "cousin", label: "Primo(a)" },
  { value: "other_relative", label: "Otro pariente" },
  { value: "non_relative", label: "No pariente" },
  { value: "not_informed", label: "No informa" },
] as const;

export const petTypeOptions = [
  { value: "dog", label: "Perro" },
  { value: "cat", label: "Gato" },
  { value: "bird", label: "Ave" },
  { value: "rabbit", label: "Conejo" },
  { value: "other", label: "Otro" },
] as const;

const requiredEnum = (values: readonly [string, ...string[]], message: string) =>
  z.enum(values, { message });

const positiveIntString = (message: string) =>
  z
    .string()
    .min(1, message)
    .regex(/^\d+$/, "Debe ser un número entero positivo.")
    .refine((val) => Number(val) >= 1, { message });

const nonNegativeIntString = (message: string) =>
  z
    .string()
    .regex(/^\d*$/, "Debe ser un número entero.")
    .transform((val) => (val === "" ? "0" : val))
    .refine((val) => Number(val) >= 0, { message });

export const housingDataSchema = z
  .object({
    neighborhoodId: z.string().optional(),
    neighborhoodOrSector: z.string().optional(),
    customNeighborhood: z.string().optional(),
    address: z.string().min(1, "La dirección es obligatoria."),
    sectorType: requiredEnum(["urban", "rural"], "El sector es obligatorio."),
    farmNameOrReference: z.string().optional(),
    stratum: z
      .string()
      .min(1, "El estrato es obligatorio.")
      .regex(/^\d+$/, "Debe ser un número entero positivo.")
      .refine((val) => {
        const n = Number(val);
        return n >= 1 && n <= 6;
      }, "El estrato debe estar entre 1 y 6."),
    tenureType: requiredEnum(
      ["owner", "tenant", "occupant", "possessor"],
      "La forma de tenencia es obligatoria."
    ),
    propertyStatus: requiredEnum(
      ["habitable", "uninhabitable", "destroyed", "damaged"],
      "El estado del inmueble es obligatorio."
    ),
    damageDescription: z.string().min(1, "La descripción breve de los daños es obligatoria."),
    wasEvacuated: requiredEnum(["yes", "no"], "Debe indicar si ha sido evacuado."),
    propertyType: requiredEnum(
      [
        "housing",
        "farm",
        "commercial_premises",
        "factory",
        "warehouse",
        "lot",
        "wellness_center",
        "educational_center",
        "senior_center",
        "hospital",
        "stadium",
        "church",
        "municipality",
        "police_station",
        "other",
      ],
      "El tipo de inmueble es obligatorio."
    ),
    propertyTypeOther: z.string().optional(),
    totalFamilies: positiveIntString("El total de familias debe ser al menos 1."),
    householdMembersCount: positiveIntString(
      "Las personas del núcleo familiar deben ser al menos 1."
    ),
    peopleToRegister: positiveIntString(
      "El número de personas a registrar debe ser al menos 1."
    ),
    petsToRegister: nonNegativeIntString(
      "El número de mascotas no puede ser negativo."
    ),
    longitude: z.string().optional(),
    latitude: z.string().optional(),
  })
  .refine(
    (data) => data.sectorType !== "rural" || !!data.farmNameOrReference?.trim(),
    {
      message:
        "El nombre de la finca o punto de referencia es obligatorio para sector rural.",
      path: ["farmNameOrReference"],
    }
  )
  .refine(
    (data) => data.propertyType !== "other" || !!data.propertyTypeOther?.trim(),
    {
      message: "Debe especificar el tipo de inmueble.",
      path: ["propertyTypeOther"],
    }
  )
  .refine(
    (data) =>
      !!data.neighborhoodId?.trim() ||
      (data.neighborhoodOrSector === OTHER_NEIGHBORHOOD_VALUE &&
        !!data.customNeighborhood?.trim()),
    {
      message: "Debe seleccionar un barrio o escribir uno.",
      path: ["neighborhoodOrSector"],
    }
  )
  .refine(
    (data) =>
      data.neighborhoodOrSector !== OTHER_NEIGHBORHOOD_VALUE ||
      !!data.customNeighborhood?.trim(),
    {
      message: "Debe escribir el nombre del barrio.",
      path: ["customNeighborhood"],
    }
  );

export const personSchema = z.object({
  firstNames: z.string().min(1, "Los nombres son obligatorios."),
  lastNames: z.string().min(1, "Los apellidos son obligatorios."),
  documentType: requiredEnum(
    ["citizenship_id", "identity_card", "birth_certificate", "passport", "ppt", "pep", "foreign_id", "nit"],
    "El tipo de documento es obligatorio."
  ),
  documentNumber: z.string().min(1, "El número de documento es obligatorio."),
  relationship: requiredEnum(
    [
      "head_of_household",
      "partner",
      "spouse",
      "son_daughter",
      "stepchild",
      "grandparent",
      "nephew_niece",
      "grandchild",
      "uncle_aunt",
      "father",
      "mother",
      "father_in_law_mother_in_law",
      "brother_sister",
      "half_brother_half_sister",
      "son_in_law",
      "daughter_in_law",
      "brother_in_law_sister_in_law",
      "cousin",
      "other_relative",
      "non_relative",
      "not_informed",
    ],
    "El parentesco es obligatorio."
  ),
  epsId: z.string().optional(),
  epsOther: z.string().optional(),
  genderIdentity: requiredEnum(
    ["woman", "man", "transgender", "other", "prefer_not_to_say"],
    "La identidad de género es obligatoria."
  ),
  birthDate: z.string().min(1, "La fecha de nacimiento es obligatoria."),
  ethnicAffiliation: requiredEnum(
    ["indigenous", "gitano_rom", "raizal", "palenquero", "negro", "mulato", "afrodescendant", "afrocolombian", "not_applicable"],
    "La pertenencia étnica es obligatoria."
  ),
  phoneNumber: z.string().min(1, "El número de teléfono es obligatorio."),
  email: z
    .string()
    .email("El correo electrónico no es válido.")
    .optional()
    .or(z.literal("")),
  disabilityCondition: requiredEnum(
    ["visual", "auditory", "physical", "cognitive", "none", "other"],
    "La condición de discapacidad es obligatoria."
  ),
  disabilityConditionOther: z.string().optional(),
})
  .refine(
    (data) => data.disabilityCondition !== "other" || !!data.disabilityConditionOther?.trim(),
    {
      message: "Debe especificar la condición de discapacidad.",
      path: ["disabilityConditionOther"],
    }
  )
  .refine(
    (data) =>
      !!data.epsId?.trim() ||
      (data.epsId === OTHER_EPS_VALUE && !!data.epsOther?.trim()),
    {
      message: "Debe seleccionar una EPS o escribir una.",
      path: ["epsId"],
    }
  )
  .refine(
    (data) => data.epsId !== OTHER_EPS_VALUE || !!data.epsOther?.trim(),
    {
      message: "Debe escribir el nombre de la EPS.",
      path: ["epsOther"],
    }
  );

export const petSchema = z.object({
  petType: requiredEnum(["dog", "cat", "bird", "rabbit", "other"], "El tipo de mascota es obligatorio."),
  name: z.string().optional(),
});

export const fullSurveySchema = z.object({
  housing: housingDataSchema,
  people: z.array(personSchema).min(1, "Debe registrar al menos una persona."),
  pets: z.array(petSchema),
  recaptchaToken: z.string().min(1, "Token de seguridad requerido."),
});

export type HousingData = z.infer<typeof housingDataSchema>;
export type PersonData = z.infer<typeof personSchema>;
export type PetData = z.infer<typeof petSchema>;
export type FullSurveyData = z.infer<typeof fullSurveySchema>;
