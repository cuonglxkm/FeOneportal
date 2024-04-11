export class PriceModel {

  cpuPrice: number;
  ramPrice: number;
  storageSsdPrice: number;
  storageHddPrice: number;

  constructor(obj) {
    if (obj) {
      this.cpuPrice = obj.cpu;
      this.ramPrice = obj.ram;
      this.storageSsdPrice = obj.storage_ssd_price;
      this.storageHddPrice = obj.storage_hdd_price;
    }
  }

}
