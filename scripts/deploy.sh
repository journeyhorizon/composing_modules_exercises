#!/usr/bin/env bash

set -e

SECONDS=0

source ./scripts/set_environment.sh

#check the branch name and deploy from CircleCI

echo -e "${COLOR}::::will deploy with tag >>${TAG_NAME}<<::::${NC}"
docker build -t ${AWS_ECR_REPO_URL} .

echo -e "${COLOR}::::login aws::::${NC}"

$(aws ecr get-login --no-include-email --region ${AWS_INSTANCE_REGION} ${AWS_PROFILE_PARAM})

echo -e "${COLOR}::::pushing to aws repo::::${NC}"
docker push ${AWS_ECR_REPO_URL}

echo -e "${COLOR}::::ssh and deploy::::${NC}"
ssh -o StrictHostKeyChecking=no -i "${AWS_PRIVATE_KEY_PATH}" ${AWS_INSTANCE_URL} "IMAGE_URL=${AWS_ECR_REPO_URL} REGION=${AWS_INSTANCE_REGION} ${AWS_INSTANCE_DEPLOY_SCRIPT}"

if [ "$CIRCLECI" == "true" ]; then
  echo -e "${COLOR}:::::::::Deployed by the CI:::::::::${NC}"

else
  echo -e "${COLOR}:::::::::Deployed by the local machine:::::::::${NC}"
  cp .env.staging .env
fi

duration=$SECONDS
echo -e "${COLOR}::::::::$(($duration / 60)) minutes and $(($duration % 60)) seconds deployment time.${NC}"