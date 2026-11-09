import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";

import ApplicationForm from "../../components/applications/ApplicationForm";
import ApplicationTable from "../../components/applications/ApplicationTable";
import DeleteApplicationModal from "../../components/applications/DeleteApplicationModal";

import { applicationService } from "../../services/application.service";

import type {
  Application,
  ApplicationFormData,
  CreateApplicationRequest,
  UpdateApplicationRequest,
} from "../../types/application.types";

export default function ApplicationsPage() {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [openForm, setOpenForm] =
    useState(false);

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [openDelete, setOpenDelete] =
    useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      const response =
        await applicationService.getAll();

      setApplications(response.data);
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de charger les candidatures."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    data: ApplicationFormData
  ) {
    try {
      if (selectedApplication) {
        const updateData: UpdateApplicationRequest =
          {
            candidateId:
              data.candidateId,
            jobId: data.jobId,
            status: data.status,
          };

        await applicationService.update(
          selectedApplication.id,
          updateData
        );

        toast.success(
          "Candidature mise à jour."
        );
      } else {
        const createData: CreateApplicationRequest =
          {
            candidateId:
              data.candidateId,
            jobId: data.jobId,
            status: data.status,
          };

        await applicationService.create(
          createData
        );

        toast.success(
          "Candidature créée."
        );
      }

      setOpenForm(false);

      setSelectedApplication(null);

      loadApplications();
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible d'enregistrer."
      );
    }
  }

  function handleEdit(
    application: Application
  ) {
    setSelectedApplication(application);

    setOpenForm(true);
  }

  function handleDelete(
    application: Application
  ) {
    setSelectedApplication(application);

    setOpenDelete(true);
  }

  async function confirmDelete() {
    if (!selectedApplication)
      return;

    try {
      await applicationService.delete(
        selectedApplication.id
      );

      toast.success(
        "Candidature supprimée."
      );

      setOpenDelete(false);

      setSelectedApplication(null);

      loadApplications();
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de supprimer."
      );
    }
  }

  return (
    <>
      <PageHeader
        title="Candidatures"
        subtitle="Gestion des candidatures."
      />

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <Button
          onClick={() => {
            setSelectedApplication(
              null
            );

            setOpenForm(true);
          }}
        >
          + Créer une candidature
        </Button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ApplicationTable
          applications={
            applications
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {openForm && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "#fff",
            borderRadius: 8,
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h3>
            {selectedApplication
              ? "Modifier une candidature"
              : "Nouvelle candidature"}
          </h3>

          <ApplicationForm
            application={
              selectedApplication
            }
            onSubmit={
              handleSubmit
            }
            onCancel={() => {
              setOpenForm(false);

              setSelectedApplication(
                null
              );
            }}
          />
        </div>
      )}

      {openDelete &&
        selectedApplication && (
          <DeleteApplicationModal
            application={
              selectedApplication
            }
            onCancel={() => {
              setOpenDelete(false);

              setSelectedApplication(
                null
              );
            }}
            onConfirm={
              confirmDelete
            }
          />
        )}
    </>
  );
}