output "rds_endpoint" {
    description = "The RDS instance endpoint"
    value = aws_db_instance.rds_instance.endpoint
}