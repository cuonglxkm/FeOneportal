import {Component, OnInit} from "@angular/core";
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {SnapshotVolumeDto} from "../../../shared/dto/snapshot-volume.dto";

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
    {label: 'Đang hoạt động', value: 'KHOITAO'},
    {label: 'Lỗi', value: 'ERROR'},
    {label: 'Tạm ngừng', value: 'SUSPENDED'},
  ];

  snapshotStatusSearch : string;
  snapshotNameSearch: string;

  isLoadingSearch = false;

  listSnapshot : SnapshotVolumeDto[];
  totalSnapshot: number = 0;

  onRootPageIndexChange(event: any){

  }









  ngOnInit(): void {
  }

  searchSnapshot(){

  }
  navigateToCreateSnapshot(){

  }

  getProjectId(projectId: number) {
  }

  getRegionId(regionId: number) {
  }

}
