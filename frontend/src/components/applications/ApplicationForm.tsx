import { useEffect } from "react";
import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../ui/Button";

import type {
  Application,
  ApplicationFormData,
} from "../../types/application.types";

const schema = z.object({
  candidateId: z
    .string()
    .min(
      1,
      "Le candidat est obligatoire."
    ),

  jobId: z
    .string()
    .min(
      1,
      "L'offre est obligatoire."
    ),

  status: z.enum([
    "PENDING",
    "REVIEWED",
    "ACCEPTED",
    "REJECTED",
  ]),
});

type FormValues = z.infer<
  typeof schema
>;

interface ApplicationFormProps {
  application?:
    | Application
    | null;

  onSubmit: (
    data: ApplicationFormData
  ) => Promise<void>;

  onCancel: () => void;
}

export default function ApplicationForm({
  application,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormValues>({
    resolver:
      zodResolver(schema),

    defaultValues: {
      candidateId: "",
      jobId: "",
      status: "PENDING",
    },
  });

  useEffect(() => {
    if (application) {
      reset({
        candidateId:
          application.candidateId,
        jobId:
          application.jobId,
        status:
          application.status,
      });
    } else {
      reset({
        candidateId: "",
        jobId: "",
        status: "PENDING",
      });
    }
  }, [application, reset]);

  const submitHandler: SubmitHandler<FormValues> =
    async (data) => {
      await onSubmit(data);
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
        placeholder="ID du candidat"
        {...register(
          "candidateId"
        )}
      />

      {errors.candidateId && (
        <small
          style={{
            color: "red",
          }}
        >
          {
            errors.candidateId
              .message
          }
        </small>
      )}

      <input
        placeholder="ID de l'offre"
        {...register("jobId")}
      />

      {errors.jobId && (
        <small
          style={{
            color: "red",
          }}
        >
          {errors.jobId.message}
        </small>
      )}

      <select
        {...register("status")}
      >
        <option value="PENDING">
          En attente
        </option>

        <option value="REVIEWED">
          En cours d'étude
        </option>

        <option value="ACCEPTED">
          Acceptée
        </option>

        <option value="REJECTED">
          Refusée
        </option>
      </select>

      <div
        style={{
          display: "flex",
          gap: "1rem",
        }}
      >
        <Button
          type="submit"
          disabled={
            isSubmitting
          }
        >
          {application
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