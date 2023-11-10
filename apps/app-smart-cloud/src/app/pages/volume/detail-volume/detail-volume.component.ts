import {Component, OnInit} from '@angular/core';
import {VolumeDTO} from "../dto/volume.dto";
import {VolumeService} from "../volume.service";
import {ActivatedRoute} from "@angular/router";
import {NzMessageService} from "ng-zorro-antd/message";

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

  ngOnInit(): void {
    const idVolume = this.activatedRoute.snapshot.paramMap.get('id');
    this.getVolumeById(idVolume);
  }

  private getVolumeById(idVolume: string) {

    this.volumeService.getVolummeById(idVolume).subscribe(data => {
      if (data !== undefined && data != null){
        this.nzMessage.create('success', 'Tìm kiếm thông tin Volume thành công.')
        this.volumeInfo = data;
      }else{

      }

    })
  }

  constructor(private volumeService: VolumeService, private activatedRoute: ActivatedRoute, private nzMessage:NzMessageService) {
  }
}
