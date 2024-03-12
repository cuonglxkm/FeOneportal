import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { Subscription } from 'rxjs';
import { KafkaPartition } from 'src/app/core/models/kafka-partition.model';
import { FetchTopicMessages, TopicMessages } from 'src/app/core/models/topic-messages.model';
import { TopicService } from 'src/app/services/kafka-topic.service';

@Component({
  selector: 'one-portal-message-topic',
  templateUrl: './message-topic.component.html',
  styleUrls: ['./message-topic.component.css'],
})
export class MessageTopicComponent implements OnInit, OnDestroy {
  @Input() serviceOrderCode: string;
  @Input() topicName: string;
  messages: TopicMessages[] = [];

  @Output() cancelEvent = new EventEmitter<void>();
  @ViewChild('virtualTable', { static: false })
  nzTableComponent?: NzTableComponent<TopicMessages>;
  sub: Subscription;
  eventSource: EventSource;

  listOfSelectedValue: string[] = [];
  partitions: string[] = [];
  listPartition: KafkaPartition[];
  loading = false;

  fromDate: number = null;
  toDate: number = null;
  date = null;

  constructor(
    private topicKafkaService: TopicService,
    private fb: NonNullableFormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.topicKafkaService
      .getListPartitions(this.topicName, this.serviceOrderCode)
      .subscribe((data: any) => {
        if (data && data.code == 200) {
          this.partitions = data.data;
          this.getListMessageTopic({
            serviceOrderCode: this.serviceOrderCode,
            topic: this.topicName,
            partitions: this.partitions.join(','),
          });
        }
      });
  }

  getListMessageTopic(req: FetchTopicMessages) {
    if(this.eventSource){
      this.eventSource.close();
      this.messages = [];
    }
    
    this.loading = true;
    this.eventSource = this.topicKafkaService.getTopicMessagesSSE(req)
    this.eventSource.onerror = err => {
        console.error('error', err);
        this.eventSource.close();
    }
  
    this.eventSource.onmessage = (event) => {
      const messageData: TopicMessages = JSON.parse(event.data);
      this.messages = [...this.messages, messageData];
      this.cdr.detectChanges();
      this.loading = false;
    };
    
  }

  onChangePartitions(event: []) {
    this.listOfSelectedValue = event;
    this.getListMessageTopic({
      serviceOrderCode: this.serviceOrderCode,
      topic: this.topicName,
      partitions:
        event.length > 0 ? event.join(',') : this.partitions.join(','),
    });
  }

  onChangeDate(result: Date[]) {
    const from: Date = result[0];
    const to: Date = result[1];
    this.fromDate = from?.getTime();
    this.toDate = to?.getTime();

    this.getListMessageTopic({
      serviceOrderCode: this.serviceOrderCode,
      topic: this.topicName,
      from: this.fromDate,
      to: this.toDate,
      partitions:
        this.listOfSelectedValue.length > 0
          ? this.listOfSelectedValue.join(',')
          : this.partitions.join(','),
    });
  }

  ngOnDestroy(): void {
      this.eventSource?.close();
  }
}
