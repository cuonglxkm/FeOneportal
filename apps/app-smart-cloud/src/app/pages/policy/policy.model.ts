import {BaseResponse} from "../../../../../../libs/common-utils/src";

export interface PolicyModel {
  id: any;
  name: any;
  type: any;
  description: any;
  jsonData: JSON;
  expand: boolean;
}

export interface PermissionPolicyModel {
  id: any;
  name: any;
  description: any;
}

export interface AttachedEntitiesDTO{
  name: string;
  type: number;
}

export interface PermissionDTO{
  name: string;
  description: number;
}
export class PolicyInfo{
  name: string;
  effect: string;
  resource: string;
  actions: [];
  type: string;
  description: string;
}

export class AttachOrDetachRequest{
  policyName: string;
  items: [];
  action: string;
}
