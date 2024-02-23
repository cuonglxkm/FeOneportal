export class AclDeleteModel {
    serviceOrderCode: string;
    principal: string;
    resourceType: string;
    resourceName: string;
    permissionGroupCode: string;
    allowDeny: string;
    host: string;

    constructor() {
        this.serviceOrderCode = '';
        this.principal = ''
        this.resourceType = '';
        this.resourceName = '';
        this.permissionGroupCode = '';
        this.allowDeny = '';
        this.host = '';
    }
}
