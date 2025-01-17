export class UserModel {
  id?: number;
  customerCode?: string;
  birthday?: string;
  isLocked?: boolean;
  isDeleted?: boolean;
  regionId?: number;
  province?: string;
  accountTypeId?: number;
  email?: string;
  paymentMethod?: string;
  contractCode?: string;
  totalBalance?: number;
  remainingBalance?: number;
  discountBalance?: number;
  operatorUserId?: number;
  name?: string;
  familyName?: string;
  address?: string;
  phoneNumber?: string;
  identityCardCode?: string;
  identityCardCreatedDate?: string;
  identityCardLocation?: string;
  taxCode?: string;
  companyName?: string;
  channelSaleId?: number;
  fullName?: string;
  customerInvoice?: any;
}

export class ProvinceModel {
  id: number;
  code: string;
  name: string;
  areaId: number;
  regionCode: number;
}
