variable "vpc_id" {
  description = "The VPC ID for the dev environment"
  type = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the dev environment"
  type = list(string)
}

variable "allowed_ip" {
  description = "Allowed IP for accessing RDS in dev"
  type = string
  default = "86.190.41.74/32"
}

variable "db_password" {
  description = "Database password for dev"
  type = string
  sensitive = true
}