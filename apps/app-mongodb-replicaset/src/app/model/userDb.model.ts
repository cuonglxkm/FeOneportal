export class ListUserDbInfo {
    totals: number;
    pages: number;
    page: number;
    size: number;
    // listRoleString: string;
    data: UserDbInfo[];
  
    constructor(obj: any) {
      this.totals = obj.totals;
      this.pages = obj.pages;
      this.page = obj.page;
      this.size = obj.size;
  
      // get list user
      this.data = [];
      const listUserInfo: [] = obj.data;
      if (listUserInfo) {
        for (let i = 0; i < listUserInfo.length; i++) {
          const userInfo = new UserDbInfo(listUserInfo[i]);
          this.data.push(userInfo);
        }
      }
    }
  }
  
  export class UserDbInfo {
    _id: string | undefined;
    user: string | undefined;
    pwd: string | undefined;
    roles: Role[] | undefined;
    restrict_ips: string[] | undefined;
    created_user: string | undefined;
    created_name: string | undefined;
    updated_user: string | undefined;
    created_date: Date | undefined;
    updated_date: Date | undefined;
  
    constructor(obj: any) {
      if (obj) {
        this._id = obj._id;
        this.user = obj.user;
        this.pwd = obj.pwd;
        this.restrict_ips = obj.restrict_ips;
        this.created_user = obj.created_user;
        this.created_name = obj.created_name;
        this.updated_user = obj.updated_user;
        this.created_date = obj.created_date;
        this.updated_date = obj.updated_date;
  
        // get roles
        this.roles = [];
        const listRole: [] = obj.roles;
        if (listRole) {
          for (let i = 0; i < listRole.length; i++) {
            const role = new Role(listRole[i]);
            this.roles.push(role);
          }
        }
      }
    }
  }
  
  export class UpsertUser {
    service_order_code: string;
    user: string;
    db: string;
    pwd: string;
    customData: CustomData;
    roles: Role[];
    authenticationRestrictions: AuthenticationRestriction;
  
    constructor(obj: any) {
      this.service_order_code = obj.service_order_code;
      this.user = obj.user;
      this.db = obj.db;
      this.pwd = obj.pwd;
      this.customData = new CustomData(obj.customData);
      this.authenticationRestrictions = new AuthenticationRestriction(
        obj.authenticationRestrictions
      );
  
      // get roles
      this.roles = [];
      const listRole: [] = obj.roles;
      if (listRole) {
        for (let i = 0; i < listRole.length; i++) {
          const role = new Role(listRole[i]);
          this.roles.push(role);
        }
      }
    }
  }
  
  export class AuthenticationRestriction {
    clientSource: string[];
    serverAddress: string[];
  
    constructor(obj: any) {
      this.clientSource = obj.clientSource;
      this.serverAddress = obj.serverAddress;
    }
  }
  
  export class CustomData {
    ip: string[];
    created_at: string;
    updated_at: string;
    create_by: string;
  
    constructor(obj: any) {
      this.ip = obj.ip;
      this.created_at = obj.created_at;
      this.updated_at = obj.updated_at;
      this.create_by = obj.create_by;
    }
  }
  
  export class Role {
    role: string;
    db: string;
  
    constructor(obj: any) {
      this.role = obj.role;
      this.db = obj.db;
    }
  }
  