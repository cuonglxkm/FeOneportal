import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { WsDetailService } from '../model/websocket/ws-detail-service.model';

@Injectable({providedIn: 'root'})
export class ShareService {

  private overviewSubject = new Subject<WsDetailService>();

  private userRoleSubject = new Subject<WsDetailService>();

  private dbColSubject = new Subject<WsDetailService>();

  constructor() { 
    //
  }
  
  public addOverviewEvent(event: WsDetailService) {
    this.overviewSubject.next(event);
  }
  
  public addDbColEvent(event: WsDetailService) {
    this.dbColSubject.next(event);
  }

  public addUserRoleEvent(event: WsDetailService) {
    this.userRoleSubject.next(event);
  }

  get overviewObs(): Observable<WsDetailService> {
    return this.overviewSubject.asObservable();
  }

  get dbColObs(): Observable<WsDetailService> {
    return this.dbColSubject.asObservable();
  }

  get userRoleObs(): Observable<WsDetailService> {
    return this.userRoleSubject.asObservable();
  }

}