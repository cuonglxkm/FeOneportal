import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AclDeleteModel } from 'src/app/core/models/acl-delete.model';
import { AclModel } from 'src/app/core/models/acl.model';
import { KafkaConsumerGroup } from 'src/app/core/models/kafka-consumer-group.model';
import { KafkaCredential } from 'src/app/core/models/kafka-credential.model';
import { AclKafkaService } from 'src/app/services/acl-kafka.service';
import { ConsumerGroupKafkaService } from 'src/app/services/consumer-group-kafka.service';
import { camelizeKeys } from 'humps';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoadingService } from "@delon/abc/loading";
import { AclReqModel } from 'src/app/core/models/acl-req.model';

@Component({
  selector: 'one-portal-acl-consumer-group',
  templateUrl: './acl-consumer-group.component.html',
  styleUrls: ['./acl-consumer-group.component.css'],
})
export class AclConsumerGroupComponent implements OnInit {
  listAcl: AclModel[];
  aclRequest: AclReqModel = new AclReqModel();
  aclConsumerGroupForm: FormGroup;

  permissionGroupCode = 'group';
  permissionGroupName = 'READ';

  @Input() listOfPrincipals: KafkaCredential[];
  @Input() serviceOrderCode: string;

  listOfConsumerGroup: KafkaConsumerGroup[];

  listOfPermission = ['DENY', 'ALLOW'];

  idListForm = 0;
  idCreateForm = 1;
  idUpdateForm = 2;
  showForm: number = this.idListForm;

  groupExtract = "Exact";
  groupPrefixed = "Prefixed";
  tabGroupValue: string = this.groupExtract;

  aclGroupForm: FormGroup;
  defaultHost = '0.0.0.0';
  isLoadingTopic = false;
  searchText = '';

  total: number;
  pageSize: number;
  pageIndex: number;
  maxSize = 9999;
  resourceTypeGroup = 'consumer_group';

  constructor(
    private fb: NonNullableFormBuilder,
    private aclKafkaService: AclKafkaService,
    private modal: NzModalService,
    private consumerGroupKafkaService: ConsumerGroupKafkaService,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService,
  ) {
    this.total = 0;
    this.pageSize = 10;
    this.pageIndex = 1;
  }

  ngOnInit() {
    this.getListAcl(1, this.pageSize, '', this.serviceOrderCode, this.resourceTypeGroup);
    this.getListConsumerGroup();
    this.initForm();
  }

  initForm() {
    this.aclConsumerGroupForm = this.fb.group({
      principal: [null, [Validators.required]],
      consumerGroups: [null, [Validators.required]],
      groupPrefixed: [null],
      host: [this.defaultHost, [Validators.required]]
    });
  }

  onSearch() {
    this.getListAcl(this.pageIndex, this.pageSize, this.searchText, this.serviceOrderCode, this.resourceTypeGroup);
  }

  getListConsumerGroup() {
    this.consumerGroupKafkaService.getListConsumerGroup(this.pageIndex, this.maxSize, '', this.serviceOrderCode)
      .subscribe((res) => {
        if (res.code && res.code == 200) {
          this.total = res.data.totals;
          this.listOfConsumerGroup = camelizeKeys(res.data.results) as KafkaConsumerGroup[];
        }
      });
  }

  changePage(event: number) {
    this.pageIndex = event;
    this.getListAcl(this.pageIndex, this.pageSize, this.searchText, this.serviceOrderCode, this.resourceTypeGroup);
  }

  changeSize(event: number) {
    this.pageSize = event;
    this.getListAcl(this.pageIndex, this.pageSize, this.searchText, this.serviceOrderCode, this.resourceTypeGroup);
  }

  getListAcl(page: number, limit: number, keySearch: string, serviceOrderCode: string, resourceType: string) {
    this.aclKafkaService.getListAcl(page, limit, keySearch.trim(), serviceOrderCode, resourceType)
      .subscribe(
        (res) => {
          if (res && res.code == 200) {
            this.total = res.data.totals
            this.listAcl = camelizeKeys(res.data.results) as AclModel[];
          }
        }
      );
  }

  createForm() {
    this.initForm();
    // this.aclTopicForm.reset();
    for (const key in this.aclConsumerGroupForm.controls) {
      this.aclConsumerGroupForm.controls[key].markAsPristine();
      this.aclConsumerGroupForm.controls[key].updateValueAndValidity();
    }
    this.showForm = this.idCreateForm;
    this.tabGroupValue = this.groupExtract;
    this.aclConsumerGroupForm.get('groupPrefixed').enable({ onlySelf: true });
  }

  cancelCreate() {
    this.aclConsumerGroupForm.reset();
    for (const key in this.aclConsumerGroupForm.controls) {
      this.aclConsumerGroupForm.controls[key].markAsPristine();
      this.aclConsumerGroupForm.controls[key].updateValueAndValidity();
    }
    this.showForm = this.idListForm;
  }

  onChangeRadio() {
    if (this.tabGroupValue == this.groupExtract) {
      this.aclConsumerGroupForm.get('consumerGroups').setValidators(Validators.required);
      this.aclConsumerGroupForm.get('groupPrefixed').clearValidators();
    } else {
      this.aclConsumerGroupForm.get('groupPrefixed').setValidators(Validators.required);
      this.aclConsumerGroupForm.get('consumerGroups').clearValidators();
    }
    this.aclConsumerGroupForm.get('groupPrefixed').updateValueAndValidity();
    this.aclConsumerGroupForm.get('consumerGroups').updateValueAndValidity();
  }

  submitForm() {
    const hostControl = this.aclConsumerGroupForm.get('host');
    if (hostControl.value == null || hostControl.value == '') {
      hostControl.setValue(this.defaultHost);
    }
    for (const i in this.aclConsumerGroupForm.controls) {
      this.aclConsumerGroupForm.controls[i].markAsDirty();
      this.aclConsumerGroupForm.controls[i].updateValueAndValidity();
    }
    if (!this.aclConsumerGroupForm.invalid) {
      this.aclRequest.serviceOrderCode = this.serviceOrderCode;
      this.aclRequest.principal = this.aclConsumerGroupForm.controls['principal'].value;
      this.aclRequest.resourceType = this.resourceTypeGroup;
      this.aclRequest.resourceName = this.aclConsumerGroupForm.controls['consumerGroups'].value;
      this.aclRequest.resourceNamePrefixed = this.aclConsumerGroupForm.controls['groupPrefixed'].value;
      this.aclRequest.permissionGroupName = this.permissionGroupName;
      this.aclRequest.permissionGroupCode = this.permissionGroupCode;
      this.aclRequest.allowDeny = 'ALLOW';
      this.aclRequest.host = this.aclConsumerGroupForm.controls['host'].value;

      this.loadingSrv.open({type: "spin", text: "Loading..."});
      this.aclKafkaService.createAcl(this.aclRequest).pipe()
        .subscribe(
          (data) => {
            if (data && data.code == 200) {
              this.showForm = this.idListForm;
              this.getListAcl(1, this.pageSize, '', this.serviceOrderCode, this.resourceTypeGroup);
            }
            this.loadingSrv.close();
          }
        );
    }
  }

  showDeleteConfirm(data: AclDeleteModel) {
    this.modal.create({
      nzTitle: 'Xóa ACL',
      nzContent: '<h3>Quý khách chắc chắn muốn thực hiện xóa ACL của ' + data.resourceName + '? </h3>'
        + '<br> <i>Vui lòng cân nhắc thật kỹ trước khi click nút Đồng ý</i>',
      nzBodyStyle: { textAlign: 'center' },
      nzOkText: 'Đồng ý',
      nzOkType: 'primary',
      nzOkDanger: false,
      nzOnOk: () => {
        this.loadingSrv.open({type: "spin", text: "Loading..."});
        this.aclKafkaService.deleteAcl(data).pipe()
          .subscribe(
            (data) => {
              if (data && data.code == 200) {
                this.showForm = this.idListForm;
                this.notification.success('Thành công', data.msg);
                this.getListAcl(this.pageIndex, this.pageSize, '', this.serviceOrderCode, this.resourceTypeGroup);
              } else {
                this.notification.error('Thất bại', data.msg);
              }
              this.loadingSrv.close();
            }
          );
      },
      nzCancelText: 'Hủy'
    });
  }

}
