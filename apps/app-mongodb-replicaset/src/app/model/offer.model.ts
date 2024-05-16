export class Price {
    fixedPrice: {
      amount: number;
      currency: string;
    };
    priceType: number;
    chargeType: number;
}

export class TimePeriod {
    startDateTime: string;
    endDateTime: string;
}

export class ValueToDiscount {
    id: number;
    offerDiscountId: number;
    value: number;
    amount: {
        amount: number;
        currency: string;
    };
}

export class Discount {
    id: number;
    productOfferId: number;
    type: number;
    valueToDiscounts: ValueToDiscount[];
    timePeriod: TimePeriod;
}

export class Region {
    id: number;
    offerId: number;
    regionId: number;
}

export class CharacteristicValue {
    id: number;
    charName: string;
    type: number;
    charOptionValues: string[];
    productOfferId: number;
}

export class OfferPack {
    productId: number;
    productName: string;
    id: number;
    offerName: string;
    price: Price;
    status: string;
    unitOfMeasure: string;
    timePeriod: TimePeriod;
    regions: Region[];
    discounts: Discount[];
    characteristicValues: CharacteristicValue[];
}

export class MongoPackDto {
    id : number;
    offerName : string;
    price : Price;
    cpu: number;
    ram: number;
    storage: number;
    node : number;

    constructor(id?: number, offerName?: string, price?: Price, cpu?: number, ram?: number, storage?: number, node?: number) {
        this.id = id || 0;
        this.offerName = offerName || '';
        this.price = price || new Price(); 
        this.cpu = cpu || 0;
        this.ram = ram || 0;
        this.storage = storage || 0;
        this.node = node || 0;
    }
  }
  