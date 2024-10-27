resource "aws_security_group" "rds_security_group" {
    name = "${var.env_name}-rds-security-group"
    description = "Allow PostgreSQL access"
    vpc_id = var.vpc_id

    ingress {
        from_port = 5432
        to_port = 5432
        protocol = "tcp"
        cidr_blocks = [var.allowed_ip]
    }

    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}

resource "aws_db_subnet_group" "rds_subnet_group" {
    name = "${var.env_name}-rds-subnet-group"
    subnet_ids = var.subnet_ids

    tags = {
        Name = "${var.env_name}-rds-subnet-group"
    }
}

resource "aws_db_instance" "rds_instance" {
    allocated_storage = var.allocated_storage
    max_allocated_storage = var.max_allocated_storage
    storage_type = "gp2"
    engine = "postgres"
    engine_version = var.engine_version
    instance_class = var.instance_class
    name = var.db_name
    username = var.username
    password = var.password
    parameter_group_name = var.parameter_group_name
    skip_final_snapshot = true
    publicly_accessible = false
    vpc_security_group_ids = [aws_security_group.rds_security_group.id]
    db_subnet_group_name = aws_db_subnet_group.rds_subnet_group.name
}

output "rds_endpoint" {
    value = aws_db_instance.rds_instance.endpoint
}