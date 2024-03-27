import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { InstancesService } from '../../../../instances/instances.service';
import { InstancesModel } from '../../../../instances/instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { AddVolumetoVmModel } from '../../../../../shared/models/volume.model';
import { AttachedDto } from '../../../../../shared/dto/volume.dto';

@Component({
  selector: 'one-portal-attach-volume',
  templateUrl: './attach-volume.component.html',
  styleUrls: ['./attach-volume.component.less'],
})
export class AttachVolumeComponent {
  @Input() region: number
  @Input() project: number
  @Input() volumeId: number
  @Input() instanceInVolume: AttachedDto[]
  @Input() multiple: boolean
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false

  isLoadingAttach: boolean = false
  isVisible: boolean = false

  listVm: InstancesModel[]

  instanceSelected: any

  isSelected: boolean = false

  constructor(private instancesService: InstancesService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private volumeService: VolumeService) {
  }

  onChange(value) {
    this.instanceSelected = value
  }

  showModal() {
    this.isVisible = true
    this.getListVm()
  }

  handleCancel() {
    this.isVisible = false
    this.isLoadingAttach = false
    this.instanceSelected = null
    this.isSelected = false
    this.onCancel.emit()
  }

  handleOk() {
    this.addVolumeToVm()
  }

  getListVm() {
    this.isLoading = true
    this.instancesService.search(1, 9999, this.region, this.project, '', '',
      true, this.tokenService.get()?.userId).subscribe(data => {
      this.isLoading = false
      this.listVm = data.records
      console.log('listvm', this.listVm)
    })
  }

  addVolumeToVm() {
    this.isLoadingAttach = true
    if(this.instanceSelected == undefined || this.instanceSelected == null) {
      this.isSelected = true
      this.isLoading = false
    } else {
      this.isSelected = false
      this.volumeService.getVolumeById(this.volumeId).subscribe(data => {
        if(data != null) {
          if (data.isMultiAttach == false && data.attachedInstances?.length == 1) {
            this.notification.error('Thất bại', 'Volume này chỉ có thể gắn với một máy ảo.')
            this.isLoadingAttach = false;
          } else {
            let addVolumetoVmRequest = new AddVolumetoVmModel();

            addVolumetoVmRequest.volumeId = this.volumeId;
            addVolumetoVmRequest.instanceId = this.instanceSelected;
            addVolumetoVmRequest.customerId = this.tokenService.get()?.userId;

            this.volumeService.addVolumeToVm(addVolumetoVmRequest).subscribe(data => {
              if (data == true) {
                this.isVisible = false
                this.isLoading = false;
                this.notification.success('Thành công', 'Gắn Volume thành công.')
                this.onOk.emit(data)
              } else {
                console.log('data', data)
                this.isVisible = false
                this.isLoading = false;
                this.notification.error('Thất bại', 'Gắn Volume thất bại.')
                this.onOk.emit(data)
              }
            }, error => {
              console.log('eror', error)
              this.isVisible = false
              this.isLoading = false;
              this.notification.error('Thất bại', 'Gắn Volume thất bại.')
              this.onOk.emit(error)
            })
          }
        } else {
          this.isVisible = false
          this.isLoadingAttach = false;
          this.notification.error('Thất bại', 'Gắn Volume thất bại.')
        }
      })
    }

  }
}
