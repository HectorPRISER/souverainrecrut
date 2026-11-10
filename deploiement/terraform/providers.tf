terraform {
  required_version = ">= 1.5.0"

  required_providers {
    # Génération de fichiers locaux (inventaire Ansible)
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }

    # Variante vSphere (ESXi/vCenter) : non utilisée ici, voir vsphere.tf.example
    # vsphere = {
    #   source  = "hashicorp/vsphere"
    #   version = "~> 2.8"
    # }
  }
}
