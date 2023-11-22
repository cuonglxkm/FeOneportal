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

  orderCode: string | null;
  customerId: number;
  createdByUserId: number | null;
  createdByUserEmail:number| null;
  note: string;
  statusCode: number;
  orderDate: string | null;
  resultNote: null;
  orderItems: [
    {
      id: number;
      orderItemQuantity: number;
      orderId: number;
      specification: {
        typeName: string ;
      };
      price: {
        fixedPrice: {
          amount: number;
          currency: string;
        };
        priceAlteration: {
          type: number;
          amount: {
            amount: number;
            currency: string;
          };
          percentage: number;
        }
      };
      serviceDuration: number;
      token: string | null;
      isTrial: boolean;
      createdDate: string| null;
      addonId: string | null;
      oneSME_SubscriptId: number| null;
      completed: boolean;
      dhsxkD_SubId: number| null;
    }
  ];
  id: number
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
