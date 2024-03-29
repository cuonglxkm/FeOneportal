import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { VolumeDTO } from '../../../../../shared/dto/volume.dto';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { EditTextVolumeModel } from '../../../../../shared/models/volume.model';

@Component({
  selector: 'one-portal-update-volume',
  templateUrl: './update-volume.component.html',
  styleUrls: ['./update-volume.component.less'],
})
export class UpdateVolumeComponent {
  @Input() region: number
  @Input() project: number
  @Input() volume: VolumeDTO
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false
  isLoadingUpdate: boolean = false

  validateForm: FormGroup<{
    nameVolume: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameVolume: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9]*$/),
      Validators.maxLength(70)]],
    description: [null as string, [Validators.maxLength(255)]]
  })

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private volumeService: VolumeService,
              private fb: NonNullableFormBuilder){
  }

  showModal() {
    this.isVisible = true
    this.validateForm.get('nameVolume').setValue(this.volume.name)
    this.validateForm.get('description').setValue(this.volume.description)
  }

  handleCancel() {
    this.isVisible = false
    this.isLoadingUpdate = false
    this.onCancel.emit()
  }

  handleOk() {
    let request: EditTextVolumeModel = new EditTextVolumeModel()
    request.customerId = this.tokenService.get()?.userId
    request.volumeId = this.volume.id
    request.newName = this.validateForm.controls.nameVolume.value
    request.newDescription = this.validateForm.controls.description.value
    this.isLoadingUpdate = true
    this.volumeService.updateVolume(request).subscribe(data => {
      if(data) {
        this.isLoadingUpdate = false
        this.isVisible = false
        this.notification.success('Thành công', 'Cập nhật thông tin Volume thành công')
        this.onOk.emit()
      }
    }, error => {
      this.isLoadingUpdate = false
      this.isVisible = false
      this.notification.error('Thất bại', 'Cập nhật thông tin Volume thất bại')
    })
    this.isVisible = false
  }
}
