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
  id: 24892
}

