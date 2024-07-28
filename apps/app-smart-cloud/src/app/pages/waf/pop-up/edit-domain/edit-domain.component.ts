import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ipValidatorMany } from '../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-edit-domain',
  templateUrl: './edit-domain.component.html',
  styleUrls: ['./edit-domain.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDomainComponent {
  @Input() isVisibleEditDomain: boolean;
  @Input() domainName: string = ""
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() onCancelVisible = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  validateForm: FormGroup<{
    ipPublic: FormControl<string>;
    host: FormControl<string>;
    port: FormControl<string>
  }> = this.fb.group({
    ipPublic: ['', [Validators.required, ipValidatorMany]],
    host:[''],
    port:['']
  });

  constructor(private fb: NonNullableFormBuilder){}

  handleCancelEditDomain(){
    this.onCancelVisible.emit(false)
  }
}
