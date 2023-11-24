import {Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class BackupVmService extends BaseService {

  constructor(public http: HttpClient) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }


}
