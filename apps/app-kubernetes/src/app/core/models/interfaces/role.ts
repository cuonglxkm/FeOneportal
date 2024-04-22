export interface fsRole {
    uid?: string;
    roleName: string;
    roleDesc?: string;
}


/*
 *  Permissions
 * */
export interface Permission {
    hasChildren: boolean;
    menuName: string;
    code: string;
    fatherId: number;
    id: number;
    menuGrade: number; // level
    permissionVo: Permission[];
    isOpen?: boolean; // whether to fold
    checked: boolean;
}

// Update permission parameter interface
export interface PutPermissionParam {
    permissionIds: number[];
    roleId: number;
}

/*
 * Role
 * */
export interface Role {
    id?: number;
    roleName: string;
    roleDesc?: string;
}
