export class User {
  userName: string;
  email: string;
  userGroups: string[];
  userPolicies: string[];
  createdDate: string;
}
export class UserCreate {
  userName: string;
  email: string;
  groupNames: string[];
  policyNames: string[];
}
export class PermissionPolicies {
  name: string;
  effect: string;
  resource: string;
  actions: any;
  type: string;
  description: string;
  attachedEntities: number;
}

export class UserGroup {
  name: string;
  parent: string;
  policies: string[];
  numberOfUser: number;
}

export class DetachPoliciesOrGroups {
  userName: string;
  items: ItemDetach[];
}

export class ItemDetach {
  itemName: string;
  type: number;
}
