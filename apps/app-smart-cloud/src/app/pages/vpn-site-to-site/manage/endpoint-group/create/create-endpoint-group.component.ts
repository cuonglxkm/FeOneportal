import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import {
  FormCreateEndpointGroup,
  FormListSubnetResponse,
} from 'src/app/shared/models/endpoint-group';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EndpointGroupService } from 'src/app/shared/services/endpoint-group.service';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { VpnSiteToSiteService } from 'src/app/shared/services/vpn-site-to-site.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { CIDR_REGEX } from 'src/app/shared/constants/constants';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-create-endpoint-group',
  templateUrl: './create-endpoint-group.component.html',
  styleUrls: ['./create-endpoint-group.component.less'],
})
export class CreateEndpointGroupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  listSubnets: FormListSubnetResponse[];
  subnetId = [];
  subnetCidr = [];
  listCidrInfo = [];
  type = [
    { label: 'Subnet(for local system)', value: 'subnet' },
    { label: 'Cidr(for external system)', value: 'cidr' },
  ];
  checked: boolean = false
  selectedType = 'cidr';
  isLoading: boolean = false;
  routerId: string
  routerName: string
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  formCreateEndpointGroup: FormCreateEndpointGroup =
    new FormCreateEndpointGroup();
  form: FormGroup<{
    name: FormControl<string>;
    endpointsCidr: FormControl<string>;

  }> = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,49}$/),
      ],
    ],
    endpointsCidr: [
      '',
      [
        Validators.required,
        Validators.pattern(
          new RegExp(
            CIDR_REGEX
        )
        ),
      ],
    ],
  });

  getData(): any {
    this.formCreateEndpointGroup.customerId = this.tokenService.get()?.userId;
    this.formCreateEndpointGroup.regionId = this.region;
    this.formCreateEndpointGroup.vpcId = this.project;
    this.formCreateEndpointGroup.name = this.form.controls.name.value;
    this.formCreateEndpointGroup.description = '';
    this.formCreateEndpointGroup.type = this.selectedType;
    this.formCreateEndpointGroup.endpoints =
      this.selectedType === 'cidr'
        ? this.form.controls.endpointsCidr.value.split(',').map(item => item.trim())
        : this.subnetId;
    return this.formCreateEndpointGroup;
  }

  getVpns2s() {
    this.vpnSiteToSiteService.getVpnSiteToSite(this.project)
      .subscribe(data => {
        if(data){   
          this.routerId = data.body.routerId      
          this.routerName = data.body.routerName      
        }
     
    }, error => {
      this.notification.error(
        'Thất bại',
        'Lấy routerId thất bại'
      );
    })
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.getListSubnet();
    this.getVpns2s()
  }

  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder,
    private notification: NzNotificationService,
    private endpointGroupService: EndpointGroupService,
    private vpnSiteToSiteService: VpnSiteToSiteService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  handleChangeType(event: any){
    console.log(event);
    console.log(this.form.controls.endpointsCidr.value);
    this.form.controls.endpointsCidr.clearValidators();
    this.form.controls.endpointsCidr.markAsPristine();
    this.form.controls.endpointsCidr.reset();
    if(event === 'cidr'){
      this.listCidrInfo = []
      this.subnetId = [];
      this.form.controls.endpointsCidr.reset();
      this.form.controls.endpointsCidr.setValidators([
        Validators.required,
        Validators.pattern(
          new RegExp(
            '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}0\\/24(,\\s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}0\\/24)*$'
        )
        ),
      ]);
      this.form.controls.endpointsCidr.updateValueAndValidity();
    }
  }

  handleCreate() {
    this.isLoading = true;
    if (this.form.valid) {
      if(this.selectedType === 'subnet' && this.subnetId.length === 0){
        this.notification.warning(
          this.i18n.fanyi('app.status.warning'),
          this.i18n.fanyi('app.endpoint-create.choose.subnet')
        );
        this.isLoading = false;
      }else{
        this.formCreateEndpointGroup = this.getData();
      console.log(this.formCreateEndpointGroup);
      this.endpointGroupService.create(this.formCreateEndpointGroup).subscribe(
        (data) => {
          this.isLoading = false;
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.endpoint-create.success')
          );
          this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
        },
        (error) => {
          this.isLoading = false;
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.endpoint-create.fail')
          );
          console.log(error);
        }
      );
      }
    }
  }

  log(value: string[]): void {
    this.listCidrInfo = value;
    this.subnetId = [];

    for (const cidr of value) {
      const selectedSubnet = this.listSubnets.find(
        (subnet) => subnet.cidr === cidr
      );

      if (selectedSubnet) {
        this.subnetId.push(selectedSubnet.id);
      }
    }
  }

  getListSubnet() {
    this.endpointGroupService
      .listSubnetEndpointGroup(this.project, this.region)
      .subscribe((data: FormListSubnetResponse[]) => {
        this.listSubnets = data;
        this.listSubnets.map((subnet) => {
          this.subnetCidr.push(subnet.cidr);
        });
      });
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }

  userChangeProject(){
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

}



