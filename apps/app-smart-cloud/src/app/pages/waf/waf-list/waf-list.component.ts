import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NonNullableFormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { BaseResponse, NotificationService } from '../../../../../../../libs/common-utils/src';
import { WafDetailDTO } from '../waf.model';
import { WafService } from 'src/app/shared/services/waf.service';
import { PolicyService } from 'src/app/shared/services/policy.service';

@Component({
  selector: 'app-waf-list',
  templateUrl: './waf-list.component.html',
  styleUrls: ['./waf-list.component.less']
})

export class WafListComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  selectedValue: string;
  value: string;

  options = [
    { label: this.i18n.fanyi('app.status.all'), value: '' },
    { label: this.i18n.fanyi('service.status.active'), value: 'ACTIVE' },
    { label: this.i18n.fanyi('app.suspend'), value: 'SUSPENDED' },
  ];

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<WafDetailDTO[]>;

  isBegin: boolean = false;

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;
  isCreateWaf: boolean;
  isCreateWafDomain: boolean;


  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private wafService: WafService,
              private fb: NonNullableFormBuilder,
              private cdr: ChangeDetectorRef,
              private notificationService: NotificationService,
              private notification: NzNotificationService,
              private policyService: PolicyService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }


  isFirstVisit: boolean = true;
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  changeInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.enterPressed = false;
    this.dataSubjectInputSearch.next(value);
  }

  onChangeInputChange() {
    this.searchSubscription = this.dataSubjectInputSearch.pipe(
      debounceTime(700)
    ).subscribe(res => {
      if (!this.enterPressed) {
        this.value = res.trim();
        this.getListWaf();
      }
    });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    const value = (event.target as HTMLInputElement).value;
    this.value = value.trim();
    this.getListWaf();
  }

  onChange(value) {
    this.selectedValue = value;
    this.getListWaf();
  }

  onPageSizeChange(value) {
    this.pageSize = value;
    this.getListWaf();
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListWaf();
  }

  wafInstance: string = '';

  getListWaf() {
    this.isLoading = true;

    this.wafService.getWafs(this.pageSize, this.pageIndex, this.selectedValue, this.value, null)
      .pipe(debounceTime(500))
      .subscribe({
        next: data => {
          if (data) {
            this.isLoading = false;
            this.response = data;
          } else {
            this.isLoading = false;
            this.response = null;
          }

          this.isBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
        },
        error :error => {
          this.isLoading = false;
          this.response = null;
          console.log(error);
          this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
        }});
  }

  navigateToCreateWaf() {
      this.router.navigate(['/app-smart-cloud/waf/create']);
  }
  
  
  navigateToAddDomain(data: WafDetailDTO) {
    if(data.status === 'ACTIVE' && data.quotaDomain > data.domainTotal) {
      return this.router.navigate([`/app-smart-cloud/waf/add-domain`], {queryParams: {wafId: data.id}});
    }
  }

  //delete
  handleOkDelete() {
    this.getListWaf();
  }

  //update
  handleOkUpdate() {
    this.getListWaf();
  }

  //create schedule snapshot
  navigateToCreateScheduleSnapshot(idWaf: number) {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create', { wafId: idWaf }], { queryParams: { snapshotTypeCreate: 0 } });
  }


  ngOnInit() {
    this.selectedValue = this.options[0].value;
    this.onChangeInputChange();
    this.getListWaf();
    this.notificationService.connection.on('UpdateWafDomain', (message) => {
      if (message) {
        switch (message.actionType) {
          case 'CREATING':
          case 'CREATED':
          case 'RESIZING':
          case 'RESIZED':
          case 'EXTENDING':
          case 'EXTENDED':
          case 'DELETED':
          case 'DELETING':
            this.getListWaf();
            break;
        }
      }
    });
    this.checkPermission();
  }

  checkPermission() {
    this.isCreateWaf = this.policyService.hasPermission("order:Create") &&
      this.policyService.hasPermission("order:GetOrderAmount") &&
      this.policyService.hasPermission("waf:WafCertificateList") &&
      this.policyService.hasPermission("payment:Get") &&
      this.policyService.hasPermission("configuration:Get") &&
      this.policyService.hasPermission("offer:Search") &&
      this.policyService.hasPermission("order:Get");
    this.isCreateWafDomain = 
      this.policyService.hasPermission("waf:WafDomainCreate") &&
      this.policyService.hasPermission("waf:WafCertificateList") && 
      this.policyService.hasPermission("waf:List");
  }
}
