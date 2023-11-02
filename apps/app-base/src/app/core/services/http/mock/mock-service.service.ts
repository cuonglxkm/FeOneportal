import { Injectable } from '@angular/core';
import { UserLogin } from '@app/core/models/interfaces/user';
import { MockHttpService } from '../mock-http.service';

@Injectable({
  providedIn: 'root'
})
export class MockServiceService {

  constructor( public mock: MockHttpService) { }

  public login(params: UserLogin){
    return this.mock.login(params.username,params.password);
  }
}
