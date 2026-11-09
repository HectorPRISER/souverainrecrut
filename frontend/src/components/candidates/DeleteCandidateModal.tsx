import Button from "../ui/Button";

import type { Candidate } from "../../types/candidate.types";

interface DeleteCandidateModalProps {
  candidate: Candidate;

  onCancel: () => void;

  onConfirm: () => Promise<void>;
}

export default function DeleteCandidateModal({
  candidate,
  onCancel,
  onConfirm,
}: DeleteCandidateModalProps) {
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
      <h2>Supprimer un candidat</h2>

      <p>
        Voulez-vous supprimer
        <strong>
          {" "}
          {candidate.fullName}
        </strong>{" "}
        ?
      </p>

      <p
        style={{
          color: "#666",
          fontSize: "0.9rem",
          marginTop: "0.5rem",
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