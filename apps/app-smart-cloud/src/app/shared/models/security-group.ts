import SecurityGroupRule from "./security-group-rule";

export interface SecurityGroup {
  tenantId?: string;
  regionId?: number;
  id?: string;
  name?: string;
  description?: string;
  rulesInfo?: SecurityGroupRule[];
}

export class SecurityGroupSearchCondition {
  userId?: string | number
  regionId?: string | number
  projectId?: string | number
  securityGroupId?: string | number
}

export interface SecurityGroupCreateForm {
  name?: string;
  description?: string;
}

export class ExecuteAttachOrDetach {
  securityGroupId: string
  instanceId: number
  action?: 'attach' | 'detach'
  userId: number
  projectId: number
  regionId: number
}

export class FormSearchSecurityGroupByInstance {
  instanceId: string
  userId: number
  regionId: number
  projectId: number
}
