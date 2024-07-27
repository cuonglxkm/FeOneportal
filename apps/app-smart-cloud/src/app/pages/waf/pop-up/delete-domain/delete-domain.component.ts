import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NAME_SNAPSHOT_REGEX } from 'src/app/shared/constants/constants';

@Component({
  selector: 'one-portal-delete-domain',
  templateUrl: './delete-domain.component.html',
  styleUrls: ['./delete-domain.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDomainComponent {
  @Input() isVisibleDeleteDomain: boolean;
  @Input() domainName: string = ""
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() onCancelVisible = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  validateForm: FormGroup<{
    name: FormControl<string>; 
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(NAME_SNAPSHOT_REGEX)]],
  });

  constructor(private fb: NonNullableFormBuilder){}

  handleCancelDeleteDomain(){
    this.onCancelVisible.emit(false)
  }
}
