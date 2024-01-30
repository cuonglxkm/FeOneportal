import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'one-portal-acl-topic',
  templateUrl: './acl-topic.component.html',
  styleUrls: ['./acl-topic.component.css'],
})
export class AclTopicComponent {
  listOfData = [
    {
      "id": 97,
      "serviceOrderCode": "kafka-s1hnuicj7u7g",
      "principal": "bbbbbb",
      "resourceType": "topic",
      "resourceName": "dungnt-01",
      "patternType": "Exact",
      "permissionGroupCode": "all",
      "permissionGroupName": "Consumer & Producer",
      "host": "0.0.0.0",
      "allowDeny": "DENY",
      "createdUser": "jzxlwtviacd",
      "createdName": "Nguyễn Đức Nhiên",
      "updatedUser": null,
      "createdDate": 1706598906000,
      "updatedDate": 1706598906000
    },
    {
      "id": 93,
      "serviceOrderCode": "kafka-s1hnuicj7u7g",
      "principal": "nhienn01",
      "resourceType": "topic",
      "resourceName": "dungnt-01",
      "patternType": "Exact",
      "permissionGroupCode": "consumer",
      "permissionGroupName": "Consumer",
      "host": "0.0.0.0",
      "allowDeny": "ALLOW",
      "createdUser": "jzxlwtviacd",
      "createdName": "Nguyễn Đức Nhiên",
      "updatedUser": null,
      "createdDate": 1705657616000,
      "updatedDate": 1705657616000
    }
  ];
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

  idListForm = 0;
  idCreateForm = 1;
  idUpdateForm = 2;
  topicExtract = "Exact";
  topicPrefixed = "Prefixed";
  showForm: number = this.idListForm;

  aclTopicForm: FormGroup;
  isEdit = false;

  createForm() {
    this.showForm = this.idCreateForm;
  }

}
