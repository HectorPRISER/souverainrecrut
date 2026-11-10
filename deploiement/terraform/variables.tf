variable "vm_name" {
  description = "Nom logique de la VM de déploiement (alias dans l'inventaire Ansible)."
  type        = string
  default     = "sr-deploy"
}

variable "vm_ip" {
  description = "Adresse IP de la VM (NAT libvirt par défaut : 192.168.122.x)."
  type        = string
  default     = "192.168.122.50"

  validation {
    condition     = can(regex("^([0-9]{1,3}\\.){3}[0-9]{1,3}$", var.vm_ip))
    error_message = "vm_ip doit être une adresse IPv4 (ex. 192.168.122.50)."
  }
}

variable "ssh_user" {
  description = "Utilisateur SSH de déploiement sur la VM."
  type        = string
  default     = "deploy"
}

variable "ssh_port" {
  description = "Port SSH de la VM."
  type        = number
  default     = 22
}

variable "ssh_private_key_path" {
  description = "Chemin (sur la machine de contrôle) de la clé privée SSH. Le chemin seul est écrit dans l'inventaire, jamais le contenu."
  type        = string
  default     = "~/.ssh/sr_deploy"
}

variable "deploy_dir" {
  description = "Répertoire de déploiement sur le serveur, créé par Ansible."
  type        = string
  default     = "/opt/souverainrecrut"
}

variable "inventory_path" {
  description = "Fichier d'inventaire Ansible généré (chemin relatif au dossier terraform/)."
  type        = string
  default     = "../ansible/inventory.ini"
}
