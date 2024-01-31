import { Component, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AclReqModel } from 'apps/app-kafka/src/app/core/models/acl-req.model';
import { AclModel } from 'apps/app-kafka/src/app/core/models/acl.model';
import { AclKafkaService } from 'apps/app-kafka/src/app/services/acl-kafka.service';

@Component({
  selector: 'one-portal-acl-topic',
  templateUrl: './acl-topic.component.html',
  styleUrls: ['./acl-topic.component.css'],
})
export class AclTopicComponent implements OnInit {
  listAclTopic: AclModel[];
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
  listOfTopic = [
    {'topicName': 'topic1'},
    {'topicName': 'topic2'},
    {'topicName': 'topic3'}
  ];

  listOfPermissionGroup = [
    {
      key: 'consumer',
      value: 'Consumer'
    },
    {
      key: 'producer',
      value: 'Producer'
    },
    {
      key: 'all',
      value: 'Consumer & Producer'
    }
  ];

  listOfPermission = ['DENY', 'ALLOW'];

  idListForm = 0;
  idCreateForm = 1;
  idUpdateForm = 2;
  showForm: number = this.idListForm;

  topicExtract = "Exact";
  topicPrefixed = "Prefixed";
  tabTopicValue: string = this.topicExtract;


  aclTopicForm: FormGroup;
  isEdit = false;
  defaultHost = '0.0.0.0';
  isLoadingTopic = false;

  total = 1;
  pageSize = 10;
  pageIndex = 1;

  serviceOrderCode = 'kafka-s1hnuicj7u7g';
  resourceTypeTopic = 'topic';
  aclRequest: AclReqModel = new AclReqModel();

  constructor(
    private fb: NonNullableFormBuilder,
    private aclKafkaService: AclKafkaService
  ) {

  }

  ngOnInit() {
    this.getListAcl(1, this.pageSize, '', this.serviceOrderCode, this.resourceTypeTopic);
    this.initForm();
  }

  initForm() {
    this.aclTopicForm = this.fb.group({
      principal: [null, [Validators.required]],
      topic: [null, [Validators.required]],
      topicPrefixed: [null],
      permissionGroup: [null, [Validators.required]],
      permission: [null, [Validators.required]],
      host: [this.defaultHost, [Validators.required]]
    });
  }

  getListAcl(page: number, limit: number, keySearch: string, serviceOrderCode: string, resourceType: string) {
    this.aclKafkaService.getListAcl(page, limit, keySearch, serviceOrderCode, resourceType)
      .subscribe(
        (res) => {
          if (res && res.code == 200) {
            this.total = res.data.totalElements
            this.listAclTopic = res.data.content;
          }
        }
      );
  }

  createForm() {
    this.initForm();
    this.isEdit = false;
    // this.aclTopicForm.reset();
    for (const key in this.aclTopicForm.controls) {
      this.aclTopicForm.controls[key].markAsPristine();
      this.aclTopicForm.controls[key].updateValueAndValidity();
    }
    this.showForm = this.idCreateForm;
    this.tabTopicValue = this.topicExtract;
    this.aclTopicForm.get('topicPrefixed').enable({ onlySelf: true });
  }

  cancelCreate() {
    this.showForm = this.idListForm;
  }

  submitForm() {
    const hostControl = this.aclTopicForm.get('host');
    if (hostControl.value == null || hostControl.value == '') {
      hostControl.setValue(this.defaultHost);
    }
    for (const i in this.aclTopicForm.controls) {
      this.aclTopicForm.controls[i].markAsDirty();
      this.aclTopicForm.controls[i].updateValueAndValidity();
    }
    if (!this.aclTopicForm.invalid) {
      this.aclRequest.serviceOrderCode = this.serviceOrderCode;
      this.aclRequest.principal = this.aclTopicForm.controls['principal'].value;
      this.aclRequest.resourceType = this.resourceTypeTopic;
      this.aclRequest.resourceName = this.aclTopicForm.controls['topic'].value;
      this.aclRequest.resourceNamePrefixed = this.aclTopicForm.controls['topicPrefixed'].value;
      const permissionGroupCode = this.aclTopicForm.controls['permissionGroup'].value;
      this.aclRequest.permissionGroupName = this.listOfPermissionGroup.find(x => x.key == permissionGroupCode).value;
      this.aclRequest.permissionGroupCode = permissionGroupCode;
      this.aclRequest.allowDeny = this.aclTopicForm.controls['permission'].value;
      this.aclRequest.host = this.aclTopicForm.controls['host'].value;
      this.aclRequest.isEdit = this.isEdit;

      this.aclKafkaService.createAcl(this.aclRequest).pipe()
        .subscribe(
          (data) => {
            if (data && data.code == 200) {
              this.showForm = this.idListForm;
              this.getListAcl(1, this.pageSize, '', this.serviceOrderCode, this.resourceTypeTopic);
            }
          }
        );
    }
  }

  onChangeRadioTopic() {
    if (this.tabTopicValue == this.topicExtract) {
      this.aclTopicForm.get('topics').setValidators(Validators.required);
      this.aclTopicForm.get('topicPrefixed').clearValidators();
    } else {
      this.aclTopicForm.get('topicPrefixed').setValidators(Validators.required);
      this.aclTopicForm.get('topics').clearValidators();
    }
    this.aclTopicForm.get('topicPrefixed').updateValueAndValidity();
    this.aclTopicForm.get('topics').updateValueAndValidity();
  }

}
