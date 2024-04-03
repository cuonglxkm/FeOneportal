import { Component, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  FormEditIpsecPolicy,
  IpsecPolicyDetail
} from 'src/app/shared/models/ipsec-policy';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { IpsecPolicyService } from 'src/app/shared/services/ipsec-policy.service';

@Component({
  selector: 'one-portal-edit-ipsec-policies',
  templateUrl: './edit-ipsec-policies.component.html',
  styleUrls: ['./edit-ipsec-policies.component.less'],
})
export class EditIpsecPoliciesComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  ipsecPolicy: IpsecPolicyDetail = new IpsecPolicyDetail();
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

  lifetimeUnits = [{ label: 'seconds', value: 'seconds' }];

  perfectForwardSecrecy = [
    { label: 'group5', value: 'group5' },
    { label: 'group14 ', value: 'group14' },
  ];

  transformProtocol = [
    { label: 'esp', value: 'esp' },
    { label: 'ah', value: 'ah' },
    { label: 'ah-esp', value: 'ah-esp' },
  ];

  selectedAuthorizationAlgorithm: string;
  selectedEncryptionMode: string;
  selectedEncryptionAlgorithm: string;
  selectedPerfectForwardSecrecy: string;
  selectedTransformProtocol: string;
  selectedLifetimeUnits: string;
  selectedLifetimeValue: number;
  isLoading: boolean = false;

  formEditIpsecPolicy: FormEditIpsecPolicy = new FormEditIpsecPolicy();
  form: FormGroup<{
    name: FormControl<string>;
    lifeTimeValue: FormControl<number>;
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,254}$/)]],
    lifeTimeValue: [3600, [Validators.required, Validators.min(60)]]
  });

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.getIpsecPolicyById(this.activatedRoute.snapshot.paramMap.get('id'));
  }

  getIpsecPolicyById(id) {
    this.isLoading = true;
    this.ipsecPolicyService
      .getIpsecPoliciesById(id, this.project, this.region)
      .subscribe(
        (data) => {
          this.ipsecPolicy = data;
          
          this.selectedAuthorizationAlgorithm =
            this.ipsecPolicy.authorizationAlgorithm;
          this.selectedEncryptionMode = this.ipsecPolicy.encapsulationMode;
          this.selectedEncryptionAlgorithm =
            this.ipsecPolicy.encryptionAlgorithm;
          this.selectedLifetimeUnits = this.ipsecPolicy.lifetimeUnit;
          this.selectedPerfectForwardSecrecy =
            this.ipsecPolicy.perfectForwardSecrecy;
          this.selectedTransformProtocol = this.ipsecPolicy.transformProtocol;
          this.form.controls.name.setValue(data.name);
          this.form.controls.lifeTimeValue.setValue(data.lifetimeValue);
          this.isLoading = false;
        },
        (error) => {
          this.ipsecPolicy = null;
          this.isLoading = false;
        }
      );
  }

  constructor(
    private ipsecPolicyService: IpsecPolicyService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private activatedRoute: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private notification: NzNotificationService,
  ) {}

  handleCreate() {
    console.log('success');
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }

  getData(): any {
    this.formEditIpsecPolicy.customerId = this.tokenService.get()?.userId;
    this.formEditIpsecPolicy.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.formEditIpsecPolicy.regionId = this.region;
    this.formEditIpsecPolicy.vpcId = this.project;
    this.formEditIpsecPolicy.name = this.form.controls.name.value;
    this.formEditIpsecPolicy.description = '';
    this.formEditIpsecPolicy.authorizationAlgorithm =
      this.selectedAuthorizationAlgorithm;
    this.formEditIpsecPolicy.encapsulationMode = this.selectedEncryptionMode;
    this.formEditIpsecPolicy.encryptionAlgorithm =
      this.selectedEncryptionAlgorithm;
    this.formEditIpsecPolicy.lifetimeUnit = this.selectedLifetimeUnits;
    this.formEditIpsecPolicy.lifetimeValue =
      this.form.controls.lifeTimeValue.value;
    this.formEditIpsecPolicy.perfectForwardSecrecy =
      this.selectedPerfectForwardSecrecy;
    this.formEditIpsecPolicy.transformProtocol =
      this.selectedTransformProtocol;
    return this.formEditIpsecPolicy;
  }

  handleEdit() {
    this.isLoading = true;
    if (this.form.valid) {
      this.formEditIpsecPolicy = this.getData();
      console.log(this.formEditIpsecPolicy);
      this.ipsecPolicyService
        .edit(this.activatedRoute.snapshot.paramMap.get('id'), this.formEditIpsecPolicy)
        .subscribe(
          (data) => {
            this.isLoading = false
            this.notification.success(
              'Thành công',
              'Cập nhật ipsec policy thành công'
            );
            this.router.navigate(['/app-smart-cloud/vpn-site-to-site/manage']);
          },
          (error) => {
            this.isLoading = false
            this.notification.error(
              'Thất bại',
              'Cập nhật ipsec policy thất bại'
            );
            console.log(error);
          }
        );
    }
  }
}
