export interface SecurityGroupRule {
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
    remoteGroupId?: string,
    remoteIpPrefix?: string,
    portRangeMin?: number,
    securityGroupId?: string,
    portRangeMax?: number,
    etherType?: string,
    protocol?: string,
    direction?: string
}
