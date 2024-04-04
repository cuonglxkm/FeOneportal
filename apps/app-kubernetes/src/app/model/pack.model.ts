export class PackModel {

  workerNode: number;

  cpu: number;
  ram: number;

  rootStorage: number;
  rootStorageType: string;
  machineTypeId: number;
  machineType: string;

  volumeStorage: number;
  volumeType: string;
  volumeTypeId: number;

  price: number;

  constructor(obj: any) {
    if (obj) {
      this.workerNode = obj.worker_node;
      this.cpu = obj.cpu;
      this.ram = obj.ram;
      this.machineType = obj.machine_type;
      this.machineTypeId = obj.machine_type_id;
      this.rootStorage = obj.root_storage;
      this.rootStorageType = obj.root_storage_type;
      this.volumeStorage = obj.volume_storage;
      this.volumeType = obj.volume_type;
      this.price = obj.price;
    }
  }

}
