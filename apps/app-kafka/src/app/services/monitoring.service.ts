import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { MonitoringData } from "../core/models/monitoring-data.model";
import { BaseResponse } from "../core/models/base-response.model";

@Injectable({
    providedIn: 'root'
})
export class MonitoringService {

    baseUrl = 'http://localhost:16005/kafka-service';

    constructor(private http: HttpClient) { }

    getMonitoringTopicData(
        serviceOrderCode: string,
        metric: string,
        interval: number,
        resource: string,
        topics: string
    ): Observable<BaseResponse<MonitoringData>> {
        return this.http.get<BaseResponse<MonitoringData>>(`${this.baseUrl}/stats/monitoring?service_order_code=${serviceOrderCode}&resource_type=${resource}&resources=${topics}&metric=${metric}&interval=${interval}`);
    }
}