import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { InstancesService } from '../../../../instances/instances.service';
import { InstancesModel } from '../../../../instances/instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { AddVolumetoVmModel } from '../../../../../shared/models/volume.model';
import { AttachedDto } from '../../../../../shared/dto/volume.dto';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-attach-volume',
  templateUrl: './attach-volume.component.html',
  styleUrls: ['./attach-volume.component.less'],
})
export class AttachVolumeComponent implements AfterViewInit{
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
  listVmUnique: InstancesModel[] = []

  instanceSelected: any

  isSelected: boolean = false

  constructor(private instancesService: InstancesService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private volumeService: VolumeService,
              private cdr: ChangeDetectorRef,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    }

  onChange(value) {
    console.log('value selected instance', value)
    this.instanceSelected = value
    this.isSelected = false
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
    this.cdr.detectChanges();
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
      this.listVmUnique = this.listVm.filter(item => item.taskState === 'ACTIVE' && !this.instanceInVolume.map((item) => item.instanceId ).includes(item.id))
    })
  }

  addVolumeToVm() {
    this.isLoading = true
    if(this.instanceSelected == undefined) {
      this.isSelected = true
      this.isLoading = false
    } else {
      this.isSelected = false
      this.isLoading = true
      this.volumeService.getVolumeById(this.volumeId, this.project).subscribe(data => {
        if(data != null) {
          if (data.isMultiAttach == false && data.attachedInstances?.length == 1) {
            this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('volume.notification.fail.attach.multiple'))
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
                this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('volume.notification.attach.success'))
                setTimeout(() => {
                  this.onOk.emit(data)
                }, 1500);


              } else {
                console.log('data', data)
                this.isVisible = false
                this.isLoading = false;
                this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('volume.notification.attach.success'))
                setTimeout(() => {
                  this.onOk.emit(data)
                }, 1500);
              }
            }, error => {
              console.log('eror', error)
              this.isVisible = false
              this.isLoading = false;
              this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('volume.notification.attach.fail'))
              setTimeout(() => {
                this.onOk.emit(error)
              }, 1500);
            })
          }
        } else {
          this.isVisible = false
          this.isLoadingAttach = false;
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('volume.notification.attach.fail'))
        }
      })
      // this.cdr.detectChanges();
    }

  }
}
