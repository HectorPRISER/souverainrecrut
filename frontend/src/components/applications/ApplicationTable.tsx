import Button from "../ui/Button";

import type {
  Application,
} from "../../types/application.types";

interface ApplicationTableProps {
  applications: Application[];

  onEdit: (
    application: Application
  ) => void;

  onDelete: (
    application: Application
  ) => void;
}

export default function ApplicationTable({
  applications,
  onEdit,
  onDelete,
}: ApplicationTableProps) {
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
            Candidat
          </th>

          <th
            style={{
              padding: "12px",
              textAlign: "left",
            }}
          >
            Offre
          </th>

          <th
            style={{
              padding: "12px",
              textAlign: "left",
            }}
          >
            Statut
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
        {applications.map(
          (application) => (
            <tr
              key={application.id}
            >
              <td
                style={{
                  padding: "12px",
                }}
              >
                {
                  application.candidateId
                }
              </td>

              <td
                style={{
                  padding: "12px",
                }}
              >
                {application.jobId}
              </td>

              <td
                style={{
                  padding: "12px",
                }}
              >
                {application.status}
              </td>

              <td
                style={{
                  padding: "12px",
                }}
              >
                <Button
                  style={{
                    marginRight:
                      "0.5rem",
                    background:
                      "#f59e0b",
                  }}
                  onClick={() =>
                    onEdit(
                      application
                    )
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
                    onDelete(
                      application
                    )
                  }
                >
                  Supprimer
                </Button>
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}