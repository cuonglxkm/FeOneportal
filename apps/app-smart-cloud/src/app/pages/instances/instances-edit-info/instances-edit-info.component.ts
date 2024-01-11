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
  Image,
  InstancesModel,
  RebuildInstances,
  OfferItem,
} from '../instances.model';
import { InstancesService } from '../instances.service';
import { RegionModel } from 'src/app/shared/models/region.model';
import { concatMap, finalize, from } from 'rxjs';
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

  region: number;
  projectId: number;
  customerId: number;
  email: string;
  //userId: number = this.tokenService.get()?.userId;

  rebuildInstances: RebuildInstances = new RebuildInstances();

  instancesModel: InstancesModel;
  id: number;
  pagedCardListImages: Array<Array<any>> = [];

  //#region Hệ điều hành
  listImageTypes: ImageTypesModel[] = [];
  isSelected: boolean = false;
  hdh: Image;
  currentImage: Image;
  listSelectedImage = [];
  selectedImageTypeId: number;
  listOfImageByImageType: Map<number, Image[]> = new Map();
  imageTypeId = [];

  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 4, lg: 5, all: 0 },
    speed: 250,
    point: {
      visible: true,
    },
    touch: true,
    loop: true,
    // interval: { timing: 1500 },
    animation: 'lazy',
  };

  onInputHDH(event: any, index: number, imageTypeId: number) {
    this.hdh = event;
    this.selectedImageTypeId = imageTypeId;
    for (let i = 0; i < this.listSelectedImage.length; ++i) {
      if (i != index) {
        this.listSelectedImage[i] = 0;
      }
    }
    if (this.currentImage.id != event) {
      this.isSelected = true;
    } else {
      this.isSelected = false;
    }
    console.log('Hệ điều hành', this.hdh);
    console.log('list seleted Image', this.listSelectedImage);
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
    private loadingSrv: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.email = this.tokenService.get()?.email;
    this.getAllImageType();
    this.router.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.dataService
          .getById(this.id, false)
          .subscribe((dataInstance: any) => {
            this.instancesModel = dataInstance;
            this.region = this.instancesModel.regionId;
            this.getAllOfferImage(this.imageTypeId);
            this.dataService
              .getImageById(this.instancesModel.imageId)
              .pipe(finalize(() => this.loadingSrv.close()))

              .subscribe((dataimage: any) => {
                //this.hdh = dataimge;
                this.currentImage = dataimage;
                //  this.selectedTypeImageId = this.hdh.imageTypeId;
                this.loading = false;
                this.cdr.detectChanges();
              });
          });
      }
    });
    this.cdr.detectChanges();
  }

  getAllImageType() {
    this.dataService.getAllImageType().subscribe((data: any) => {
      this.listImageTypes = data;
      this.listImageTypes.forEach (e => {
        this.imageTypeId.push(e.id);
      })
      console.log('list image types', this.listImageTypes);
    });
  }

  getAllOfferImage(imageTypeId: any[]) {
    imageTypeId.forEach((id) => {
      let listImage: Image[] = [];
      this.listOfImageByImageType.set(id, listImage);
    });
    this.dataService
      .getListOffers(144, this.region, 'VM-Image')
      .subscribe((data: OfferItem[]) => {
        data.forEach((e: OfferItem) => {
          let tempImage = new Image();
          e.characteristicValues.forEach((char) => {
            if (char.charOptionValues[0] == 'Id') {
              tempImage.id = Number.parseInt(char.charOptionValues[1]);
              tempImage.name = e.offerName;
            }
            if (char.charOptionValues[0] == 'ImageTypeId') {
              this.listOfImageByImageType
                .get(Number.parseInt(char.charOptionValues[1]))
                .push(tempImage);
            }
          });
        });
        this.cdr.detectChanges();
        console.log('list Images', this.listOfImageByImageType);
      });
  }

  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.region = region.regionId;
    console.log(this.tokenService.get()?.userId);
    this.getAllOfferImage(this.imageTypeId);
    this.cdr.detectChanges();
  }
  onProjectChange(project: any) {}

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
