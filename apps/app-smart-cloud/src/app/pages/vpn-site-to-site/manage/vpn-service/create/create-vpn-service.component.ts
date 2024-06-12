import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { FormCreateVpnService } from 'src/app/shared/models/vpn-service';
import { VpnSiteToSiteDTO } from 'src/app/shared/models/vpn-site-to-site';
import { VpnServiceService } from 'src/app/shared/services/vpn-service.service';
import { VpnSiteToSiteService } from 'src/app/shared/services/vpn-site-to-site.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NAME_SPECIAL_REGEX } from 'src/app/shared/constants/constants';


@Component({
  selector: 'one-portal-create-vpn-service',
  templateUrl: './create-vpn-service.component.html',
  styleUrls: ['./create-vpn-service.component.less'],
})
export class CreateVpnServiceComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  routerName: string
  response: VpnSiteToSiteDTO
  isLoading: boolean = false
  formCreateVpnService: FormCreateVpnService =new FormCreateVpnService();
  form: FormGroup<{
    name: FormControl<string>;
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(NAME_SPECIAL_REGEX)]],
  });


  getData(): any {
    this.formCreateVpnService.customerId =
      this.tokenService.get()?.userId;
    this.formCreateVpnService.regionId = this.region;
    this.formCreateVpnService.projectId = this.project;
    this.formCreateVpnService.name =
      this.form.controls.name.value;
    this.formCreateVpnService.routerId = this.response?.routerId;

    return this.formCreateVpnService;
  }


  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.routerName = this.tokenService.get()?.name + 'VPN_Router';
    this.getDataVpnSitetoSite()
  }

  getDataVpnSitetoSite() {
    this.vpnSiteToSiteService.getVpnSiteToSite(this.project)
      .subscribe(data => {
        if(data){
          this.response = data.body  
        }
    }, error => {
      this.response = null;
      console.log(this.response);
    })
  }


  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder,
    private notification: NzNotificationService,
    private vpnSiteToSiteService: VpnSiteToSiteService,
    private vpnServiceService: VpnServiceService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  handleCreate() {
    this.isLoading = true;
    if (this.form.valid) {
      this.formCreateVpnService = this.getData();
      console.log(this.formCreateVpnService);
      this.vpnServiceService
        .create(this.formCreateVpnService)
        .subscribe(
          (data) => {
            this.isLoading = false
            this.notification.success(
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.vpn-service-create.success')
            );
            this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
          },
          (error) => {
            this.isLoading = false
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.vpn-service-create.fail')
            );
            console.log(error);
          }
        );
    }
    
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }

  userChangeProject(){
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }
}
