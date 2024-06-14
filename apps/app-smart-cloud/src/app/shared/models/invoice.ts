export class FormCreateUserInvoice {
    id: number
    fullName: string
    companyName: string
    phoneNumber: string
    email: string
    taxCode: string
    address: string
    customerGroupId: number
    customerTypeId: number
    customerId: number
  }

  export class FormUpdateUserInvoice {
    id: number
    fullName: string
    companyName: string
    phoneNumber: string
    email: string
    taxCode: string
    address: string
    customerGroupId: number
    customerTypeId: number
    customerId: number
  }
  

  export class FormInitUserInvoice {
    CustomerType: number
    BuyerName: string
    CompanyName: string
    TaxCode: string
    Address: string
    PhoneNumber: string
    Email: string
  }