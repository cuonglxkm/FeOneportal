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
