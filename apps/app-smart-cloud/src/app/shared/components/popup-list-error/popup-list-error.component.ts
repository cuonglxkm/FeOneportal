import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'one-portal-popup-list-error',
  templateUrl: './popup-list-error.component.html',
  styleUrls: ['./popup-list-error.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupListErrorComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() errorStr: string = '';
  errorList: string[] = [];

  ngOnInit(): void {
    this.errorList = this.errorStr.split(', ');
  }

  handleCancel() {
    this.isVisible = false;
  }
}
