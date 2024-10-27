variable "env_name" {
    description = "Environment name (dev, staging, prod)"
    type = string
}

variable "s3_bucket_name" {
    description = "The name of the S3 bucket to use as the origin"
    type = string
}

variable "default_ttl" {
    description = "Default TTL for cache behaviour"
    type = number
    default = 86400
}

variable "max_ttl" {
    description = "Max TTL for cache behaviour"
    type = number
    default = 31536000
}