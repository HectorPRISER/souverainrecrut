import Button from "../ui/Button";

import type { Application } from "../../types/application.types";

interface DeleteApplicationModalProps {
  application: Application;

  onCancel: () => void;

  onConfirm: () => Promise<void>;
}

export default function DeleteApplicationModal({
  application,
  onCancel,
  onConfirm,
}: DeleteApplicationModalProps) {
  return (
    <div
      style={{
        marginTop: "2rem",
        background: "#fff",
        padding: "2rem",
        borderRadius: 8,
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h2>Supprimer une candidature</h2>

      <p>
        Voulez-vous supprimer cette candidature ?
      </p>

      <div
        style={{
          margin: "1rem 0",
          padding: "1rem",
          background: "#f9fafb",
          borderRadius: 6,
        }}
      >
        <p>
          <strong>Candidat :</strong>{" "}
          {application.candidateId}
        </p>

        <p>
          <strong>Offre :</strong>{" "}
          {application.jobId}
        </p>

        <p>
          <strong>Statut :</strong>{" "}
          {application.status}
        </p>
      </div>

      <p
        style={{
          color: "#666",
          fontSize: "0.9rem",
        }}
      >
        Cette action est irréversible.
      </p>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "1.5rem",
        }}
      >
        <Button
          type="button"
          onClick={onCancel}
        >
          Annuler
        </Button>

        <Button
          type="button"
          style={{
            background: "#dc2626",
          }}
          onClick={() => {
            void onConfirm();
          }}
        >
          Supprimer
        </Button>
      </div>
    </div>
  );
}