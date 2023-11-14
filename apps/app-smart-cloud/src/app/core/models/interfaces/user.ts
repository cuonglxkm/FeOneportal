import { SignInProvider } from "../enum"

export interface UserInfoNew {
    userId: string
    authCode: string[]
    aud?: string
    auth_time?: number
    email?: string
    email_verified?: boolean
    sign_in_provider?: SignInProvider
}

export interface fsUser {
    displayName?: string
    email: string
    emailVerified: boolean
    phoneNumber?: string
    photoUrl?: string
    uid?: string
}


export interface UserLogin {
    id: string,
    username: string;
    password: string;
}


/*
 * User Management
 * */
export interface User {
    id: number;
    password: string;
    userName?: string;
    available?: boolean;
    roleName?: string[];
    sex?: 1 | 0;
    telephone?: string;
    mobile?: string | number;
    email?: string;
    lastLoginTime?: Date;
    oldPassword?: string;
    departmentId?: number;
    departmentName?: string;
}

/*
 * User change password
 * */
export interface UserPsd {
    id: string;
    oldPassword: string;
    newPassword: string;
}

export interface UserInfo {
    userId: number;
    authCode: string[];
}

export interface UserToken {
    aud: string
    auth_time: number
    email: string
    email_verified: boolean,
    name: string,
    picture: string,
    user_id: string
}