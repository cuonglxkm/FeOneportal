export class EndpointGroupDTO{
    projectId: string
    TenantId: string
    endpoints: string[]
    type: string
    id: string
    name: string
    customerId: number
    vpcId: number
    regionId: number
    description: string
}

export class FormSearchEndpointGroup {
    vpcId: number
    regionId: number
    name?: string
    pageSize: number
    currentPage: number
}

export class FormCreateEndpointGroup {
    name: string
    type: string
    endpoints: string[]
    description: string
    customerId: number
    vpcId: number
    regionId: number
}

export class FormDetailEndpointGroup {
    id: string
    projectId: string
    tenantId: string
    endpoints: string[]
    type: string
    name: string
    description: string;
    customerId: number;
    vpcId: number;
    regionId: number;
}

export class FormDeleteEndpointGroup {
    id: string
    vpcId: number
    regionId: number
  }

export class FormEditEndpointGroup{
    id: string
    name: string
    description: string
    vpcId: number;
    regionId: number;
}
