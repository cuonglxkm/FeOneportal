import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
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
import { SslCertDTO } from '../../waf.model';
import { WafService } from 'src/app/shared/services/waf.service';

@Component({
  selector: 'one-portal-list-ssl-cert',
  templateUrl: './list-ssl-cert.component.html',
  styleUrls: ['./list-ssl-cert.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListSslCertComponent {
  isLoading: boolean = true;
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isBegin: boolean = false;
  typeVPC: number;
  isFirstVisit: boolean = true;

  customerId: number;
  pageSize: number = 10;
  pageIndex: number = 1;
  response: BaseResponse<SslCertDTO[]>;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private router: Router,
    private volumeService: VolumeService,
    private fb: NonNullableFormBuilder,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private notification: NzNotificationService,
    private SslCertService: SSLCertService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private wafService: WafService
  ) {}

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
          this.getListCertificate();
        }
      });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    this.getListCertificate()
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    setTimeout(() => {
      // this.getListVolume(true);
    }, 2500);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.isFirstVisit = false;
    this.project = project?.id;
    this.typeVPC = project?.type;
    this.isLoading = true;
    this.getListCertificate();
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListCertificate();
  }

  getListCertificate() {
    this.isLoading = true;
    this.wafService.getListSslCert('', this.pageIndex, this.pageIndex).pipe(finalize(()=>{
      this.isLoading = false
    })).subscribe({
      next:(data)=>{
        this.response = data
      },
      error:(error)=>{
        this.response = null;
        console.log(error);
        this.notification.error(error.statusText, this.i18n.fanyi('app.failData'))
      }
    })
  }

  navigateToDetail(id: number){
    this.router.navigate([`/app-smart-cloud/waf/ssl-cert/${id}`])
  }
}
