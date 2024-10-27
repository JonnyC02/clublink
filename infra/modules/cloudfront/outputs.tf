output "cloudfront_distribution_id" {
    description = "ID of the CloudFront distribution"
    value = aws_cloudfront_distribution.static_assets_distribution.id
}

output "cloudfront_domain_name" {
    description = "Domain name of the CloudFront distribution"
    value = aws_cloudfront_distribution.static_assets_distribution.domain_name
}

output "cloudfront_oai_arn" {
    description = "ARN of the CloudFront Origin Access Identity"
    value = aws_cloudfront_origin_access_identity.oai.iam_arn
}