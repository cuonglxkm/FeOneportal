import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {PopupDeleteSnapshotVolumeComponent} from "../popup-snapshot/popup-delete-snapshot-volume.component";
import {PopupEditSnapshotVolumeComponent} from "../popup-snapshot/popup-edit-snapshot-volume.component";

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
  snapshotName: string;
  snapshotSize: number;
  snapshotDesc: string;
  snapshotVolumeName: string;
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.isEdit =  queryParams['edit'];
      if(this.isEdit){
        this.headerInfo = {
          breadcrumb1: 'Home',
          breadcrumb2: 'Dịch vụ',
          breadcrumb3: 'Snapshot Volume',
          content: 'Chỉnh sửa Snapshot Volume'
        };
      }else{
        this.isEdit = false;
        this.headerInfo = {
          breadcrumb1: 'Home',
          breadcrumb2: 'Dịch vụ',
          breadcrumb3: 'Snapshot Volume',
          content: 'Xem chi tiết Snapshot Volume'
        };
      }
    });
  }

  getProjectId(projectId: number) {
    this.projectSearch = projectId;
  }

  getRegionId(regionId: number) {
    this.regionSearch = regionId;
  }
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private modalService: NzModalService) {
  }

  backTOListPage(){
    this.router.navigate(['/app-smart-cloud/snapshotvls']);
  }
  validateEditSnapshot(): boolean{
    return false;
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
            //do Delete snapshot
            modal.destroy();
          }
        }
      ]
    });
  }

    protected readonly navigator = navigator;
}
