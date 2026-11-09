import { useEffect } from "react";
import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../ui/Button";

import type {
  User,
  UserFormData,
} from "../../types/user.types";

const schema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom est requis."),

  lastName: z
    .string()
    .min(2, "Le nom est requis."),

  email: z
    .string()
    .email("Email invalide."),

  password: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || value.length >= 6,
      {
        message:
          "6 caractères minimum.",
      }
    ),

  role: z.enum([
    "ADMIN",
    "RECRUITER",
  ]),
});

type FormValues = z.infer<
  typeof schema
>;

interface UserFormProps {
  user?: User | null;

  onSubmit: (
    data: UserFormData
  ) => Promise<void>;

  onCancel: () => void;
}

export default function UserForm({
  user,
  onSubmit,
  onCancel,
}: UserFormProps) {
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
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "RECRUITER",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName:
          user.firstName,

        lastName:
          user.lastName,

        email:
          user.email,

        password: "",

        role:
          user.role,
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "RECRUITER",
      });
    }
  }, [user, reset]);

  const submitHandler: SubmitHandler<FormValues> =
    async (data) => {
      await onSubmit({
        firstName:
          data.firstName,

        lastName:
          data.lastName,

        email:
          data.email,

        password:
          data.password,

        role:
          data.role,
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
        placeholder="Prénom"
        {...register("firstName")}
      />

      {errors.firstName && (
        <small
          style={{
            color: "red",
          }}
        >
          {
            errors.firstName
              .message
          }
        </small>
      )}

      <input
        placeholder="Nom"
        {...register("lastName")}
      />

      {errors.lastName && (
        <small
          style={{
            color: "red",
          }}
        >
          {
            errors.lastName
              .message
          }
        </small>
      )}

      <input
        placeholder="Email"
        {...register("email")}
      />

      {errors.email && (
        <small
          style={{
            color: "red",
          }}
        >
          {errors.email.message}
        </small>
      )}

      <input
        type="password"
        placeholder={
          user
            ? "Nouveau mot de passe (optionnel)"
            : "Mot de passe"
        }
        {...register("password")}
      />

      {errors.password && (
        <small
          style={{
            color: "red",
          }}
        >
          {
            errors.password
              .message
          }
        </small>
      )}

      <select
        {...register("role")}
      >
        <option value="ADMIN">
          ADMIN
        </option>

        <option value="RECRUITER">
          RECRUITER
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
          {user
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