"use server";

import { prisma } from "@/lib/prisma";
import {
  fullSurveySchema,
  FullSurveyData,
  HousingData,
  PersonData,
  PetData,
} from "@/lib/schemas";
import {
  SectorType,
  TenureType,
  PropertyStatus,
  PropertyType,
  DocumentType,
  GenderIdentity,
  EthnicAffiliation,
  PetType,
} from "@prisma/client";

export type SubmitResult =
  | { success: true; surveyId: string }
  | { success: false; error: string };

type RecaptchaVerifyResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

async function verifyRecaptcha(token: string): Promise<RecaptchaVerifyResponse> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    throw new Error("RECAPTCHA_SECRET_KEY no esta configurada.");
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }).toString(),
  });

  return response.json();
}

function toSectorType(value: HousingData["sectorType"]): SectorType {
  return value as SectorType;
}

function toTenureType(value: HousingData["tenureType"]): TenureType {
  return value as TenureType;
}

function toPropertyStatus(value: HousingData["propertyStatus"]): PropertyStatus {
  return value as PropertyStatus;
}

function toPropertyType(value: HousingData["propertyType"]): PropertyType {
  return value as PropertyType;
}

function toDocumentType(value: PersonData["documentType"]): DocumentType {
  return value as DocumentType;
}

function toGenderIdentity(value: PersonData["genderIdentity"]): GenderIdentity {
  return value as GenderIdentity;
}

function toEthnicAffiliation(value: PersonData["ethnicAffiliation"]): EthnicAffiliation {
  return value as EthnicAffiliation;
}

function toPetType(value: PetData["petType"]): PetType {
  return value as PetType;
}

export async function submitSurvey(data: FullSurveyData): Promise<SubmitResult> {
  try {
    const parsed = fullSurveySchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: "Los datos del formulario no son validos. Verifique e intente de nuevo.",
      };
    }

    const { housing, people, pets, recaptchaToken } = parsed.data;

    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.success || (recaptchaResult.score ?? 0) < 0.5) {
      return {
        success: false,
        error: "No se pudo verificar que eres humano. Intente de nuevo.",
      };
    }

    const survey = await prisma.householdSurvey.create({
      data: {
        submittedAt: new Date(),
        housing: {
          create: {
            neighborhoodOrSector: housing.neighborhoodOrSector,
            address: housing.address,
            sectorType: toSectorType(housing.sectorType),
            farmNameOrReference: housing.farmNameOrReference ?? null,
            stratum: Number(housing.stratum),
            tenureType: toTenureType(housing.tenureType),
            propertyStatus: toPropertyStatus(housing.propertyStatus),
            damageDescription: housing.damageDescription ?? null,
            wasEvacuated: housing.wasEvacuated === "yes",
            propertyType: toPropertyType(housing.propertyType),
            propertyTypeOther: housing.propertyTypeOther ?? null,
            totalFamilies: Number(housing.totalFamilies),
            householdMembersCount: Number(housing.householdMembersCount),
            peopleToRegister: Number(housing.peopleToRegister),
            petsToRegister: Number(housing.petsToRegister),
            longitude: null,
            latitude: null,
          },
        },
        people: {
          create: people.map((person, index) => ({
            orderIndex: index,
            firstNames: person.firstNames,
            lastNames: person.lastNames,
            documentType: toDocumentType(person.documentType),
            documentNumber: person.documentNumber,
            genderIdentity: toGenderIdentity(person.genderIdentity),
            birthDate: new Date(person.birthDate),
            ethnicAffiliation: toEthnicAffiliation(person.ethnicAffiliation),
            phoneNumber: person.phoneNumber,
          })),
        },
        pets: {
          create: pets.map((pet, index) => ({
            orderIndex: index,
            petType: toPetType(pet.petType),
            name: pet.name ?? null,
          })),
        },
      },
    });

    return { success: true, surveyId: survey.id };
  } catch (error) {
    console.error("Error al guardar el censo:", error);
    return {
      success: false,
      error: "Ocurrio un error al guardar el censo. Intente de nuevo mas tarde.",
    };
  }
}
