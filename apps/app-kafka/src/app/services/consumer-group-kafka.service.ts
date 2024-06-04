import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BaseResponse } from '../core/models/base-response.model';
import { KafkaConsumerGroup, KafkaConsumerGroupDetail, KafkaConsumerGroupTopic } from '../core/models/kafka-consumer-group.model';
import { Pagination } from '../core/models/pagination.model';
import { BaseService } from './base.service';
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import Base from '@antv/g2/lib/base';

@Injectable({
    providedIn: 'root'
})

export class ConsumerGroupKafkaService extends BaseService {
    public refresh$ = new Subject();
    private kafkaUrl = this.baseUrl + '/kafka-service';
    private consumerGroupUrl = this.kafkaUrl + this.ENDPOINT.consumerGroups;

    constructor(
        private http: HttpClient,
        @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
        
        super()
    }
    private getHeaders() {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
            'Authorization': 'Bearer ' + this.tokenService.get()?.token
        })
    }

    getListConsumerGroup(
        page: number,
        limit: number,
        keySearch: string,
        serviceOrderCode: string,
    ): Observable<BaseResponse<Pagination<KafkaConsumerGroup[]>>> {
        return this.http.get<BaseResponse<Pagination<KafkaConsumerGroup[]>>>(`${this.consumerGroupUrl}/get-all?page=${page}&limit=${limit}&key_search=${keySearch}&service_order_code=${serviceOrderCode}`);
    }

    getDetailConsumerGroup(
        groupId: string,
        serviceOrderCode: string
    ): Observable<BaseResponse<KafkaConsumerGroupDetail>> {
        return this.http.get<BaseResponse<KafkaConsumerGroupDetail>>(`${this.consumerGroupUrl}/get-detail-group?&group_id=${groupId}&service_order_code=${serviceOrderCode}`);
    }

    getListTopicInGroup(
        groupId: string,
        serviceOrderCode: string,
        keySearch: string
    ): Observable<BaseResponse<KafkaConsumerGroupTopic[]>> {
        return this.http.get<BaseResponse<KafkaConsumerGroupTopic[]>>(`${this.consumerGroupUrl}/get-list-topic-in-group?&group_id=${groupId}&service_order_code=${serviceOrderCode}&key_search=${keySearch}`);
    }

    deleteConsumerGroup(data: KafkaConsumerGroup): Observable<BaseResponse<null>> {
        const json = {
            body: {
                service_order_code: data.serviceOrderCode,
                group_id: data.cgName,
                status: data.stateConsumer
            }
        }
        return this.http.delete<BaseResponse<null>>(this.consumerGroupUrl, json);
    }

    sync(serviceOrderCode: string): Observable<BaseResponse<null>> {
        return this.http.post<BaseResponse<null>>(`${this.consumerGroupUrl}/sync/${serviceOrderCode}`, {});
    }

}
