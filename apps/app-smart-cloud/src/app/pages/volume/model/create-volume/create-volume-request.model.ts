export class CreateVolumeRequestModel{
  customerId: number;
  createdByUserId: number;
  note: string;
  orderItems:[
    {
      orderItemQuantity:1;
      specification: string;
      specificationType:'volume_create';
      price:number;
      serviceDuration:1;
    }
  ]
}
