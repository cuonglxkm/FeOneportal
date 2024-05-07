import { Injectable } from '@angular/core';
import { BaseService } from '../shared/services/base.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
  })
export class PaymentService extends BaseService {

    prefix_url = "mongodb-replicaset-service"
    type = "mongodb"

    constructor(private http: HttpClient) {
        super();
    }

    getUnitPrice() {
        return this.http.get(`${this.baseUrl}/${this.prefix_url}/payment/unit-price`);

    }
}