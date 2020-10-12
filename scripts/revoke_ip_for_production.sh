#!/usr/bin/env bash

if [ "$ENV_SET" != "true" ]; then
  source ./scripts/set_environment.sh
fi

export IP=`curl https://ipinfo.io/ip`

echo -e "${COLOR}:::::::::Current Instance's IP: $IP:::::::::${NC}"

echo -e "${COLOR}:::::::::Revoking $IP for $AWS_SECURITY_GROUP_ID:::::::::${NC}"

aws ec2 revoke-security-group-ingress --group-id ${AWS_SECURITY_GROUP_ID} --protocol tcp --port 22 --cidr ${IP}/32 --region ${AWS_INSTANCE_REGION} ${AWS_PROFILE_PARAM}
#aws ec2 authorize-security-group-ingress --group-id ${AWS_SECURITY_GROUP_ID} --ip-permissions IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=\{CidrIp=${IP}/32,Description="Circle CI Deploy"\} --region ${AWS_INSTANCE_REGION} ${AWS_PROFILE_PARAM}
