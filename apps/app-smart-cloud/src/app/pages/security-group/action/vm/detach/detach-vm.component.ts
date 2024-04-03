import { Component } from '@angular/core';

@Component({
  selector: 'one-portal-detach-vm',
  templateUrl: './detach-vm.component.html',
  styleUrls: ['./detach-vm.component.less'],
})
export class DetachVmComponent {


  isVisible: boolean = false
  isLoading: boolean = false

  showModal() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
  }

  handleOk() {
    this.isLoading = true

  }
}
