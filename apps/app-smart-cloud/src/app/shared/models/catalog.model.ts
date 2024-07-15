export class Product {
  id: number;
  name: string;
  description: string;
  uniqueName: string;
  properties: Properties[];
}

export class Properties {
  id: number;
  name: string;
  productId: number;
  isShow: boolean;
}

export class OfferDetail {
  id: number;
  productId: number;
  offerName: string;
  productName: string;
  price: {
    fixedPrice: {
      amount: number
      currency: string
    }
    priceType: number
    chargeType: number
  };
  status: string;
  unitOfMeasure: string;
  timePeriod: {
    startDateTime: Date
    endDateTime: Date
  };
  regions: [
    {
      id: number
      offerId: number
      regionId: number
    }
  ];
  discounts: [
    {
      id: number
      productOfferId: number
      type: number
      valueToDiscounts: [
        {
          id: number
          offerDiscountId: number
          value: number
          amount: {
            amount: number
            currency: string
          }
        }
      ]
      timePeriod: {
        startDateTime: Date
        endDateTime: Date
      }
    }
  ];
  characteristicValues: CharacteristicValues[];
}

export class CharacteristicValues {
  id: number
  charName: string
  type: number
  charOptionValues: string[]
  productOfferId: number
}

export class SupportService {
  productName: string;
  isActive: boolean;
  regionId: number;
}
