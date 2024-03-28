import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormCreateIpsecPolicy } from 'src/app/shared/models/ipsec-policy';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { IpsecPolicyService } from 'src/app/shared/services/ipsec-policy.service';


@Component({
  selector: 'one-portal-create-ipsec-policies',
  templateUrl: './create-ipsec-policies.component.html',
  styleUrls: ['./create-ipsec-policies.component.less'],
})
export class CreateIpsecPoliciesComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  authorizationAlgorithm = [
    { label: 'sha1', value: 'sha1' },
    { label: 'sha256', value: 'sha256' },
    { label: 'sha384', value: 'sha384' },
    { label: 'sha512', value: 'sha512' },
  ];

  encryptionMode = [
    { label: 'tunnel', value: 'tunnel' },
    { label: 'transport', value: 'transport' },
  ];

  encryptionAlgorithm = [
    { label: 'aes-128', value: 'aes-128' },
    { label: '3des', value: '3des' },
    { label: 'aes-192', value: 'aes-192' },
    { label: 'aes-256', value: 'aes-256' },
  ];

  lifetimeUnits = [
    { label: 'seconds', value: 'seconds' },
  ];

  perfectForwardSecrecy = [
    { label: 'group5', value: 'group5' },
    { label: 'group14 ', value: 'group14' },
  ];

  transformProtocol = [
    { label: 'esp', value: 'esp' },
    { label: 'ah', value: 'ah' },
    { label: 'ah-esp', value: 'ah-esp' },
  ];

  selectedAuthorizationAlgorithm = 'sha1'
  selectedEncryptionMode = 'tunnel'
  selectedEncryptionAlgorithm = 'aes-128'
  selectedPerfectForwardSecrecy = 'group5'
  selectedTransformProtocol = 'esp'
  selectedLifetimeUnits = 'seconds'
  isLoading: boolean = false
  formCreateIpsecPolicy: FormCreateIpsecPolicy =new FormCreateIpsecPolicy();
  form: FormGroup<{
    name: FormControl<string>;
    lifeTimeValue: FormControl<number>
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,254}$/)]],
    lifeTimeValue: [3600, [Validators.required, Validators.min(60)]]
  });


  getData(): any {
    this.formCreateIpsecPolicy.customerId =
      this.tokenService.get()?.userId;
    this.formCreateIpsecPolicy.regionId = this.region;
    this.formCreateIpsecPolicy.vpcId = this.project;
    this.formCreateIpsecPolicy.name =
      this.form.controls.name.value;
    this.formCreateIpsecPolicy.description = "";
    this.formCreateIpsecPolicy.authorizationAlgorithm = this.selectedAuthorizationAlgorithm
    this.formCreateIpsecPolicy.encapsulationMode = this.selectedEncryptionMode;
    this.formCreateIpsecPolicy.encryptionAlgorithm = this.selectedEncryptionAlgorithm;
    this.formCreateIpsecPolicy.lifetimeUnit = this.selectedLifetimeUnits
    this.formCreateIpsecPolicy.lifetimeValue = this.form.controls.lifeTimeValue.value
    this.formCreateIpsecPolicy.perfectForwardSecrecy = this.selectedPerfectForwardSecrecy
    this.formCreateIpsecPolicy.transformProtocol = this.selectedTransformProtocol
    return this.formCreateIpsecPolicy;
  }


  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }


  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder,
    private notification: NzNotificationService,
    private ipsecPolicyService: IpsecPolicyService
  ) {}

  handleCreate() {
    this.isLoading = true;
    if (this.form.valid) {
      this.formCreateIpsecPolicy = this.getData();
      console.log(this.formCreateIpsecPolicy);
      this.ipsecPolicyService
        .create(this.formCreateIpsecPolicy)
        .subscribe(
          (data) => {
            this.isLoading = false
            this.notification.success(
              'Thành công',
              'Tạo mới ipsec policy thành công'
            );
            this.router.navigate(['/app-smart-cloud/vpn-site-to-site/manage']);
          },
          (error) => {
            this.isLoading = false
            this.notification.error(
              'Thất bại',
              'Tạo mới ipsec policy thất bại'
            );
            console.log(error);
          }
        );
    }
    
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }
}
