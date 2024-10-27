provider "aws" {
    region = "eu-west-1"
}

module "rds" {
    source = "../../modules/rds"
    env_name = "dev"
    vpc_id = var.vpc_id
    subnet_ids = var.subnet_ids
    allowed_ip = var.allowed_ip
    db_name = "clublinkdb_dev"
    username = "admin"
    password = var.db_password
    instance_class = "db.t4g.micro"
    allocated_storage = 1
    max_allocated_storage = 2
    engine_version = "13.3"
    parameter_group_name = "default.postgres13"
}

module "s3" {
    source = "../../modules/s3"
    env_name = "dev"
    cloudfront_oai_arn = module.cloudfront.cloudfront_oai_arn
}