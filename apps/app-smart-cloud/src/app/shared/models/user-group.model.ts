export interface UserGroupModel {
    name: string
    parent: string
    policies: string[]
    groupUsers: string[]
    userOfGroup: number
    createdDate: any
}

export class FormSearchUserGroup {
    name: string
    pageSize: number
    currentPage: number
}

export class FormDeleteUserGroups {
    groupName: string[]
}

export class FormUserGroup {
    groupName: string
    parentName: string
    policyNames: string[]
    userNames: string[]
}

export class RemovePolicy {
  groupName: string
  items: ItemDetachPolicy[]
}

export class ItemDetachPolicy {
  itemName: string
}
