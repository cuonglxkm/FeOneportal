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
  userId:  number
  regionId:  number
  projectId: number
  securityGroupId?: string | number
}

export interface SecurityGroupCreateForm {
  name?: string;
  description?: string;
}

export class FormCreateSG {
  userId: number
  name: string
  description: string
  regionId: number
  projectId: number
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


export class FormDeleteSG {
  id: string
  userId: number
  regionId: number
  projectId: number
}
