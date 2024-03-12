export interface FlavorSearchForm {
  show?: boolean;
  region?: number;
  isBasic?: boolean;
  isVpc?: boolean;
  showAll?: boolean;
}

export default interface Flavor {
  cloudId: string,
  flavorName: string,
  price: number,
  price3Months: number,
  price6Months: number,
  price12Months: number,
  price24Months: number,
  priceSSD: number,
  cpu: number,
  ram: number,
  hdd: number,
  bttn: number,
  btqt: number,
  region: number,
  regionText: string,
  isBasic: boolean,
  show: boolean,
  isVpc: boolean,
  isDeleted: unknown,
  description: string,
  systemFlavorDetail: unknown,
  id: number
}


