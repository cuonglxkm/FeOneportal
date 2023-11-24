import {Component, OnInit} from "@angular/core";

@Component({
  selector: 'app-snapshot-volume-detail',
  templateUrl: './snappshotvl-detail.component.html',
  styleUrls: ['./snappshotvl-detail.component.less'],
})
export class SnappshotvlDetailComponent implements OnInit {

  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'Snapshot Volume',
    content: 'Xem chi tiết Snapshot Volume'
  };

  regionSearch : number;
  projectSearch : number;
  ngOnInit(): void {
  }

  getProjectId(projectId: number) {
    this.projectSearch = projectId;
  }

  getRegionId(regionId: number) {
    this.regionSearch = regionId;
  }
}
