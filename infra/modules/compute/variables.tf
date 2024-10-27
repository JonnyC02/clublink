variable "env_name" {
  description = "Environment name (dev, staging, prod)"
  type = string
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance"
  type = string
}

variable "instance_type" {
  description = "EC2 instance type"
  default = "t4g.nano"
}

variable "key_name" {
  description = "Key pair name for SSH access"
  type = string
}

variable "subnet_id" {
  description = "Subnet ID for the EC2 instance"
  type = string
}

variable "vpc_id" {
  description = "VPC ID for the security group"
  type = string
}

variable "ssh_cidr_block" {
  description = "CIDR block for SSH access"
  type = string
}

variable "volume_size" {
  description = "Size of the root EBS volume in GB"
  type = number
  default = 2
}

variable "assign_eip" {
  description = "Whether to assign an Elastic IP"
  type = bool
  default = false
}