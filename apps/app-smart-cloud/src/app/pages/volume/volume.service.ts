import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { HttpClient,HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class VolumeService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };


  private url = 'http://172.16.68.200:1009/volumes';


  // getVolumes( userId: number, vpcId: number, regionId: number): Observable<SshKey[]> {
  //   return this.http.get<SshKey[]>(this.url + '?userId=' + userId + '&pvpcId=' + vpcId+ '&regionId=' + regionId).pipe(
  //     catchError(this.handleError<SshKey[]>('get shh-key error'))
  //   );
  // }

  constructor(private http: HttpClient) { }
}
