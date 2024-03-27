export class AllowAddressPair {
    ipAddress?:string;
    macAddress?: string;
}

export class AllowAddressPairSearchForm {
    portId?: string;
    vpcId?: number;
    search?: string;
    pageSize?: number;
    currentPage?: number;
    customerId?: number;
    region?: number;
}

export default interface PairInfo {
    ipAddress?: string;
    macAddress?: string;
}

export class AllowAddressPairCreateOrDeleteForm {
    portId?: string;
    pairInfos?: PairInfo[];
    region?: number;
    isDelete?: boolean;
    vpcId?: number;
    customerId?: number;
}

export class AllowAddressPairResponse {
    totalCount?: number;
    records?: PairInfo;
    pageSize?: number;
    currentPage?: number;
    previousPag: number;
}
