resource "aws_s3_bucket" "static_assets" {
  bucket = "${var.env_name}-static-assets"
  acl = "private"

  website {
    index_document = "index.html"
    error_document = "index.html"
  }

  tags = {
    Environment = var.env_name
  }
}

resource "aws_s3_bucket_policy" "cloudfront_policy" {
  bucket = aws_s3_bucket.static_assets.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          "AWS": var.cloudfront_oai_arn
        },
        Action = "s3:GetObject",
        Resource = "${aws_s3_bucket.static_assets.arn}/*"
      }
    ]
  })
}