terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {
  # *nix systems
  # host = "unix:///var/run/docker.sock"
  
  # windows
  host = "npipe:////.//pipe//docker_engine"
}

resource "docker_image" "hsmysql" {
  name         = "mysql:8.0"
  keep_locally = true
}

# resource "docker_image" "hsbackend" {
#   name         = "localhost:5000/hsbackend"
#   keep_locally = false
# }
# 
# resource "docker_image" "hsfrontend" {
#   name         = "localhost:5000/hsfrontend"
#   keep_locally = false
# }

resource "docker_network" "private_network" {
  name = "hsnetwork"
}

resource "docker_container" "hsmysql" {
  image = docker_image.hsmysql.image_id
  name  = "hsmysql"
  env = [ for line in split("\n", file("./test.env")) : line if trimspace(line) != "" ]

  networks_advanced {
    name = "hsnetwork"
  }
}

# resource "docker_container" "hsbackend" {
#   image = docker_image.hsbackend.image_id
#   name  = "hsbackend"
#   env = [ for line in split("\n", file("./test.env")) : line if trimspace(line) != "" ]
# 
#   networks_advanced {
#     name = "hsnetwork"
#   }
# }
# 
# resource "docker_container" "hsfrontend" {
#   image = docker_image.hsfrontend.image_id
#   name  = "hsfrontend"
#   env = [ for line in split("\n", file("./test.env")) : line if trimspace(line) != "" ]
# 
#   networks_advanced {
#     name = "hsnetwork"
#   }
# 
#   ports {
#     internal = 80
#     external = 9999
#   }
# }
