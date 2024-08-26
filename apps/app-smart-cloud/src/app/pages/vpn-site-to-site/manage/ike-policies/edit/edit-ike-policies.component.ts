import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
  FormSearchIKEPolicy,
  IKEPolicyModel
} from 'src/app/shared/models/vpns2s.model';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { IkePolicyService } from 'src/app/shared/services/ike-policy.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NAME_SPECIAL_REGEX } from 'src/app/shared/constants/constants';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-edit-ike-policies',
  templateUrl: './edit-ike-policies.component.html',
  styleUrls: ['./edit-ike-policies.component.less'],
})
export class EditIkePoliciesComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  ikePolicy: IKEPolicyModel = new IKEPolicyModel();
  formSearchIkePolicy: FormSearchIKEPolicy = new FormSearchIKEPolicy()
  nameList: string[] = [];
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
    { label: 'group2', value: 'group2' },
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
  lifeTimeValue: number = 3600;
  formEditIkePolicy: IKEPolicyModel = new IKEPolicyModel();
  form: FormGroup<{
    name: FormControl<string>;
    lifeTimeValue: FormControl<number>;
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(NAME_SPECIAL_REGEX), this.duplicateNameValidator.bind(this)]],
    lifeTimeValue: [3600, [Validators.required]]
  });

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.getIkePolicyById(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getListIKEPolicies()
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
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(
    private ikePolicyService: IkePolicyService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private activatedRoute: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  handleCreate() {
    console.log('success');
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

  onKeyDown(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    const currentValue = inputElement.value;
  
    // Cho phép các phím đặc biệt
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];
  
    // Kiểm tra nếu phím không phải là số, không phải các phím đặc biệt, hoặc là số 0 ở đầu
    if (
      (!allowedKeys.includes(key) && isNaN(Number(key))) ||
      (key === '0' && currentValue.length === 0)
    ) {
      event.preventDefault();
      // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value + event.key);
    if (value < 1 && event.key !== 'Backspace' && event.key !== 'Delete') {
      event.preventDefault();
    }
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  getListIKEPolicies() {
    this.formSearchIkePolicy.projectId = this.project
    this.formSearchIkePolicy.regionId = this.region
    this.formSearchIkePolicy.searchValue = ''
    console.log("get data");
    console.log(this.formSearchIkePolicy);
    this.formSearchIkePolicy.pageSize = 99999
    this.formSearchIkePolicy.pageNumber = 1
  this.ikePolicyService.getIKEpolicy(this.formSearchIkePolicy)
    .subscribe((data) => {
        data.records.forEach((item) => {
          if (this.nameList.length > 0) {
            this.nameList.push(item.name);
          } else {
            this.nameList = [item.name];
          }
        });
      },
      (error) => {
        this.nameList = null;
      }
    );
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
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.ike.policy-edit.success')
            );
            this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
          },
          (error) => {
            this.isLoading = false
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.ike.policy-edit.fail')
            );
            console.log(error);
          }
        );
    }
  }
}
