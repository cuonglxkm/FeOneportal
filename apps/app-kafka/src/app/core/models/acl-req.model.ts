export class AclReqModel {
    serviceOrderCode: string;
    principal: string[];
    resourceType: string;
    resourceName: string[];
    resourceNamePrefixed: string;
    permissionGroupCode: string;
    permissionGroupName: string;
    allowDeny: string;
    host: string;
    isEdit: boolean;

    constructor() {
        this.serviceOrderCode = '';
        this.principal = [];
        this.resourceType = '';
        this.resourceName = [];
        this.permissionGroupCode = '';
        this.permissionGroupName = '';
        this.allowDeny = '';
        this.host = '';
        this.isEdit = false;
    }
}

