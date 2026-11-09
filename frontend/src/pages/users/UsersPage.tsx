import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";

import UserForm from "../../components/users/UserForm";
import UserTable from "../../components/users/UserTable";
import DeleteUserModal from "../../components/users/DeleteUserModal";

import { userService } from "../../services/user.service";

import type {
  User,
  UserFormData,
  CreateUserRequest,
  UpdateUserRequest,
} from "../../types/user.types";

export default function UsersPage() {
  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [openForm, setOpenForm] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [openDelete, setOpenDelete] =
    useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const response =
        await userService.getAll();

      setUsers(response.data);
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de charger les utilisateurs."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    data: UserFormData
  ) {
    try {
      if (selectedUser) {
        const updateData: UpdateUserRequest =
          {
            firstName:
              data.firstName,

            lastName:
              data.lastName,

            email:
              data.email,

            role:
              data.role,

            ...(data.password
              ? {
                  password:
                    data.password,
                }
              : {}),
          };

        await userService.update(
          selectedUser.id,
          updateData
        );

        toast.success(
          "Utilisateur mis à jour."
        );
      } else {
        const createData: CreateUserRequest =
          {
            firstName:
              data.firstName,

            lastName:
              data.lastName,

            email:
              data.email,

            password:
              data.password ?? "",

            role:
              data.role,
          };

        await userService.create(
          createData
        );

        toast.success(
          "Utilisateur créé."
        );
      }

      setOpenForm(false);

      setSelectedUser(null);

      loadUsers();
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible d'enregistrer."
      );
    }
  }

  function handleEdit(user: User) {
    setSelectedUser(user);

    setOpenForm(true);
  }

  function handleDelete(user: User) {
    setSelectedUser(user);

    setOpenDelete(true);
  }

  async function confirmDelete() {
    if (!selectedUser) return;

    try {
      await userService.delete(
        selectedUser.id
      );

      toast.success(
        "Utilisateur supprimé."
      );

      setOpenDelete(false);

      setSelectedUser(null);

      loadUsers();
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
        title="Utilisateurs"
        subtitle="Gestion des utilisateurs."
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
            setSelectedUser(null);

            setOpenForm(true);
          }}
        >
          + Créer un utilisateur
        </Button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <UserTable
          users={users}
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
            {selectedUser
              ? "Modifier un utilisateur"
              : "Nouveau utilisateur"}
          </h3>

          <UserForm
            user={selectedUser}
            onSubmit={handleSubmit}
            onCancel={() => {
              setOpenForm(false);

              setSelectedUser(null);
            }}
          />
        </div>
      )}

      {openDelete &&
        selectedUser && (
          <DeleteUserModal
            user={selectedUser}
            onCancel={() => {
              setOpenDelete(false);

              setSelectedUser(null);
            }}
            onConfirm={
              confirmDelete
            }
          />
        )}
    </>
  );
}