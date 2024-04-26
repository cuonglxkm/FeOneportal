export class PackModel {

  packId: number;
  offerId: number;
  packName: string;
  workerNode: number;

  cpu: number;
  ram: number;
  machineTypeId: number;
  machineType: string;

  rootStorage: number;
  rootStorageType: string;
  rootStorageName: string;

  volumeStorage: number;
  volumeType: string;
  volumeTypeId: number;

  price: number;

  constructor(obj: any) {
    if (obj) {
      this.packId = obj.pack_id;
      this.offerId = obj.offer_id;
      this.packName = obj.pack_name;
      this.workerNode = obj.worker_node;
      this.cpu = obj.cpu;
      this.ram = obj.ram;
      this.machineType = obj.machine_type;
      this.machineTypeId = obj.machine_type_id;
      this.rootStorage = obj.root_storage;
      this.rootStorageType = obj.root_storage_type;
      this.volumeStorage = obj.volume_storage;
      this.volumeType = obj.volume_type;
      this.volumeTypeId = obj.volume_type_id;
      this.rootStorageName = obj.root_storage_name;
      this.price = obj.price;
    }
  }

}
