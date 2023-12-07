export class User {
  id: number;
  name: string;
  groups: number;
  createdTime: string;
}

export class GroupCreateUser {
    id: number;
    name: string;
    numberUsers: number;
    attachedPolicies: string[];
    createdTime: string;
}

export class CopyUserPolicies {
    id: number;
    name: string;
    groups: string[];
    attachedPolicies: string[];
    createdTime: string;
}

export class PermissionPolicies {
  id: number;
  name: string;
  type: string;
  attachedEntities: number;
}
