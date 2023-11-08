import {Component, EventEmitter, Output} from '@angular/core';
import {NzSelectOptionInterface} from 'ng-zorro-antd/select';

@Component({
  selector: 'app-popup-content',
  template: `
      <nz-form-label >Chọn máy ảo</nz-form-label>
      <nz-select nzSize="default"
                 [nzPlaceHolder]="'-Chọn máy ảo-'"
                 [nzOptions]="options"
                 [(ngModel)]="selectedItem"
                 style="width: 300px;"
      >
      </nz-select>
  `
})
export class  PopupAddVolumeComponent{
  options: NzSelectOptionInterface[] = [
    { value: 'VM01', label: 'VM-01' },
    { value: 'VM02', label: 'VM-02' },
    { value: 'VM03', label: 'VM-03' }
  ];

  selectedItem: string;

  @Output() valueSelected: EventEmitter<string> = new EventEmitter<string>();

  onChange(value: string): void {
    this.selectedItem = value;
    this.valueSelected.emit(value);
  }
}
