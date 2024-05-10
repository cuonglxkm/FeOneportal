import { Component, Inject, OnInit } from '@angular/core';
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
import { getCurrentRegionAndProject } from '@shared';
import { InstancesService } from '../../../instances/instances.service';
import { RegionModel, ProjectModel, AppValidator } from '../../../../../../../../libs/common-utils/src';
import { finalize } from 'rxjs/operators';
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


export class ListenerCreateComponent implements OnInit{
  regionId: any;
  projectId ;
  step: number = 0;
  dataListener: any;
  lbId : any;
  order = 0;
  lstInstance = [{Name: 'a', taskState : 'a', status: 'a', id: 'a', IpAddress: 'a', Port: 0, Weight: 0, Backup: false, order: 0 }];
  lstInstanceUse = [{Name: 'a', taskState : 'a', status: 'a', id: 'a', IpAddress: 'a', Port: 0, Weight: 0, Backup: false, order: 0}];
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
    listenerName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), Validators.maxLength(50)]],
    port: [80, Validators.required],
    member: [50000],
    connection: [5000],
    timeout: [50000],
    allowCIRR: ['0.0.0.0/0', [Validators.required,AppValidator.ipWithCIDRValidator1]],
    description: [''],

    poolName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), Validators.maxLength(50)]],
    healthName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), Validators.maxLength(50)]],
    maxRetries: [3],
    maxRetriesDown: [3],
    delay: [5],
    timeoutHealth: [5],
    path: ['/',[Validators.required]],
    sucessCode: ['200',[Validators.required, Validators.pattern(/^[0-9_]*$/)]]
  });
  protocolListener = 'HTTP';
  checkedSession: any;
  sessionFix = 'HTTP';
  listAlgorithm = [
    { value: 'ROUND_ROBIN', name: 'ROUND ROBIN' },
    { value: 'LEAST_CONNECTIONS', name: 'LEAST CONNECTIONS' },
    { value: 'SOURCE_IP', name: 'SOURCE IP' }
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
  loading= false;

  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              private service: ListenerService,
              private instancesService: InstancesService,
              private activatedRoute: ActivatedRoute,
              private notification: NzNotificationService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  ngOnInit(): void {
    this.lbId = this.activatedRoute.snapshot.paramMap.get('lbId');
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.loadVm();
    this.loadSSlCert();
  }

  nextStep() {
    this.step += 1;
    this.sessionFix = this.protocolListener == 'TCP' ? 'TCP' : 'HTTP';
  }

  priviousStep() {
    if (this.step == 0) {
      this.router.navigate(['/app-smart-cloud/load-balancer/list']);
    } else {
      this.step -= 1;
    }
  }

  createListener(): boolean {
    this.loading = true;
    let member = this.lstInstanceUse.map((item) => ({
      Name: item.Name,
      IpAddress: item.IpAddress,
      Port: item.Port,
      Weight: item.Weight,
      Backup: item.Backup,
    }));
    let data = {
      listeners : {
        name: this.validateForm.controls['listenerName'].value,
        protocol: this.protocolListener,
        clientDataTimeout: this.validateForm.controls['timeout'].value,
        memberConnectTimeout: this.validateForm.controls['connection'].value,
        memberDataTimeout: this.validateForm.controls['member'].value,
        port: this.validateForm.controls['port'].value,
        sslCert: this.protocolListener == 'TERMINATED_HTTPS' ? this.certId : null,
        allowedCIDR: this.validateForm.controls['allowCIRR'].value,
        description: this.validateForm.controls['description'].value,
      },
      pools : {
        name: this.validateForm.controls['poolName'].value,
        algorithm: this.selectedAlgorithm,
        stickySession: this.checkedSession,
        protocol: this.protocolListener == 'TCP' ? 'TCP' : 'HTTP',
      },
      healthMonitors : {
        name: this.validateForm.controls['healthName'].value,
        httpMethod: this.selectedCheckMethod == 'HTTP' ? this.selectedHttpMethod : 0,
        type: this.selectedCheckMethod,
        delay: this.dataListener?.id,
        maxRetries: this.validateForm.controls['maxRetries'].value,
        timeout: this.validateForm.controls['timeoutHealth'].value,
        // adminStateUp: true,
        expectedCodes: this.selectedCheckMethod == 'HTTP' ? this.validateForm.controls['sucessCode'].value : '',
        urlPath: this.selectedCheckMethod == 'HTTP' ? this.validateForm.controls['path'].value : '',
        maxRetriesDown: this.validateForm.controls['maxRetriesDown'].value,

      },
      listMembers: null,
      members: JSON.stringify(member),
      projectId: this.projectId,
      region: this.regionId,
      customerId: this.tokenService.get()?.userId,
      lbId: this.lbId,
    };

    this.service.createListener(data)
      .pipe(finalize(() => {
        this.loading = false;
        this.router.navigate(['/app-smart-cloud/load-balancer/detail/' + this.lbId]);
      }))
      .subscribe(
      data => {
        this.notification.success('Thành công', 'Tạo mới listener thành công');
        this.dataListener = data;
        return true;
      },
      error => {
        this.notification.error(' Thất bại', 'Tạo mới listener thất bại');
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

  private loadVm() {
    this.lstInstance = [];
    this.lstInstanceUse = [];
    this.instancesService.search(1,999,this.regionId,this.projectId, '','KHOITAO',true,this.tokenService.get()?.userId).subscribe(
      data => {
        for (let item of data.records) {
          const rs = this.splitByIpAddress(item);
          if (rs != null) {
            for (let item of  rs) {
              this.lstInstance.push(item)
            }
          }
        }
      }
    )
  }

  removeInstance(IpAddress: any,order: any, action: number) {
    if (action == 0) {
      //xoa
      const index = this.lstInstanceUse.findIndex(e => e.order == order);
      if(index != -1) {
        // const data = this.lstInstanceUse[index];
        // this.lstInstance.push(data);
        this.lstInstanceUse.splice(index, 1);
      }
    } else {
      //them
      const index = this.lstInstance.findIndex(e => e.IpAddress == IpAddress);
      if(index >= 0) {
        const data = {...this.lstInstance[index]};
        data.order = Object.assign({}, this.order++);
        this.lstInstanceUse.push(data);
        // this.lstInstance.splice(index, 1);
      }
    }
  }

  splitByIpAddress(instance: any): [any] {
    // const { name, des } = obj;
    if (instance.ipPrivate == undefined || instance.ipPrivate == null || instance.ipPrivate == '') {
      return null;
    } else {
      const desArray = instance.ipPrivate.split(', ');
      if (desArray.length > 1) {
        return desArray.map((item) => ({
          Name: instance.name,
          status: instance.status,
          id: instance.id,
          IpAddress: item,
          Port: null,
          Weight: null,
          Backup: false,
        }));
      } else {
        return [{
          Name: instance.name,
          status: instance.status,
          id: instance.id,
          IpAddress: instance.ipPrivate,
          Port: null,
          Weight: null,
          Backup: false,
        }]
      }
    }

  }

  protected readonly focus = focus;
  activeDropdownSSL = false;
  listCert: any = null;
  certId: any;
  changeProtocolListener(event: any) {
    if (event == 'TERMINATED_HTTPS') {
      this.validateForm.controls['port'].setValue(443);
    } else {
      this.validateForm.controls['port'].setValue(80);
    }
  }

  private loadSSlCert() {
    this.service.loadSSlCert(this.tokenService.get()?.userId,this.regionId,this.projectId).subscribe(
      data => {
        this.listCert = data;
      }
    )
  }

  checkPossiblePress(event: KeyboardEvent) {
    const key = event.key;
    if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
      event.preventDefault();
    }
  }
}
