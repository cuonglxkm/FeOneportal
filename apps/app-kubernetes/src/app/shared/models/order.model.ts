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

export class OrderDTOSonch{
  id: any;
  orderCode: any;
  customerId: any;
  note: any;
  statusCode: any;
  orderDate: any;
  updatedDate: any;
  customerName: any;
  email: any;
  phoneNumber: any;
  address: any;
  invoiceCode: any;
    amount: PaymentInfoDTO;
  totalAmount: PaymentInfoDTO;
  vat: PaymentInfoDTO;
  paymentMethod: any; //Thanh toán tr? tru?c
  orderItems: ItemDTO[];
}

export class ItemDTO{
  serviceName: any;
  unitPrice: PaymentInfoDTO;
  duration: any;
  quantity: any;
  totalAmount: PaymentInfoDTO;
  serviceDetail: any;
}

export class PaymentInfoDTO{
  amount: any;
  currency: string;
}


