import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstants } from "../core/constants/app-constant";
import { BaseResponse } from "../core/models/base-response.model";
import { MonitoringData } from "../core/models/monitoring-data.model";
import { BaseService } from "./base.service";

@Injectable({
    providedIn: 'root'
})
export class MonitoringService extends BaseService {

    kafkaUrl = AppConstants.BASE_URL + '/kafka-service';

    constructor(private http: HttpClient) {
        super()
    }

    getMonitoringTopicData(
        serviceOrderCode: string,
        metric: string,
        interval: number,
        resource: string,
        topics: string
    ): Observable<BaseResponse<MonitoringData>> {
        return this.http.get<BaseResponse<MonitoringData>>(`${this.kafkaUrl}/stats/monitoring?service_order_code=${serviceOrderCode}&resource_type=${resource}&resources=${topics}&metric=${metric}&interval=${interval}`);
    }
}