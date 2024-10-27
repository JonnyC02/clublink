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

module "compute" {
  source = "../../modules/compute"
  env_name = "dev"
  ami_id = "ami-09e67e426f25ce0d7"
  instance_type  = "t4g.nano"
  key_name = "my-dev-keypair"
  subnet_id = aws_subnet.public_subnet.id
  vpc_id = aws_vpc.main_vpc.id
  ssh_cidr_block = "86.190.41.74/32"
  volume_size = 2
  assign_eip = false
}

resource "aws_vpc" "main_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true

  tags = {
    Name = "${var.env_name}-vpc"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id = aws_vpc.main_vpc.id
  cidr_block = "10.0.1.0/24"
  map_public_ip_on_launch = false

  tags = {
    Name = "${var.env_name}-public-subnet"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id

  tags = {
    Name = "${var.env_name}-igw"
  }
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.env_name}-public-route-table"
  }
}

resource "aws_route_table_association" "public_route_table_assoc" {
  subnet_id = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_route_table.id
}