export interface AclModel {
    serviceOrderCode: string;
    principal: string;
    resourceType: string;
    resourceName: string;
    patternType: string;
    permissionGroupCode: string;
    permissionGroupName: string;
    host: string;
    allowDeny: string;
    createdDate: number;
}



