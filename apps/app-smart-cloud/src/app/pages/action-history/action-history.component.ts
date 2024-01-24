import { Component, OnInit } from '@angular/core';
import { ActionHistoryModel } from 'src/app/shared/models/action-history.model';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { Router } from '@angular/router';
import { ActionHistoryService } from 'src/app/shared/services/action-history.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'one-portal-action-history',
  templateUrl: './action-history.component.html',
  styleUrls: ['./action-history.component.less'],
})
export class ActionHistoryComponent implements OnInit {
  form = new FormGroup({
    date: new FormControl(''),
  });
  regionId: number;
  projectId: number;
  listOfActionHistory: ActionHistoryModel[] = [];
  isBegin: Boolean = false;
  size = 10;
  index: number = 0;
  total: number = 0;
  baseResponse: BaseResponse<ActionHistoryModel[]>;
  eventLogID: any;
  selectedAction = 'Tất cả'; 

  actionData = ['Tất cả', 'Tạo mới', 'Sửa', 'Xóa'];
  constructor(private service: ActionHistoryService, private router: Router) {}

  modalStyle = {
    padding: '20px',
    'border-radius': '10px',
    width: '1000px',
  };

  ngOnInit(): void {
    this.service.model.subscribe((data) => {
      console.log(data);
    });
    this.getData();
  }

  ngOnChange(): void {}
  getData(): void {
    // this.service.getData(this.ipAddress, this.status, this.customerId, this.regionId, this.isCheckState, this.size, this.index)
    //   .subscribe(baseResponse => {
    //   this.listOfIp = baseResponse.records;
    //     console.log(this.listOfIp);
    // });
    this.service.getActionLogs()
      .subscribe(baseResponse => {
      this.listOfActionHistory = baseResponse.records;
        console.log(this.listOfActionHistory);
    });
  }

  search(search: string) {
    console.log(search);
    // this.searchKey = search;
    // this.getSshKeys();
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    // this.getSshKeys();
  }

  projectChange(project: ProjectModel) {
    // this.projectId = project.id;
    // this.getSshKeys();
  }

  onPageSizeChange(event: any) {
    // this.size = event
    // this.getSshKeys();
  }

  onPageIndexChange(event: any) {
    // this.index = event;
    // this.getSshKeys();
  }
}
