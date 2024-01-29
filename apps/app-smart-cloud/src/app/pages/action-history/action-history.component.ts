import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { ActionHistoryModel } from 'src/app/shared/models/action-history.model';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { ActionHistoryService } from 'src/app/shared/services/action-history.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
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
  pageNumber: number = 0;
  total: number;
  selectedAction = 'Tất cả';
  tableHeight: string;

  actionData = ['Tất cả', 'Tạo mới', 'Sửa', 'Xóa'];
  constructor(
    private service: ActionHistoryService,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).subscribe(result => {
      if (result.breakpoints[Breakpoints.XSmall]) {
        // Màn hình cỡ nhỏ
        this.tableHeight = '120px';
      } else if (result.breakpoints[Breakpoints.Small]) {
        // Màn hình cỡ nhỏ - trung bình
        this.tableHeight = '250px';
      } else if (result.breakpoints[Breakpoints.Medium]) {
        // Màn hình trung bình
        this.tableHeight = '300px';
      } else if (result.breakpoints[Breakpoints.Large]) {
        // Màn hình lớn
        this.tableHeight = '500px';
      } else if (result.breakpoints[Breakpoints.XLarge]) {
        // Màn hình rất lớn
        this.tableHeight = '600px';
      }

      // Cập nhật chiều cao của card bằng Renderer2
      this.renderer.setStyle(this.el.nativeElement, 'height', this.tableHeight);
    });

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
        '',
        '',
        ''
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
