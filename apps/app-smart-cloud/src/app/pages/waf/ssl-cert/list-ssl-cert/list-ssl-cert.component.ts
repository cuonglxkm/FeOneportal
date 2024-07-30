import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { BaseResponse, NotificationService, ProjectModel, RegionModel } from '../../../../../../../../libs/common-utils/src';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Router } from '@angular/router';
import { VolumeService } from 'src/app/shared/services/volume.service';
import { NonNullableFormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { SSLCertService } from 'src/app/shared/services/ssl-cert.service';
import { debounceTime } from 'rxjs';

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
  response: BaseResponse<any>
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private volumeService: VolumeService,
              private fb: NonNullableFormBuilder,
              private cdr: ChangeDetectorRef,
              private notificationService: NotificationService,
              private notification: NzNotificationService,
              private SslCertService: SSLCertService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
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
    this.getListCertificate(true);
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListCertificate(false);
  }

  getListCertificate(isBegin){
    // this.isLoading = true;
    // this.customerId = this.tokenService.get()?.userId
    // this.SslCertService.getSslCert({currentPage: this.pageIndex, pageSize: this.pageSize, customerId: this.customerId, region: this.region, vpcId: this.project}).pipe((debounceTime(500))).subscribe(data =>{
    //   if(data){
    //     this.isLoading = false;
    //     this.response = data
    //     console.log('data', data)
    //     console.log('isLoading', this.isLoading)
    //   }
    // }, error => {
    //   this.isLoading = false;
    //   this.response = null;
    //   console.log(error);
    //   this.notification.error(error.statusText, this.i18n.fanyi('app.failData'))
    // })
    this.response = {
      currentPage: 1,
      pageSize: 10,
      totalCount: 100,
      previousPage: 0,
      records: [
        {
          id: 1,
          name: 'ssl.certificate.1',
          authorizedDomains:['smartcloud.vn', '*smartcloud.vn'],
          status: 'Normal',
          type: 'RSA Certificate',
          expiration: new Date(),
          associatedDomain: ['smartcloud.vn']
        },
        {
          id: 2,
          name: 'ssl.certificate.2',
          authorizedDomains:['smartcloud.vn', '*smartcloud.vn'],
          status: 'Normal',
          type: 'RSA Certificate',
          expiration: new Date(),
          associatedDomain: ['smartcloud.vn']
        }
      ]
    }
  }
}
