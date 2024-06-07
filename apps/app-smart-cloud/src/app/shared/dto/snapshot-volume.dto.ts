export class SnapshotVolumeDto {
  id: number;
  cloudId: string;
  name: string;
  description: string;
  sizeInGB: number;
  volumeId: number;
  customerId: number;
  customer: Customer;
  contract: Contract;
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
  fromRootVolume: boolean;
  note: string;
  scheduleId: number;
  volumeType: string;
}

export class Customer {
  id: number;
  email: string;
  accoutType: number;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  customerCode: string;
  phoneNumber: string;
  province: Province;
  userCode: string;
  contractCode: string;
  isLocked: boolean;
  identityCardCode: string;
  identityCardCreatedDate: string;
  identityCardLocation: string;
  birthday: string;
  taxCode: string;
  channelSaleId: number;
}

export class Province {
  id: number;
  code: string;
  name: string;
  areaId: number;
  regionCode: number;
}

export class Contract {
  id: number;
  code: string;
  createdDate: string;
  suspendDate: string;
  expiredDate: string;
}
