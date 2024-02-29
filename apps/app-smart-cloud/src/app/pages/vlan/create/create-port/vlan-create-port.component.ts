import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormSearchSubnet, Subnet } from '../../../../shared/models/vlan.model';
import { getCurrentRegionAndProject } from '@shared';

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
    idSubnet: FormControl<string>
    namePort: FormControl<string>
    ipAddress: FormControl<string>
  }> = this.fb.group({
    idSubnet: ['', [Validators.required]],
    namePort: ['', [Validators.required]],
    ipAddress: ['', [Validators.required]]
  })

  listSubnet: Subnet[] = []
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
    this.validateForm.reset();
    this.onCancel.emit();
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('form', this.validateForm.getRawValue())
      // this.isLoading = true;
      // this.vlanService.create(this.validateForm.value, this.conditionSearch)
      //   .subscribe(data => {
      //     this.notification.success('Thành công', 'Tạo Security Group thành công');
      //     this.validateForm.reset();
      //     this.isVisible = false;
      //     this.isLoading = false;
      //     this.onOk.emit(data);
      //   }, error => {
      //     this.isLoading = false;
      //     this.notification.error('Thất bại', 'Tạo Security Group thất bại');
      //   })
    }

  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId

    this.getSubnetByNetworkId()
  }

}
