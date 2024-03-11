import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
  selector: 'one-portal-edit-file-system',
  templateUrl: './edit-file-system.component.html',
  styleUrls: ['./edit-file-system.component.less'],
})
export class EditFileSystemComponent {
  @Input() region: number
  @Input() project: number
  @Input() wanId: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false
  isLoadingUpdate: boolean = false

  validateForm: FormGroup<{
    nameFileSystem: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameFileSystem: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9]*$/),
      Validators.maxLength(70)]],
    description: [null as string, [Validators.maxLength(255)]]
  })

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private fb: NonNullableFormBuilder){
  }

  showModal() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoadingUpdate = false
    this.onCancel.emit()
  }

  handleOk() {
  }
}
