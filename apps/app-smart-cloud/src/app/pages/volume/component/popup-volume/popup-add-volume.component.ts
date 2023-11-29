import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {NzSelectOptionInterface} from 'ng-zorro-antd/select';
import {VolumeService} from "../../../../shared/services/volume.service";
import {GetAllVmModel} from "../../../../shared/models/volume.model";
import {VmDto} from "../../../../shared/dto/volume.dto";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

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
export class PopupAddVolumeComponent implements OnInit {
  options: NzSelectOptionInterface[] = [];
  getAllVmResponse: GetAllVmModel;
  listAllVMs: VmDto[] = [];
  selectedItem: any;
  @Output() valueSelected: EventEmitter<string> = new EventEmitter<string>();

  constructor(private volumeService: VolumeService, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  onChange(value: string): void {
    this.selectedItem = value;
    this.valueSelected.emit(value);
  }

  async ngOnInit(): Promise<void> {
    const regionString = localStorage.getItem('region');
    const region = JSON.parse(regionString);
    let userId = this.tokenService.get()?.userId;
    this.getAllVmResponse = await this.volumeService.getListVM(userId, region.regionId).toPromise();
    this.listAllVMs = this.getAllVmResponse.records;
    this.listAllVMs.forEach((vm) => {
      this.options.push({label: vm.name, value: vm.id});
    })

  }
}
