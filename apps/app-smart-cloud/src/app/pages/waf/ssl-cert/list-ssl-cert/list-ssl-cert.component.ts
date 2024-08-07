import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  BaseResponse,
  NotificationService,
  ProjectModel,
  RegionModel,
} from '../../../../../../../../libs/common-utils/src';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Router } from '@angular/router';
import { VolumeService } from 'src/app/shared/services/volume.service';
import { NonNullableFormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { SSLCertService } from 'src/app/shared/services/ssl-cert.service';
import { debounceTime, finalize, Subject, Subscription } from 'rxjs';
import { AssociatedDomainDTO, SslCertDTO } from '../../waf.model';
import { WafService } from 'src/app/shared/services/waf.service';

@Component({
  selector: 'one-portal-list-ssl-cert',
  templateUrl: './list-ssl-cert.component.html',
  styleUrls: ['./list-ssl-cert.component.less'],
})
export class ListSslCertComponent implements OnInit {
  isLoadingList: boolean = false;

  isBegin: boolean = false;
  typeVPC: number;
  isFirstVisit: boolean = true;

  customerId: number;
  pageSize: number = 10;
  pageIndex: number = 1;
  response: BaseResponse<SslCertDTO[]>;

  searchParam: string = ''

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private router: Router,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private wafService: WafService
  ) {}

  dataSubjectSearchParam: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;

  ngOnInit(): void {
      this.getListCertificate()
  }

  onPageSizeChange(value) {
    this.pageSize = value;
    this.getListCertificate();
  }

  changeInputChange(evet: Event) {
    const value = (event.target as HTMLInputElement).value
    this.enterPressed = false;
    this.dataSubjectSearchParam.next(value);
  }

  onChangeInputChange() {
    this.searchSubscription = this.dataSubjectSearchParam
      .pipe(debounceTime(700))
      .subscribe((res) => {
        if (!this.enterPressed) {
          this.searchParam = res.trim()
          this.getListCertificate();
        }
      });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    const value = (event.target as HTMLInputElement).value
    this.searchParam = value.trim()
    this.getListCertificate()
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListCertificate();
  }

  getListCertificate() {
    this.isLoadingList = true;
    this.wafService.getListSslCert(this.searchParam, this.pageSize, this.pageIndex).subscribe({
      next:(data)=>{
        this.isLoadingList = false
        this.response = data
      },
      error:(error)=>{
        this.response = null;
        this.isLoadingList = false
        this.notification.error(error.statusText, this.i18n.fanyi('app.failData'))
      }
    })
  }

  navigateToDetail(id: number){
    this.router.navigate([`/app-smart-cloud/waf/ssl-cert/${id}`])
  }

  navigateToCreateSsl(){
    this.router.navigate(["/app-smart-cloud/waf/ssl-cert/create"])
  }

  getListAssociatedDomains(domains: AssociatedDomainDTO[]){
    if(domains.length){
      return domains?.map(item => item.domainName)?.join(", ")
    }
    return "_"
  }

  onOkAction(){
    this.getListCertificate()
  }
}
