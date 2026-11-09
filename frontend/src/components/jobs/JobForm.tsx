import { useEffect } from "react";
import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../ui/Button";

import type {
  Job,
  JobFormData,
} from "../../types/job.types";

const schema = z.object({
  title: z
    .string()
    .min(
      3,
      "Le titre doit contenir au moins 3 caractères."
    )
    .max(
      150,
      "Le titre est trop long."
    ),

  description: z
    .string()
    .min(
      10,
      "La description doit contenir au moins 10 caractères."
    ),

  location: z
    .string()
    .min(
      2,
      "Le lieu est obligatoire."
    ),

  company: z
    .string()
    .min(
      2,
      "Le nom de l'entreprise est obligatoire."
    ),

  recruiterId: z
    .string()
    .min(
      1,
      "Le recruteur est obligatoire."
    ),
});

type FormValues = z.infer<typeof schema>;

interface JobFormProps {
  job?: Job | null;

  onSubmit: (
    data: JobFormData
  ) => Promise<void>;

  onCancel: () => void;
}

export default function JobForm({
  job,
  onSubmit,
  onCancel,
}: JobFormProps) {
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
      title: "",
      description: "",
      location: "",
      company: "",
      recruiterId: "",
    },
  });

  useEffect(() => {
    if (job) {
      reset({
        title: job.title,
        description:
          job.description,
        location: job.location,
        company: job.company,
        recruiterId:
          job.recruiterId,
      });
    } else {
      reset({
        title: "",
        description: "",
        location: "",
        company: "",
        recruiterId: "",
      });
    }
  }, [job, reset]);

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
        placeholder="Titre"
        {...register("title")}
      />

      {errors.title && (
        <small
          style={{
            color: "red",
          }}
        >
          {errors.title.message}
        </small>
      )}

      <textarea
        rows={5}
        placeholder="Description"
        {...register(
          "description"
        )}
      />

      {errors.description && (
        <small
          style={{
            color: "red",
          }}
        >
          {
            errors.description
              .message
          }
        </small>
      )}

      <input
        placeholder="Entreprise"
        {...register("company")}
      />

      {errors.company && (
        <small
          style={{
            color: "red",
          }}
        >
          {errors.company.message}
        </small>
      )}

      <input
        placeholder="Lieu"
        {...register("location")}
      />

      {errors.location && (
        <small
          style={{
            color: "red",
          }}
        >
          {errors.location.message}
        </small>
      )}

      <input
        placeholder="ID du recruteur"
        {...register(
          "recruiterId"
        )}
      />

      {errors.recruiterId && (
        <small
          style={{
            color: "red",
          }}
        >
          {
            errors.recruiterId
              .message
          }
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
          disabled={
            isSubmitting
          }
        >
          {job
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