import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HousingData, PersonData, PetData } from "@/lib/schemas";

export type WizardStep =
  | "welcome"
  | "housing"
  | "person"
  | "pet"
  | "review";

interface WizardState {
  step: WizardStep;
  stepIndex: number;
  acceptedDataTreatment: boolean;
  housing: HousingData | null;
  people: PersonData[];
  pets: PetData[];
}

interface WizardActions {
  setAcceptedDataTreatment: (value: boolean) => void;
  setHousing: (housing: HousingData) => void;
  setPeople: (people: PersonData[]) => void;
  setPets: (pets: PetData[]) => void;
  syncPeopleCount: (count: number) => void;
  syncPetsCount: (count: number) => void;
  goToStep: (step: WizardStep, index?: number) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
}

const initialState: WizardState = {
  step: "welcome",
  stepIndex: 0,
  acceptedDataTreatment: false,
  housing: null,
  people: [],
  pets: [],
};

export const useWizardStore = create<WizardState & WizardActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAcceptedDataTreatment: (value) =>
        set({ acceptedDataTreatment: value }),

      setHousing: (housing) => set({ housing }),

      setPeople: (people) => set({ people }),

      setPets: (pets) => set({ pets }),

      syncPeopleCount: (count: number) => {
        const current = get().people;
        if (count > current.length) {
          const added: PersonData[] = Array.from(
            { length: count - current.length },
            () => ({
              firstNames: "",
              lastNames: "",
              documentType: undefined as unknown as PersonData["documentType"],
              documentNumber: "",
              genderIdentity: undefined as unknown as PersonData["genderIdentity"],
              birthDate: "",
              ethnicAffiliation: undefined as unknown as PersonData["ethnicAffiliation"],
              phoneNumber: "",
            })
          );
          set({ people: [...current, ...added] });
        } else if (count < current.length) {
          set({ people: current.slice(0, count) });
        }
      },

      syncPetsCount: (count: number) => {
        const current = get().pets;
        if (count > current.length) {
          const added: PetData[] = Array.from(
            { length: count - current.length },
            () => ({
              petType: undefined as unknown as PetData["petType"],
              name: "",
            })
          );
          set({ pets: [...current, ...added] });
        } else if (count < current.length) {
          set({ pets: current.slice(0, count) });
        }
      },

      goToStep: (step, index = 0) => set({ step, stepIndex: index }),

      next: () => {
        const state = get();
        if (state.step === "welcome") {
          set({ step: "housing", stepIndex: 0 });
        } else if (state.step === "housing") {
          set({ step: "person", stepIndex: 0 });
        } else if (state.step === "person") {
          if (state.stepIndex < state.people.length - 1) {
            set({ stepIndex: state.stepIndex + 1 });
          } else if (state.pets.length > 0) {
            set({ step: "pet", stepIndex: 0 });
          } else {
            set({ step: "review", stepIndex: 0 });
          }
        } else if (state.step === "pet") {
          if (state.stepIndex < state.pets.length - 1) {
            set({ stepIndex: state.stepIndex + 1 });
          } else {
            set({ step: "review", stepIndex: 0 });
          }
        }
      },

      back: () => {
        const state = get();
        if (state.step === "housing") {
          set({ step: "welcome", stepIndex: 0 });
        } else if (state.step === "person") {
          if (state.stepIndex > 0) {
            set({ stepIndex: state.stepIndex - 1 });
          } else {
            set({ step: "housing", stepIndex: 0 });
          }
        } else if (state.step === "pet") {
          if (state.stepIndex > 0) {
            set({ stepIndex: state.stepIndex - 1 });
          } else {
            set({ step: "person", stepIndex: state.people.length - 1 });
          }
        } else if (state.step === "review") {
          if (state.pets.length > 0) {
            set({ step: "pet", stepIndex: state.pets.length - 1 });
          } else {
            set({ step: "person", stepIndex: state.people.length - 1 });
          }
        }
      },

      reset: () => {
        set(initialState);
        if (typeof window !== "undefined") {
          localStorage.removeItem("censo-wizard");
        }
      },
    }),
    {
      name: "censo-wizard",
      partialize: (state) => ({
        step: state.step,
        stepIndex: state.stepIndex,
        acceptedDataTreatment: state.acceptedDataTreatment,
        housing: state.housing,
        people: state.people,
        pets: state.pets,
      }),
    }
  )
);
