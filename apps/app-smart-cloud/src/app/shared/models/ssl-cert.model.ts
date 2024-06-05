export class FormSearchSslSearch {
    customerId: number
    region: number
    vpcId: number
    currentPage: number
    pageSize: number
  }

  export class FormCreateSslCert {
    expiration: string
    name: string
    customerId: number
    regionId: number
    vpcId: number
    publicKey: string
    privateKey: string
    passphrase: string
  }

  export class FormDeleteSslCert{
    uuid: string
    regionId: number
    projectId: number
  }