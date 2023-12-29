import {SnapshotVolumeDto} from "../dto/snapshot-volume.dto";

export class OrderDTO{
  id: number;
  orderCode: string;
  customerId: number;
  createdByUserId: string;
  createdByUserEmail: string;
  note:string;
  statusCode: string;
  orderDate: string;
  orderItems: any;
  resultNote: any;
}
