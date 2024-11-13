variable "env_name" {
    description = "Environment name (dev, staging, prod)"
    type = string
}

variable "vpc_id" {
    description = "The VPC ID for the RDS instance"
    type = string
}

variable "subnet_ids" {
    description = "List of subnet IDs for the RDS subnet group"
    type = list(string)
}

variable "allowed_ip" {
    description = "CIDR block or IP address allowed to access the RDS instance"
    type = string
}

variable "db_name" {
    description = "Database name"
    type = string
}

variable "username" {
    description = "Username for the RDS instance"
    type = string
}

variable "password" {
    description = "Password for the RDS instance"
    type = string
    sensitive = true
}

variable "instance_class" {
    description = "RDS instance class"
    type = string
    default = "db.t3.micro"
}

variable "allocated_storage" {
    description = "Initial allocated storage for RDS"
    type = number
    default = 20
}

variable "max_allocated_storage" {
    description = "Maximum allocated storage for RDS"
    type = number
    default = 100
}

variable "engine_version" {
    description = "Database engine version"
    type = string
    default = "13.3"
}

variable "parameter_group_name" {
    description = "RDS parameter group"
    type = string
    default = "default.postgres13"
}