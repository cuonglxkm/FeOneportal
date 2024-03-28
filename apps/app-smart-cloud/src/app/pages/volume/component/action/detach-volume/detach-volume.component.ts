import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { InstancesService } from '../../../../instances/instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { AttachedDto } from '../../../../../shared/dto/volume.dto';
import { debounceTime } from 'rxjs';
import { AddVolumetoVmModel } from '../../../../../shared/models/volume.model';

@Component({
  selector: 'one-portal-detach-volume',
  templateUrl: './detach-volume.component.html',
  styleUrls: ['./detach-volume.component.less']
})
export class DetachVolumeComponent {
  @Input() region: number;
  @Input() project: number;
  @Input() volumeId: number;
  @Input() isMultiple: boolean;
  @Input() instanceInVolume: AttachedDto[];
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isLoading: boolean = false;
  isVisible: boolean = false;

  instanceInVolumeSelected: any;

  listInstanceInVolume: AttachedDto[] = [];

  isSelected: boolean = false;

  constructor(private instancesService: InstancesService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private volumeService: VolumeService) {
  }

  onChange(value) {
    this.instanceInVolumeSelected = value;
  }

  showModal() {
    this.isVisible = true;
    this.getListVmInVolume();
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    if (this.isMultiple) {
      this.isSelected = false;
      this.instanceInVolumeSelected = null;
    }
    this.onCancel.emit();
  }

  handleOk() {
    this.doDetach();
  }

  getListVmInVolume() {
    this.volumeService.getVolumeById(this.volumeId)
      .pipe(debounceTime(300))
      .subscribe(response => {
        if (response != null) {
          if (response?.attachedInstances?.length > 0) {
            this.listInstanceInVolume = response.attachedInstances;
          }
        }
      });
  }

  doDetach() {
    this.isLoading = true;
    if (this.isMultiple) {
      if(this.instanceInVolumeSelected == undefined) {
        this.isSelected = true
        this.isLoading = false
      } else {
        this.isLoading = true
        let addVolumetoVmRequest = new AddVolumetoVmModel();
        addVolumetoVmRequest.volumeId = this.volumeId;
        console.log('attach', this.listInstanceInVolume);
        addVolumetoVmRequest.instanceId = Number.parseInt(this.instanceInVolumeSelected);
        addVolumetoVmRequest.customerId = this.tokenService.get()?.userId;

        this.volumeService.detachVolumeToVm(addVolumetoVmRequest).subscribe(data => {
          if (data == true) {
            this.isLoading = false;
            this.isVisible = false;
            this.notification.success('Thành công', `Yêu cầu gỡ volume thành công`);
            setTimeout(() => {
              this.onOk.emit(data)
            }, 1500);
          } else {
            this.isVisible = false;
            this.isLoading = false;
            this.notification.error('Thất bại', `Yêu cầu gỡ volume thất bại`);
            setTimeout(() => {
              this.onOk.emit(data)
            }, 1500);
          }
        }, error => {
          this.isLoading = false;
          this.isVisible = false;
          this.notification.error('Thất bại', `Yêu cầu gỡ volume thất bại`);
          setTimeout(() => {
            this.onOk.emit(error)
          }, 1500);
        });
      }

    } else {
      this.isSelected = false

      let addVolumetoVmRequest = new AddVolumetoVmModel();
      addVolumetoVmRequest.volumeId = this.volumeId;
      console.log('attach', this.listInstanceInVolume);
      addVolumetoVmRequest.instanceId = this.instanceInVolume[0].instanceId
      addVolumetoVmRequest.customerId = this.tokenService.get()?.userId;

      this.volumeService.detachVolumeToVm(addVolumetoVmRequest).subscribe(data => {
        if (data == true) {
          this.isLoading = false;
          this.isVisible = false;
          this.notification.success('Thành công', `Yêu cầu gỡ volume thành công`);
          this.onOk.emit(data);
        } else {
          this.isVisible = false;
          this.isLoading = false;
          this.notification.error('Thất bại', `Yêu cầu gỡ volume thất bại`);
          this.onOk.emit(data);
        }
      }, error => {
        this.isLoading = false;
        this.isVisible = false;
        this.notification.error('Thất bại', `Yêu cầu gỡ volume thất bại`);
        this.onOk.emit(error);
      });
    }


  }
}
