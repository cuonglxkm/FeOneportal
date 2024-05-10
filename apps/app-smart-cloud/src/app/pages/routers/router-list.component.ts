import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';
import {
  FormSearchRouter,
  RouterCreate,
  RouterModel,
  RouterUpdate,
} from 'src/app/shared/models/router.model';
import { RouterService } from 'src/app/shared/services/router.service';
import {
  FormSearchNetwork,
  NetWorkModel,
} from 'src/app/shared/models/vlan.model';
import { VlanService } from 'src/app/shared/services/vlan.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'one-portal-router-list',
  templateUrl: './router-list.component.html',
  styleUrls: ['./router-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouterListComponent implements OnInit {
  @ViewChild('operationTpl', { static: true }) operationTpl!: TemplateRef<any>;
  dataList: RouterModel[] = [];
  isTrigger: boolean = false;
  currentPage = 1;
  pageSize = 10;
  total = 1;
  loading = true;
  filterGender = [
    { text: 'male', value: 'male' },
    { text: 'female', value: 'female' },
  ];
  searchGenderList: string[] = [];
  filterStatus = [
    { text: 'Tất cả trạng thái', value: '' },
    { text: 'Kích hoạt', value: 'ACTIVE' },
    { text: 'Chưa kích hoạt', value: 'INACTIVE' },
  ];

  listVLAN: [{ id: ''; text: 'Chọn VLAN' }];
  listSubnet: [{ id: ''; text: 'Chọn Subnet' }];
  listIPAddress: [{ id: ''; text: 'Chọn địa chỉ IP' }];
  listIPAddressOnVLAN: [{ id: ''; text: 'Chọn địa chỉ IP' }];

  form: FormGroup<{
    name: FormControl<string>
    network: FormControl<string>
  }> = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,49}$/),
      ],
    ],
    network: [''],
  });

  formEdit: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,49}$/),
      ],
    ],
  });

  formDelete: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, this.nameRouterValidator.bind(this)]]
  });

  cloudId: string;
  region: number;
  projectId: number;
  project: ProjectModel;
  activeCreate: boolean = false;
  isVisibleGanVLAN: boolean = false;
  isVisibleGoKhoiVLAN: boolean = false;
  formListRouter: FormSearchRouter = new FormSearchRouter()
  isLoadingCreateRouter: boolean = false
  isLoadingDeleteRouter: boolean = false
  isLoadingEditRouter: boolean = false
  value: string = ''
  status: string = ''

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: RouterService,
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder
  ) {}

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.formEdit.controls.name.setValue(this.routerUpdate.routerName)
  }

  selectedChecked(e: any): void {
    // @ts-ignore
    this.checkedCashArray = [...e];
  }

  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.activeCreate = false;
    this.loading = true;
    this.region = region.regionId;
    console.log(this.tokenService.get()?.userId);
  }

  onProjectChange(project: ProjectModel) {
    this.activeCreate = false;
    this.loading = true;
    this.projectId = project.id;
    this.getDataList();
  }

  doSearch(value: string) {
    this.value = value
  }

  onChange(value: string) {
    this.status = value
  }

  getDataList() {
      this.formListRouter.currentPage = this.currentPage
      this.formListRouter.pageSize = this.pageSize
      this.formListRouter.routerName = this.value
      this.formListRouter.status = this.status
      this.formListRouter.regionId = this.region
      this.formListRouter.vpcId = this.projectId
      this.loading = true;
      this.dataService
        .getListRouter(this.formListRouter)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (data) => {
            if (data != null && data.records && data.records.length > 0) {
              this.activeCreate = false;
              this.dataList = data.records;
              this.total = data.totalCount;
            } else {
              this.activeCreate = true;
            }
            this.cdr.detectChanges();
          },
          error: (e) => {
            this.dataList = [];
            this.activeCreate = true;
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('router.nofitacation.load.fail')
            );
          },
        });
  }

  reloadTable() {
    this.dataList = [];
    this.getDataList();
  }

  getStatus(value: string): string {
    const foundItem = this.filterStatus.find((item) => item.value === value);

    if (foundItem) {
      return foundItem.text;
    } else {
      return value;
    }
  }

  listNetwork: NetWorkModel[] = [];

  getListNetwork(): void {
    this.dataService
      .getListNetwork(this.region, this.projectId)
      .subscribe((data: any) => {
        this.listNetwork = data;
        this.cdr.detectChanges();
      });
  }

  routerCreate: RouterCreate = new RouterCreate();
  isVisibleCreate = false;
  modalCreate() {
    this.isVisibleCreate = true;
    this.isTrigger = true;
    this.getListNetwork();
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
    this.routerCreate.networkId = ''
    this.routerCreate.routerName = ''
  }

  handleOkCreate() {

    this.isLoadingCreateRouter = true
    this.routerCreate.adminState = this.isTrigger;
    this.routerCreate.customerId = this.tokenService.get()?.userId;
    this.routerCreate.regionId = this.region;
    this.routerCreate.projectId = this.projectId;
    this.dataService.createRouter(this.routerCreate).subscribe({
      next: (data) => {
        this.isLoadingCreateRouter = false
        this.isVisibleCreate = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('router.nofitacation.create.sucess'));
        this.getDataList();
      },
      error: (error) => {
        this.isLoadingCreateRouter = false
        this.cdr.detectChanges()
        if(error.status === 500){
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('router.alert.over.router.used'))
        }else{
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('router.nofitacation.create.fail'))
        }
      },
    });
  }

  routerUpdate: RouterUpdate = new RouterUpdate();
  isVisibleEdit = false;
  modalEdit(dataRouter: RouterModel) {
    this.isVisibleEdit = true;
    this.isTrigger = dataRouter.status.toUpperCase() == 'ACTIVE' ? true : false;
    this.cloudId = dataRouter.cloudId;
    this.routerUpdate.id = dataRouter.cloudId;
    this.routerUpdate.adminState = dataRouter.adminState;
    this.routerUpdate.customerId = this.tokenService.get()?.userId;
    this.routerUpdate.regionId = dataRouter.regionId;
    this.routerUpdate.routerName = dataRouter.routerName;
    this.routerUpdate.vpcId = dataRouter.vpcId;
    this.routerUpdate.networkId = dataRouter.networkId;
  }

  handleCancelEdit() {
    this.isVisibleEdit = false;
  }

  handleOkEdit() {
    this.isLoadingEditRouter = true
    this.dataService.updateRouter(this.routerUpdate).subscribe({
      next: (data) => {
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('router.nofitacation.edit.sucess'));
        this.isLoadingEditRouter = false
        this.isVisibleEdit = false;
        this.getDataList();
      },
      error: (e) => {
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('router.nofitacation.edit.fail')
        );
        this.isLoadingEditRouter = false
      },
    });
  }

  isVisibleDelete: boolean = false;
  nameRouterDelete: string;
  modalDelete(cloudId: string, nameRouter: string) {
    this.cloudId = cloudId;
    this.nameRouterDelete = nameRouter;
    this.isVisibleDelete = true;
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  nameRouterValidator(control: FormControl): { [key: string]: any } | null {
    const name = control.value;
    if (name !== this.nameRouterDelete) {
      return { 'nameMismatch': true };
    }
    return null;
  }

  handleOkDelete() {
    this.isLoadingDeleteRouter = true
      this.dataService
        .deleteRouter(this.cloudId, this.region, this.projectId)
        .subscribe({
          next: (data) => {
            this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('router.nofitacation.remove.sucess'));
            this.isLoadingDeleteRouter = false
            this.isVisibleDelete = false;
            this.reloadTable();
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('router.nofitacation.remove.fail')
            );
            this.isLoadingDeleteRouter = false
          },
        });
  }
}
