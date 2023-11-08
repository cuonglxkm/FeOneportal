import {Component} from '@angular/core';
import {NzSelectOptionInterface} from 'ng-zorro-antd/select';
import {NzModalService, NzModalRef, NzModalComponent} from 'ng-zorro-antd/modal';
import {PopupAddVolumeComponent} from "./popup-volume/popup-add-volume.component";
import {PopupDeleteVolumeComponent} from "./popup-volume/popup-delete-volume.component";
import { Router } from "@angular/router";

interface Volume {
  name: string;
  storage: number;
  iops: number;
  statusVolume: number;
  statusAction: number;
  vm: string;
}

@Component({
  selector: 'app-volume',
  templateUrl: './volume.component.html',
  styleUrls: ['./volume.component.less'],
})
export class VolumeComponent {

  // listOfData: SshKey[];
  // data: SshKey;

  combinedValues: string[] = [];

  selectedOption: NzSelectOptionInterface | null = null;
  options: NzSelectOptionInterface[] = [
    {label: 'Khởi tạo', value: 'init'},
    {label: 'Hủy', value: 'cancel'},
    {label: 'Tạm dừng', value: 'pause'},
  ];

  listVM: NzSelectOptionInterface[] = [
    {label: 'VM01', value: 'vm01'},
    {label: 'VM02', value: 'vm02'},
    {label: 'VM03', value: 'vm03'},
  ];

  optionVolumeRoot: NzSelectOptionInterface[] = [
    {label: 'Tạo Snapshot', value: 'initSnapshot'}
  ]

  optionVolumeAdd: NzSelectOptionInterface[] = [
    {label: 'Gắn Volume', value: 'addVolume'},
    {label: 'Gỡ Volume', value: 'cancelVolume'},
    {label: 'Tạo Backup', value: 'initBackup'},
    {label: 'Tạo lịch Snapshot', value: 'initScheduleSnapshot'},
    {label: 'Xóa', value: 'delete'}

  ]

  volumeStatus: Map<number, string>;

  constructor(private modalService: NzModalService , private router: Router) {
    this.volumeStatus = new Map<number, string>();
    this.volumeStatus.set(0, 'Tạm dừng');
    this.volumeStatus.set(1, 'Đang hoạt động');
    this.volumeStatus.set(2, 'Chậm gia hạn');
    this.volumeStatus.set(3, 'Vi phạm điều khoản');
    this.combinedValues = this.listOfData.map((item, index) => 'item' + index);
  }


  listOfData: Volume[] = [
    {
      name: 'VM01_root_volume',
      storage: 2,
      iops: 200,
      statusVolume: 0,
      statusAction: 0,
      vm: 'VM01'
    },
    {
      name: 'VM02_root_volume',
      storage: 4,
      iops: 200,
      statusVolume: 1,
      statusAction: 1,
      vm: 'VM01'
    },
    {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 2,
      statusAction: 1,
      vm: 'VM02'
    },
    {
      name: 'VM04_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 3,
      statusAction: 1,
      vm: 'VM03'
    },
    {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 1,
      statusAction: 1,
      vm: 'VM02'
    },
    {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 2,
      statusAction: 1,
      vm: 'VM02'
    },
    {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 1,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 2,
      statusAction: 1,
      vm: 'VM02'
    },
    {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 1,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 1,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 2,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 2,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 2,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 2,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 1,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 2,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 1,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 2,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 2,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 1,
      statusAction: 1,
      vm: 'VM02'
    }, {
      name: 'VM03_root_volume',
      storage: 10,
      iops: 200,
      statusVolume: 1,
      statusAction: 1,
      vm: 'VM02'
    }
  ];
  isVisible = false;
  isOkLoading = false;

  onSelectionChange(value: any , nameVolume: string) {
    console.log('Value selected: ', value);
    console.log('Volume Name: ', nameVolume);
    if(value === 'addVolume' ){
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Gắn Volume',
        nzContent: PopupAddVolumeComponent,
        nzFooter: [
          {
            label: 'Hủy',
            type: 'default',
            onClick: () => modal.destroy()
          },
          {
            label: 'Xác nhận',
            type: 'primary',
            onClick: () => {
              const selected = modal.getContentComponent().selectedItem;
              console.log('Add volume ' + nameVolume + ' in to ' + selected);
              modal.destroy()
            }
          }
        ]
      });
    }

    if(value === 'cancelVolume' ){
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Gỡ Volume',
        nzContent: PopupAddVolumeComponent,
        nzFooter: [
          {
            label: 'Hủy',
            type: 'default',
            onClick: () => modal.destroy()
          },
          {
            label: 'Xác nhận',
            type: 'primary',
            onClick: () => {
              const selected = modal.getContentComponent().selectedItem;
              console.log('Add volume ' + nameVolume + ' in to ' + selected);
              modal.destroy();
            }
          }
        ]
      });
    }

    if(value === 'delete' ){
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Xóa Volume',
        nzWidth: '600px',
        nzContent: PopupDeleteVolumeComponent,
        nzFooter: [
          {
            label: 'Hủy',
            type: 'default',
            onClick: () => modal.destroy()
          },
          {
            label: 'Đồng ý',
            type: 'primary',
            onClick: () => {
              modal.destroy();
            }
          }
        ]
      });
    }

  }

  navigateToCreateVolume(){
    this.router.navigate(['/app-smart-cloud/volume/create']);
  }


}
