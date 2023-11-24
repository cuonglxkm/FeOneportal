import {Component, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";

@Component({
  selector: 'one-portal-list-backup-vm',
  templateUrl: './list-backup-vm.component.html',
  styleUrls: ['./list-backup-vm.component.less'],
})
export class ListBackupVmComponent implements OnInit {

  region: number;

  project: number;

  value?: string;

  isVisibleDelete: boolean = false

  isLoading: boolean = false;

  status = [
    {label: 'Tất cả', value: 'all'},
    {label: 'Hoạt động', value: 'AVAILABLE'},
    {label: 'Tạm dừng', value: 'SUSPENDED'},
    {label: 'Lỗi', value:'ERROR'}
  ]

  selectedValue: any;

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  onInputChange(value: string) {
    this.value = value;
  }

  showModalDelete(): void {
    this.isVisibleDelete = true;
  }

  handleCancelDelete(): void {
    this.isVisibleDelete = false;
  }

  handleOkDelete(){
  }

  search(){
  }

  getListBackupVM() {
  }

  onChange(value){
    this.selectedValue = value.value;
    console.log('selected', this.selectedValue)
  }

  ngOnInit(): void {
  }
}
