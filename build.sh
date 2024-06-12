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
PLATFORMS="linux/amd64,linux/arm64"
IMAGE_NAME="${NAMESPACE}/${OSCARADMINUI_SERVICENAME}"
PUSH=false

echo "Initializing Docker build script..."
echo "Using NAMESPACE: ${NAMESPACE}"
echo "Default IMAGE_NAME: ${IMAGE_NAME}"
echo "Default TAG: ${TAG}"

# Parse command line options
while getopts "ct:p" opt; do
  case $opt in
    c)
      # Remove the docker image for all platforms
      docker buildx rm mybuilder 2>/dev/null || true
      docker buildx create --use --name mybuilder
      docker buildx inspect --bootstrap
      if docker buildx imagetools inspect "${IMAGE_NAME}:${TAG}" >/dev/null 2>&1; then
        echo "Removing image ${IMAGE_NAME}:${TAG} from the registry..."
        docker buildx imagetools rm "${IMAGE_NAME}:${TAG}"
        docker rmi -f "${IMAGE_NAME}:${TAG}"
      else
        echo "Image ${IMAGE_NAME}:${TAG} not found. Skipping removal."
      fi
      docker buildx rm mybuilder
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

echo "Ensuring Buildx is initialized..."
# Ensure Buildx is initialized
docker buildx rm mybuilder 2>/dev/null || true
docker buildx create --use --name mybuilder
docker buildx inspect --bootstrap

# Function to clean up temporary files and builders
cleanup() {
  echo "Cleaning up..."
  docker buildx rm mybuilder
  echo "Docker build script completed successfully."
}

# Trap exit to ensure cleanup
trap cleanup EXIT

# Build the Docker image for each platform
if $PUSH; then
  echo "Building and pushing Docker image ${IMAGE_NAME}:${TAG} for platforms ${PLATFORMS[*]}..."
  docker buildx build --platform "$(IFS=,; echo "${PLATFORMS[*]}")" -t "${IMAGE_NAME}:${TAG}" --push .
  echo "Pulling the image ${IMAGE_NAME}:${TAG} back to the local Docker daemon..."
  docker pull "${IMAGE_NAME}:${TAG}"
else
  os_name=$(uname -s)
  PLATFORM=""

  case "$os_name" in
      Darwin)
          # If OS is Darwin, process files for arm64
          PLATFORM="linux/arm64"
          ;;
      Linux)
          # If OS is Linux, process files for amd64
          PLATFORM="linux/amd64"
          ;;
      *)
          echo "Unknown operating system: $os_name"
          ;;
  esac

  echo "Building Docker image ${IMAGE_NAME}:${TAG} for platform ${PLATFORM}..."
  docker build -t "${IMAGE_NAME}:${TAG}" .
fi

# Verify if the image is available locally
if docker images | grep -q "${IMAGE_NAME}\s*${TAG}"; then
  echo "Docker image ${IMAGE_NAME}:${TAG} successfully built and available locally."
else
  echo "Error: Docker image ${IMAGE_NAME}:${TAG} not found in local repository."
  exit 1
fi
