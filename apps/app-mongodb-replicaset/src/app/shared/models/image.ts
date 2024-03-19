export default interface Image {
  id: number,
  name: string,
  imageTypeId: number,
  cloudId: string,
  flavorId: number,
  show: number,
  regionId: number,
  regionText: string,
  status: string,
  isLicense: boolean,
  isForAllUser: boolean
}
