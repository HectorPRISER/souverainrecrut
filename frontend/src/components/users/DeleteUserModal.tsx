import Button from "../ui/Button";

import type { User } from "../../types/user.types";

interface DeleteUserModalProps {
  user: User;

  onCancel: () => void;

  onConfirm: () => Promise<void>;
}

export default function DeleteUserModal({
  user,
  onCancel,
  onConfirm,
}: DeleteUserModalProps) {
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
      <h2>Supprimer un utilisateur</h2>

      <p>
        Voulez-vous supprimer
        <strong>
          {" "}
          {user.firstName} {user.lastName}
        </strong>
        ?
      </p>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <Button
          onClick={onCancel}
        >
          Annuler
        </Button>

        <Button
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