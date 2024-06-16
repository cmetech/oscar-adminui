#!/bin/bash

# Check if the .env file exists one directory up
if [ ! -f ../oscar/.env ]; then
  echo "Error: .env file not found in the parent directory."
  exit 1
fi

# Source the .env file
source ../oscar/.env

CONFIG_DIR="../oscar/conf/env"

# Source all .env files in the conf/env directory
for env_file in "$CONFIG_DIR"/*.env; do
    if [ -f "$env_file" ]; then
        source "$env_file"
    fi
done

# Initialize default values
TAG="${OSCARADMINUI_VERSION}"
os_name=$(uname -s)
PLATFORM=""

case "$os_name" in
    Darwin)
        # If OS is Darwin, process files for arm64
        PLATFORM="arm64"
        ;;
    Linux)
        # If OS is Linux, process files for amd64
        PLATFORM="amd64"
        ;;
    *)
        echo "Unknown operating system: $os_name"
        exit 1
        ;;
esac

IMAGE_NAME="${NAMESPACE}/${OSCARADMINUI_SERVICENAME}-${PLATFORM}"
PUSH=false

echo "Initializing Docker build script..."
echo "Using NAMESPACE: ${NAMESPACE}"
echo "Default IMAGE_NAME: ${IMAGE_NAME}"
echo "Default TAG: ${TAG}"

# Parse command line options
while getopts "ct:p" opt; do
  case $opt in
    c)
      # Remove the docker image
      echo "Removing image ${IMAGE_NAME}:${TAG} from the local Docker daemon..."
      docker rmi -f "${IMAGE_NAME}:${TAG}"
      exit 0
      ;;
    t)
      # Specify a tag
      TAG="${OPTARG}"
      echo "Using specified TAG: ${TAG}"
      ;;
    p)
      # Set push flag to true
      PUSH=true
      echo "Push flag set to true. The image will be pushed to the registry."
      ;;
    *)
      # Invalid option
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

# Build the Docker image
echo "Building Docker image ${IMAGE_NAME}:${TAG} for platform ${PLATFORM}..."
docker build -t "${IMAGE_NAME}:${TAG}" .

# Verify if the image is available locally
if docker images | grep -q "${IMAGE_NAME}\s*${TAG}"; then
  echo "Docker image ${IMAGE_NAME}:${TAG} successfully built and available locally."

  # Push the image if the push flag is set
  if $PUSH; then
    echo "Pushing Docker image ${IMAGE_NAME}:${TAG} to the registry..."
    docker push "${IMAGE_NAME}:${TAG}"
  fi
else
  echo "Error: Docker image ${IMAGE_NAME}:${TAG} not found in local repository."
  exit 1
fi