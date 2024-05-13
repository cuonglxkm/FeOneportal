import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormCreatePort, FormSearchSubnet, Subnet } from '../../../../shared/models/vlan.model';
import { getCurrentRegionAndProject } from '@shared';
import {
  AppValidator,
  ipAddressExistsValidator,
  ipAddressValidator
} from '../../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'one-portal-vlan-create-port',
  templateUrl: './vlan-create-port.component.html',
  styleUrls: ['./vlan-create-port.component.less'],
})
export class VlanCreatePortComponent implements OnInit{
  @Input() region: number
  @Input() project: number
  @Input() networkId: number
  @Input() networkCloudId: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false


  validateForm: FormGroup<{
    idSubnet: FormControl<number>
    namePort: FormControl<string>
    ipAddress: FormControl<string>
  }>

  listSubnet: Subnet[] = []
  subnetAddress: string

  subnetSelected: any;

  idSubnet: number
  isLoadingSubnet: boolean = false

  ipPort: string[] = []

  isInvalidGateway: boolean = false
  dataSubjectGateway: Subject<any> = new Subject<any>();

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private fb: NonNullableFormBuilder,) {

  }

  getPortByNetworId() {
    this.vlanService.getPortByNetwork(this.networkCloudId, this.region, 9999, 1, null).subscribe(data => {
      console.log('port', data.records)
      // data?.records.forEach(item => {
      //   if(this.ipPort.length <= 0) {
      //     this.ipPort = [item.fixedIPs.toString()]
      //   } else {
      //     this.ipPort?.push(item.fixedIPs.toString())
      //   }
      //
      //   // console.log(this.ipPort)
      // })
    })
  }
  getSubnetByNetworkId() {
    this.isLoadingSubnet = true
    let formSearchSubnet = new FormSearchSubnet()
    formSearchSubnet.networkId = this.networkId
    formSearchSubnet.customerId = this.tokenService.get()?.userId
    formSearchSubnet.region = this.region
    formSearchSubnet.pageSize = 9999
    formSearchSubnet.pageNumber = 1
    formSearchSubnet.name = null



    this.vlanService.getSubnetByNetwork(formSearchSubnet).subscribe(data => {
      // console.log('data-subnet', data)
      this.listSubnet = data.records

      this.isLoadingSubnet = false
    })
  }

  invalidGateway: string

  onCheckPort() {
    this.dataSubjectGateway.pipe(debounceTime(600)).subscribe((res) => {
      this.vlanService.getSubnetById(this.validateForm.controls.idSubnet.value).subscribe(item => {
        this.vlanService.checkIpAvailable(res, item.subnetAddressRequired, this.networkCloudId, this.region).subscribe(data => {
          this.isInvalidGateway = false
          const dataJson = JSON.parse(JSON.stringify(data));
          console.log('gateway data', dataJson)
        }, error => {
          console.log('error', error.error)
          this.isInvalidGateway = true
          this.invalidGateway = error.error
        })
      })

    })
  }

  inputPort(value) {
    this.dataSubjectGateway.next(value);
  }

  showModal(): void {
    this.isVisible = true;

    this.getPortByNetwork()

    console.log('port', this.ipPort)
  }



  handleCancel(): void {
    this.isVisible = false;
    this.isLoading = false
    this.validateForm.reset();
    this.onCancel.emit();
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('form', this.validateForm.getRawValue())
      let formCreatePort = new FormCreatePort()
      formCreatePort.portName = this.validateForm.controls.namePort.value
      formCreatePort.customerId = this.tokenService.get()?.userId
      formCreatePort.regionId = this.region
      formCreatePort.subnetId = this.validateForm.controls.idSubnet.value
      formCreatePort.ipAddress = this.validateForm.controls.ipAddress.value
      this.isLoading = true
      this.vlanService.createPort(formCreatePort).subscribe(data => {
          this.isLoading = false
          this.isVisible = false
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.vlan.note59'))
          this.onOk.emit(data)
          this.validateForm.reset()

      }, error => {
        this.isLoading = false
        this.isVisible = false
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.vlan.note60' )  + this.i18n.fanyi(error.error.detail))
        this.validateForm.reset()
      })
    }

  }

  isIpInList(ip: string, ipList: string[]): boolean {
    return ipList.includes(ip);
  }

  getPortByNetwork() {
    this.vlanService.getPortByNetwork(this.networkCloudId, this.region, 9999, 1, null).subscribe(data => {
      console.log('get all port', data.records)
      data?.records?.forEach(item => {
        this.ipPort?.push(item.fixedIPs.toString())
      })
    })
  }


  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.getSubnetByNetworkId()
    this.onCheckPort()




    this.validateForm = this.fb.group({
      idSubnet: [0, [Validators.required]],
      namePort: ['', [Validators.required,  Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_]*$/)]],
      ipAddress: ['', [ipAddressValidator(this.subnetAddress), ipAddressExistsValidator(this.ipPort)]]
    });

  }



}
