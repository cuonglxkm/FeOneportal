import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { KafkaMessage } from 'src/app/core/models/kafka-message.model';
import { KafkaPartition } from 'src/app/core/models/kafka-partition.model';
import { SyncInfoModel } from 'src/app/core/models/sync-info.model';
import { TopicService } from 'src/app/services/kafka-topic.service';

@Component({
  selector: 'one-portal-message-topic',
  templateUrl: './message-topic.component.html',
  styleUrls: ['./message-topic.component.css'],
})
export class MessageTopicComponent implements OnInit {
  @Input() serviceOrderCode: string;
  @Input() topicName: string;

  @Output() cancelEvent = new EventEmitter<void>();

  listMessage: KafkaMessage[] = [];
  listOfSelectedValue: string[] = [];
  listOfOption: string[] = [];
  listPartition: KafkaPartition[];
  syncInfo: SyncInfoModel = new SyncInfoModel();
  stringToSearch: string = '';
  loading: boolean = false;

  total: number;
  index: number = 1;
  size: number = 10;

  fromDate: number = null
  toDate: number = null
  date = null;

  constructor(
    private kafkaService: TopicService,
    private fb: NonNullableFormBuilder
  ) { }
  validateForm: FormGroup

  ngOnInit(): void {
    this.getSyncTime(this.serviceOrderCode)
    this.kafkaService.getListPartitions(this.topicName, this.serviceOrderCode)
      .subscribe(
        (data: any) => {
          if (data && data.code == 200) {
            this.listOfOption = data.data
            this.getListMessageTopic(this.topicName, this.serviceOrderCode, 1, 10, null, null, this.listOfOption.join(","));
          }
        }
      );
  }

  getListMessageTopic(nameTopic: string, serviceOderCode: string, page: number, size: number, fromDate: number, toDate: number, listPar: string) {
    this.loading = true;
    this.kafkaService.getMessageTopicKafka(nameTopic, serviceOderCode, page, size, fromDate, toDate, listPar)
      .subscribe(
        (data: any) => {
          if (data && data.code == 200) {
            this.listMessage = [];
            this.total = data?.data?.totals;
            this.index = data?.data?.page;
            this.size = data?.data?.size;
            data?.data?.results?.forEach(element => {
              let item = new KafkaMessage(element);
              this.listMessage.push(item);
            });

          }
          this.loading = false
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
    this.index = 1;
    this.getListMessageTopic(this.topicName, this.serviceOrderCode, this.index, this.size, this.fromDate, this.toDate, this.listOfSelectedValue.length > 0 ? this.listOfSelectedValue.join(",") : this.listOfOption.join(","));
  }

  changeMessPage($event: any) {
    this.index = $event;
    this.getListMessageTopic(this.topicName, this.serviceOrderCode, this.index, this.size, this.fromDate, this.toDate, this.listOfSelectedValue.length > 0 ? this.listOfSelectedValue.join(",") : this.listOfOption.join(","));
  }

  onChangePartitions(event: []) {
    this.listOfSelectedValue = event;
    this.getListMessageTopic(this.topicName, this.serviceOrderCode, 1, this.size, this.fromDate, this.toDate, event.length > 0 ? event.join(",") : this.listOfOption.join(","));
  }

  onChangeDate(result: Date[]) {
    let from: Date = result[0];
    let to: Date = result[1];

    this.fromDate = from?.getTime();
    this.toDate = to?.getTime();
    this.getListMessageTopic(this.topicName, this.serviceOrderCode, 1, this.size, this.fromDate, this.toDate, this.listOfSelectedValue.length > 0 ? this.listOfSelectedValue.join(",") : this.listOfOption.join(","));
  }

}
