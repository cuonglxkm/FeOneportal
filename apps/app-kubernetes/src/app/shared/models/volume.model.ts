import {VmDto, VolumeDTO} from "../dto/volume.dto";

export class CreateVolumeRequestModel {
  customerId: number;
  createdByUserId: number;
  note: string;
  orderItems: [
    {
      orderItemQuantity: number;
      specification: string;
      specificationType: string;
      price: number;
      serviceDuration: number;
    }
  ]
}
export class CreateVolumeResponseModel{
  success: boolean;
  code: number;
  data: any;
  message: any;
  errorCode: any;
}

export class EditSizeVolumeModel{
  customerId: number;
  createdByUserId: number;
  note: string;
  orderItems: [
    {
      orderItemQuantity: number;
      specification: string;
      specificationType: string;
      price: number;
      serviceDuration: number;
    }
  ]
}


export class GetAllVmModel {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  previousPage: number;
  records: VmDto[];

}
export class GetListVolumeModel {
  totalCount: number;
  records: VolumeDTO[];
  pageSize: number;
  currentPage: number;
  previousPage: number;
}

export class AddVolumetoVmModel {
  volumeId: number;
  instanceId: number;
  customerId: number;
}
export class EditTextVolumeModel{
  volumeId: number;
  customerId: number;
  newName: string;
  newDescription: string;
}
