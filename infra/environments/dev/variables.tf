variable "region" {
  default = "eu-west-1"
}

variable "bucket_name" {
  default = "frontend-bucket-dev"
}

variable "instance_class" {
  default = "db.t3.micro"
}

variable "database_name" {
  default = "dev_db"
}