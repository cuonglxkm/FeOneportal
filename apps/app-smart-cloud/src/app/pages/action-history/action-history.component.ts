import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActionHistoryModel } from 'src/app/shared/models/action-history.model';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { ActionHistoryService } from 'src/app/shared/services/action-history.service';
@Component({
  selector: 'one-portal-action-history',
  templateUrl: './action-history.component.html',
  styleUrls: ['./action-history.component.less'],
})
export class ActionHistoryComponent implements OnInit {
  dateRange: Date[] = [new Date(), new Date()];
  dateFormat = 'dd/MM/yyyy';
  fromDate: string;
  toDate: string;
  regionId: number;
  projectId: number;
  listOfActionHistory: ActionHistoryModel[] = [];
  pageSize = 10;
  pageNumber: number = 1;
  total: number;
  selectedAction = 'Tất cả';
  tableHeight: string;
  searchParam: string = '';

  actionData = ['Tất cả', 'Tạo mới', 'Sửa', 'Xóa'];
  constructor(
    private service: ActionHistoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    let currentDate = new Date();
    this.fromDate = currentDate.toISOString().substring(0, 10);
    this.toDate = currentDate.toISOString().substring(0, 10);
    this.getData();
  }

  getData(): void {
    this.service
      .getData(
        this.pageSize,
        this.pageNumber,
        this.fromDate,
        this.toDate,
        '',
        this.searchParam,
        this.searchParam,
        this.searchParam
      )
      .subscribe((data) => {
        this.listOfActionHistory = data.records;
        this.total = data.totalCount;
        console.log(this.listOfActionHistory);
      });
  }

  onChangeDateRange() {
    console.log('date picked', this.dateRange);
    this.fromDate = this.dateRange[0].toISOString().substring(0, 10);
    this.toDate = this.dateRange[1].toISOString().substring(0, 10);
    this.getData();
  }
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    // this.getSshKeys();
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
    // this.getSshKeys();
  }
}
