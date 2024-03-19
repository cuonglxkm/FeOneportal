import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../shared/services/vlan.service';
import { FormSearchNetwork, NetWorkModel } from '../../../shared/models/vlan.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { FileSystemModel, FormSearchFileSystem } from 'src/app/shared/models/file-system.model';
import { FileSystemService } from 'src/app/shared/services/file-system.service';


@Component({
  selector: 'one-portal-create-file-system-snapshot',
  templateUrl: './create-file-system-snapshot.component.html',
  styleUrls: ['./create-file-system-snapshot.component.less'],
})
export class CreateFileSystemSnapshotComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  value: string;

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<FileSystemModel[]>;

  isLoading: boolean = false;

  isCheckBegin: boolean = false;

  customerId: number;

  form: FormGroup<{
    nameFileSystem: FormControl<string>;
    nameSnapshot: FormControl<string>
  }> = this.fb.group({
    nameFileSystem: ['', [Validators.required]],
    nameSnapshot: ['', [Validators.required]],
  });


  getListFileSystem() {
    this.isLoading = true;
    let formSearch = new FormSearchFileSystem();
    formSearch.vpcId = this.project;
    formSearch.regionId = this.region;
    formSearch.name = this.value;
    formSearch.isCheckState = false;
    formSearch.pageSize = this.pageSize;
    formSearch.currentPage = this.pageIndex;

    this.fileSystemService.search(formSearch)

      .subscribe(data => {
        this.isLoading = false;
        console.log('data file system', data);
        this.response = data;
      }, error => {
        this.isLoading = false;
        this.response = null;
      });
  }  

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.getListFileSystem()
  }


  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder,
     private fileSystemService: FileSystemService
    // private volumeService: VolumeService,
    // private modalService: NzModalService,
    // private notification: NzNotificationService
  ) {}

  goBack() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/list']);
  }
  // request = new CreateScheduleSnapshotDTO();
  // create() {
  //   const modal: NzModalRef = this.modalService.create({
  //     nzTitle: 'Xác nhận tạo lịch Snapshot',
  //     nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện tạo lịch Snapshot?</p>`,
  //     nzFooter: [
  //       {
  //         label: 'Hủy',
  //         type: 'default',
  //         onClick: () => modal.destroy(),
  //       },
  //       {
  //         label: 'Đồng ý',
  //         type: 'primary',
  //         onClick: () => {
  //           this.isLoading = true;
  //           this.request.dayOfWeek = this.dateStart;
  //           this.request.daysOfWeek = [];
  //           this.request.description = this.descSchedule;
  //           this.request.intervalWeek = 1; // fix cứng số tuần  = 1;
  //           this.request.mode = 3; //fix cứng chế độ = theo tuần ;
  //           this.request.dates = 0;
  //           this.request.duration = 0;
  //           this.request.volumeId = this.volumeId;
  //           this.request.runtime = this.time.toISOString();
  //           this.request.intervalMonth = 0;
  //           this.request.maxBaxup = 1; // fix cứng số bản
  //           this.request.snapshotPacketId = 0;
  //           this.request.customerId = this.userId;
  //           this.request.projectId = this.project;
  //           this.request.regionId = this.region;
  //           console.log(this.request);
  //           this.snapshotService.createSnapshotSchedule(this.request).subscribe(
  //             (data) => {
  //               if (data != null) {
  //                 console.log(data);
  //                 this.isLoading = false;
  //                 this.notification.success('Success', 'Tạo lịch thành công');
  //                 this.router.navigate([
  //                   '/app-smart-cloud/schedule/snapshot/list',
  //                 ]);
  //               } else {
  //                 this.notification.error('Có lỗi xảy ra', 'Tạo lịch thất bại');
  //                 this.isLoading = false;
  //               }
  //             },
  //             (error) => {
  //               console.log(error);
  //               this.notification.error('Có lỗi xảy ra', 'Tạo lịch thất bại');
  //               this.isLoading = false;
  //             }
  //           );
  //           modal.destroy();
  //         },
  //       },
  //     ],
  //   });
  // }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }
}
