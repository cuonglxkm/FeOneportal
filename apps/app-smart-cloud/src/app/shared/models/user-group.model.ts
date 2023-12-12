export interface UserGroupModel {
    name: string
    parent: [string]
    policies: [string]
    groupUsers: [string]
    userOfGroup: number
    createdDate: any
}

export class FormSearchUserGroup {
    name: string
    pageSize: number
    currentPage: number
}

export class FormEditUserGroup {
    groupName: string
}

export class FormDeleteOneUserGroup {
    groupName: string
    userName: string
}

export class FormDeleteUserGroups {
    groupName: [string]
}
