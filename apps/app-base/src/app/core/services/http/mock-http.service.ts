import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionResult, HttpCustomConfig } from '@app/core/models/interfaces/http';
import { mockAPI } from '@env/environment';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as qs from 'qs'
import { filter, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockHttpService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    return this.http.get<any>(`${this.baseUrl}/user?username=${username}&password=${password}`);
  }
}
