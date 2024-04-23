export class SecurityGroupSearchCondition {
  userId: number;
  regionId: number;
  projectId: number;
  securityGroupId?: string | number;
}

export interface SecurityGroup {
  tenantId?: string;
  regionId?: number;
  id?: string;
  name?: string;
  description?: string;
  rulesInfo?: SecurityGroupRule[];
}

export default interface SecurityGroupRule {
  id?: string,
  remoteGroupId?: string,
  remoteIpPrefix?: string,
  portRangeMax?: number,
  portRangeMin?: number,
  protocol?: string,
  etherType?: string,
  direction: 'ingress' | 'egress',
  securityGroupId?: string,
  portRange?: string,
  remoteIp?: string,
}

export class CreateSGReqDto {
  userId: number;
  name: string;
  description: string;
  regionId: number;
  projectId: number;
}

export class SecurityGroupData {
  regionId: number;
  projectId: number;
  securityGroupName: string;
  securityGroupId: string;
}