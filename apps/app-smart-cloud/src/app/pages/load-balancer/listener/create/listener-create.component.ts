import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ListenerService } from '../../../../shared/services/listener.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { da, th } from 'date-fns/locale';
import { getCurrentRegionAndProject } from '@shared';
import { InstancesService } from '../../../instances/instances.service';
import { isThisHour } from 'date-fns';
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';

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

function isValidIPAddress(ipAddress: string): boolean {
  // Kiểm tra xem địa chỉ IP có thuộc các dải cho phép không
  if (
    !ipAddress.startsWith('10.') &&
    !(ipAddress.startsWith('172.') && ipAddress >= '172.16.0.0' && ipAddress <= '172.24.0.0') &&
    !(ipAddress.startsWith('192.168.'))
  ) {
    return false;
  }

  // Kiểm tra định dạng của địa chỉ IP
  if (!ipAddress.match(/^((\d{1,3}\.\d{1,3}\.0\.0\/16)|(\d{1,3}\.\d{1,3}\.\d{1,3}\.0\/24))$/)) {
    return false;
  }
  return true;
}

@Component({
  selector: 'one-portal-listener-create',
  templateUrl: './listener-create.component.html',
  styleUrls: ['./listener-create.component.less']
})


export class ListenerCreateComponent {
  regionId: any;
  projectId ;
  step: number = 2;
  dataListener: any;
  lbId : any;
  lstInstance = [];
  lstInstanceUse = [];
  validateForm: FormGroup<{
    listenerName: FormControl<string>
    port: FormControl<number>
    member: FormControl<number>
    connection: FormControl<number>
    timeout: FormControl<number>
    allowCIRR: FormControl<string>
    description: FormControl<string>

    poolName: FormControl<string>
    healthName: FormControl<string>
    maxRetries: FormControl<number>
    maxRetriesDown: FormControl<number>
    delay: FormControl<number>
    timeoutHealth: FormControl<number>
    path: FormControl<string>
    sucessCode: FormControl<string>
  }> = this.fb.group({
    listenerName: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/), Validators.maxLength(50)]],
    port: [0, Validators.required],
    member: [1],
    connection: [1],
    timeout: [1],
    allowCIRR: ['', [Validators.required, ipAddressValidator()]],
    description: [''],

    poolName: [''],
    healthName: [''],
    maxRetries: [0],
    maxRetriesDown: [0],
    delay: [0],
    timeoutHealth: [0],
    path: [''],
    sucessCode: ['']
  });
  protocolListener: any;
  checkedSession: any;
  sessionFix = 'HTTP';
  listAlgorithm = [
    { value: 'ROUND_ROBIN', name: 'Round robin' },
    { value: 'LEAST_CONNECTIONS', name: 'Least connections' },
    { value: 'SOURCE_IP', name: 'source ip' }
  ];

  listCheckMethod = [
    { value: 'HTTP', name: 'HTTP' },
    { value: 'TCP', name: 'TCP' },
    { value: 'PING', name: 'PING' }
  ];

  listHttpMethod = [
    { value: 'GET', name: 'GET' },
    { value: 'POST', name: 'POST' },
    { value: 'PUT', name: 'PUT' }
  ];
  selectedAlgorithm = 'ROUND_ROBIN';
  selectedCheckMethod = 'HTTP';
  selectedHttpMethod = 'GET';

  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              private service: ListenerService,
              private instancesService: InstancesService,
              private activatedRoute: ActivatedRoute,
              private notification: NzNotificationService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.lbId = this.activatedRoute.snapshot.paramMap.get('lbId');
    this.loadVm();
  }

  nextStep() {
    if (this.step == 0) {
      if (this.createListener() == true) {
      }
    } else if (this.step == 1) {
      if (this.createPool() == true) {
      }
      this.loadVm();
    } else if (this.step == 2) {
      // if (this.createMember() == true) {
      //   this.step += 1;
      // }
    }

    this.step += 1;
  }

  priviousStep() {
    if (this.step == 0) {
      this.router.navigate(['/app-smart-cloud/load-balancer/list']);
    } else {
      this.step -= 1;
    }
  }

  checkDisable() {
  }

  createListener(): boolean {
    let data = {
      regionId: this.regionId,
      lbId: this.lbId,
      idleTimeOutConnection: this.validateForm.controls['connection'].value,
      allowedCIDR: this.validateForm.controls['allowCIRR'].value,
      description: this.validateForm.controls['description'].value,
      idleTimeOutMember: this.validateForm.controls['member'].value,
      sslCert: '',
      idleTimeOutClient: this.validateForm.controls['timeout'].value,
      port: this.validateForm.controls['port'].value,
      protocol: this.protocolListener,
      name: this.validateForm.controls['listenerName'].value
    };

    this.service.createListener(data).subscribe(
      data => {
        this.notification.success('Thành công', 'Tạo mới listener thành công');
        this.dataListener = data;
        return true;
      },
      error => {
        this.notification.error(' Thành công', 'Tạo mới listener thất bại');
        return false;
      }
    );
    return false;
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  private createPool() {
    console.log(this.dataListener)
    console.log(this.dataListener?.id)
    let data = {
      listener_id: this.dataListener.idStringListener,
      name: this.validateForm.controls['poolName'].value,
      description: '',
      algorithm: this.selectedAlgorithm,
      sessionPersistence: this.checkedSession,
      protocol: this.protocolListener == 'TCP' ? 'TCP' : 'HTTP',
      regionId: this.regionId,
      vpcId: this.projectId,
      // loadbalancer_id: this.lbId
    };

    this.service.createPool(data).subscribe(
      data => {
        this.notification.success(' Thành công', 'Tạo mới pool thành công');
        return this.createHealth(data);
      },
      error => {
        this.notification.error(' Thành công', 'Tạo mới pool thất bại');
        return false;
      }
    );
    return false;
  }

  private createMember() {

  }

  private createHealth(pool: any) {
    let data = {
      delay: this.dataListener?.id,
      name: this.validateForm.controls['healthName'].value,
      maxRetries: this.validateForm.controls['maxRetries'].value,
      type: this.selectedCheckMethod,
      timeout: this.validateForm.controls['timeoutHealth'].value,
      adminStateUp: true,
      poolId: pool.poolId,
      expectedCodes: this.validateForm.controls['sucessCode'].value,
      httpMethod: this.selectedHttpMethod,
      urlPath: this.validateForm.controls['path'].value,
      maxRetriesDown: this.validateForm.controls['maxRetriesDown'].value,
      projectId: this.projectId,
      regionId: this.regionId,
    };

    this.service.createHealth(data).subscribe(
      data => {
        this.notification.success(' Thành công', 'Tạo mới Health Monitor thành công');
        return true;
      },
      error => {
        this.notification.error(' Thành công', 'Tạo mới Health Monitor thất bại');
        return false;
      }
    );
    return false;
  }

  private loadVm() {
    this.instancesService.search(1,999,this.regionId,this.projectId, '','KHOITAO',true,this.tokenService.get()?.userId).subscribe(
      data => {
        this.lstInstance = [...data.records];
        for (let item of this.lstInstance) {
          item.backup = false;
          item.port = 0;
          item.weight = 0;
        }
        console.log(this.lstInstance);
      }
    )
  }

  removeInstance(item: any, action: number) {
    console.log(item+ "itemID");
    if (action == 0) {
      //xoa
      const index = this.lstInstanceUse.findIndex(e => e.id = item);
      if(index != -1) {
        const data = this.lstInstanceUse[index];
        this.lstInstance.push(data);
        this.lstInstanceUse.splice(index, 1);
      }
    } else {
      //them
      const index = this.lstInstance.findIndex(e => e.id = item);
      console.log(index + "itemID");
      if(index >= 0) {
        const data = this.lstInstance[index];
        this.lstInstanceUse.push(data);
        this.lstInstance.splice(index, 1);
      }
    }
  }
}
