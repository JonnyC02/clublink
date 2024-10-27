output "rds_endpoint" {
    description = "RDS endpoint for dev environment"
    value = module.rds.rds_endpoint
}

output "cloudfront_domain" {
    description = "CloudFront domain for the dev environment"
    value = module.cloudfront.cloudfront_domain_name
}

output "s3_bucket_name" {
    description = "S3 bucket for static assets in dev environment"
    value = module.s3.bucket_name
}