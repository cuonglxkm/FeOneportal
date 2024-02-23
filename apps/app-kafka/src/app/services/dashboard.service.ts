import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponse } from '../core/models/base-response.model';
import { ChartData } from '../core/models/chart-data.model';
import { HealthCheckModel, HealthStatusModel } from '../core/models/health-check.model';

@Injectable({
  providedIn: 'root',
})
export class DashBoardService {
  private baseUrl = 'http://localhost:16005/kafka-service';

  constructor(private http: HttpClient) { }

  getDataInstant(resource: string, serviceOrderCode: string): Observable<BaseResponse<null>> {
    return this.http.get<BaseResponse<null>>(`${this.baseUrl}/stats/instants?service_order_code=${serviceOrderCode}&resource=${resource}`);
  }

  getCheckHealthCluster(serviceOrderCode: string): Observable<BaseResponse<HealthStatusModel>> {
    return this.http.get<BaseResponse<HealthStatusModel>>(`${this.baseUrl}/stats/health?service_order_code=${serviceOrderCode}`);
  }

  getCheckHealthChart(
    serviceOrderCode: string,
    fromTime: number,
    toTime: number
  ): Observable<BaseResponse<HealthCheckModel>> {
    return this.http.get<BaseResponse<HealthCheckModel>>(
      `${this.baseUrl}/stats/check-health?service_order_code=${serviceOrderCode}&start=${fromTime}&end=${toTime}`
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
      `${this.baseUrl}/stats/charts?service_order_code=${serviceOrderCode}&previous_time_mins=${previousTimeMins}&metric_type=${metricType}&num_points=${numPoints}&unit=${unit}`
    );
  }
}
