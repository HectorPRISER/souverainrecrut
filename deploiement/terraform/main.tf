# Sans ESXi/vCenter, la VM Ubuntu est créée à la main (QEMU/KVM) : Terraform ne peut pas la créer.
# Terraform décrit ici ce qui est réellement disponible : la cible de déploiement, et il génère
# l'inventaire Ansible à partir de variables (source unique de vérité : IP, utilisateur, clé).
# La variante vSphere (création réelle de la VM) est fournie dans vsphere.tf.example.

locals {
  inventory_content = templatefile("${path.module}/templates/inventory.ini.tftpl", {
    vm_name              = var.vm_name
    vm_ip                = var.vm_ip
    ssh_user             = var.ssh_user
    ssh_port             = var.ssh_port
    ssh_private_key_path = var.ssh_private_key_path
    deploy_dir           = var.deploy_dir
  })
}

resource "local_file" "ansible_inventory" {
  filename        = "${path.module}/${var.inventory_path}"
  content         = local.inventory_content
  file_permission = "0644"
}
