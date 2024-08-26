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
  FormEditIpsecPolicy,
  FormSearchIpsecPolicy,
  IpsecPolicyDetail
} from 'src/app/shared/models/ipsec-policy';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { IpsecPolicyService } from 'src/app/shared/services/ipsec-policy.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NAME_SPECIAL_REGEX } from 'src/app/shared/constants/constants';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-edit-ipsec-policies',
  templateUrl: './edit-ipsec-policies.component.html',
  styleUrls: ['./edit-ipsec-policies.component.less'],
})
export class EditIpsecPoliciesComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  formSearchIpsecPolicy: FormSearchIpsecPolicy = new FormSearchIpsecPolicy()
  nameList: string[] = [];

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
  lifeTimeValue: number = 3600;
  formEditIpsecPolicy: FormEditIpsecPolicy = new FormEditIpsecPolicy();
  ipsecPolicy: IpsecPolicyDetail = new IpsecPolicyDetail();


  form: FormGroup<{
    name: FormControl<string>;
    lifeTimeValue: FormControl<number>;
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(NAME_SPECIAL_REGEX)]],
    lifeTimeValue: [3600, [Validators.required]]
  });
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.getIpsecPolicyById(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getListIPsecPolicies()
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

  getListIPsecPolicies() {
    this.formSearchIpsecPolicy.vpcId = this.project
    this.formSearchIpsecPolicy.regionId = this.region
    this.formSearchIpsecPolicy.name = ''
    console.log("get data");
    console.log(this.formSearchIpsecPolicy);
    this.formSearchIpsecPolicy.pageSize = 99999
    this.formSearchIpsecPolicy.currentPage = 1
  this.ipsecPolicyService.getIpsecpolicy(this.formSearchIpsecPolicy)
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
          if (error.error.detail.includes('could not be found')) {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              'Bản ghi không tồn tại'
            );
            this.router.navigateByUrl('/app-smart-cloud/vpn-site-to-site')
          }
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
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.ipsec.policy-edit.success')
            );
            this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
          },
          (error) => {
            this.isLoading = false
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.ipsec.policy-edit.fail')
            );
            console.log(error);
          }
        );
    }
  }
}
