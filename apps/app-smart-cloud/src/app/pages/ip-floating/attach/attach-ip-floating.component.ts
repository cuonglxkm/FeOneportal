import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../shared/services/vlan.service';
import { IpFloatingService } from '../../../shared/services/ip-floating.service';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormSearchNetwork, NetWorkModel, Port } from '../../../shared/models/vlan.model';

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

  listNetwork: NetWorkModel[] = []
  listPort: Port[] = []

  validateForm: FormGroup<{
    networkId: FormControl<number>
    portId: FormControl<number>
  }> = this.fb.group({
    networkId: [0, [Validators.required]],
    portId: [0, [Validators.required]]
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
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.validateForm.reset()
    this.onCancel.emit()
  }

  submitForm() {

  }

  onSelectedChange(value) {
    this.validateForm.controls.networkId.setValue(value)

    this.getPortByNetwork(value)

  }
  getListNetwork() {
    let formSearchNetwork: FormSearchNetwork = new FormSearchNetwork()
    formSearchNetwork.region = this.region
    formSearchNetwork.pageSize = 9999
    formSearchNetwork.pageNumber = 1
    formSearchNetwork.networktAddress = null
    formSearchNetwork.vlanName = null
    this.vlanService.getVlanNetworks(formSearchNetwork).subscribe(data => {
      this.listNetwork = data.records
    })
  }

  getPortByNetwork(idNetwork) {
    this.vlanService.getPortByNetwork(idNetwork, this.region, 9999, 1, null).subscribe(data => {
      this.listPort = data.records
    })
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }
}
