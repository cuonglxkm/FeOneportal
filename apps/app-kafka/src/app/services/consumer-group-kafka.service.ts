import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { KafkaConsumerGroup } from '../core/models/kafka-consumer-group.model';

@Injectable({
    providedIn: 'root'
})

export class ConsumerGroupKafkaService {
    public refresh$ = new Subject();
    private baseUrl = 'http://api.galaxy.vnpt.vn:30383/kafka-service';

    constructor(private http: HttpClient) { }

    getListConsumerGroup(
        page: number,
        limit: number,
        keySearch: string,
        serviceOrderCode: string,
    ) {
        return this.http.get(`${this.baseUrl}/consumer-groups/get-all?page=${page}&limit=${limit}&key_search=${keySearch}&service_order_code=${serviceOrderCode}`);
    }

    getDetailConsumerGroup(
        groupId: string,
        serviceOrderCode: string
    ) {
        return this.http.get(`${this.baseUrl}/consumer-groups/get-detail-group?&group_id=${groupId}&service_order_code=${serviceOrderCode}`);
    }

    getListTopicInGroup(
        groupId: string,
        serviceOrderCode: string,
        keySearch: string
    ) {
        return this.http.get(`${this.baseUrl}/consumer-groups/get-list-topic-in-group?&group_id=${groupId}&service_order_code=${serviceOrderCode}&key_search=${keySearch}`);
    }

    deleteConsumerGroup(data: KafkaConsumerGroup): Observable<any> {
        const json = {
            service_order_code: data.serviceOrderCode,
            group_id: data.cgName,
            status: data.stateConsumer
        }
        return this.http.post('${this.baseUrl}/consumer-groups/delete-group', JSON.stringify(json));
    }

}
