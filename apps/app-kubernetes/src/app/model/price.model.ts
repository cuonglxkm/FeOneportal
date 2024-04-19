export class PriceModel {

  item: string;
  price: number;

  constructor(obj) {
    if (obj) {
      this.item = obj.item;
      this.price = obj.price;
    }
  }

}
