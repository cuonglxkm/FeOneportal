export  class SnapshotVolumeDto{
  id: number;
  cloudId: string;
  name: string;
  description: string;
  sizeInGB: number;
  volumeId: number;
  customerId: number;
  customer: {
    id: number;
    email: string;
    accoutType: number;
    password: string;
    firstName: string;
    lastName: string;
    address: string;
    customerCode: string;
    phoneNumber: string;
    province: {
      id: number;
      code: string;
      name: string;
      areaId: number;
      regionCode: number
    };
    userCode: string;
    contractCode: string;
    isLocked: true;
    identityCardCode: string;
    identityCardCreatedDate: string;
    identityCardLocation: string;
    birthday: string;
    taxCode: string;
    channelSaleId: number
  };
  contract: {
    id: number;
    code: string;
    createdDate: string;
    suspendDate: string;
    expiredDate: string
  };
  region: number;
  regionText: string;
  serviceStatus: string;
  resourceStatus: string;
  volumeName: string;
  suspendType: string;
  duration: number;
  startDate: string;
  endDate: string;
  suspendDate: string;
  offerId: number;
  iops: number;
  totalCount: number;
  projectName: string;
  projectId: number;
  fromRootVolume: true;
  note: string;
  scheduleId: number

}
