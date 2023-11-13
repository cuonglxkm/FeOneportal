export default interface SecurityGroupRule {
    id?: string,
    remoteGroupId?: string,
    remoteIpPrefix?: string,
    portRangeMax?: number,
    portRangeMin?: number,
    protocol?: string,
    etherType?: string,
    direction: 'ingress' | 'egress',
    securityGroupId?: string,
    portRange?: string,
    remoteIp?: string
}

export interface SecurityGroupRuleCreateForm {
    // remoteType: string,
    rule?: string,
    // remoteGroupId: string,
    // remoteIpPrefix: string,
    // portRangeMin: number,
    // securityGroupId: string,
    // portRangeMax: number,
    // etherType: string,
    // protocol: string,
    direction: 'ingress' | 'egress',
}

export class SecurityGroupRuleGetPage {
    pageSize?: number;
    pageNumber?: number;
    securityGroupId?: string;
    direction?: string;
}
