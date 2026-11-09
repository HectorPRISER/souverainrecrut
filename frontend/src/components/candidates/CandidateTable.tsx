import Button from "../ui/Button";

import type { Candidate } from "../../types/candidate.types";

interface CandidateTableProps {
  candidates: Candidate[];

  onEdit: (candidate: Candidate) => void;

  onDelete: (candidate: Candidate) => void;
}

export default function CandidateTable({
  candidates,
  onEdit,
  onDelete,
}: CandidateTableProps) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "#fff",
      }}
    >
      <thead>
        <tr>
          <th
            style={{
              padding: "12px",
              textAlign: "left",
            }}
          >
            Nom complet
          </th>

          <th
            style={{
              padding: "12px",
              textAlign: "left",
            }}
          >
            Email
          </th>

          <th
            style={{
              padding: "12px",
              textAlign: "left",
            }}
          >
            Téléphone
          </th>

          <th
            style={{
              padding: "12px",
              textAlign: "left",
            }}
          >
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {candidates.map((candidate) => (
          <tr key={candidate.id}>
            <td
              style={{
                padding: "12px",
              }}
            >
              {candidate.fullName}
            </td>

            <td
              style={{
                padding: "12px",
              }}
            >
              {candidate.email}
            </td>

            <td
              style={{
                padding: "12px",
              }}
            >
              {candidate.phone ??
                "-"}
            </td>

            <td
              style={{
                padding: "12px",
              }}
            >
              <Button
                style={{
                  marginRight: "0.5rem",
                  background:
                    "#f59e0b",
                }}
                onClick={() =>
                  onEdit(candidate)
                }
              >
                Modifier
              </Button>

              <Button
                style={{
                  background:
                    "#dc2626",
                }}
                onClick={() =>
                  onDelete(candidate)
                }
              >
                Supprimer
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}