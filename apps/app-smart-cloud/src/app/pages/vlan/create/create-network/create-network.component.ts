import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';
import { getCurrentRegionAndProject } from '@shared';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { FormCreateNetwork, FormSearchNetwork } from '../../../../shared/models/vlan.model';
import { AppValidator, ProjectModel, RegionModel } from '../../../../../../../../libs/common-utils/src';
import { debounceTime, Subject } from 'rxjs';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

export function ipAddressValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const ipAddressList = control.value.split(',').map(ip => ip.trim()); // Tách các địa chỉ IP theo dấu (,)

    for (const ipAddress of ipAddressList) {
      if (!isValidIPAddress(ipAddress)) {
        return { 'invalidIPAddress': { value: ipAddress } }; // Địa chỉ IP không hợp lệ
      }
    }

    return null; // Địa chỉ IP hợp lệ
  };
}

// Hàm kiểm tra xem địa chỉ IP có hợp lệ không
function isValidIPAddress(ipAddress: string): boolean {
  // Kiểm tra định dạng chung của địa chỉ IP
  const ipAndPrefix = ipAddress.split('/');
  if (ipAndPrefix.length !== 2) {
    return false;
  }

  const ipParts = ipAndPrefix[0].split('.');
  const prefixLength = parseInt(ipAndPrefix[1], 10);

  if (ipParts.length !== 4 || isNaN(prefixLength)) {
    return false;
  }

  // Kiểm tra phần prefix length
  if ((prefixLength !== 16 && prefixLength !== 24)) {
    return false;
  }

  // Kiểm tra xem các phần của IP có nằm trong khoảng từ 0 đến 255 không
  for (const part of ipParts) {
    const partNumber = parseInt(part, 10);
    if (partNumber < 0 || partNumber > 255) {
      return false;
    }
  }

  // Kiểm tra xem địa chỉ IP có nằm trong các khoảng hợp lệ không
  const ipNumber = ipParts.map(part => parseInt(part, 10));

  if (
    (ipNumber[0] === 10 && ipNumber[1] >= 0 && ipNumber[1] <= 100) ||
    (ipNumber[0] === 172 && ipNumber[1] >= 16 && ipNumber[1] <= 31) ||
    (ipNumber[0] === 192 && ipNumber[1] === 168 && ipNumber[2] === 0)
  ) {
    return true;
  }

  return false;
}

@Component({
  selector: 'one-portal-create-network',
  templateUrl: './create-network.component.html',
  styleUrls: ['./create-network.component.less']
})


export class CreateNetworkComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;

  isDisableGatewayIp: boolean = false;
  isDhcp: boolean = false;

  isActiveHostRoute: boolean = false;
  listHostRoutes = [];

  formCreateNetwork: FormCreateNetwork = new FormCreateNetwork();

  isInvalidGateway: boolean = false

  validateForm: FormGroup<{
    nameNetwork: FormControl<string>
    nameSubnet: FormControl<string>
    networkAddress: FormControl<string>
    disableGatewayIp: FormControl<boolean>
    dhcp: FormControl<boolean>
    gateway: FormControl<string>
    allocationPool: FormControl<string>
  }> = this.fb.group({
    nameNetwork: ['vlan_', [Validators.required,
      AppValidator.startsWithValidator('vlan_'),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      this.duplicateNameValidator.bind(this),
      this.prefixValidator()]],
    nameSubnet: ['', [Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/)]],
    networkAddress: ['', [Validators.required,
      ipAddressValidator()]],
    disableGatewayIp: [false],
    dhcp: [true],
    gateway: [''],
    allocationPool: [null as string, []]
  });

  pool: string = '';
  gateway: string = ''
  dataSubjectCidr: Subject<any> = new Subject<any>();
  dataSubjectGateway: Subject<any> = new Subject<any>();
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private vlanService: VlanService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder) {
    this.validateForm.get('disableGatewayIp').valueChanges.subscribe(() => {

      this.validateForm.get('gateway').reset();
    });

    const nameNetworkInput = document.querySelector('input[formControlName="nameNetwork"]');
    if (nameNetworkInput) {
      nameNetworkInput.addEventListener('keydown', (event: KeyboardEvent) => {
        const currentValue = this.validateForm.get('nameNetwork').value;
        const cursorPosition = (event.target as HTMLInputElement).selectionStart;

        // Ngăn việc xóa các ký tự trong 'vlan_'
        if (event.key === 'Backspace' && cursorPosition <= 5) {
          event.preventDefault();
        } else if (event.key === 'Delete' && cursorPosition < 5) {
          event.preventDefault();
        }
      });
    }

    this.validateForm.get('nameNetwork').valueChanges.subscribe(value => {
      if (value !== null && value !== undefined && value !== '') {
        if (!value.startsWith('vlan_')) {
          // Nếu giá trị không bắt đầu bằng 'vlan_', đặt lại giá trị 'vlan_'
          this.validateForm.get('nameNetwork').setValue('vlan_', { emitEvent: false });
        }
      }
    })

  }

  prefixValidator(): Validators {
    return (control: FormControl): { [key: string]: any } | null => {
      const isValid = control.value.startsWith('vlan_') && control.value.length > 5;
      return isValid ? null : { prefixError: true };
    };
  }

  regionChanged(region: RegionModel) {
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/vlan/network/list']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/vlan/network/list']);
  }

  disableGatewayIp(value) {
    this.isDisableGatewayIp = value;
  }

  dhcp(value) {
    this.isDhcp = value;
  }

  submitForm() {
    if (this.validateForm.valid) {
      this.isLoading = true;
      console.log('value form', this.validateForm.getRawValue());
      this.formCreateNetwork.networktAddress = this.validateForm.controls.networkAddress.value;
      this.formCreateNetwork.name = this.validateForm.controls.nameNetwork.value;
      this.formCreateNetwork.vpcId = this.project;
      this.formCreateNetwork.regionId = this.region;
      this.formCreateNetwork.customerId = this.tokenService.get()?.userId;
      this.formCreateNetwork.subnetName = this.validateForm.controls.nameSubnet.value;
      this.formCreateNetwork.gatewayIP = this.validateForm.controls.gateway.value;
      this.formCreateNetwork.dnsNameServer = null;
      // if(this.isInPurchasedSubnet())
      this.formCreateNetwork.allocationPool = this.validateForm.controls.allocationPool.value;
      this.formCreateNetwork.enableDHCP = this.validateForm.controls.dhcp.value;
      this.formCreateNetwork.hostRoutes = null;

      this.vlanService.createNetwork(this.formCreateNetwork).subscribe(data => {
        this.isLoading = false;
        this.router.navigate(['/app-smart-cloud/vlan/network/list']);
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.vlan.note57'));

      }, error => {
        this.isLoading = false;
        console.log('error', error)
        this.router.navigate(['/app-smart-cloud/vlan/network/list']);
        this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message)
        // this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.vlan.note58') + 'Dải IP ' + this.validateForm.controls.networkAddress.value +' đã tồn tại trong 1 dải Subnet. Vui lòng chọn dải khác');
      });
    } else {
      console.log('value form invalid', this.validateForm.getRawValue());
    }
  }

  nameList: string[] = [];

  getListNetwork() {
    let formSearch = new FormSearchNetwork();
    formSearch.project = this.project;
    formSearch.region = this.region;
    formSearch.pageNumber = 1;
    formSearch.pageSize = 9999;
    this.vlanService.getVlanNetworks(formSearch).subscribe(data => {
      data?.records?.forEach(item => {
        this.nameList?.push(item.name);
      });
    });
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

  reset() {
    this.router.navigate(['/app-smart-cloud/vlan/network/list'])
  }

  inputCheckPool(value) {
    this.dataSubjectCidr.next(value);
  }

  onInputCheckPool() {
    this.dataSubjectCidr.pipe(debounceTime(600)).subscribe((res) => {
      this.vlanService.checkAllocationPool(res).subscribe(data => {
        const dataJson = JSON.parse(JSON.stringify(data));

        this.pool = dataJson.ipRange
        this.gateway = dataJson.gateWay

        console.log('gateway', this.validateForm.controls.disableGatewayIp.value)
        if(this.validateForm.controls.disableGatewayIp.value == false) {
          console.log('here')
          this.validateForm.controls.gateway.setValue(dataJson.gateWay)
        }

        this.validateForm.controls.allocationPool.setValue(this.pool)
        console.log('pool data', this.pool)
      })
    })
  }

  invalidGateway: string

  onCheckGateway() {
    this.dataSubjectGateway.pipe(debounceTime(600)).subscribe((res) => {
      this.vlanService.checkIpAvailable(res, this.validateForm.controls.networkAddress.value, '', this.region).subscribe(data => {
        this.isInvalidGateway = false
        const dataJson = JSON.parse(JSON.stringify(data));
        console.log('gateway data', dataJson)
      }, error => {
        console.log('error', error.error)
        this.isInvalidGateway = true
        this.invalidGateway = error.error
      })
    })
  }

  inputGateway(value) {
    this.dataSubjectGateway.next(value);
  }


  ngOnInit() {

    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.getListNetwork();
    this.onInputCheckPool();
    this.onCheckGateway();
  }
}
