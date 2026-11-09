import { useEffect } from "react";
import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../ui/Button";

import type {
  Candidate,
  CandidateFormData,
} from "../../types/candidate.types";

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(
      3,
      "Le nom complet doit contenir au moins 3 caractères."
    )
    .max(
      100,
      "Le nom complet ne peut pas dépasser 100 caractères."
    ),

  email: z
    .string()
    .email("Adresse email invalide."),

  phone: z
    .string()
    .trim()
    .min(
      8,
      "Le numéro de téléphone est trop court."
    )
    .max(
      20,
      "Le numéro de téléphone est trop long."
    )
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface CandidateFormProps {
  candidate?: Candidate | null;

  onSubmit: (
    data: CandidateFormData
  ) => Promise<void>;

  onCancel: () => void;
}

export default function CandidateForm({
  candidate,
  onSubmit,
  onCancel,
}: CandidateFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),

    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (candidate) {
      reset({
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone ?? "",
      });
    } else {
      reset({
        fullName: "",
        email: "",
        phone: "",
      });
    }
  }, [candidate, reset]);

  const submitHandler: SubmitHandler<FormValues> =
    async (data) => {
      await onSubmit({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
      });
    };

  return (
    <form
      onSubmit={handleSubmit(
        submitHandler
      )}
      style={{
        display: "grid",
        gap: "1rem",
      }}
    >
      <input
        placeholder="Nom complet"
        {...register("fullName")}
      />

      {errors.fullName && (
        <small
          style={{ color: "red" }}
        >
          {errors.fullName.message}
        </small>
      )}

      <input
        placeholder="Email"
        {...register("email")}
      />

      {errors.email && (
        <small
          style={{ color: "red" }}
        >
          {errors.email.message}
        </small>
      )}

      <input
        placeholder="Téléphone"
        {...register("phone")}
      />

      {errors.phone && (
        <small
          style={{ color: "red" }}
        >
          {errors.phone.message}
        </small>
      )}

      <div
        style={{
          display: "flex",
          gap: "1rem",
        }}
      >
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {candidate
            ? "Mettre à jour"
            : "Créer"}
        </Button>

        <Button
          type="button"
          onClick={onCancel}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}