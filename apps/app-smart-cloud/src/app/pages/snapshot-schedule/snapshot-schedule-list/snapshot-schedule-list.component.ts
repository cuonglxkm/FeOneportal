import {Component, Inject, OnInit} from "@angular/core";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {Router} from "@angular/router";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {SnapshotVolumeService} from "../../../shared/services/snapshot-volume.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {PopupAddVolumeComponent} from "../../volume/component/popup-volume/popup-add-volume.component";

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

  pageSize: number = 5;
  currentPage: number = 1;
  listOfData: any;
  totalData: number
  isLoadingEntities:boolean;
  customerID: number;

  actionSelected: number;

  onQueryParamsChange(params: NzTableQueryParams){
    const {pageSize, pageIndex} = params;
    this.pageSize = pageSize;
    this.currentPage = pageIndex;
    this.searchSnapshotScheduleList();
  }
  searchSnapshotScheduleList(){
    this.doGetSnapSchedules(this.pageSize, this.currentPage, this.customerID , this.project, this.region, this.searchStatus);
  }

  private doGetSnapSchedules(pageSize:number, currentPage:number, customerID: number, projectId: number, regionId: number, status: string){
    this.isLoadingEntities = true;
    this.snapshot.getListSchedule(pageSize,currentPage,customerID,projectId,regionId,status).subscribe(
      data => {
        this.totalData = data.totalCount;
        this.listOfData = data.records;
        this.isLoadingEntities = false;
      },
      error => {
        this.notification.error('Có lỗi xảy ra','Lấy danh sách lịch Snapshot thất bại');
        this.isLoadingEntities = false;
      }
    )
  }

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private snapshot: SnapshotVolumeService,
              private modalService: NzModalService,
              private snapshotVolumeService: SnapshotVolumeService,
              private notification: NzNotificationService) {
  }

  ngOnInit(): void {
    this.customerID = this.tokenService.get()?.userId;
  }

  selectedActionChange(value: any, data: any){

  }

  navigateToUpdate(id: number){
    console.log(id);
  }
  showModalSuppend(id: number){
    console.log(id);
  }

  showModalDelete(id: number){
    console.log(id);
  }

  onChange(value: string) {
    console.log('abc', this.searchStatus)
    this.searchStatus = value;
    this.searchSnapshotScheduleList();
  }

  onChangeAction(value: number , id: number){
    if(value == 2){
      const modal: NzModalRef = this.modalService.create({
          nzTitle: 'Xóa lịch Snapshot',
        nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện xóa lịch Snapshot?</p>`,
        nzFooter: [
          {
            label: 'Hủy',
            type: 'default',
            onClick: () => modal.destroy()
          },
          {
            label: 'Đồng ý',
            type: 'primary',
            onClick: () => {
              this.doDeleteSnapshotSchedule(id);
              modal.destroy()
            }
          }
        ]
      });
    }
    if(value == 3){
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Xóa lịch Snapshot',
        nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện Tạm dừng lịch Snapshot?</p>`,
        nzFooter: [
          {
            label: 'Hủy',
            type: 'default',
            onClick: () => modal.destroy()
          },
          {
            label: 'Đồng ý',
            type: 'primary',
            onClick: () => {
              this.doPauseSnapshotSchedule(id);
              modal.destroy()
            }
          }
        ]
      });
    }
    if(value == 4){
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Xóa lịch Snapshot',
        nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện Tiếp tục lịch Snapshot?</p>`,
        nzFooter: [
          {
            label: 'Hủy',
            type: 'default',
            onClick: () => modal.destroy()
          },
          {
            label: 'Đồng ý',
            type: 'primary',
            onClick: () => {
              this.doResumeSnapshotSchedule(id);
              modal.destroy()
            }
          }
        ]
      });
    }
  }

  doDeleteSnapshotSchedule(id: number){
    console.log('Delete:  '+id);
  }
  doPauseSnapshotSchedule(id: number){
    this.isLoadingEntities = true;
    this.snapshotVolumeService.actionSchedule(id,'suspend',this.customerID, this.region, this.project).subscribe(
      data =>{
        if(data){
          this.notification.success('Success','Tạm dừng lịch thành công.');
          this.isLoadingEntities = false;
        }else{
          this.notification.error('Có lỗi xảy ra','Tạm dừng Entities thất bại.');
          this.isLoadingEntities = false;
        }
      }
    )
  }
  doResumeSnapshotSchedule(id: number){
    this.isLoadingEntities = true;
    this.snapshotVolumeService.actionSchedule(id,'restore',this.customerID, this.region, this.project).subscribe(
      data =>{
        if(data){
          this.notification.success('Success','Tiếp tục lịch thành công.');
          this.isLoadingEntities = false;
        }else{
          this.notification.error('Có lỗi xảy ra','Tiếp tục lịch thất bại.');
          this.isLoadingEntities = false;
        }
      }
    )
  }

  navigateToDetail(id: number){
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/detail/'+id])
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
    this.searchSnapshotScheduleList();
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    this.searchSnapshotScheduleList();
  }

}
