import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponse } from '../core/models/base-response.model';
import { ChartData } from '../core/models/chart-data.model';
import { HealthCheckModel } from '../core/models/health-check.model';

@Injectable({
  providedIn: 'root',
})
export class DashBoardService {
  private baseUrl = 'http://api.galaxy.vnpt.vn:30383/kafka-service';

  constructor(private http: HttpClient) { }

  getTopicCount(serviceOrderCode: string) {
    return this.http.get(`${this.baseUrl}/stats/topicCount?serviceOrderCode=${serviceOrderCode}`);
  }

  getPartitionCount(serviceOrderCode: string) {
    return this.http.get(`${this.baseUrl}/stats/partitionCount?serviceOrderCode=${serviceOrderCode}`);
  }

  getMessageCount(serviceOrderCode: string) {
    return this.http.get(`${this.baseUrl}/stats/messageCount?serviceOrderCode=${serviceOrderCode}`);
  }

  getOfflinePartitionCount(serviceOrderCode: string) {
    return this.http.get(`${this.baseUrl}/stats/offlinePartitionCount?serviceOrderCode=${serviceOrderCode}`);
  }

  getCheckHealthCluster(serviceOrderCode: string) {
    return this.http.get(`${this.baseUrl}/stats/isHealth?serviceOrderCode=${serviceOrderCode}`);
  }

  getCheckHealthChart(
    serviceOrderCode: string,
    fromTime: number,
    toTime: number
  ): Observable<BaseResponse<HealthCheckModel>> {
    return this.http.get<BaseResponse<HealthCheckModel>>(
      `${this.baseUrl}/stats/checkHealth?serviceOrderCode=${serviceOrderCode}&start=${fromTime}&end=${toTime}`
    );
  }

  getDataChart(
    serviceOrderCode: string,
    previousTimeMins: number,
    metricType: string,
    numPoints: number,
    unit: string
  ): Observable<BaseResponse<ChartData>> {
    return this.http.get<BaseResponse<ChartData>>(
      `${this.baseUrl}/stats/queryChart?serviceOrderCode=${serviceOrderCode}&previousTimeMins=${previousTimeMins}&metricType=${metricType}&numPoints=${numPoints}&unit=${unit}`
    );
  }
}
