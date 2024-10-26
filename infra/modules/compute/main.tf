module "network" {
    source = "../../modules/network"
    env    = "dev"
    cidr_block = "10.0.0.0/16"
}

module "compute" {
    source = "../../modules/compute"
    env = "dev"
    instance_type = "t4g.nano"
    subnet_id = module.network.subnet_id
}

module "database" {
    source = "../../modules/database"
    env = "dev"
    db_name = "development db"
    subnet_id = module.network.subnet_id
}