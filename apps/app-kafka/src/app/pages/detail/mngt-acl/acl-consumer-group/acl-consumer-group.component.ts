import { Component, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AclDeleteModel } from 'apps/app-kafka/src/app/core/models/acl-delete.model';
import { AclReqModel } from 'apps/app-kafka/src/app/core/models/acl-req.model';
import { AclKafkaService } from 'apps/app-kafka/src/app/services/acl-kafka.service';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'one-portal-acl-consumer-group',
  templateUrl: './acl-consumer-group.component.html',
  styleUrls: ['./acl-consumer-group.component.css'],
})
export class AclConsumerGroupComponent implements OnInit {
  // listAcl: AclModel[];
  aclRequest: AclReqModel = new AclReqModel();
  listAcl = [
    {
      "id": 105,
      "serviceOrderCode": "kafka-s1hnuicj7u7g",
      "principal": "nhienn01",
      "resourceType": "consumer_group",
      "resourceName": "kafka-s1hnuicj7u7g-internal-sync-messages-topic",
      "patternType": "Exact",
      "permissionGroupCode": "group",
      "permissionGroupName": "READ",
      "host": "0.0.0.0",
      "allowDeny": "ALLOW",
      "createdUser": "jzxlwtviacd",
      "createdName": "Nguyễn Đức Nhiên",
      "updatedUser": null,
      "createdDate": 1706775379000,
      "updatedDate": 1706775379000
    }
  ]
  aclConsumerGroupForm: FormGroup;

  permissionGroupCode = 'group';
  permissionGroupName = 'READ';

  listOfPrincipals = [
    {
      "service_order_code": "kafka-s1hnuicj7u7g",
      "username": "nhienn01",
      "email": "fake@vnpt.vn",
      "created_date": "18-01-2024 14:07:46",
      "updated_date": "19-01-2024 14:50:06",
      "created_user": "jzxlwtviacd",
      "created_name": "Nguyễn Đức Nhiên",
      "updated_user": "jzxlwtviacd",
      "updated_name": "Nguyễn Đức Nhiên"
    },
    {
      "service_order_code": "kafka-s1hnuicj7u7g",
      "username": "bbbbbb",
      "email": "fake@vnpt.vn",
      "created_date": "12-01-2024 09:26:26",
      "updated_date": "12-01-2024 09:26:26",
      "created_user": "jzxlwtviacd",
      "created_name": "Nguyễn Đức Nhiên",
      "updated_user": null,
      "updated_name": null
    },
    {
      "service_order_code": "kafka-s1hnuicj7u7g",
      "username": "aaaaa",
      "email": "fake@vnpt.vn",
      "created_date": "09-01-2024 14:59:41",
      "updated_date": "12-01-2024 10:56:37",
      "created_user": "jzxlwtviacd",
      "created_name": "Nguyễn Đức Nhiên",
      "updated_user": "jzxlwtviacd",
      "updated_name": "Nguyễn Đức Nhiên"
    }
  ];

  listOfConsumerGroup = [
    { 'cgName': 'group1' },
    { 'cgName': 'group2' },
    { 'cgName': 'group3' },
    { 'cgName': 'group4' },
    { 'cgName': 'group5' },
    { 'cgName': 'group6' },
    { 'cgName': 'group7' },
    { 'cgName': 'group8' },
    { 'cgName': 'group9' }
  ];

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
  resourceTypeGroup = 'consumer_group';
  serviceOrderCode = 'kafka-s1hnuicj7u7g';


  constructor(
    private fb: NonNullableFormBuilder,
    private aclKafkaService: AclKafkaService,
    private modal: NzModalService
  ) {
    this.total = 0;
    this.pageSize = 10;
    this.pageIndex = 1;
  }

  ngOnInit() {
    this.getListAcl(1, this.pageSize, '', this.serviceOrderCode, this.resourceTypeGroup);
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
            this.total = res.data.totalElements
            this.listAcl = res.data.content;
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

      this.aclKafkaService.createAcl(this.aclRequest).pipe()
        .subscribe(
          (data) => {
            if (data && data.code == 200) {
              this.showForm = this.idListForm;
              this.getListAcl(1, this.pageSize, '', this.serviceOrderCode, this.resourceTypeGroup);
            }
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
        this.aclKafkaService.deleteAcl(data).pipe()
          .subscribe(
            (data: any) => {
              if (data && data.code == 200) {
                this.showForm = this.idListForm;
                this.getListAcl(this.pageIndex, this.pageSize, '', this.serviceOrderCode, this.resourceTypeGroup);
              }
            }
          );
      },
      nzCancelText: 'Hủy'
    });
  }

}
