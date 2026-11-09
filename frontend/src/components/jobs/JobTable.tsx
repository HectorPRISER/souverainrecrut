import Button from "../ui/Button";

import type { Job } from "../../types/job.types";

interface JobTableProps {
  jobs: Job[];

  onEdit: (job: Job) => void;

  onDelete: (job: Job) => void;
}

export default function JobTable({
  jobs,
  onEdit,
  onDelete,
}: JobTableProps) {
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
            Titre
          </th>

          <th
            style={{
              padding: "12px",
              textAlign: "left",
            }}
          >
            Entreprise
          </th>

          <th
            style={{
              padding: "12px",
              textAlign: "left",
            }}
          >
            Lieu
          </th>

          <th
            style={{
              padding: "12px",
              textAlign: "left",
            }}
          >
            Recruteur
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
        {jobs.map((job) => (
          <tr key={job.id}>
            <td
              style={{
                padding: "12px",
              }}
            >
              {job.title}
            </td>

            <td
              style={{
                padding: "12px",
              }}
            >
              {job.company}
            </td>

            <td
              style={{
                padding: "12px",
              }}
            >
              {job.location}
            </td>

            <td
              style={{
                padding: "12px",
              }}
            >
              {job.recruiterId}
            </td>

            <td
              style={{
                padding: "12px",
              }}
            >
              <Button
                style={{
                  marginRight: "0.5rem",
                  background: "#f59e0b",
                }}
                onClick={() =>
                  onEdit(job)
                }
              >
                Modifier
              </Button>

              <Button
                style={{
                  background: "#dc2626",
                }}
                onClick={() =>
                  onDelete(job)
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