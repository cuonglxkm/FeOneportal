import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  ImageTypesModel,
  Images,
  InstancesModel,
  RebuildInstances,
} from '../instances.model';
import { InstancesService } from '../instances.service';
import { RegionModel } from 'src/app/shared/models/region.model';
import { finalize } from 'rxjs';
import { LoadingService } from '@delon/abc/loading';
import { NguCarouselConfig } from '@ngu/carousel';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';

@Component({
  selector: 'one-portal-instances-edit-info',
  templateUrl: './instances-edit-info.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class InstancesEditInfoComponent implements OnInit {
  loading = true;

  region: number = 3;
  projectId: number = 310;
  customerId: number = 669;
  //userId: number = this.tokenService.get()?.userId;

  rebuildInstances: RebuildInstances = new RebuildInstances();

  instancesModel: InstancesModel;
  id: number;
  pagedCardListImages: Array<Array<any>> = [];
  effect = 'scrollx';

  //#region Hệ điều hành
  listImageTypes: ImageTypesModel[] = [];
  listImageVersionByType: Images[] = [];
  selectedValueVersion: any;
  isLoading = false;
  hdh: Images;
  selectedTypeImageId: number;
  selectedImage: Images;

  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 4, lg: 5, all: 0 },
    speed: 250,
    point: {
      visible: true
    },
    touch: true,
    loop: true,
    // interval: { timing: 1500 },
    animation: 'lazy'
  };

  getAllImageVersionByType(type: number) {
    this.dataService
      .getAllImage(null, this.region, type, this.customerId)
      .subscribe((data: any) => {
        this.listImageVersionByType = data;
      });
  }

  onInputHDH(index: number, event: any) {
    this.hdh = this.listImageVersionByType.find((x) => (x.id = event));
    this.selectedTypeImageId = this.hdh.imageTypeId;
  }

  //#endregion

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private route: Router,
    public message: NzMessageService,
    private el: ElementRef,
    private renderer: Renderer2,
    private loadingSrv: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });

    this.router.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.dataService
          .getById(this.id, false)
          .subscribe((dataInstae: any) => {
            this.instancesModel = dataInstae;
            this.dataService.getAllImageType().subscribe((data: any) => {
              this.listImageTypes = data;
              for (let i = 0; i < this.listImageTypes.length; i += 4) {
                this.pagedCardListImages.push(
                  this.listImageTypes.slice(i, i + 4)
                );
              }
              this.dataService
                .getImageById(this.instancesModel.imageId)
                .pipe(finalize(() => this.loadingSrv.close()))

                .subscribe((dataimge: any) => {
                  //this.hdh = dataimge;
                  this.selectedImage = dataimge;
                  //  this.selectedTypeImageId = this.hdh.imageTypeId;
                  this.loading = false;
                  this.cdr.detectChanges();
                });
            });
          });
      }
    });
    this.cdr.detectChanges();
  }

  modify(): void {
    this.modalSrv.create({
      nzTitle: 'Xác nhận thay đổi hệ điều hành',
      nzContent:
        'Quý khách chắn chắn muốn thực hiện thay đổi hệ điều hành máy ảo?',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.save();
      },
    });
  }

  save(): void {
    this.rebuildInstances.regionId = this.instancesModel.regionId;
    this.rebuildInstances.customerId = this.instancesModel.customerId;
    this.rebuildInstances.imageId = this.hdh.id;
    this.rebuildInstances.flavorId = this.instancesModel.flavorId;
    this.rebuildInstances.id = this.instancesModel.id;
    this.dataService.rebuild(this.rebuildInstances).subscribe(
      (data: any) => {
        console.log(data);
        this.message.success('Thay đổi hệ điều hành thành công');
        this.returnPage();
      },
      (error) => {
        console.log(error.error);
        this.message.error('Thay đổi hệ điều hành không thành công');
      }
    );
  }
  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.region = region.regionId;
    console.log(this.tokenService.get()?.userId);
  }

  navigateToEdit() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit/' + this.id,
    ]);
  }
  navigateToChangeImage() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit-info/' + this.id,
    ]);
  }
  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/instances']);
  }
}
