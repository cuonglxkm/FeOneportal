import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../shared/services/vlan.service';
import { FormSearchNetwork, NetWorkModel } from '../../../shared/models/vlan.model';


@Component({
  selector: 'one-portal-create-file-system',
  templateUrl: './create-file-system.component.html',
  styleUrls: ['./create-file-system.component.less'],
})
export class CreateFileStorageComponent implements OnInit{
  // @Input() region: number
  // @Input() project: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  // listNetwork: NetWorkModel[] = []
  // validateForm: FormGroup<{
  //   networkId: FormControl<number>
  // }> = this.fb.group({
  //   networkId: [0, [Validators.required]]
  // });

  // constructor(private router: Router,
  //             @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  //             private notification: NzNotificationService,
  //             private route: ActivatedRoute,
  //             private vlanService: VlanService,
  //             private ipFloatingService: IpFloatingService,
  //             private fb: NonNullableFormBuilder) {
  // }

  showModalCreateFileSystem() {
    this.isVisible = true
    // this.getListNetwork()
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    // this.validateForm.reset()
    // this.onCancel.emit()
  }

  // submitForm() {
  //   if(this.validateForm.valid) {
  //     this.isLoading = true
  //     console.log('valid form', this.validateForm.getRawValue())
  //     let formCreate: FormCreateIp = new FormCreateIp()
  //     formCreate.networkId = this.validateForm.controls.networkId.value
  //     formCreate.regionId = this.region
  //     this.ipFloatingService.createIp(formCreate).subscribe(data => {
  //       this.isVisible = false
  //       this.isLoading = false
  //       this.notification.success('Thành công', 'Cấp phát IP Floating thành công')
  //       this.onOk.emit(data)
  //     }, error => {
  //       this.isVisible = false
  //       this.isLoading = false
  //       this.notification.error('Thất bại', 'Cấp phát IP Floating thất bại')
  //       this.validateForm.reset()
  //     })
  //   }
  // }

  // getListNetwork() {
  //   let formSearchNetwork: FormSearchNetwork = new FormSearchNetwork()
  //   formSearchNetwork.region = this.region
  //   formSearchNetwork.pageSize = 9999
  //   formSearchNetwork.pageNumber = 1
  //   formSearchNetwork.networktAddress = null
  //   formSearchNetwork.vlanName = null
  //   this.vlanService.getVlanNetworks(formSearchNetwork).subscribe(data => {
  //     this.listNetwork = data.records
  //   })
  // }

  ngOnInit() {
    // let regionAndProject = getCurrentRegionAndProject()
    // this.region = regionAndProject.regionId
    // this.project = regionAndProject.projectId
  }
}
