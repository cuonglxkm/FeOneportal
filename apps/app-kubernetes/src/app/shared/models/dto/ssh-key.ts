export interface SshKey {
    id: number;
    name: string;
    fingerprint: string;
    publicKey: string;
    dateCreated: string;
    region: number;
    cloudIdentity: number;
    customerId: number;
    projectId: number;
    projectName: string;
    privateKey: string;
    regionText: string;
    vpcId: number;
    regionId: number;
}
