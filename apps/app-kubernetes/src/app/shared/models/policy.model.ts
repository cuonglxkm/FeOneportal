import {BaseResponse} from "../../../../../../libs/common-utils/src";

export interface PolicyModel {
  id: any;
  name: any;
  effect: any;
  resource: any;
  actions: any;
  type: string;
  description: boolean;
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

export class PermissionDTO{
  name: string;
  description: any;
  isChecked = false;
}

export class UpdatePolicyRequest{
  name: string;
  effect: string;
  resource: string;
  actions: any;
  desciption:string;
}

export class ServicePermissionDetail{
  serviceName: string;
  listPermission: any;
}

export class ServicePolicyDTO {
  serviceName: string;
  seviceCode: string;
}

export class PolicyInfo{
  name: string;
  effect: string;
  resource: string;
  actions: any;
  type: string;
  description: string;
}

export class AttachOrDetachRequest{
  policyName: string;
  items: [];
  action: string;
}
