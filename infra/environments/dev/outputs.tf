output "rds_endpoint" {
    description = "RDS endpoint for dev environment"
    value = module.rds.rds_endpoint
}

output "s3_bucket_name" {
    description = "S3 bucket for static assets in development environment"
    value = module.s3.bucket_name
}

output "dev_instance_id" {
  description = "ID of the EC2 instance in the dev environment"
  value = module.ec2.instance_id
}

output "dev_instance_public_ip" {
  description = "Public IP of the EC2 instance in the dev environment"
  value = module.ec2.public_ip
}

output "dev_instance_public_dns" {
  description = "Public DNS of the EC2 instance in the dev environment"
  value = module.ec2.public_dns
}
