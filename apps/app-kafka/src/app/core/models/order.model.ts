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
  price: number;
  serviceDuration: number;
}

