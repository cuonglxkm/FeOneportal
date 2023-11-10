import {SecurityGroupRule} from "./security-group-rule";

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
}

export interface SecurityGroupCreateForm {
  name?: string;
  description?: string;
}
