export class WanIP {
  id: number
  wanName: string
  ipAddress: string
  vpcName: string
  vpcId: number
  attachedVmName: string
  customerId: number
  regionId: number
  attachedVmId: number
}

export class FormSearch {
  regionId: number
  childChannels: number
  customerId: number
  ipAddress: string
  instanceName: string
  netName: string
  projectId: number
  pageSize: number
  currentPage: number
}

export class FormCreate {
  networkId: number
  regionId: number
  isFloating: boolean //false
  ipAddress: string
}

export class FormAction {
  id: number
  instanceId: number
  action: string
}

 export class Wan {
   id: number
   cloudId: string
   name: string
   vlanId: number
   adminState: true
   shared: true
   subnetAddressRequired: string
   status: string
   vpcId: number
   region: number
   regionText: string
   subnets: [
     {
       id: number
       name: string
       networkAddress: string
       ipVersion: number
       gatewayIp: string
       enableDHCP: true
       dnsNameServer: string
       cloudId: string
       status: string
       networkId: number
       networkCloudId: string
       allocationPools: [
         {
           start: string
           end: string
         }
       ]
       hostRouters: [
         {
           destinationCidr: string
           nextHop: string
         }
       ]
     }
   ]
   customerName: string
   customerEmail: string
   customerId: number
   totalIP: number
   usedIp: number
   subnetCloudId: string
   getwayIP: string
   networkName: string
   vpcName: string
   regionId: number
   type: string
 }

 export class FormSearchWan {
  regionId: number
   projectId: number
   childChannels: number[]
   customerId: number
   wanName: string
   subnetAddress: string
   pageSize: number
   currentPage: number
 }
