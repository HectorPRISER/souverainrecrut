import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";

import CandidateForm from "../../components/candidates/CandidateForm";
import CandidateTable from "../../components/candidates/CandidateTable";
import DeleteCandidateModal from "../../components/candidates/DeleteCandidateModal";

import { candidateService } from "../../services/candidate.service";

import type {
  Candidate,
  CandidateFormData,
  CreateCandidateRequest,
  UpdateCandidateRequest,
} from "../../types/candidate.types";

export default function CandidatesPage() {
  const [candidates, setCandidates] =
    useState<Candidate[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [openForm, setOpenForm] =
    useState(false);

  const [selectedCandidate, setSelectedCandidate] =
    useState<Candidate | null>(null);

  const [openDelete, setOpenDelete] =
    useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    try {
      const response =
        await candidateService.getAll();

      setCandidates(response.data);
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de charger les candidats."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    data: CandidateFormData
  ) {
    try {
      if (selectedCandidate) {
        const updateData: UpdateCandidateRequest = {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
        };

        await candidateService.update(
          selectedCandidate.id,
          updateData
        );

        toast.success(
          "Candidat mis à jour."
        );
      } else {
        const createData: CreateCandidateRequest = {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
        };

        await candidateService.create(
          createData
        );

        toast.success(
          "Candidat créé."
        );
      }

      setOpenForm(false);

      setSelectedCandidate(null);

      loadCandidates();
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible d'enregistrer."
      );
    }
  }

  function handleEdit(
    candidate: Candidate
  ) {
    setSelectedCandidate(candidate);

    setOpenForm(true);
  }

  function handleDelete(
    candidate: Candidate
  ) {
    setSelectedCandidate(candidate);

    setOpenDelete(true);
  }

  async function confirmDelete() {
    if (!selectedCandidate) return;

    try {
      await candidateService.delete(
        selectedCandidate.id
      );

      toast.success(
        "Candidat supprimé."
      );

      setOpenDelete(false);

      setSelectedCandidate(null);

      loadCandidates();
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
        title="Candidats"
        subtitle="Gestion des candidats."
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
            setSelectedCandidate(null);

            setOpenForm(true);
          }}
        >
          + Créer un candidat
        </Button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <CandidateTable
          candidates={candidates}
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
            {selectedCandidate
              ? "Modifier un candidat"
              : "Nouveau candidat"}
          </h3>

          <CandidateForm
            candidate={selectedCandidate}
            onSubmit={handleSubmit}
            onCancel={() => {
              setOpenForm(false);

              setSelectedCandidate(null);
            }}
          />
        </div>
      )}

      {openDelete &&
        selectedCandidate && (
          <DeleteCandidateModal
            candidate={
              selectedCandidate
            }
            onCancel={() => {
              setOpenDelete(false);

              setSelectedCandidate(
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