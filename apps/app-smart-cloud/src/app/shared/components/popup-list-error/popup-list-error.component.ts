import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'one-portal-popup-list-error',
  templateUrl: './popup-list-error.component.html',
  styleUrls: ['./popup-list-error.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupListErrorComponent {
  @Input() isVisible: boolean = false;
  @Input() errorList: string[] = [];
  @Output() onCancel = new EventEmitter();

  handleCancel() {
    this.isVisible = false;
    this.onCancel.emit();
  }
}
