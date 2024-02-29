import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormCreatePort, FormSearchSubnet, Subnet } from '../../../../shared/models/vlan.model';
import { getCurrentRegionAndProject } from '@shared';
import { AppValidator, ipAddressValidator } from '../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-vlan-create-port',
  templateUrl: './vlan-create-port.component.html',
  styleUrls: ['./vlan-create-port.component.less'],
})
export class VlanCreatePortComponent implements OnInit{
  @Input() region: number
  @Input() project: number
  @Input() networkId: number
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
  idSubnet: number
  isLoadingSubnet: boolean = false

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,) {

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
      console.log('data-subnet', data)
      this.listSubnet = data.records

      this.isLoadingSubnet = false
    })
  }

  showModal(): void {
    this.isVisible = true;
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
        if(data) {
          this.isLoading = false
          this.isVisible = false
          this.notification.success('Thành công', 'Tạo Port thành công')
          this.onOk.emit(data)
          this.validateForm.reset()
        } else {
          console.log('data',data)
        }
      }, error => {
        this.isLoading = false
        this.isVisible = false
        this.notification.error('Thất bại', 'Tạo Port thất bại')
        this.validateForm.reset()
      })
    }

  }



  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId

    this.validateForm = this.fb.group({
      idSubnet: [0, [Validators.required]],
      namePort: ['', [Validators.required,  Validators.maxLength(50)]],
      ipAddress: ['', [Validators.required, ipAddressValidator(this.subnetAddress)]]
    });

    this.getSubnetByNetworkId()
  }



}
