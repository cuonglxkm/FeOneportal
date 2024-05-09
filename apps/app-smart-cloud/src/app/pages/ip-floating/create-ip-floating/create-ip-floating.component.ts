import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../shared/services/vlan.service';
import { ipAddressValidator } from '../../../../../../../libs/common-utils/src';
import { IpFloatingService } from '../../../shared/services/ip-floating.service';
import { FormSearchNetwork, NetWorkModel } from '../../../shared/models/vlan.model';
import { FormCreateIp } from '../../../shared/models/ip-floating.model';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-create-ip-floating',
  templateUrl: './create-ip-floating.component.html',
  styleUrls: ['./create-ip-floating.component.less'],
})
export class CreateIpFloatingComponent implements OnInit{
  @Input() region: number
  @Input() project: number
  @Input() projectType: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  listNetwork: NetWorkModel[] = []
  validateForm: FormGroup<{
    networkId: FormControl<number>
  }> = this.fb.group({
    networkId: [0, [Validators.required]]
  });

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private vlanService: VlanService,
              private ipFloatingService: IpFloatingService,
              private fb: NonNullableFormBuilder) {
  }

  showModalCreateIpFloating() {
    if (this.projectType == 1) {
      this.isVisible = true
      this.getListNetwork()
    } else {
      this.router.navigate(['/app-smart-cloud/networks/ip-floating-normal/create']);
    }
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.validateForm.reset()
    this.onCancel.emit()
  }

  submitForm() {
    if(this.validateForm.valid) {
      this.isLoading = true
      console.log('valid form', this.validateForm.getRawValue())
      let formCreate: FormCreateIp = new FormCreateIp()
      formCreate.networkId = this.validateForm.controls.networkId.value
      formCreate.regionId = this.region
      formCreate.isFloating = true
      this.ipFloatingService.createIp(formCreate).subscribe(data => {
        this.isVisible = false
        this.isLoading = false
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('ip.floating.nofitacation.add.success'))
        this.onOk.emit(data)
      }, error => {
        this.isVisible = false
        this.isLoading = false
        this.notification.error(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('ip.floating.nofitacation.add.fail'))
        this.validateForm.reset()
      })
    }
  }

  getListNetwork() {
    let formSearchNetwork: FormSearchNetwork = new FormSearchNetwork()
    formSearchNetwork.region = this.region
    formSearchNetwork.pageSize = 9999
    formSearchNetwork.pageNumber = 1
    formSearchNetwork.networktAddress = null
    formSearchNetwork.vlanName = null
    formSearchNetwork.project = this.project
    this.vlanService.getVlanNetworks(formSearchNetwork).subscribe(data => {
      this.listNetwork = data.records
    })
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }
}
