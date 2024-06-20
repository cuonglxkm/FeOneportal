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

export class OrderDetailDTO{
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
  paymentCode: any;
  amount: PaymentInfoDTO;
  totalAmount: PaymentInfoDTO;
  vat: PaymentInfoDTO;
  paymentMethod: any; //Thanh toán tr? tru?c
  orderItems: ItemDTO[];
  paymentUrl: string;
  paymentId: number;
}

export class ItemDTO{
  serviceName: any;
  unitPrice: PaymentInfoDTO;
  duration: any;
  quantity: any;
  totalAmount: PaymentInfoDTO;
  serviceDetail: any;
  serviceNameLink ?: string
  serviceType?: string
}

export class PaymentInfoDTO{
  amount: any;
  currency: string;
}


