import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {NzSelectOptionInterface} from 'ng-zorro-antd/select';
import {VolumeService} from "../../../../shared/services/volume.service";
import {GetAllVmModel} from "../../../../shared/models/volume.model";
import {VmDto, VolumeDTO} from "../../../../shared/dto/volume.dto";
import {NZ_MODAL_DATA} from "ng-zorro-antd/modal";

@Component({
  selector: 'app-popup-content',
  template: `
    <nz-form-label>Chọn máy ảo</nz-form-label>
    <nz-select nzSize="default"
               [nzPlaceHolder]="'-Chọn máy ảo-'"
               [(ngModel)]="selectedItem"
               nzShowSearch
               style="width: 300px;"
    >
      <nz-option *ngFor="let item of options" [nzLabel]="item.label.toString()" [nzValue]="item.value"></nz-option>
    </nz-select>
  `
})
export class PopupCancelVolumeComponent implements OnInit {
  options: NzSelectOptionInterface[] = [];
  selectedItem: any;
  @Output() valueSelected: EventEmitter<string> = new EventEmitter<string>();

  constructor(private volumeSevice: VolumeService,@Inject(NZ_MODAL_DATA) public data: number ) {
  }

  onChange(value: string): void {
    this.selectedItem = value;
    this.valueSelected.emit(value);
  }

  async ngOnInit(): Promise<void> {
    this.volumeSevice.getVolummeById(this.data.toString()).toPromise().then( response => {
      if(response != null){
        if(response.attachedInstances.length > 0){
          response.attachedInstances.forEach(vm => {
            this.options.push({label: vm.instanceName , value: vm.instanceId})
          })
        }
      }
    })
  }
}
