import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";

import JobForm from "../../components/jobs/JobForm";
import JobTable from "../../components/jobs/JobTable";
import DeleteJobModal from "../../components/jobs/DeleteJobModal";

import { jobService } from "../../services/job.service";

import type {
  Job,
  JobFormData,
  CreateJobRequest,
  UpdateJobRequest,
} from "../../types/job.types";

export default function JobsPage() {
  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [openForm, setOpenForm] =
    useState(false);

  const [selectedJob, setSelectedJob] =
    useState<Job | null>(null);

  const [openDelete, setOpenDelete] =
    useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      const response =
        await jobService.getAll();

      setJobs(response.data);
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de charger les offres."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    data: JobFormData
  ) {
    try {
      if (selectedJob) {
        const updateData: UpdateJobRequest =
          {
            title: data.title,
            description:
              data.description,
            location:
              data.location,
            company:
              data.company,
            recruiterId:
              data.recruiterId,
          };

        await jobService.update(
          selectedJob.id,
          updateData
        );

        toast.success(
          "Offre mise à jour."
        );
      } else {
        const createData: CreateJobRequest =
          {
            title: data.title,
            description:
              data.description,
            location:
              data.location,
            company:
              data.company,
            recruiterId:
              data.recruiterId,
          };

        await jobService.create(
          createData
        );

        toast.success(
          "Offre créée."
        );
      }

      setOpenForm(false);

      setSelectedJob(null);

      loadJobs();
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible d'enregistrer."
      );
    }
  }

  function handleEdit(job: Job) {
    setSelectedJob(job);

    setOpenForm(true);
  }

  function handleDelete(job: Job) {
    setSelectedJob(job);

    setOpenDelete(true);
  }

  async function confirmDelete() {
    if (!selectedJob) return;

    try {
      await jobService.delete(
        selectedJob.id
      );

      toast.success(
        "Offre supprimée."
      );

      setOpenDelete(false);

      setSelectedJob(null);

      loadJobs();
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
        title="Offres"
        subtitle="Gestion des offres d'emploi."
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
            setSelectedJob(null);

            setOpenForm(true);
          }}
        >
          + Créer une offre
        </Button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <JobTable
          jobs={jobs}
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
            {selectedJob
              ? "Modifier une offre"
              : "Nouvelle offre"}
          </h3>

          <JobForm
            job={selectedJob}
            onSubmit={handleSubmit}
            onCancel={() => {
              setOpenForm(false);

              setSelectedJob(null);
            }}
          />
        </div>
      )}

      {openDelete &&
        selectedJob && (
          <DeleteJobModal
            job={selectedJob}
            onCancel={() => {
              setOpenDelete(false);

              setSelectedJob(null);
            }}
            onConfirm={
              confirmDelete
            }
          />
        )}
    </>
  );
}