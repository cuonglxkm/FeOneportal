import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { ClipboardService } from 'ngx-clipboard';
import { NzNotificationService } from "ng-zorro-antd/notification";
import { KafkaService } from 'apps/app-kafka/src/app/services/kafka.service';
import { KafkaTopic } from 'apps/app-kafka/src/app/core/models/kafka-topic.model';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { KafkaMessage } from 'apps/app-kafka/src/app/core/models/kafka-message.model';
import { SyncInfoModel } from 'apps/app-kafka/src/app/core/models/sync-info.model';
import { KafkaPartition } from 'apps/app-kafka/src/app/core/models/kafka-partition.model';

@Component({
  selector: 'one-portal-message-topic',
  templateUrl: './message-topic.component.html',
  styleUrls: ['./message-topic.component.css'],
})
export class MessageTopicComponent implements OnInit {
  @Input() serviceOrderCode: string;
  @Input() topicName: string;

  @Output() cancelEvent = new EventEmitter<void>();

  listMessage: KafkaMessage[];
  listOfSelectedValue: string[] = [];
  listOfOption: string[];
  listPartition: KafkaPartition[];
  syncInfo: SyncInfoModel;
  stringToSearch: string;

  total: number;
  index: number;
  size: number;

  fromDate: number = null
  toDate: number = null
  date = null;

  constructor(
    private kafkaService: KafkaService,
    private fb: NonNullableFormBuilder
  ) { }
  validateForm: FormGroup

  ngOnInit(): void {
    this.getSyncTime(this.serviceOrderCode)
    this.kafkaService.getListPartitions(this.topicName, this.serviceOrderCode)
      .subscribe(
        (data: any) => {
          if (data && data.code == 200) {
            this.listOfOption = data?.data
            this.getListMessageTopic(this.topicName, this.serviceOrderCode, 1, 10, null, null, this.listOfOption.join(","));
          }
        }
      );
  }

  getListMessageTopic(nameTopic: string, serviceOderCode: string, page: number, size: number, fromDate: number, toDate: number, listPar: string) {

    this.kafkaService.getMessageTopicKafka(nameTopic, serviceOderCode, page, size, fromDate, toDate, listPar)
      .subscribe(
        (data: any) => {
          if (data && data.code == 200) {
            console.log(data);
            
            this.listMessage = [];
            this.total = data?.data?.totals;
            this.size = data?.data?.size;
            data?.data?.results?.forEach(element => {
              let item = new KafkaMessage(element);
              this.listMessage.push(item);
            });
            console.log("this.listMessage: ",this.listMessage);
            
          }
        }
      );
  }

  getSyncTime(serviceOrderCode: string) {
    this.kafkaService.getSyncTime(serviceOrderCode)
      .subscribe((res: any) => {
        if (res.code && res.code == 200) {
          this.syncInfo = res.data;
        }
      });
  }

  changeMessPageSize($event: any) {
    this.size = $event;
    // this.getListMessageTopic(this.selectTopic, this.serviceOrderCode, this.index, this.size, this.fromDate, this.toDate, this.listOfSelectedValue.length > 0 ? this.listOfSelectedValue.join(",") : this.listOfOption.join(","));
  }

  changeMessPage($event: any) {
    this.index = $event;
    // this.getListMessageTopic(this.selectTopic, this.serviceOrderCode, this.messPageIndex, this.messPageSize, this.fromDate, this.toDate, this.listOfSelectedValue.length > 0 ? this.listOfSelectedValue.join(",") : this.listOfOption.join(","));
  }

  onChangePartitions(event: []) {
    this.listOfSelectedValue = event;
    // this.getListMessageTopic(this.selectTopic, this.serviceOrderCode, this.pageIndex, this.pageSize, this.fromDate, this.toDate, event.length > 0 ? event.join(",") : this.listOfOption.join(","));
  }

  onChangeDate(result: Date[]) {
    let from: Date = result[0];
    let to: Date = result[1];

    this.fromDate = from?.getTime();
    this.toDate = to?.getTime();
    // this.getListMessageTopic(this.selectTopic, this.serviceOrderCode, this.pageIndex, this.pageSize, this.fromDate, this.toDate, this.listOfSelectedValue.length > 0 ? this.listOfSelectedValue.join(",") : this.listOfOption.join(","));
  }

}
