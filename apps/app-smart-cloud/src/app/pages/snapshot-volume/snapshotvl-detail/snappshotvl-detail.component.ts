import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {PopupDeleteSnapshotVolumeComponent} from "../popup-snapshot/popup-delete-snapshot-volume.component";
import {PopupEditSnapshotVolumeComponent} from "../popup-snapshot/popup-edit-snapshot-volume.component";
import {SnapshotVolumeService} from "../../../shared/services/snapshot-volume.service";
import {messages} from "nx/src/utils/ab-testing";
import {EditSnapshotVolume} from "../../../shared/models/snapshotvl.model";
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'app-snapshot-volume-detail',
  templateUrl: './snappshotvl-detail.component.html',
  styleUrls: ['./snappshotvl-detail.component.less'],
})
export class SnappshotvlDetailComponent implements OnInit {

  headerInfo : any;

  regionSearch : number;
  projectSearch : number;
  isEdit: boolean;
  snapshotId: number;
  snapshotName: string;
  snapshotSize: number;
  snapshotDesc: string;
  snapshotVolumeName: string;
  snapshotVPC:string;
  snapshotVlCreateDate: string;
  isLoading: boolean;
  isShowWarningSnapshotVlName: boolean;
  contentWarningSnapshotVlName: string;
  ngOnInit(): void {

    const idSnapshotVl = this.activatedRoute.snapshot.paramMap.get('id');
    this.snapshotId = Number.parseInt(idSnapshotVl);

    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.isEdit =  queryParams['edit'];
      if(this.isEdit){
        this.headerInfo = {
          breadcrumb1: 'Home',
          breadcrumb2: 'Dịch vụ',
          breadcrumb3: 'Snapshot Volume',
          content: 'Chỉnh sửa Snapshot Volume'
        };
        this.getSnapshotVolume(idSnapshotVl);


      }else{
        this.isEdit = false;
        this.headerInfo = {
          breadcrumb1: 'Home',
          breadcrumb2: 'Dịch vụ',
          breadcrumb3: 'Snapshot Volume',
          content: 'Xem chi tiết Snapshot Volume'
        };

        this.getSnapshotVolume(idSnapshotVl);
      }
    });
  }

  private getSnapshotVolume(idSnapshotVl: string) {
    this.isLoading = true;
    this.snapshotVlService.getSnapshotVolummeById(idSnapshotVl).subscribe(data => {
      if (data !== undefined && data != null){
        this.snapshotName = data.name;
        this.snapshotSize = data.sizeInGB;
        this.snapshotDesc = data.description;
        this.snapshotVolumeName = data.volumeName;
        this.snapshotVlCreateDate = data.startDate;
        this.snapshotVPC = data.projectName;
        this.isLoading = false;
      }else{
      }

    })
  }

  getProjectId(projectId: number) {
    this.projectSearch = projectId;
  }

  getRegionId(regionId: number) {
    this.regionSearch = regionId;
  }
  constructor(private router: Router, private snapshotVlService: SnapshotVolumeService,
              private activatedRoute: ActivatedRoute, private modalService: NzModalService,
              private message: NzMessageService) {
  }

  backTOListPage(){
    this.router.navigate(['/app-smart-cloud/snapshotvls']);
  }

  changeSnapshotName(){
    this.isShowWarningSnapshotVlName = false;
    this.contentWarningSnapshotVlName = null;
    //check empty
    if(this.snapshotName.trim() == '' ||  this.snapshotName === undefined){
      this.isShowWarningSnapshotVlName = true;
      this.contentWarningSnapshotVlName = 'Tên Snapshot Volume không được để trống.';
    }
    //check special
    if(this.checkSpecialSnapshotName(this.snapshotName)){
      this.isShowWarningSnapshotVlName = true;
      this.contentWarningSnapshotVlName = 'Tên Snapshot Volume không được chứa ký tự đặc biệt.';
    }
  }
  private checkSpecialSnapshotName( str: string): boolean{
    //check ký tự đặc biệt
    const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return specialCharacters.test(str);
  }


  private doEditSnapshot() {
    this.isLoading = true;
    let editRequest = new EditSnapshotVolume();
    editRequest.name = this.snapshotName;
    editRequest.id = this.snapshotId;
    editRequest.description = this.snapshotDesc;
    this.snapshotVlService.editSnapshotVolume(editRequest).subscribe(
      (data) => {
        this.isLoading = false;
        this.message.create('success', 'Chỉnh sửa Snapshot Volume thành công')
        this.router.navigate(['/app-smart-cloud/snapshotvls']);
      },
      (error) => {
      this.isLoading = false;
        console.error('Lỗi:', error);

        if (error.status === 404) {
          this.message.create('error', 'Không tìm thấy thông tin Snapshot Volume')
        } else if (error.status === 500) {
          this.message.create('error', 'Lỗi Sever.')
        } else {
        }
      })
  }

  editSnapshot(){
    const modal: NzModalRef = this.modalService.create({
      nzTitle: 'Xác định điều chỉnh Snapshot Volume',
      nzWidth: '600px',
      nzContent: PopupEditSnapshotVolumeComponent,
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
            this.doEditSnapshot()
            modal.destroy();
          }
        }
      ]
    });
  }

    protected readonly navigator = navigator;
}
