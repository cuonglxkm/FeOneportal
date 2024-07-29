import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NonNullableFormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { BaseResponse, NotificationService } from '../../../../../../../libs/common-utils/src';

export class WafDomainDTO{
  id: number;
  domain: string;
  ip: string;
  cname: string;
  https: string;
  package: string;
  wafName: string;
  status: string;
}

@Component({
  selector: 'app-waf-domain-list',
  templateUrl: './domain-list.component.html',
  styleUrls: ['./domain-list.component.less']
})

export class WafDomainListComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  selectedValue: string;
  value: string;

  options = [
    { label: this.i18n.fanyi('app.status.all'), value: '' },
    { label: this.i18n.fanyi('service.status.active'), value: 'ACTIVE' },
    { label: this.i18n.fanyi('app.suspend'), value: 'SUSPENDED' },
  ];

  policies = [
    {name:"IP / Geo Block", value: true},
    {name:"DDos Protection", value: true},
    {name:"WAF", value: true},
    {name:"Threat Intel", value: false},
    {name:"Rate Limiting", value: true},
    {name:"Custom rules", value: true},
    {name:"Whitelist", value: true}
  ]

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<WafDomainDTO[]>;

  isBegin: boolean = false;

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;
  expandSet = new Set<number>();
  

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              //private wafService: WafService,
              private notificationService: NotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  onExpandChange(id: number, checked: boolean): void {
    debugger;
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

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
        this.getListWafDomain();
      }
    });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    const value = (event.target as HTMLInputElement).value;
    this.value = value.trim();
    this.getListWafDomain();
  }

  onChange(value) {
    this.selectedValue = value;
    this.getListWafDomain();
  }

  onPageSizeChange(value) {
    this.pageSize = value;
    this.getListWafDomain();
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListWafDomain();
  }

  getListWafDomain() {
    //this.isLoading = true;

    // this.wafService.getWafs(this.customerId, this.project,
    //   this.region, this.pageSize, this.pageIndex, this.selectedValue, this.value)
    //   .pipe(debounceTime(500))
    //   .subscribe(data => {
    //     if (data) {
    //       this.isLoading = false;
    //       this.response = data;
    //     } else {
    //       this.isLoading = false;
    //       this.response = null;
    //     }
    //     if (isBegin) {
    //       this.isBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
    //     }
    //   }, error => {
    //     this.isLoading = false;
    //     this.response = null;
    //     console.log(error);
    //     this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
    //   });

    this.response = {
      currentPage: 1,
      pageSize: 10,
      totalCount: 100,
      previousPage: 0,
      records: [{
        id: 1,
        domain: "cuongpv.it",
        ip: "1.1.1.1",
        cname: "cuongpv.it.cdn",
        https: "enable",
        package: "CSM",
        wafName: "waf_01",
        status: "Succes",
      }]
    }
    this.isLoading=false;
  }

  navigateToCreateWaf() {
      this.router.navigate(['/app-smart-cloud/waf/create']);
  }
  
  
  navigateToAddDomain() {
    this.router.navigate(['/app-smart-cloud/waf/create-domain']);
  }

  //delete
  handleOkDelete() {
    this.getListWafDomain();
  }

  //update
  handleOkUpdate() {
    this.getListWafDomain();
  }

  //create schedule snapshot
  navigateToCreateScheduleSnapshot(idWaf: number) {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create', { wafId: idWaf }], { queryParams: { snapshotTypeCreate: 0 } });
  }


  ngOnInit() {
    this.selectedValue = this.options[0].value;
    this.onChangeInputChange();
    this.getListWafDomain();
    this.notificationService.connection.on('UpdateWaf', (message) => {
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
            this.getListWafDomain();
            break;
        }
      }
    });
  }
}