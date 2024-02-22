import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { KafkaConsumerGroup, KafkaConsumerGroupDetail, KafkaConsumerGroupTopic } from '../core/models/kafka-consumer-group.model';
import { Pagination } from '../core/models/pagination.model';
import { BaseResponse } from '../core/models/base-response.model';

@Injectable({
    providedIn: 'root'
})

export class ConsumerGroupKafkaService {
    public refresh$ = new Subject();
    private baseUrl = 'http://localhost:16005/kafka-service';

    constructor(private http: HttpClient) { }

    getListConsumerGroup(
        page: number,
        limit: number,
        keySearch: string,
        serviceOrderCode: string,
    ): Observable<BaseResponse<Pagination<KafkaConsumerGroup[]>>>  {
        return this.http.get<BaseResponse<Pagination<KafkaConsumerGroup[]>>>(`${this.baseUrl}/consumer-groups/get-all?page=${page}&limit=${limit}&key_search=${keySearch}&service_order_code=${serviceOrderCode}`);
    }

    getDetailConsumerGroup(
        groupId: string,
        serviceOrderCode: string
    ): Observable<BaseResponse<KafkaConsumerGroupDetail>> {
        return this.http.get<BaseResponse<KafkaConsumerGroupDetail>>(`${this.baseUrl}/consumer-groups/get-detail-group?&group_id=${groupId}&service_order_code=${serviceOrderCode}`);
    }

    getListTopicInGroup(
        groupId: string,
        serviceOrderCode: string,
        keySearch: string
    ): Observable<BaseResponse<KafkaConsumerGroupTopic[]>> {
        return this.http.get<BaseResponse<KafkaConsumerGroupTopic[]>>(`${this.baseUrl}/consumer-groups/get-list-topic-in-group?&group_id=${groupId}&service_order_code=${serviceOrderCode}&key_search=${keySearch}`);
    }

    deleteConsumerGroup(data: KafkaConsumerGroup): Observable<BaseResponse<null>> {
        const json = {
            body: {
                service_order_code: data.serviceOrderCode,
                group_id: data.cgName,
                status: data.stateConsumer
            }
        }
        return this.http.delete<BaseResponse<null>>('${this.baseUrl}/consumer-groups', json);
    }

}
