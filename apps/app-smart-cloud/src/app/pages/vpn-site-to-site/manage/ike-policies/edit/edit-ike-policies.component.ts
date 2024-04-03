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
  IKEPolicyModel
} from 'src/app/shared/models/vpns2s.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { IkePolicyService } from 'src/app/shared/services/ike-policy.service';

@Component({
  selector: 'one-portal-edit-ike-policies',
  templateUrl: './edit-ike-policies.component.html',
  styleUrls: ['./edit-ike-policies.component.less'],
})
export class EditIkePoliciesComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  ikePolicy: IKEPolicyModel = new IKEPolicyModel();
  authorizationAlgorithm = [
    { label: 'sha1', value: 'sha1' },
    { label: 'sha256', value: 'sha256' },
    { label: 'sha384', value: 'sha384' },
    { label: 'sha512', value: 'sha512' },
  ];

  
  ikeVersion = [
    { label: 'v1', value: 'v1' },
    { label: 'v2', value: 'v2' },
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

 
  phase1Negotiation = [
    { label: 'main', value: 'main' },
    { label: 'aggressive', value: 'aggressive' }
  ];

  selectedAuthorizationAlgorithm: string;
  selectedIKEVersion: string;
  selectedEncryptionAlgorithm: string;
  selectedPerfectForwardSecrecy: string;
  selectedPhaseMode: string;
  selectedLifetimeUnits: string;
  selectedLifetimeValue: number;
  isLoading: boolean = false;

  formEditIkePolicy: IKEPolicyModel = new IKEPolicyModel();
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

    this.getIkePolicyById(this.activatedRoute.snapshot.paramMap.get('id'));
  }

  getIkePolicyById(id) {
    this.isLoading = true;
    this.ikePolicyService
      .getIkePolicyById(id, this.project, this.region)
      .subscribe(
        (data) => {
          this.ikePolicy = data;
          console.log("data ike get ----" ,data);
          this.selectedAuthorizationAlgorithm =
            this.ikePolicy.authorizationAlgorithm;
          this.selectedIKEVersion = this.ikePolicy.ikeVersion;
          this.selectedEncryptionAlgorithm =
            this.ikePolicy.encryptionAlgorithm;
          this.selectedLifetimeUnits = this.ikePolicy.lifetimeUnit;
          this.selectedPerfectForwardSecrecy =
            this.ikePolicy.perfectForwardSecrey;
          this.selectedPhaseMode = this.ikePolicy.ikePhase1NegotiationMode;
          this.form.controls.name.setValue(data.name);
          this.form.controls.lifeTimeValue.setValue(data.lifetimeValue);
          this.isLoading = false;
        },
        (error) => {
          this.ikePolicy = null;
          this.isLoading = false;
        }
      );
  }

  constructor(
    private ikePolicyService: IkePolicyService,
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
    this.formEditIkePolicy.customerId = this.tokenService.get()?.userId;
    this.formEditIkePolicy.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.formEditIkePolicy.regionId = this.region;
    this.formEditIkePolicy.projectId = this.project;
    this.formEditIkePolicy.name = this.form.controls.name.value;
    this.formEditIkePolicy.authorizationAlgorithm =
      this.selectedAuthorizationAlgorithm;
    this.formEditIkePolicy.ikeVersion = this.selectedIKEVersion;
    this.formEditIkePolicy.encryptionAlgorithm =
      this.selectedEncryptionAlgorithm;
    this.formEditIkePolicy.lifetimeUnit = this.selectedLifetimeUnits;
    this.formEditIkePolicy.lifetimeValue =
      this.form.controls.lifeTimeValue.value;
    this.formEditIkePolicy.perfectForwardSecrey =
      this.selectedPerfectForwardSecrecy;
    this.formEditIkePolicy.ikePhase1NegotiationMode =
      this.selectedPhaseMode;
    return this.formEditIkePolicy;
  }

  handleEdit() {
    this.isLoading = true;
    if (this.form.valid) {
      this.formEditIkePolicy = this.getData();
      console.log(this.formEditIkePolicy);
      this.ikePolicyService
        .edit(this.activatedRoute.snapshot.paramMap.get('id'), this.formEditIkePolicy)
        .subscribe(
          (data) => {
            this.isLoading = false
            this.notification.success(
              'Thành công',
              'Cập nhật ike policy thành công'
            );
            this.router.navigate(['/app-smart-cloud/vpn-site-to-site/manage']);
          },
          (error) => {
            this.isLoading = false
            this.notification.error(
              'Thất bại',
              'Cập nhật ike policy thất bại'
            );
            console.log(error);
          }
        );
    }
  }
}
