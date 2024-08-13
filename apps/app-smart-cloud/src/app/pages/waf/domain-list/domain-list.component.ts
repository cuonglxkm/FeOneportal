import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NonNullableFormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { BaseResponse, NotificationService } from '../../../../../../../libs/common-utils/src';
import { WafService } from 'src/app/shared/services/waf.service';
import { debug, error } from 'console';
import { SslCertDTO, UpdatePolicies, WafDomain } from '../waf.model';


@Component({
  selector: 'app-waf-domain-list',
  templateUrl: './domain-list.component.html',
  styleUrls: ['./domain-list.component.less']
})

export class WafDomainListComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  selectedValue: string;
  value: string;
  disablePolicies = false;
  
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
  copySuccess: boolean;
  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<WafDomain[]>;

  isBegin: boolean = false;

  listSslCert: SslCertDTO[]

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;
  expandSet = new Set<number>();

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private wafService: WafService,
              private notificationService: NotificationService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  onExpandChange(id: number, checked: boolean): void {
    // debugger;
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
    this.isLoading = true;

    this.wafService.getWafDomains(this.pageSize, this.pageIndex, this.selectedValue, this.value)
      .pipe(debounceTime(500))
      .subscribe({
        next: (data) => {
          if (data) {
            this.response = data;
            this.response.records.forEach(x => {
              if(!x.sysDomainInfoVO){
                x.sysDomainInfoVO={
                  customizeRuleSwitch: "OFF",
                  blockSwitch: "OFF",
                  rateLimitSwitch: "OFF",
                  whitelistSwitch: "OFF",
                  dmsDefendSwitch: "OFF",
                  intelligenceSwitch: "OFF",
                  wafDefendSwitch: "OFF",
                };
              }
            });
            this.isLoading = false;
          } else {
            this.response = null;
            this.isLoading = false;
          }
          //this.isBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
        },
        error: (error) => {
            this.isLoading = false;
            this.response = null;
            console.log(error);
            this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
          }}
      );

  }

  getListSslCert(){
    this.wafService.getListSslCert('', 999, 1).subscribe((res) => {
      this.listSslCert = res?.records
    }, (error) => {
      console.log(error);     
    })
  }

  onOkCreateSslCert(){
    this.getListSslCert()
  }

  navigateToCreateWaf() {
      this.router.navigate(['/app-smart-cloud/waf/create']);
  }
  
  
  navigateToAddDomain() {
    this.router.navigate(['/app-smart-cloud/waf/add-domain']);
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

  backPolicy(event, policyType:string, data){
    switch(policyType) {
      case "blockSwitch":
        data.sysDomainInfoVO.blockSwitch = event ? "ON" : "OFF";
        break;
      case "dmsDefendSwitch":
        data.sysDomainInfoVO.dmsDefendSwitch = event ? "ON" : "OFF";
        break;
      case "wafDefendSwitch":
        data.sysDomainInfoVO.wafDefendSwitch = event ? "ON" : "OFF";
        break;
      case "intelligenceSwitch":
        data.sysDomainInfoVO.intelligenceSwitch = event ? "ON" : "OFF";
        break;
      case "rateLimitSwitch":
        data.sysDomainInfoVO.rateLimitSwitch = event ? "ON" : "OFF";
        break;
      case "customizeRuleSwitch":
        data.sysDomainInfoVO.customizeRuleSwitch = event ? "ON" : "OFF";
        break;  
      case "whitelistSwitch":
        data.sysDomainInfoVO.whitelistSwitch = event ? "ON" : "OFF";
        break;
      default:
        // code block
    }
  }

  changePolicy(event: any, policyType:string, data){
    this.isLoading = true;
    var updateData: UpdatePolicies = {};
    switch(policyType) {
      case "blockSwitch":
        data.sysDomainInfoVO.blockSwitch = event ? "ON" : "OFF";
        updateData.iPGeoBlock = event;
        break;
      case "dmsDefendSwitch":
        data.sysDomainInfoVO.dmsDefendSwitch = event ? "ON" : "OFF";
        updateData.ddos = event;
        break;
      case "wafDefendSwitch":
        data.sysDomainInfoVO.wafDefendSwitch = event ? "ON" : "OFF";
        updateData.waf = event;
        break;
      case "intelligenceSwitch":
        data.sysDomainInfoVO.intelligenceSwitch = event ? "ON" : "OFF";
        updateData.threatIntelligence = event;
        break;
      case "rateLimitSwitch":
        data.sysDomainInfoVO.rateLimitSwitch = event ? "ON" : "OFF";
        updateData.rateLimit = event;
        break;
      case "customizeRuleSwitch":
        data.sysDomainInfoVO.customizeRuleSwitch = event ? "ON" : "OFF";
        updateData.customRules = event;
        break;  
      case "whitelistSwitch":
        data.sysDomainInfoVO.whitelistSwitch = event ? "ON" : "OFF";
        updateData.whiteList = event;
        break;
      default:
        // code block
    }
    this.wafService.updatePolicies(data.id,updateData).subscribe({
      next: (data) => {
          this.isLoading = false;
          this.getListWafDomain();
        },
      error: (error) => {
          this.isLoading = false;
          this.backPolicy(!event,policyType,data);
          this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
        }
      }
    );
  }

  copy(text){
    if(this.copySuccess) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 500);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });;
  }

  ngOnInit() {
    this.selectedValue = this.options[0].value;
    this.onChangeInputChange();
    this.getListWafDomain();
    this.getListSslCert()
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
            this.getListWafDomain();
            break;
        }
      }
    });
  }
}
