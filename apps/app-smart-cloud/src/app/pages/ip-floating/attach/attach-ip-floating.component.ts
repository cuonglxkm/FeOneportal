import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../shared/services/vlan.service';
import { IpFloatingService } from '../../../shared/services/ip-floating.service';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormSearchNetwork, NetWorkModel, Port } from '../../../shared/models/vlan.model';
import { FormAction } from '../../../shared/models/ip-floating.model';

@Component({
  selector: 'one-portal-attach-ip-floating',
  templateUrl: './attach-ip-floating.component.html',
  styleUrls: ['./attach-ip-floating.component.less']
})
export class AttachIpFloatingComponent implements OnInit {
  @Input() region: number
  @Input() project: number
  @Input() idIpFloating: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  isLoadingVlan: boolean = false
  isLoadingPort: boolean = false

  listNetwork: NetWorkModel[] = []
  listPort: Port[] = []

  networkId: string

  validateForm: FormGroup<{
    networkId: FormControl<number>
    portId: FormControl<string>
  }> = this.fb.group({
    networkId: [0, [Validators.required]],
    portId: [null as string, [Validators.required]]
  });

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private vlanService: VlanService,
              private ipFloatingService: IpFloatingService,
              private fb: NonNullableFormBuilder) {
  }

  showModal() {
    this.isVisible = true
    this.getListNetwork()
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.validateForm.reset()
    this.onCancel.emit()
  }

  submitForm() {
    if(this.validateForm.valid) {
      console.log('form attach', this.validateForm.getRawValue())
      let formAction = new FormAction()
      formAction.id = this.idIpFloating
      formAction.portId = this.validateForm.controls.portId.value
      formAction.action = 'attach'
      this.ipFloatingService.action(formAction).subscribe(data => {
        this.notification.success('Thành công', 'Gắn IP Floating thành công')
      }, error => {
        this.notification.error('Thất bại', 'Gắn IP Floating thất bại')
      })
    }

  }

  onSelectedChange(value) {
    this.networkId = value

    if(this.networkId != null || this.networkId != undefined || this.networkId != '') {
      this.getPortByNetwork(this.networkId)
    }
  }

  getListNetwork() {
    this.isLoadingVlan = true

    let formSearchNetwork: FormSearchNetwork = new FormSearchNetwork()
    formSearchNetwork.region = this.region
    formSearchNetwork.pageSize = 9999
    formSearchNetwork.pageNumber = 1
    formSearchNetwork.networktAddress = null
    formSearchNetwork.vlanName = null
    formSearchNetwork.project = this.project

    this.vlanService.getVlanNetworks(formSearchNetwork).subscribe(data => {
      this.listNetwork = data.records
      this.isLoadingVlan = false
    }, error => {
      this.isLoadingVlan = false
      this.listNetwork = null
    })

  }

  getPortByNetwork(idNetwork) {
    this.isLoadingPort = true
    this.vlanService.getVlanByNetworkId(idNetwork).subscribe(data => {
      this.vlanService.getPortByNetwork(data.cloudId, this.region, 9999, 1, null).subscribe(item => {
        this.listPort = item.records
        this.isLoadingPort = false
      }, error => {
        this.listPort = null
        this.isLoadingPort = false
      })
    }, error => {
      this.listPort = null
      this.isLoadingPort = false
    })

  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }
}
