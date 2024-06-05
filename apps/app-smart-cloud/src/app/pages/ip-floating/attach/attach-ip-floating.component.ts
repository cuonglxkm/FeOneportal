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
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

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
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
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
    this.isLoading = true
    if(this.validateForm.valid) {
      console.log('form attach', this.validateForm.getRawValue())
      let formAction = new FormAction()
      formAction.id = this.idIpFloating
      formAction.portId = this.validateForm.controls.portId.value
      formAction.action = 'attach'
      this.ipFloatingService.action(formAction).subscribe(data => {
        this.isVisible = false;
        this.isLoading = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('ip.floating.nofitacation.attach.success'));
        this.onOk.emit(data);
      }, error => {
        this.isVisible = true;
        this.isLoading = false;
        if(error && error.error && error.error.type && error.error.type == "Exception" && error.error.message){
          this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message);
        } else {
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('ip.floating.nofitacation.attach.fail'));
        }
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
    this.vlanService.getVlanByNetworkId(idNetwork, this.project).subscribe(data => {
      this.vlanService.getPortByNetwork(data.cloudId, this.region, 9999, 1, null).subscribe(item => {
        this.listPort = item.records.filter(x => (!x.attachedDevice || x.attachedDevice == "" || x.attachedDevice == "compute:nova") && !x.name.includes("octavia"));
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
