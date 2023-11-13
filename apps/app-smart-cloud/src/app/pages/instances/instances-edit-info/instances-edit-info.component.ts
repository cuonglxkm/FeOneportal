import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ImageTypesModel, Images, InstancesModel } from '../instances.model';
import { InstancesService } from '../instances.service';

@Component({
  selector: 'one-portal-instances-edit-info',
  templateUrl: './instances-edit-info.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstancesEditInfoComponent implements OnInit {
  loading = true;

  region: number = 3;
  projectId: number = 310;
  customerId: number = 669;
  //userId: number = this.tokenService.get()?.userId;

  instancesModel: InstancesModel;
  id: number;
  pagedCardListImages: Array<Array<any>> = [];
  effect = 'scrollx';

  //#region Hệ điều hành
  listImageTypes: ImageTypesModel[] = [];
  listImageVersionByType: Images[] = [];
  selectedValueVersion: any;
  isLoading = false;

  getAllImageVersionByType(type: number) {
    this.dataService
      .getAllImage(null, this.region, type, this.customerId)
      .subscribe((data: any) => {
        this.listImageVersionByType = data;
      });
  }

  onInputHDH(index: number, event: any) {
    //this.hdh = this.listImageVersionByType.find((x) => (x.id = event));
  }

  //#endregion

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private route: Router,
    public message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.router.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.dataService.getById(this.id, false).subscribe((data: any) => {
          this.instancesModel = data;
          this.dataService.getAllImageType().subscribe((data: any) => {
            this.listImageTypes = data;
            for (let i = 0; i < this.listImageTypes.length; i += 4) {
              this.pagedCardListImages.push(
                this.listImageTypes.slice(i, i + 4)
              );
              
            this.loading = false;
            this.cdr.detectChanges();
            }
          });
        });
      }
    });
  }
  navigateToEdit() {
    this.route.navigate(['/app-smart-cloud/vm/instances-edit/' + this.id]);
  }
  navigateToChangeImage() {
    this.route.navigate(['/app-smart-cloud/vm/instances-edit-info/' + this.id]);
  }
  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/vm']);
  }
}
