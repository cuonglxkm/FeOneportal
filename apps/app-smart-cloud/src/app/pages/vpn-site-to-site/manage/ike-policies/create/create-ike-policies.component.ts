import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { FormSearchIKEPolicy, IKEPolicyModel} from 'src/app/shared/models/vpns2s.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { IkePolicyService } from 'src/app/shared/services/ike-policy.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NAME_SPECIAL_REGEX } from 'src/app/shared/constants/constants';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-create-ike-policies',
  templateUrl: './create-ike-policies.component.html',
  styleUrls: ['./create-ike-policies.component.less'],
})
export class CreateIkePoliciesComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  ikePolicyModel: IKEPolicyModel = {
    id: null,
    name: null,
    encryptionAlgorithm: 'aes-128',
    authorizationAlgorithm: 'sha1',
    ikeVersion: 'v1',
    lifetimeUnit: 'seconds',
    lifetimeValue: 3600,
    perfectForwardSecrey: 'group5',
    ikePhase1NegotiationMode: 'main',
    regionId: 0,
    customerId: 0,
    projectId: 0
  };
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

  lifetimeUnit = [
    { label: 'seconds', value: 'seconds' },
  ];

  perfectForwardSecrey = [
    { label: 'group5', value: 'group5' },
    { label: 'group2', value: 'group2' },
    { label: 'group14 ', value: 'group14' },
  ];

  phase1Negotiation = [
    { label: 'main', value: 'main' },
    { label: 'aggressive', value: 'aggressive' }
  ];
  isLoading: boolean = false


  form: FormGroup<{
    name: FormControl<string>
    description: FormControl<string>
    lifetimeValue: FormControl<number>
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(NAME_SPECIAL_REGEX), this.duplicateNameValidator.bind(this)]],
    description: [''],
    lifetimeValue: [3600, Validators.required],
  });

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    console.log(this.region);
    this.getListIKEPolicies()
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


  constructor(
    private router: Router,
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    private ikePolicyService: IkePolicyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}
  getData(): any {
    this.ikePolicyModel.customerId =
      this.tokenService.get()?.userId;
    this.ikePolicyModel.regionId = this.region;
    this.ikePolicyModel.projectId = this.project;
    this.ikePolicyModel.name =
    this.form.controls.name.value;
    return this.ikePolicyModel;
  }
  handleCreate() {
    this.isLoading = true;
    if (this.form.valid) {
      //this.formCreateIpsecPolicy = this.getData();
      this.getData();
      console.log(this.ikePolicyModel);
      this.ikePolicyService
        .create(this.ikePolicyModel)
        .subscribe(
          (data) => {
            this.isLoading = false
            this.notification.success(
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.ike.policy-create.success')
            );
            this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
          },
          (error) => {
            this.isLoading = false
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.ike.policy-create.fail')
            );
            console.log(error);
          }
        );
    }

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
