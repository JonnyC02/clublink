provider "aws" {
    region = "eu-west-1"
}

resource "aws_instance" "frontend_server" {
    ami = "ami-00385a401487aefa4"
    instance_type = "t4g.nano"

    tags = {
        Name = "Frontend Server"
    }
}