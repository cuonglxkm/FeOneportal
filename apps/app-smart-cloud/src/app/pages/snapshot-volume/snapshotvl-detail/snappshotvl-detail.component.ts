import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {PopupDeleteSnapshotVolumeComponent} from "../popup-snapshot/popup-delete-snapshot-volume.component";
import {PopupEditSnapshotVolumeComponent} from "../popup-snapshot/popup-edit-snapshot-volume.component";
import {SnapshotVolumeService} from "../../../shared/services/snapshot-volume.service";
import {messages} from "nx/src/utils/ab-testing";

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
  snapshotVlCreateDate: string;
  isLoading: boolean;
  ngOnInit(): void {

    const idSnapshotVl = this.activatedRoute.snapshot.paramMap.get('id');

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
              private activatedRoute: ActivatedRoute, private modalService: NzModalService) {
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
