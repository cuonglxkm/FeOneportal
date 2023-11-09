import {Component, OnInit} from '@angular/core';
import {NzSelectOptionInterface} from 'ng-zorro-antd/select';
import {NzModalService, NzModalRef, NzModalComponent} from 'ng-zorro-antd/modal';
import {PopupAddVolumeComponent} from "./popup-volume/popup-add-volume.component";
import {PopupDeleteVolumeComponent} from "./popup-volume/popup-delete-volume.component";
import {Router} from "@angular/router";
import {VolumeDTO} from "./dto/volume.dto";
import {VolumeService} from "./volume.service";
import {GetListVolumeModel} from "./model/get-list-volume.model";

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
export class VolumeComponent implements OnInit {

  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'Volume',
    content: 'Danh sách Volume'
  };

  listVolumeRootResponse: GetListVolumeModel;
  listVolumeAddVolumeResponse: GetListVolumeModel;

  listVolumeRoot: VolumeDTO[];
  listVolumeAdd: VolumeDTO[];
  totalRoot: number;
  totalAdd: number;
  curentPageRoot: number;
  curentPageAdd: number;

  combinedValues: string[] = [];

  selectedOption: NzSelectOptionInterface | null = null;
  options: NzSelectOptionInterface[] = [
    {label: 'Khởi tạo', value: 'init'},
    {label: 'Hủy', value: 'cancel'},
    {label: 'Tạm dừng', value: 'pause'},
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

  volumeStatus: Map<String, string>;

  constructor(private modalService: NzModalService, private router: Router, private volumeSevice: VolumeService) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', 'Khởi tạo');
    this.combinedValues = this.listOfData.map((item, index) => 'item' + index);
  }

  ngOnInit() {
    //get list Root
    this.volumeSevice.getVolumes(669, 4094, 3, true, 10 , 0).subscribe(data => {
      this.listVolumeRootResponse = data;
      this.listVolumeRoot = data.records;
      this.totalRoot = data.totalCount;
      console.log(this.listVolumeRoot);
    })
    //get list Add
    this.volumeSevice.getVolumes(669, 4094, 3, false , 10, 0).subscribe(data => {
      this.listVolumeAddVolumeResponse = data;
      this.listVolumeAdd = data.records;
      this.totalAdd = data.totalCount;
      console.log(this.listVolumeAdd);
    })
  }
  onRootPageIndexChange(event: any) {
    this.curentPageRoot = event;
    this.volumeSevice.getVolumes(669, 4094, 3, true, 10 , (this.curentPageRoot-1)).subscribe(data => {
      this.listVolumeRootResponse = data;
      this.listVolumeRoot = data.records;
      this.totalRoot = data.totalCount;
    })
  }

  onAddPageIndexChange(event: any) {
    this.curentPageAdd = event;
    this.volumeSevice.getVolumes(669, 4094, 3, false, 10 , (this.curentPageAdd-1)).subscribe(data => {
      this.listVolumeAddVolumeResponse = data;
      this.listVolumeAdd = data.records;
      this.totalAdd = data.totalCount;
      console.log(this.listVolumeAdd);
    })
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

  onSelectionChange(value: any, nameVolume: string) {
    console.log('Value selected: ', value);
    console.log('Volume Name: ', nameVolume);
    if (value === 'addVolume') {
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

    if (value === 'cancelVolume') {
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

    if (value === 'delete') {
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

  navigateToCreateVolume() {
    this.router.navigate(['/app-smart-cloud/volume/create']);
  }


}
