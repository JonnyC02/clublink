output "instance_id" {
  description = "ID of the EC2 instance"
  value = aws_instance.backend_server.id
}

output "public_ip" {
  description = "Public IP address of the EC2 instance (if Elastic IP is assigned)"
  value = aws_eip.backend_server_eip.*.public_ip
}

output "public_dns" {
  description = "Public DNS of the EC2 instance"
  value = aws_instance.backend_server.public_dns
}
