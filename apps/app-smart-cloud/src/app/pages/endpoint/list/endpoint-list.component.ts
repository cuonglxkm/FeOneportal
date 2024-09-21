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
import { EndpointSmartIR } from '../endpoint.model';
import { EndpointService } from 'src/app/shared/services/endpoint.service';

@Component({
  selector: 'app-endpoint-list',
  templateUrl: './endpoint-list.component.html',
  styleUrls: ['./endpoint-list.component.less']
})

export class EndpointListComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  selectedValue: string;
  value: string;

  options = [
    { label: this.i18n.fanyi('app.status.all'), value: '' },
    { label: this.i18n.fanyi('service.status.success'), value: 'ACTIVE' },
    { label: this.i18n.fanyi('service.status.fail'), value: 'ERROR' },
  ];

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<EndpointSmartIR[]>;

  isBegin: boolean = false;

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;


  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private endpointService: EndpointService,
              private notificationService: NotificationService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }


  isFirstVisit: boolean = true;
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  changeInputChange(event: Event) {
    this.pageIndex = 1;
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
        this.getListEndpoint();
      }
    });
  }

  onEnter(event: Event) {
    this.pageIndex = 1;
    event.preventDefault();
    this.enterPressed = true;
    const value = (event.target as HTMLInputElement).value;
    this.value = value.trim();
    this.getListEndpoint();
  }

  onChange(value) {
    this.pageIndex = 1;
    this.selectedValue = value;
    this.getListEndpoint();
  }

  onPageSizeChange(value) {
    this.pageSize = value;
    this.getListEndpoint();
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListEndpoint();
  }

  wafInstance: string = '';

  getListEndpoint() {
    this.isLoading = true;
    this.endpointService.getEndpoints(this.pageSize, this.pageIndex, this.selectedValue, this.value)
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

  navigateToCreateEndpoint() {
      this.router.navigate(['/app-smart-cloud/endpoint/create']);
  }
  
  
  // navigateToAddDomain(data: WafDetailDTO) {
  //   if(data.status === 'ACTIVE' && data.quotaDomain > data.domainTotal) {
  //     return this.router.navigate([`/app-smart-cloud/waf/add-domain`], {queryParams: {wafId: data.id}});
  //   }
  // }

  //delete
  handleOkDelete() {
    this.getListEndpoint();
  }

  //update
  handleOkUpdate() {
    this.getListEndpoint();
  }

  //create schedule snapshot
  navigateToCreateScheduleSnapshot(idWaf: number) {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create', { wafId: idWaf }], { queryParams: { snapshotTypeCreate: 0 } });
  }


  ngOnInit() {
    this.selectedValue = this.options[0].value;
    this.onChangeInputChange();
    this.getListEndpoint();
    this.notificationService.connection.on('UpdateEndpoint', (message) => {
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
            this.getListEndpoint();
            break;
        }
      }
    });
  }
}
