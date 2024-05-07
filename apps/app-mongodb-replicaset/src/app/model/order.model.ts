export class Order {
  customerId: number;
  createdByUserId: number;
  couponCode: string;
  note: string;
  orderItems: OrderItem[];
}

export class OrderItem {
  orderItemQuantity: number;
  specification: string;
  specificationType: string;
  serviceDuration: number;
  sortItem: number;
  price : number
}

export class OrderItemWithPackInfo {
  offerId : number;
  regionId : number;
}

export class OrderItemWithPack {
  orderItemQuantity: number;
  specificationString: string;
  specificationType: string;
  serviceDuration: number;
  sortItem: number;

}

export class OrderData  {
  orderItems : OrderItemWithPack[];
  projectId : number
}

