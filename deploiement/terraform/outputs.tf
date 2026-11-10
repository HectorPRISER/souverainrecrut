output "vm_ip" {
  description = "Adresse IP de la VM de déploiement."
  value       = var.vm_ip
}

output "inventory_file" {
  description = "Inventaire Ansible généré."
  value       = local_file.ansible_inventory.filename
}

output "ssh_command" {
  description = "Commande de connexion SSH à la VM."
  value       = "ssh -i ${var.ssh_private_key_path} -p ${var.ssh_port} ${var.ssh_user}@${var.vm_ip}"
}

output "next_step" {
  description = "Commande Ansible à lancer ensuite."
  value       = "ansible-playbook -i ../ansible/inventory.ini ../ansible/playbook.yml"
}
