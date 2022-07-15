#!/usr/bin/env bash

set -e

export COLOR='\033[0;32m'
export NC='\033[0m'
export ERR='\033[0;31m'

export TAG_NAME=${TAG:-"latest-$(git rev-parse HEAD)"}
export AWS_PROFILE_PARAM=''
export ENV_FILE_PATH='.env'
export ENV_NAME='STAGING'

# todo: REPLACE HERE: environment for Test instance
export AWS_ECR_REPO_URL="027248772204.dkr.ecr.eu-west-2.amazonaws.com/lof-server-test:${TAG_NAME}"
export AWS_INSTANCE_URL='ubuntu@3.10.244.58'
export AWS_INSTANCE_REGION='eu-west-2'
export AWS_SECURITY_GROUP_ID='sg-054b68c664da76d61'
export ENV_FILE_PATH='.env.staging'
export ENV_NAME='STAGING'
export AWS_ENV_SECRET_NAME='lof/server/staging/ayyD3OXr0zLtC4FkrBu7yg'
export AWS_INSTANCE_DEPLOY_SCRIPT='./deploy-server.sh'
export AWS_ACCOUNT_ID='027248772204'

if [ "$CIRCLECI" != "true" ]; then
  cp .env.staging .env
fi

if [ "$ENV" == "production" ] || [ "$CIRCLE_BRANCH" == "production" ]; then
  echo -e "${COLOR}:::::::::::::Setting environment for PRODUCTION::::::::::::::${NC}"
  # todo: REPLACE HERE: environment for Production instance
  export AWS_ECR_REPO_URL="027248772204.dkr.ecr.eu-west-2.amazonaws.com/lof-server-prod:latest"
  export AWS_INSTANCE_REGION='eu-west-2'
  export ENV_FILE_PATH='.env.prod'
  export ENV_NAME='PRODUCTION'
  # Remember to fill manually
  export AWS_ENV_SECRET_NAME='lof/server/production'

  if [ "$CIRCLECI" != "true" ]; then
    cp .env.prod .env
  fi

else
  echo -e "${COLOR}:::::::::::::Setting environment for TEST::::::::::::::${NC}"
fi

if [ "$CIRCLECI" == "true" ]; then
  echo -e "${COLOR}:::::::::::::Deploying by the CIRCLE CI::::::::::::::${NC}"
  export AWS_PRIVATE_KEY_PATH='permission.pem'

  if [ "$CIRCLE_BRANCH" != "main" ] && [ "$CIRCLE_BRANCH" != "production" ]; then
    echo -e "${COLOR}:::::::::Current branch $CIRCLE_BRANCH will not be deployed from the CI:::::::::${NC}"
    echo -e "${COLOR}:::::::::Exiting:::::::::${NC}"
    exit 0
  fi

else
  echo -e "${COLOR}:::::::::Deploying by the local machine:::::::::${NC}"
  # todo: REPLACE HERE: indicate AWS profile
  export AWS_PROFILE_PARAM='--profile=jh'
  cp Dockerfile_local Dockerfile
  echo -e 'node_modules\nbuild\nnpm-debug.log\nyarn-error.log' > .dockerignore
fi
