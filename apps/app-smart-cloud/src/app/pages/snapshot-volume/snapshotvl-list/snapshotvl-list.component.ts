import {Component, Inject, OnInit} from "@angular/core";
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {SnapshotVolumeDto} from "../../../shared/dto/snapshot-volume.dto";
import {SnapshotVolumeService} from "../../../shared/services/snapshot-volume.service";
import {GetListSnapshotVlModel} from "../../../shared/models/snapshotvl.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {Router} from "@angular/router";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {PopupDeleteVolumeComponent} from "../../volume/component/popup-volume/popup-delete-volume.component";
import {PopupDeleteSnapshotVolumeComponent} from "../popup-snapshot/popup-delete-snapshot-volume.component";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {NzMessageService} from "ng-zorro-antd/message";
@Component({
  selector: 'app-snapshot-volume-list',
  templateUrl: './snapshotvl-list.component.html',
  styleUrls: ['./snapshotvl-list.component.less'],
})
export class SnapshotVolumeListComponent implements OnInit {
  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'Snapshot Volume',
    content: 'Danh sách Snapshot Volume'
  };

  options: NzSelectOptionInterface[] = [
    {label: 'Tất cả trạng thái', value: null},
    {label: 'Đang khởi tạo', value: 'DANGKHOITAO'},
    {label: 'Dịch vụ đã xóa', value: 'HUY'},
    {label: 'Tạm ngừng', value: 'TAMNGUNG'},
    {label: 'Đang hoạt động', value: 'KHOITAO'},
  ];

  optionAction: NzSelectOptionInterface[] = [
    {label: 'Tạo Volume', value: 'initVolume'},
    {label: 'Chỉnh sửa', value: 'edit'},
    {label: 'Xóa', value: 'delete'}
  ]
  isLoading: boolean;

  selectedAction: string;
  isLoadingSearch = false;

  listSnapshotVlResponse: GetListSnapshotVlModel;
  listSnapshot: SnapshotVolumeDto[];
  totalSnapshot: number;

  //parameter search
  userId: number;
  projectId: number;
  regionId: number;
  size: number;
  pageSize: number = 10;
  currentPage: number;
  snapshotStatusSearch: string;
  snapshotNameSearch: string;
  volumeName: string;


  onPageIndexChange(event: any) {
    this.currentPage = event;
    this.getListSnapshotVl(this.userId, this.projectId, this.regionId, this.size, this.pageSize,
      this.currentPage, this.snapshotStatusSearch, this.volumeName, this.snapshotNameSearch);
  }

  onPageSizeChange(event: any) {
    this.pageSize = event;
    this.getListSnapshotVl(this.userId, this.projectId, this.regionId, this.size, this.pageSize,
      1, this.snapshotStatusSearch, this.volumeName, this.snapshotNameSearch);
  }


  ngOnInit(): void {
  }

  searchSnapshot() {
    this.userId = this.tokenService.get()?.userId;
    this.getListSnapshotVl(this.userId, this.projectId, this.regionId, this.size, this.pageSize,
      1, this.snapshotStatusSearch, this.volumeName, this.snapshotNameSearch);
  }

  navigateToCreateSnapshot() {

  }

  getProjectId(project: ProjectModel) {
    this.projectId = project.id;
    this.searchSnapshot();
  }

  getRegionId(region: RegionModel) {
    this.regionId = region.regionId;
    if(this.projectId != null ){
      this.searchSnapshot();
    }
  }
  onSelectionChange(event: any, snapshotVl: SnapshotVolumeDto){
    if(event == 'edit'){
      this.router.navigate(['/app-smart-cloud/snapshotvls/detail', snapshotVl.id], { queryParams: { edit: 'true' } });
    }
    if(event == 'initVolume'){
      this.router.navigate(['/app-smart-cloud/volume/create'],
        { queryParams:
            {
              createdFromSnapshot: 'true',
              idSnapshot: snapshotVl.id,
              sizeSnapshot: snapshotVl.sizeInGB ,
              typeSnapshot: snapshotVl.iops>0?'ssd':'hdd',

            }
        });
    }
    if(event == 'delete'){
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Xóa Snapshot Volume',
        nzWidth: '600px',
        nzContent: PopupDeleteSnapshotVolumeComponent,
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
              //do Delete snapshot
              this.doDeteleSnapshotVl(snapshotVl.id);
              modal.destroy();
            }
          }
        ]
      });
    }
  }

  constructor(private snapshotVlService: SnapshotVolumeService, private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private modalService: NzModalService,
              private message: NzMessageService) {
  }

  private getListSnapshotVl(customerId: number, projectId: number, regionId: number, size: number, pageSize: number, currentPage: number, status: string, volumeName: string, name: string) {
    this.isLoadingSearch = true;
    this.listSnapshot = [];
    this.snapshotVlService.getSnapshotVolumes(customerId, projectId, regionId, size, pageSize, currentPage, status, volumeName, name).subscribe(data => {
      if (data.records.length > 0) {
        this.listSnapshotVlResponse = data;
        this.listSnapshot = data.records;
        this.totalSnapshot = data.totalCount;
        this.isLoadingSearch = false;
      } else
        this.isLoadingSearch = false;
    })
  }
  getDetailSnapshotVl(idSnapshot: number){
    console.log(idSnapshot);
    this.router.navigate(['/app-smart-cloud/snapshotvls/detail/' + idSnapshot]);
  }

  doDeteleSnapshotVl(snapshotId: number){
    this.isLoading = true;
    this.snapshotVlService.deleteSnapshotVolume(snapshotId).subscribe(
      (data) => {
        this.message.create('success', 'Xóa Snapshot Volume thành công')
        this.isLoading = false;
        this.searchSnapshot();
      },
      (error) => {
        this.isLoading = false;

        if (error.status === 404) {
          this.message.create('error', 'Không tìm thấy thông tin Snapshot Volume')
        } else if (error.status === 500) {
          this.message.create('error', 'Lỗi Sever.')
        } else {

        }
      }
    )
  }
}
