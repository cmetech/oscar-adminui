#!/bin/bash

# Get the operating system name
os_name=$(uname -s)

case "$os_name" in
    Darwin)
        # If OS is Darwin, process files for arm64
        PLATFORM="linux/arm64"
        IMAGE_NAME="oscar/adminui-arm64"
        ;;
    Linux)
        # If OS is Linux, process files for amd64
        PLATFORM="linux/amd64"
        IMAGE_NAME="oscar/adminui-amd64"
        ;;
    *)
        echo "Unknown operating system: $os_name"
        ;;
esac

# Initialize default values
TAG="latest"

# Parse command line options
while getopts "c:t:" opt; do
  case $opt in
    c)
      # Remove the docker image
      docker rmi -f "${IMAGE_NAME}:${OPTARG}"
      exit 0
      ;;
    t)
      # Specify a tag
      TAG="${OPTARG}"
      ;;
    *)
      # Invalid option
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

# Build the Docker image
docker build --platform "${PLATFORM}" -t "${IMAGE_NAME}:${TAG}" .
