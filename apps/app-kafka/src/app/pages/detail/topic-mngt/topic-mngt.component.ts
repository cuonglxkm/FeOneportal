import { Component, Input, OnInit } from '@angular/core';
import { KafkaService } from '../../../services/kafka.service';
import { filter, finalize, map } from 'rxjs/operators';
import { ClipboardService } from 'ngx-clipboard';
import { InfoConnection } from '../../../core/models/info-connection.model';
import { BrokerConfig } from '../../../core/models/broker-config.model';
import { AppConstants } from '../../../core/constants/app-constant';
import { NzNotificationService } from "ng-zorro-antd/notification";
import { STColumn } from '@delon/abc/st';
import { KafkaTopic } from '../../../core/models/kafka-topic.model';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDescriptionsSize } from 'ng-zorro-antd/descriptions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
@Component({
  selector: 'one-portal-topic-mngt',
  templateUrl: './topic-mngt.component.html',
  styleUrls: ['./topic-mngt.component.css'],
})

export class TopicMngtComponent implements OnInit {
  @Input() serviceOrderCode: string;

  listTopic: KafkaTopic[] = [];
  index: number = 1;
  size: number = 10;
  total: number;
  search: string = '';
  control: number;
  selectedTopic: KafkaTopic;
  topicDetail: string;

  visibleConfigInfo: boolean;
  isSubmitProduce: boolean = false;
  isVisible: boolean = false;
  loading = false;

  configInfo: object = new Object();
  config: any[];

  singleValue = null;
  listNum = 0;
  createNum = 1;
  editNum = 2;
  detailNum = 3;

  produceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private kafkaService: KafkaService,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.getList();
    this.control = this.listNum;

    this.produceForm = this.fb.group({
      topicName: [null, [Validators.required]],
      numberMessage: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
      key: [""],
      value: [null, [Validators.required, Validators.maxLength(500)]],
      serviceOrderCode: [this.serviceOrderCode, [Validators.required]],
      configs: [""],
      groupId: [""]
    });
  }

  Cancel() {
    this.getList();
    this.control = this.listNum;
  }

  getList() {
    this.loading = true
    this.kafkaService.getListTopic(this.index, this.size, this.search, this.serviceOrderCode)
      .pipe(
        filter((r) => r && r.code == 200),
        map((r) => r.data)
      )
      .subscribe((data) => {
        this.total = data?.totals;
        this.size = data?.size;
        console.log('total: ', this.total, 'size: ' + this.size);

        let temp: KafkaTopic[] = [];
        data.data.forEach(element => {
          temp.push(new KafkaTopic(element));
        });
        this.listTopic = temp;
        console.log(this.listTopic);
        this.loading = false
      });
  }

  handleSearch() {
    this.index = 1;
    this.search = this.search.trim()
    this.getList();
  }

  changePageSize($event: any) {
    this.size = $event;
    this.index = 1;
    this.getList();
  }

  changePage($event: any) {
    this.index = $event;
    this.getList();
  }

  openCreateForm() {
    this.control = this.createNum;
  }

  detailTopic(topicName) {
    this.control = this.detailNum;
    this.topicDetail = topicName;
  }

  updateTopicForm(data: KafkaTopic) {
    this.control = this.editNum;
    this.selectedTopic = data;
  }

  showTopicInfo(data: KafkaTopic) {
    this.configInfo = JSON.parse(data.configs);
    this.visibleConfigInfo = true;
  }

  closeTopicInfo() {
    this.visibleConfigInfo = false;
  }

  testProduce() {
    this.isVisible = true
  }

  submitModalForm(): void {
    for (const i in this.produceForm.controls) {
      this.produceForm.controls[i].markAsDirty();
      this.produceForm.controls[i].updateValueAndValidity();
    }
  }

  handleCloseProduceModal() {
    this.isVisible = false;
    this.produceForm.reset();
    this.produceForm.get('key').setValue('')
    this.produceForm.get('configs').setValue('');
    this.produceForm.get('groupId').setValue('');
    this.produceForm.get('serviceOrderCode').setValue(this.serviceOrderCode);
  }

  handleSubmitTestProduce() {
    validateFormBeforeSubmit(this.produceForm);

    if (this.produceForm.valid) {
      let data = this.produceForm.value;
      this.isSubmitProduce = true;

      this.kafkaService.testProduce(data)
        .pipe(finalize(() => this.isSubmitProduce = false))
        .subscribe((r: any) => {
          if (r && r.code == 200) {
            this.notification.success(
              'Thông báo',
              r.msg,
              {
                nzPlacement: 'bottomRight',
                nzStyle: {
                  backgroundColor: '#dff6dd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                }
              },
            );
            this.getList()
            this.control = this.listNum;
            this.handleCloseProduceModal();
          } else {
            this.notification.error(
              data.error_msg,
              data.msg,
              {
                nzPlacement: 'bottomRight',
                nzStyle: {
                  backgroundColor: '#fed9cc',
                  borderRadius: '4px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                }
              },
            );
          }
        })
    };
  }

  deleteMessages(data: KafkaTopic) {
    this.modal.confirm({
      nzTitle: 'Bạn chắc chắn muốn xoá tất cả message của topic ' + data.topicName + ' không?',
      nzOkText: 'Đồng ý',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.kafkaService.deleteMessages(data.topicName, this.serviceOrderCode)
          .subscribe(
            (data: any) => {
              if (data && data.code == 200) {
                this.notification.success(
                  'Thông báo',
                  data.msg,
                  {
                    nzPlacement: 'bottomRight',
                    nzStyle: {
                      backgroundColor: '#dff6dd',
                      borderRadius: '4px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    }
                  },
                );
                this.getList();
              }
            }
          );
      },
      nzCancelText: 'Huỷ bỏ',
      nzOnCancel: () => console.log('Huỷ')
    });
  }

  showDeleteConfirm(data: KafkaTopic) {
    this.modal.confirm({
      nzTitle: 'Bạn chắc chắn muốn xoá Topic ' + data.topicName + ' ?',
      nzOkText: 'Đồng ý',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.kafkaService.deleteTopicKafka(data.topicName, this.serviceOrderCode)
          .subscribe(
            (data: any) => {
              if (data && data.code == 200) {
                this.notification.success(
                  'Thông báo',
                  data.msg,
                  {
                    nzPlacement: 'bottomRight',
                    nzStyle: {
                      backgroundColor: '#dff6dd',
                      borderRadius: '4px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    }
                  },
                );
                this.getList();
              }
            }
          );
      },
      nzCancelText: 'Huỷ',
      nzOnCancel: () => console.log('Huỷ')
    });
  }
}
export function validateFormBeforeSubmit(formGroup: FormGroup) {
  const noWhitespaceInHeadAndTailPattern = /^[^\s]+(\s+[^\s]+)*$/;
  for (const i in formGroup.controls) {
    formGroup.controls[i].markAsDirty();
    formGroup.controls[i].updateValueAndValidity();
    let value = formGroup.controls[i].value;
    if (value) {
      value = value + '';
      if (!noWhitespaceInHeadAndTailPattern.test(value)) {
        formGroup.controls[i].setValue(value.trim());
      }
    }
  }
}