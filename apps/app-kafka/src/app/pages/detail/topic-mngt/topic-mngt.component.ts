/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from '@delon/abc/loading';
import { camelizeKeys } from 'humps';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from "ng-zorro-antd/notification";
import { filter, finalize, map } from 'rxjs/operators';
import { AppConstants } from 'src/app/core/constants/app-constant';
import { KafkaTopic } from '../../../core/models/kafka-topic.model';
import { TopicService } from '../../../services/kafka-topic.service';
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

  new:boolean = true;
  delTopic: string;
  err_mess: string;

  deleteInfor: KafkaTopic;
  deleteType: string = '';

  visibleConfigInfo: boolean;
  isVisible: boolean = false;
  isDelVisible: boolean = false;
  loading = false;

  configInfo: object = new Object();
  config: any[];

  singleValue = null;
  listNum = 0;
  createNum = 1;
  editNum = 2;
  detailNum = 3;

  produceForm: FormGroup;

  notiSuccessText = 'Thành công';
  notiFailedText = 'Thất bại';

  constructor(
    private fb: FormBuilder,
    private topicService: TopicService,
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

    if (localStorage.getItem('locale') == AppConstants.LOCALE_EN) {
      this.changeLangData();
    }
  }

  changeLangData() {
    this.notiSuccessText = 'Success';
    this.notiFailedText = 'Failed';
  }

  Cancel() {
    this.getList();
    this.control = this.listNum;
  }

  getListTopic() {
    this.topicService.getListTopic(1, 10000, "", this.serviceOrderCode)
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
    this.topicService.getListTopic(this.index, this.size, this.search, this.serviceOrderCode)
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
      this.topicService.testProduce(data)
        .pipe(finalize(() => {
          setTimeout(() => {
            this.loadingSrv.close();
            this.getList();
          }, 5000);
          
        }))
        .subscribe((r: any) => {
          if (r && r.code == 200) {
            this.notification.success(this.notiSuccessText, r.msg);
            this.control = this.listNum;
            this.handleCloseProduceModal();
          } else {
            this.notification.error(this.notiFailedText, r.msg);
          }
        })
    }
  }

  showConfirm(info: KafkaTopic, type: string) {
    this.err_mess = '';
    this.delTopic = '';
    this.new = true;
    this.isDelVisible = true;
    this.deleteInfor = info;
    this.deleteType = type;
  }

  handleCloseDelete() {
    this.isDelVisible = false;

  }

  handleDeleteMessages(data: KafkaTopic) {
    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.topicService.deleteMessages(data.topicName, this.serviceOrderCode)
      .pipe(finalize(() => {
        this.loadingSrv.close();
        this.loadingSrv.open({ type: "spin", text: "Đang đồng bộ message..." });

        setTimeout(() => {
          this.handleSyncTopic(this.serviceOrderCode);
        }, 6000);
      }))
      .subscribe(
        (data: any) => {
          if (data && data.code == 200) {
            this.notification.success(this.notiSuccessText, data.msg);
          } else {
            this.notification.error(this.notiFailedText, data.msg);
          }
          this.isDelVisible = false;
        }
      );

  }

  handleDeleteTopic(data: KafkaTopic) {
    this.checkName()
    if(this.err_mess!=='')
    return
    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.topicService.deleteTopicKafka(data.topicName, this.serviceOrderCode)
      .pipe(finalize(() => {
        this.loadingSrv.close();
      }))
      .subscribe(
        (data: any) => {
          if (data && data.code == 200) {
            this.notification.success(this.notiSuccessText, data.msg);
          } else {
            this.notification.error(this.notiFailedText, data.msg);
          }
          this.getList();
          this.isDelVisible = false;
        }
      );
  }

  handleSyncTopic(serviceOrderCode: string) {

    this.topicService.syncTopic(serviceOrderCode)
      .pipe(finalize(() => {
        this.loadingSrv.close();
      }))
      .subscribe(
        (data: any) => {
          if (data && data.code == 200) {
            this.notification.success(this.notiSuccessText, data.msg);
          } else {
            this.notification.error(this.notiFailedText, data.msg);
          }
          this.getList();
        }
      );
  }

  checkName() {
    this.new= false
    this.err_mess = "";
    if (this.delTopic.length === 0) {
      this.err_mess = "Tên topic không được để trống";
    } else
      if (this.delTopic !== this.deleteInfor.topicName) {
        this.err_mess = "Tên topic nhập chưa đúng";
      }


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
