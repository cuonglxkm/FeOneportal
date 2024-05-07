import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseService } from '../shared/services/base.service';
import { Collection } from '../model/database.model';
import { filter, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService extends BaseService{

  constructor(private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
      super();
  }

//   override baseUrl = 'http://localhost:16008';


  prefix_url = "mongodb-replicaset-service"
    // private getHeaders() {
    //     return new HttpHeaders({
    //       'Content-Type': 'application/json',
    //       'user_root_id': this.tokenService.get()?.userId,
    //       'Authorization': 'Bearer ' + this.tokenService.get()?.token
    //     })
    //   }

    createDatabase(service_order_code : string, requestBody : Collection) {
        return this.http.post(`${this.baseUrl}/${this.prefix_url}/db/create/${service_order_code}`, requestBody);
    }

    createCollection(service_order_code : string, requestBody : Collection) {
        return this.http.post(`${this.baseUrl}/${this.prefix_url}/db/create-coll/${service_order_code}`, requestBody);
    }

    dropDatabase(service_order_code : string, db : string) {
        return this.http.delete(`${this.baseUrl}/${this.prefix_url}/db/drop/${service_order_code}/${db}`);
    }

    syncDatabase(service_order_code : string, db : string) {
        return this.http.get(`${this.baseUrl}/${this.prefix_url}/db/${service_order_code}/sync/${db}`);
      }

    dropCollection(service_order_code : string, db : string, coll : string) {
        return this.http.delete(`${this.baseUrl}/${this.prefix_url}/db/drop-coll/${service_order_code}/${db}/${coll}`);
    }

    getAllDatabase(service_order_code : string) {
        return this.http.get(`${this.baseUrl}/${this.prefix_url}/db/get-all/${service_order_code}`);
    }

    getCollectionInfo(service_order_code: string, db: string, pageSize : number, pageIndex : number) {
        return this.http.get(`${this.baseUrl}/${this.prefix_url}/db/get-all-coll/${service_order_code}/${db}?pageIndex=${pageIndex || ''}&pageSize=${pageSize || ''}`);
    }

    getDbAndColl(service_order_code: string) {
        return this.http.get(`${this.baseUrl}/${this.prefix_url}/db/get-db-coll/${service_order_code}`);
    }
    countDbAndColl(service_order_code: string) {
    return this.http.get(`${this.baseUrl}/${this.prefix_url}/db/count/${service_order_code}`);
  }
}
