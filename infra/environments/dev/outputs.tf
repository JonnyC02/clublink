output "rds_endpoint" {
    description = "RDS endpoint for dev environment"
    value = module.rds.rds_endpoint
}

output "s3_bucket_name" {
    description = "S3 bucket for static assets in dev environment"
    value = module.s3.bucket_name
}