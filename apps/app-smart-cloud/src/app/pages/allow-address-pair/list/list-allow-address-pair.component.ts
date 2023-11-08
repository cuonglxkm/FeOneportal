import { Component } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

interface Area {
  id: number;
  name: string;
  desc: string;
}
interface Project {
  id: number;
  name: string;
  desc: string;
}

interface IPAddress {
  id: number;
  ipAddress: string;
  macAddress: string;
}
@Component({
  selector: 'one-portal-list-allow-address-pair',
  templateUrl: './list-allow-address-pair.component.html',
  styleUrls: ['./list-allow-address-pair.component.less'],
})
export class ListAllowAddressPairComponent {

  validateForm: FormGroup<{
    ipAddress: FormControl<string | null>;
  }>;

  value?: string;

  selectedValueArea?: Area;
  optionsArea: Area[] = [
    { name: 'Khu vực 1', id: 1, desc: '' },
    { name: 'Khu vực 2', id: 2, desc:''},
    { name: 'Khu vực 3', id: 3, desc:"" },
  ];

  selectedValueProject?: Project;
  optionsProject: Project[] = [
    { name: 'Dự án 1', id: 1, desc: '' },
    { name: 'Dự án 2', id: 2, desc:''},
    { name: 'Dự án 3', id: 3, desc:"" },
  ]

  listIPAddress: IPAddress[] = [
    { ipAddress: '192.168.9.0/24', id: 1, macAddress: 'FA:16:3E:3F:A2:5E' },
    { ipAddress: '192.168.9.0/24', id: 2, macAddress:'FA:16:3E:3F:A2:5E'},
    { ipAddress: '192.168.9.0/24', id: 3, macAddress:'FA:16:3E:3F:A2:5E' },
  ]

  isVisible = false;
  isConfirmLoading = false;
  isVisibleCreate = false;
  isCreateLoading = false;
  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isConfirmLoading = true;
    setTimeout(() => {
      this.isVisible = false;
      this.isConfirmLoading = false;
    }, 3000);
  }

  handleCancel(): void {
    this.isVisible = false;
    this.isVisibleCreate = false;
  }

  handleCreate(){
    this.isCreateLoading = true;
    this.submitForm();
    setTimeout(() => {
      this.isVisibleCreate = false;
      this.isCreateLoading = false;
    }, 3000);
  }

  showModalCreate(){
    this.isVisibleCreate = true;
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
