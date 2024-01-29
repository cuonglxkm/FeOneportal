import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DashBoardService {
  private baseUrl = 'http://api.galaxy.vnpt.vn:30383/kafka-service';
  token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIyOTNmNjQwZC05ODFjLTRjODAtODM4OC01YjY1NmY5MTRhODIiLCJ1c2VyVHlwZSI6bnVsbCwidG9rZW5UeXBlIjoxLCJ1c2VyQ29kZSI6IjM2ODVheTA2eDBwIiwiZXhwIjoxNzYwODA4ODkxfQ.B1wFl02vaPQ962x6Hcb4YCoWQN6xg2ndbwZawIr_kAVX35tA5LCl3LY3KRmocONUuN3QhXpfgVOp-LWveUrkzm10lPro6owY5WnTHT2iv-FnGfMKmPvtPJhpqnbH43UAmlWH_e-1hHp7RgGTiVNgZmYLP7WnDpn9PVaBgJlhgVCtCdBNOGwxav1jb7Ne5DPBsaLr9JahiF3lEPQGwaTAeC_sm-BrgLwn8v_f52G6YPVq3BFMfLCOV122PMjFhoiuGL7azkzsihjbGqgrSt_1_DNYxECT-MZCtx1NSiZYroDw-RGlh9nalP88xJS_5Ke64R2EHGS4jhfC33UrYqwD1g';

  headers = new HttpHeaders({
    'Authorization': 'Bearer ' + this.token,
  })

  constructor(private http: HttpClient) {}

  getCheckHealthChart(serviceOrderCode: string, fromTime: number, toTime: number) {
    return this.http.get(`${this.baseUrl}/stats/checkHealth?serviceOrderCode=${serviceOrderCode}&start=${fromTime}&end=${toTime}`);
}

getDataChart(serviceOrderCode: string, previousTimeMins: number, metricType: string, numPoints: number, unit: string) {
    return this.http.get(`${this.baseUrl}/stats/queryChart?serviceOrderCode=${serviceOrderCode}&previousTimeMins=${previousTimeMins}&metricType=${metricType}&numPoints=${numPoints}&unit=${unit}`);
}
}
