import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InstancesService } from '../../instances.service';
import { BlockStorageAttachments } from '../../instances.model';
import { finalize } from 'rxjs';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { getCurrentRegionAndProject } from '@shared';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'one-portal-blockstorage-detail',
  templateUrl: './blockstorage-detail.component.html',
  styleUrls: [],
})
export class BlockstorageDetailComponent implements OnInit {
  @Input() instancesId: any;
  @Input() isDetail: any;
  @Output() valueChanged = new EventEmitter();

  loading: boolean = true;
  listOfDataBlockStorage: BlockStorageAttachments[] = [];
  region: number;

  constructor(
    private dataService: InstancesService,
    private cdr: ChangeDetectorRef,
    private catalogService: CatalogService,
    public message: NzMessageService,
    private commonService: CommonService
  ) {}

  projectChange(project: any) {
    this.valueChanged.emit(project);
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.getBlockStorage();
    this.getActiveServiceByRegion();
  }

  //Lấy các dịch vụ hỗ trợ theo region
  isSupportEncryption: boolean = false;
  isSupportMultiAttachment: boolean = false;
  getActiveServiceByRegion() {
    this.catalogService
      .getActiveServiceByRegion(['Encryption', 'MultiAttachment'], this.region)
      .subscribe((data) => {
        console.log("support service", data);
        this.isSupportMultiAttachment = data.filter(
          (e) => e.productName == 'MultiAttachment'
        )[0].isActive;
        this.isSupportEncryption = data.filter(
          (e) => e.productName == 'Encryption'
        )[0].isActive;
      });
  }

  getBlockStorage() {
    this.dataService
      .getBlockStorage(this.instancesId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfDataBlockStorage = data;
        this.cdr.detectChanges();
      });
  }

  navigateToVolumeDetail(id: string | number){
    this.commonService.navigateAdvance('/app-smart-cloud/volumes/detail/' + id, '/app-smart-cloud/volumes-advance/detail/' + id)
  }
}
