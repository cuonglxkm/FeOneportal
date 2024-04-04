export class PackModel {

  id: number;
  workerNode: number;

  cpu: number;
  ram: number;
  configType: string;
  configTypeId: number;

  rootStorage: number;
  rootStorageType: string;

  volumeStorage: number;
  volumeType: string;
  volumeTypeId: number;

  price: number;

  constructor(obj: any) {
    if (obj) {
      this.id = obj.id;
      this.workerNode = obj.worker_node;
      this.cpu = obj.cpu;
      this.ram = obj.ram;
      this.rootStorage = obj.root_storage;
      this.rootStorageType = obj.root_storage_type;
      this.volumeStorage = obj.volume_storage;
      this.volumeType = obj.volume_type;
      this.price = obj.price;
    }
  }

}
