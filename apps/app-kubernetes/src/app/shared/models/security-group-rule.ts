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
  remoteIp?: string
}

export class SecurityGroupRuleCreateForm {
  direction?: any;
  remoteType?: string;
  rule?: string;
  remoteGroupId?: string;
  remoteIpPrefix?: string;
  portRangeMin?: number;
  securityGroupId?: string;
  portRangeMax?: number;
  etherType?: string;
  protocol?: string;
  region?: string | number;
  userId?: string | number;
  projectId?: string | number;
}

export class SecurityGroupRuleGetPage {
  pageSize?: number;
  pageNumber?: number;
  securityGroupId?: string;
  direction?: string;
}

export class RuleSearchCondition {
  userId: number
  regionId: number
  projectId: number
  pageSize: number
  pageNumber: number
  securityGroupId?: string
  direction?: 'ingress' | 'egress'
}
