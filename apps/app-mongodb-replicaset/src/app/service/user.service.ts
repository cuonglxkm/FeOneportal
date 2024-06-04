import { Inject, Injectable } from '@angular/core';
import { BaseService } from '../shared/services/base.service';
import { HttpClient } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Observable, filter, map, of } from 'rxjs';
import { Role } from '../model/userDb.model';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    super();
  }

  // override baseUrl = 'http://127.0.0.1:16008';

  prefix_url = "mongodb-replicaset-service"

//   mockRole: Role[];

  // private getHeaders() {
    //     return new HttpHeaders({
    //       'Content-Type': 'application/json',
    //       'User-Root-Id': this.tokenService.get()?.userId,
    //       'Authorization': 'Bearer ' + this.tokenService.get()?.token
    //     })
    //   }

  getAllUser2(serviceOrderCode: string): Observable<any[]> {
    // return null;
    return this.http
      .get(`${this.baseUrl}/${this.prefix_url}/db-user/code/${serviceOrderCode}`).pipe(
        filter((r: any) => r && r.code == 200),
        map(r => r.data)
      );
  }

  getUsers(serviceOrderCode: string, username: string, page: number, size: number) {
    return this.http.get(`${this.baseUrl}/${this.prefix_url}/db-user/code/${serviceOrderCode}?username=${username}&page=${page}&size=${size}`);
  }

  syncUser(serviceOrderCode: string) {
    return this.http.get(`${this.baseUrl}/${this.prefix_url}/db-user/${serviceOrderCode}/sync-user`);
  }

  getUserInfo(serviceOrderCode: string, user: string) {
    return this.http.get(`${this.baseUrl}/${this.prefix_url}/db-user/${serviceOrderCode}/${user}`);
  }

  deleteUser(serviceOrderCode: string, user: string) {
    // console.log(`${this.baseUrl}/${this.prefix_url}/db-user/${serviceOrderCode}/${user}`)
    return this.http.delete(`${this.baseUrl}/${this.prefix_url}/db-user/${serviceOrderCode}/${user}`);
  }

  createUser(requestBody : any) {
    return this.http.post(`${this.baseUrl}/${this.prefix_url}/db-user/`, requestBody);
  }

  updateUser(serviceOrderCode: string, requestBody: any) {
    return this.http.put(`${this.baseUrl}/${this.prefix_url}/db-user/${serviceOrderCode}`, requestBody);
  }

  changePass(serviceOrderCode: string, requestBody: any) {
    return this.http.put(`${this.baseUrl}/${this.prefix_url}/db-user/change-pass/${serviceOrderCode}`, requestBody);
  }
  
//   getCustomRole(serviceOrderCode: string) {
//     this.mockRole.push({role: "1111", db: "1111"})
//     this.mockRole.push({role: "2222", db: "2222"})
//     this.mockRole.push({role: "3333", db: "3333"})
//     this.mockRole.push({role: "4444", db: "4444"})
//     return of(this.mockRole)
//   }
}
