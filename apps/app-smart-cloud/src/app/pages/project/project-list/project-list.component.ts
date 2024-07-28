import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { VpcModel } from '../../../shared/models/vpc.model';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VpcService } from '../../../shared/services/vpc.service';
import { getCurrentRegionAndProject } from '@shared';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService, RegionModel } from '../../../../../../../libs/common-utils/src';
import { IpPublicService } from '../../../shared/services/ip-public.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { RegionID } from 'src/app/shared/enums/common.enum';
import { debounceTime, Subject } from 'rxjs';
import { TimeCommon } from 'src/app/shared/utils/common';

@Component({
  selector: 'one-portal-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.less']
})
export class ProjectListComponent implements OnInit {
  regionId: any;
  isBegin: Boolean = false;
  size = 10;
  index: number = 1;
  total: number = 0;
  loading = false;
  isVisibleDelete = false;
  isVisibleDeleteProject = false;

  listOfData: VpcModel[] = [];

  searchKey = '';
  selectedStatus = '';
  statusData = [
    { name: this.i18n.fanyi('app.status.all'), value: '' },
    { name: this.i18n.fanyi('status.active'), value: 'ENABLE' },
    // { name: this.i18n.fanyi('status.disable'), value: 'DISABLE' },
    { name: this.i18n.fanyi('status.suspended'), value: 'SUSPENDED' }];

  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '600px'
  };
  nameDelete: any = '';
  itemDelete: any;
  disableDelete = true;
  isVisibleEditNormal = false;
  form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)] }),
    description: new FormControl('')
  });
  loadingDelete = false;
  searchDelay = new Subject<boolean>();

  results: VpcModel[] = [];
  allData: VpcModel[] = [];

  constructor(private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private vpcService: VpcService,
    private ipService: IpPublicService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private notification: NzNotificationService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {

  }
  url = window.location.pathname;
  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.regionId = RegionID.NORMAL;
      } else {
        this.regionId = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.regionId = RegionID.ADVANCE;
    }
    this.getData(true);

    this.notificationService.connection.on('UpdateProject', (data) => {
      console.log("UpdateProject:");
      console.log(data);
      if (data) {
        let projectId = data.serviceId;
        switch (data.actionType) {
          case "CREATING":
          case "DELETED":
          case "ERROR":
            this.getData(true);
            break;
          case "CREATED":
            var foundIndex = this.listOfData.findIndex(x => x.id == projectId);
            if (foundIndex > -1) {
              this.getData(true);
            }
            break;
          case "RESIZED":
            var foundIndex = this.listOfData.findIndex(x => x.id == projectId);
            if (foundIndex > -1) {
              this.getData(true);
            }
            break;
          case "RESIZING":
            var foundIndex = this.listOfData.findIndex(x => x.id == projectId);
            if (foundIndex > -1) {
              this.getData(true);
            }
            break;
          case "DELETING":
            var foundIndex = this.listOfData.findIndex(x => x.id == projectId);
            if (foundIndex > -1) {
              this.getData(true);
            }
            break;
        }
      }
    });

    // this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {     
    //   this.getData(false);
    // });

  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    if (this.regionId === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/project-advance']);
    } else {
      this.router.navigate(['/app-smart-cloud/project']);
    }
    this.getData(true);
  }

  onRegionChanged(region: RegionModel) {
    this.regionId = region.regionId;
  }

  getData(isCheckBegin: boolean): void {
    this.loading = true;
    this.vpcService.getData(this.searchKey, this.selectedStatus, this.tokenService.get()?.userId, this.regionId, this.size, this.index)
      .pipe(finalize(() => this.loading = false))
      .subscribe(baseResponse => {
        this.allData = baseResponse.records;
        this.listOfData =  this.allData;

        console.log(" this.listOfData", this.listOfData)
        this.filterData()
        this.total = baseResponse.totalCount;
        if (isCheckBegin) {
          this.isBegin = this.listOfData === null || this.listOfData.length < 1 ? true : false;
        }
      });


    // this.vpcService.getData(this.searchKey, this.selectedStatus, this.tokenService.get()?.userId, this.regionId, this.size, this.index)
    // .pipe(debounceTime(500))
    // .subscribe(baseResponse => {
    //   this.loading = false
    //   this.listOfData = baseResponse.records;
    //   console.log(" this.listOfData", this.listOfData)
    //   // this.filterData()
    //   this.total = baseResponse.totalCount;
    //   if (isCheckBegin) {
    //     this.isBegin = this.listOfData === null || this.listOfData.length < 1 ? true : false;
    //   }
    // });
  }

  onPageSizeChange(event: any) {
    this.size = event;
    this.getData(false);
  }

  onPageIndexChange(event: any) {
    this.index = event;
    this.getData(false);
  }

  edit(item: any) {
    // if (item.type == 'VPC') {
    //   this.router.navigate(['/app-smart-cloud/vpc/update/' + item.id]);
    // } else {
    // }
    this.form.controls['name'].setValue(item.displayName);
    this.form.controls['description'].setValue(item.description);
    this.itemDelete = item;
    this.isVisibleEditNormal = true;

  }

  delete(itemDelete: any) {
    this.itemDelete = itemDelete;
    if (itemDelete.type == 'VPC') {
      this.isVisibleDeleteProject = true;
    } else {
      this.isVisibleDelete = true;
    }

  }

  handleCancel() {
    this.nameDelete = '';
    this.isVisibleDelete = false;
    this.isVisibleDeleteProject = false;
    // debugger
    this.isVisibleEditNormal = false;
    this.disableDelete = true;
  }

  openIpDelete() {
    this.loadingDelete = true;
    this.vpcService.delete(this.itemDelete.id)
      .pipe(finalize(() => {
        this.getData(true);
        this.isVisibleDelete = false;
        this.isVisibleDeleteProject = false;
        this.disableDelete = true;
        this.loadingDelete = false;
      }))
      .subscribe(
        {
          next: post => {
            var listProject = JSON.parse(localStorage.getItem('projects'));
            if (listProject.length > 0) {
              listProject = listProject.filter(x => x.id != this.itemDelete.id);
              localStorage.setItem('projects', JSON.stringify(listProject));
            }

            this.notification.success('Thành công', 'Xóa VPC thành công');
          },
          error: e => {
            this.notification.error('Thất bại', 'Xóa VPC thất bại');
          }
        }
      );
  }

  search(inputSearch: any) {
    console.log("event", inputSearch)
    if (inputSearch !== null) {
      this.searchKey = inputSearch;
      console.log("searchKey", this.searchKey)
      this.filterData()
    }
    if (inputSearch == null) {
      this.getData(false);
    }
  
  }

  // search(inputSearch: string) {
  //   console.log("event", inputSearch)
  //   this.searchKey = inputSearch.toLowerCase().trim();
  //   console.log("searchKey",this.searchKey)
  //   this.getData(false);
  // }

  
  filterData() {
    if (this.searchKey) {
      this.listOfData = this.allData.filter(item =>

        item.displayName.toLowerCase().includes(this.searchKey.toLowerCase()
        )
      );
    } else {
      this.listOfData = this.allData;
    }
  }

  createProject() {
    if (this.regionId === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/project-advance/create']);
    } else {
      this.router.navigate(['/app-smart-cloud/project/create']);
    }
  }

  viewDetail(id: number) {
    this.router.navigate(['/app-smart-cloud/project/detail/' + id]);
  }

  confirmNameDelete(event: any) {
    this.nameDelete = '';
    if (event == this.itemDelete.displayName) {
      this.disableDelete = false;
    } else {
      this.disableDelete = true;
    }
  }

  redirectTo() {

  }

  updateProject() {
    const request = {
      customerId: this.tokenService.get()?.userId,
      id: this.itemDelete.id,
      projectName: this.form.controls['name'].value,
      description: this.form.controls['description'].value
    };

    this.vpcService.updateVpc(request, this.itemDelete.id)
      .pipe(finalize(() => {
        this.getData(true);
        this.isVisibleEditNormal = false;
      }))
      .subscribe(
        data => {
          this.notification.success('Thành công', 'Cập nhật VPC thành công');
          this.router.navigate(['/app-smart-cloud/project']);
        },
        error => {
          this.notification.error('Thất bại', 'Cập nhật VPC thất bại');
        }
      );
  }
}
