variable "env_name" {
    description = "Environemnt name (dev, staging, prod)"
    type = string
}

variable "cloudfront_oai_arn" {
    description = "ARN of the CloudFront Origin Access Identity to allow S3 access"
    type = string
}