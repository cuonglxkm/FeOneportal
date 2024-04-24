export class OfferItem {
    id: number;
    productId: number;
    offerName: string;
    price: Price;
    status: string;
    unitOfMeasure: string;
    timePeriod: TimePeriod;
    regions: Region[];
    discounts: any[];
    characteristicValues: CharacteristicValue[];
    description: string;
    ipNumber: string;
}

export class OfferKafka {
    id: number;
    productId: number;
    offerName: string;
    price: Price;
    regions: Region[];
    broker: number;
    ram: number;
    cpu: number;
    storage: number;
}

export class CharacteristicValues {
    id: number
    charName: string
    type: number
    charOptionValues: string[]
    productOfferId: number
}

export class Price {
    fixedPrice: FixedPrice;
    priceType: number;
    chargeType: number;
}

export class FixedPrice {
    amount: number;
    currency: string;
}

export class TimePeriod {
    startDateTime: string;
    endDateTime: any;
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

export class UnitPrice {
    item: string;
    price: number;
}