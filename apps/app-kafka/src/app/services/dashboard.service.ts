import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { Observable } from 'rxjs';
import { BaseResponse } from '../core/models/base-response.model';
import { ChartData } from '../core/models/chart-data.model';
import { HealthCheckModel, HealthStatusModel } from '../core/models/health-check.model';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})
export class DashBoardService extends BaseService {
  private kafkaUrl = this.baseUrl + '/kafka-service';
  private statsUrl = this.kafkaUrl + this.ENDPOINT.stats;

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {

    super()
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  getDataInstant(resource: string, serviceOrderCode: string): Observable<BaseResponse<null>> {
    return this.http.get<BaseResponse<null>>(`${this.statsUrl}/instants?service_order_code=${serviceOrderCode}&resource=${resource}`);
  }

  getCheckHealthCluster(serviceOrderCode: string): Observable<BaseResponse<HealthStatusModel>> {
    return this.http.get<BaseResponse<HealthStatusModel>>(`${this.statsUrl}/health?service_order_code=${serviceOrderCode}`);
  }

  getCheckHealthChart(
    serviceOrderCode: string,
    fromTime: number,
    toTime: number
  ): Observable<BaseResponse<HealthCheckModel>> {
    return this.http.get<BaseResponse<HealthCheckModel>>(
      `${this.statsUrl}/check-health?service_order_code=${serviceOrderCode}&start=${fromTime}&end=${toTime}`
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
      `${this.statsUrl}/charts?service_order_code=${serviceOrderCode}&previous_time_mins=${previousTimeMins}&metric_type=${metricType}&num_points=${numPoints}&unit=${unit}`
    );
  }
}
