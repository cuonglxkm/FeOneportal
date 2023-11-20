import {Component, OnInit} from '@angular/core';
import {AttachedDto, VolumeDTO} from "../../../../shared/dto/volume.dto";
import {VolumeService} from "../../../../shared/services/volume.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {PopupExtendVolumeComponent} from "../popup-volume/popup-extend-volume.component";

@Component({
  selector: 'app-detail-volume',
  templateUrl: './detail-volume.component.html',
  styleUrls: ['./detail-volume.component.less'],
})
export class DetailVolumeComponent implements OnInit {
  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'Volume',
    content: 'Chi tiết Volume '
  };

  volumeInfo: VolumeDTO;

  attachedDto: AttachedDto[];

  listVMs: string = '';

  ngOnInit(): void {
    const idVolume = this.activatedRoute.snapshot.paramMap.get('id');
    this.getVolumeById(idVolume);
  }

  private getVolumeById(idVolume: string) {



    this.volumeSevice.getVolummeById(idVolume).subscribe(data => {
      if (data !== undefined && data != null){
        this.volumeInfo = data;
        this.attachedDto = data.attachedInstances;
        if(this.attachedDto.length > 1){
          this.attachedDto.forEach(vm => {
              this.listVMs += vm.instanceName+'\n';
          })
        }
      }else{

      }

    })
  }

  openPopupExtend(){
    const modal: NzModalRef = this.modalService.create({
      nzTitle: 'Gia hạn Volume',
      nzContent: PopupExtendVolumeComponent,
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
            const selected = modal.getContentComponent().selectedItem;
            this.extendVolume();
            modal.destroy()
          }
        }
      ]
    });
  }
  extendVolume(){
    console.log('Gia hạn thành công');
  }

  navigateEditVolume(idVolume:number){
    this.router.navigate(['/app-smart-cloud/volume/edit/'+idVolume]);
  }

  volumeStatus: Map<String, string>;
  constructor(private volumeSevice: VolumeService,  private router: Router, private activatedRoute: ActivatedRoute, private nzMessage:NzMessageService, private modalService:NzModalService) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', 'Đang hoạt động');
    this.volumeStatus.set('ERROR', 'Lỗi');
    this.volumeStatus.set('SUSPENDED', 'Tạm ngừng');
  }

  protected readonly navigator = navigator;
}
