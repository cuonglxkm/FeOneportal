import {SecurityGroupRule} from "./security-group-rule";

export interface SecurityGroup {
  tenantId?: string;
  regionId?: number;
  id: string;
  name?: string;
  description?: string;
  rulesInfo?: SecurityGroupRule[];
}

export interface SecurityGroupSearchCondition {
  userId?: string | number
  regionId?: string | number
  projectId?: string | number
}

export interface SecurityGroupCreateForm {
  name?: string;
  description?: string;
}
