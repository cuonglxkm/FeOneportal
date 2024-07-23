import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Inject, Injectable} from "@angular/core";
import {catchError, Observable} from "rxjs";
import Flavor, {FlavorSearchForm} from "../models/flavor.model";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";

@Injectable({
  providedIn: 'root'
})
export class FlavorService extends BaseService {

  constructor(public http: HttpClient, @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  search(form: FlavorSearchForm): Observable<Flavor[]> {
    let params = new HttpParams();
    Object.entries(form).forEach(([key, value]) => {
      params = params.append(key, value);
    })
    return this.http.get<Flavor[]>(this.baseUrl + this.ENDPOINT.provisions + '/flavors', {
      headers: this.getHeaders().headers,
      params: params
    })
      .pipe(catchError(this.errorCode));
  }
}
