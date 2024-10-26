variable bucket_name {
  type        = string
  description = "name for the S3 bucket"
}

variable website_enabled {
  type        = bool
  default     = false
  description = "Is the bucket website enabled"
}

resource "aws_s3_bucket" "frontend_bucket" {
  bucket = var.bucket_name

  website {
    index_document = "index.html"
    error_document = "index.html"
  }

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${var.bucket_name}/*"
    }
  ]
}
EOF
}

output "bucket_name" {
  value = aws_s3_bucket.frontend_bucket.bucket
}