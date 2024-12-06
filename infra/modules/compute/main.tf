resource "aws_security_group" "ec2_security_group" {
  name_prefix = "${var.env_name}-ec2-sg"
  description = "Security group for ${var.env_name} backend server"
  vpc_id = var.vpc_id
  disable_api_termination = true
  root_block_device.encrypted = true

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["192.16.0.0/24"]
  }

  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = [var.ssh_cidr_block]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["192.168.1.0/24"]
  }
}

resource "aws_instance" "backend_server" {
  ami = var.ami_id
  instance_type = var.instance_type
  subnet_id = var.subnet_id
  security_groups = [aws_security_group.ec2_security_group.name]
  key_name = var.key_name

  user_data = <<-EOF
    #!/bin/bash
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs git
  EOF

  root_block_device {
    volume_size = var.volume_size
    volume_type = "gp3"
  }

  tags = {
    Name = "${var.env_name}-backend-Server"
  }
}

resource "aws_eip" "backend_server_eip" {
  instance = aws_instance.backend_server.id
  vpc = true
  count = var.assign_eip ? 1 : 0
}