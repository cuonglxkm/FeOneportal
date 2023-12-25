import {Component, OnInit} from "@angular/core";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {Router} from "@angular/router";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {SnapshotVolumeService} from "../../../shared/services/snapshot-volume.service";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'one-portal-list-schedule-snapshot',
  templateUrl: './snapshot-schedule-list.component.html',
  styleUrls: ['./snapshot-schedule-list.component.less'],
})
export class SnapshotScheduleListComponent implements OnInit {

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  searchStatus?: string = null
  searchName?: string;

  status = [
    {label: 'Tất cả', value: null},
    {label: 'Đang hoạt động', value: 'ACTIVE'},
    {label: 'Vô hiệu hóa', value: 'DISABLED'},
    {label: 'Tạm dừng', value: 'PAUSED'}
  ]

  pageSize: number;
  currentPage: number;
  listOfData: any;
  totalData: number
  isLoadingEntities:boolean;
  customerID: number;

  onQueryParamsChange(params: NzTableQueryParams){
    const {pageSize, pageIndex} = params;
    this.pageSize = pageSize;
    this.currentPage = pageIndex;
    this.searchSnapshotScheduleList();
  }
  searchSnapshotScheduleList(){
    this.doGetSnapSchedules(this.pageSize, this.currentPage, this.customerID , this.project, this.region, this.status);
  }

  private doGetSnapSchedules(pageSize:number, currentPage:number, customerID: number, projectId: number, regionId: number, status: any){
    this.isLoadingEntities = true;
    this.snapshot.getListSchedule(pageSize,currentPage,customerID,projectId,regionId,status).subscribe(
      data => {
        this.totalData = data.totalCount;
        this.listOfData = data.records;
        this.isLoadingEntities = false;
      },
      error => {
        this.notification.error('Có lỗi xảy ra','Lấy danh sách Attached Entities thất bại');
        this.isLoadingEntities = false;
      }
    )
  }

  constructor(private router: Router,
              private snapshot: SnapshotVolumeService,
              private notification: NzNotificationService) {
  }

  ngOnInit(): void {
  }

  onChange(value: string) {
    console.log('abc', this.searchStatus)
    this.searchStatus = value;
    this.searchSnapshotScheduleList();
  }

  onInputChange(value: string) {
    this.searchName = value;
    console.log('input text: ', this.searchName)
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create'])
  }


  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

}
