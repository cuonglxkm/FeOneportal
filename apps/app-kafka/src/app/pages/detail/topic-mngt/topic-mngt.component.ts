import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from '@delon/abc/loading';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from "ng-zorro-antd/notification";
import { throwError } from 'rxjs';
import { catchError, filter, finalize, map } from 'rxjs/operators';
import { KafkaTopic } from '../../../core/models/kafka-topic.model';
import { TopicService } from '../../../services/kafka-topic.service';
import { camelizeKeys } from 'humps';
@Component({
  selector: 'one-portal-topic-mngt',
  templateUrl: './topic-mngt.component.html',
  styleUrls: ['./topic-mngt.component.css'],
})

export class TopicMngtComponent implements OnInit {
  @Input() serviceOrderCode: string;

  listTopic: KafkaTopic[] = [];
  listTopicTestProducer: KafkaTopic[] = [];
  index: number = 1;
  size: number = 10;
  total: number;
  search: string = '';
  control: number;
  selectedTopic: KafkaTopic;
  topicDetail: string;

  visibleConfigInfo: boolean;
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
    private topicKafkaService: TopicService,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService,
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

  getListTopic() {
    this.topicKafkaService.getListTopic(1, 10000, "", this.serviceOrderCode)
      .pipe(
        filter((r) => r && r.code == 200),
        map((r) => r.data)
      )
      .subscribe((data) => {
        this.listTopicTestProducer = camelizeKeys(data?.results) as KafkaTopic[];
      });
  }

  getList() {
    this.loading = true
    this.topicKafkaService.getListTopic(this.index, this.size, this.search, this.serviceOrderCode)
      .pipe(
        filter((r) => r && r.code == 200),
        map((r) => r.data)
      )
      .subscribe((data) => {
        this.total = data?.totals;
        this.size = data?.size;
        this.listTopic = camelizeKeys(data?.results) as KafkaTopic[];
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
    this.getListTopic();
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
    this.getList();
  }

  handleSubmitTestProduce() {
    validateFormBeforeSubmit(this.produceForm);

    if (this.produceForm.valid) {

      this.loadingSrv.open({ type: "spin", text: "Loading..." });

      let data = this.produceForm.value;
      this.topicKafkaService.testProduce(data)
        .pipe(finalize(() => {
          this.loadingSrv.close();
        }))
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
              "Test producer thất bại",
              r.msg,
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
        this.loading = true
        this.topicKafkaService.deleteMessages(data.topicName, this.serviceOrderCode)
          .pipe(
            catchError((error: HttpErrorResponse) => {
              this.notification.error(
                error.error.error_msg,
                error.error.msg,
                {
                  nzPlacement: 'bottomRight',
                  nzStyle: {
                    backgroundColor: '#fed9cc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  }
                },
              );
              this.loading = false;
              return throwError('Something bad happened; please try again later.');
            })
          )
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
              } else {
                this.notification.error(
                  'Thông báo',
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
              this.getList();
              this.loading = false;
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

        this.loading = true
        this.topicKafkaService.deleteTopicKafka(data.topicName, this.serviceOrderCode)
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
              } else {
                this.notification.error(
                  "Xoá Topic thất bại",
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
              this.getList();
              this.loading = false;
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