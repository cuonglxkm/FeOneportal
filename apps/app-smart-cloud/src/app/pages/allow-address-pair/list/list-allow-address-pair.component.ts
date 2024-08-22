import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import PairInfo, {
  AllowAddressPair,
  AllowAddressPairCreateOrDeleteForm,
  AllowAddressPairSearchForm,
} from 'src/app/shared/models/allow-address-pair';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { AllowAddressPairService } from '../../../shared/services/allow-address-pair.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import Pagination from '../../../shared/models/pagination';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import {
  RegionModel,
  ProjectModel,
} from '../../../../../../../libs/common-utils/src';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { I18NService } from '@core';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'list-allow-address-pair',
  templateUrl: './list-allow-address-pair.component.html',
  styleUrls: ['./list-allow-address-pair.component.less'],
})
export class ListAllowAddressPairComponent implements OnInit {
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private allowAddressPairService: AllowAddressPairService,
    private notification: NzNotificationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private commonService: CommonService
  ) {}

  portId: string;
  userId: number;

  region = JSON.parse(localStorage.getItem('regionId'));

  project = JSON.parse(localStorage.getItem('projectId'));

  validateForm: FormGroup<{
    ipAddress: FormControl<string | null>;
  }>;

  value?: string;

  formSearch: AllowAddressPairSearchForm = new AllowAddressPairSearchForm();

  isVisibleDelete = false;
  isConfirmLoading = false;

  formDeleteOrCreate: AllowAddressPairCreateOrDeleteForm =
    new AllowAddressPairCreateOrDeleteForm();

  isLoading: boolean = false;

  collection: Pagination<AllowAddressPair> = {
    previousPage: 0,
    totalCount: 0,
    records: [],
    currentPage: 1,
    pageSize: 10,
  };

  pageSize: number = 5;
  pageNumber: number = 1;

  instanceId: string;

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
  }

  userChangeProject(project: ProjectModel) {
    this.commonService.navigateAdvance('/app-smart-cloud/instances', '/app-smart-cloud/instances-advance')
    // this.router.navigate(['/app-smart-cloud/instances']);
  }

  onProjectChange(project: ProjectModel) {
    this.project = project.id;
  }

  getParam(): AllowAddressPairSearchForm {
    this.formSearch.vpcId = this.project;
    this.formSearch.region = this.region;
    this.formSearch.portId = this.portId;
    this.formSearch.pageSize = 10;
    this.formSearch.currentPage = 1;
    if (this.value === undefined) {
      this.formSearch.search = null;
    } else {
      this.formSearch.search = this.value;
    }
    return this.formSearch;
  }

  showModalDelete(): void {
    this.isVisibleDelete = true;
  }

  handleCancelDelete(): void {
    this.isVisibleDelete = false;
  }

  handleOkDelete(pairInfo: PairInfo): void {
    this.isConfirmLoading = true;
    this.formDeleteOrCreate.portId = this.portId;
    this.formDeleteOrCreate.pairInfos = [pairInfo];

    this.formDeleteOrCreate.isDelete = true;
    this.formDeleteOrCreate.region = this.region;
    this.formDeleteOrCreate.vpcId = this.project;
    this.formDeleteOrCreate.customerId = this.tokenService.get()?.userId;

    this.isVisibleDelete = false;
    ``;
    this.isLoading = true;
    this.allowAddressPairService
      .createOrDelete(this.formDeleteOrCreate)
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.notification.success(
            '',
            this.i18n.fanyi('app.notify.delete.allow.address.pair.success')
          );
          this.getAllowAddressPair(this.formSearch);
        },
        error: (e) => {
          this.isLoading = false;
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.notify.delete.allow.address.pair.fail')
          );
        },
      });
  }

  handleOkCreate() {
    this.getAllowAddressPair(this.formSearch);
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const { pageSize, pageIndex } = params;
    this.formSearch.pageSize = pageSize;
    this.formSearch.currentPage = pageIndex;
    this.getAllowAddressPair(this.formSearch);
  }

  getAllowAddressPair(formSearch: AllowAddressPairSearchForm) {
    this.isLoading = true;
    this.allowAddressPairService.search(formSearch).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.collection = data;
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('app.notify.get.list.allow.address.pair')
        );
        this.isLoading = false;
        this.collection = null;
      },
    });
  }

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId;
    this.formSearch.customerId = this.userId;
    this.portId = this.activatedRoute.snapshot.paramMap.get('portId');
    this.instanceId = this.activatedRoute.snapshot.paramMap.get('instanceId');
    this.search();
  }

  dataSubjectSearchParam: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;
  changeSearchParam(value: string) {
    this.enterPressed = false;
    this.dataSubjectSearchParam.next(value);
  }

  onChangeSearchParam() {
    this.searchSubscription = this.dataSubjectSearchParam
      .pipe(debounceTime(700))
      .subscribe((res) => {
        if (!this.enterPressed) {
          this.search();
        }
      });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    this.search();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  search() {
    this.formSearch = this.getParam();
    this.getAllowAddressPair(this.formSearch);
  }

  onInputChange(value: string) {
    this.value = value;
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  navigateToInstanceList(){
    this.commonService.navigateAdvance('/app-smart-cloud/instances', '/app-smart-cloud/instances-advance')
  }

  navigateToInstanceDetail(){
    this.commonService.navigateAdvance('/app-smart-cloud/instances/instances-detail/' + this.instanceId, '/app-smart-cloud/instances-advance/instances-detail/' + this.instanceId)
  }
}
