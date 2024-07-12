import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { Router } from '@angular/router';
import { OperationHistoryService } from 'src/app/shared/services/operation-history.service';
import { FormControl, FormGroup } from '@angular/forms';
import { OperationHistoryModel } from 'src/app/shared/models/operation-history.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { finalize } from 'rxjs';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-operation-history',
  templateUrl: './operation-history.component.html',
  styleUrls: ['./operation-history.component.less'],
})
export class OperationHistoryComponent implements OnInit {
  form = new FormGroup({
    date: new FormControl(''),
  });
  regionId: number;
  projectId: number;
  listOperation: OperationHistoryModel[] = [];
  isBegin: Boolean = false;
  pageSize = 2;
  pageIndex: number = 0;
  total: number ;
  baseResponse: BaseResponse<OperationHistoryModel[]>;
  eventLogID: any;
  status: number =0;
  ipAddress: string = '';
  loading: boolean = true;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  paymentData = ['Tất cả', 'Tạo mới', 'Sửa', 'Xóa'];
  constructor(private service: OperationHistoryService, 
    private router: Router, 
    private cdr: ChangeDetectorRef,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) { }



  ngOnInit(): void {
    this.getData();
  }

  ngOnChange(): void { }
  getData(): void {
    this.loading= true;
    this.service.getData(this.ipAddress, this.status, 669, 3, this.pageSize, this.pageIndex, true).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe(data => {
      this.listOperation= data.records;
      this.total = data.totalCount;
    })
  }

  search(search: string) {
    console.log(search);
    // this.searchKey = search;
    // this.getSshKeys();
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.getData()
    // this.getSshKeys();
  }

  onRegionChanged(region: RegionModel) {
    this.regionId = region.regionId;
  }

  projectChange(project: ProjectModel) {
    // this.projectId = project.id;
    // this.getSshKeys();
  }

}
