import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {catchError, Observable} from "rxjs";
import Flavor, {FlavorSearchForm} from "../models/flavor.model";

@Injectable({
  providedIn: 'root'
})
export class FlavorService extends BaseService {

  constructor(public http: HttpClient) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  search(form: FlavorSearchForm): Observable<Flavor[]> {
    let params = new HttpParams();
    Object.entries(form).forEach(([key, value]) => {
      params = params.append(key, value);
    })
    return this.http.get<Flavor[]>(this.baseUrl + this.ENDPOINT.provisions + '/flavors', {
      headers: this.getHeaders(),
      params: params
    })
      .pipe(catchError(this.errorCode));
  }
}
