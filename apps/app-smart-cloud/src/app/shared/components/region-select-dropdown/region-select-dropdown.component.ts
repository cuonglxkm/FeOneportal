import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import {
  CoreDataService,
  RegionCoreService,
  RegionModel,
} from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'region-select-dropdown',
  templateUrl: './region-select-dropdown.component.html',
  styleUrls: ['./region-select-dropdown.component.less'],
})
export class RegionSelectDropdownComponent implements OnInit {
  @Input() isDetail = false;
  @Output() valueChanged = new EventEmitter();
  @Output() userChanged = new EventEmitter();
  @Output() regionChange = new EventEmitter();
  selectedRegion: RegionModel;
  listRegion: RegionModel[] = [];
  url = window.location.pathname;
  constructor(
    private regionService: RegionCoreService,
    private coreDataService: CoreDataService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (localStorage.getItem('regions')) {
      this.listRegion = JSON.parse(localStorage.getItem('regions'));
      if (
        localStorage.getItem('regionId') != null &&
        !this.url.includes('advance')
      ) {
        this.selectedRegion = this.listRegion.find(
          (item) =>
            item.regionId == JSON.parse(localStorage.getItem('regionId'))
        );
        if (this.selectedRegion.regionId === 7) {
          this.selectedRegion = this.listRegion[0];
          this.setSelectedRegionFromLocalStorage();
        } else {
          return;
        }
      } else if (
        localStorage.getItem('regionId') != null &&
        this.url.includes('advance')
      ) {
        this.selectedRegion = this.listRegion[1];
        this.setSelectedRegionFromLocalStorage();
      }
    } else {
      this.regionService.getAll(environment['baseUrl']).subscribe({
        next: (data) => {
          this.listRegion = data;
          localStorage.setItem('regions', JSON.stringify(this.listRegion));
          this.setSelectedRegionFromLocalStorage();
        },
        error: (error) => {
          this.listRegion = [];
        },
      });
    }
  }

  setSelectedRegionFromLocalStorage() {
    if (this.url.includes('advance')) {
      this.selectedRegion = this.listRegion[1];
      localStorage.setItem(
        'regionId',
        JSON.stringify(this.listRegion[1].regionId)
      );
      this.regionChange.emit(this.listRegion[1]);
    } else {
      this.selectedRegion = this.listRegion[0];
      localStorage.setItem(
        'regionId',
        JSON.stringify(this.listRegion[0].regionId)
      );
      this.regionChange.emit(this.listRegion[0]);
    }
  }

  regionChanged(region: RegionModel) {
    let baseUrl = environment['baseUrl'];
    const regionId = region.regionId;

    const bucketPath = '/app-smart-cloud/object-storage/bucket';
    const bucketAdvancePath = '/app-smart-cloud/object-storage-advance/bucket';
    const subUserPath = '/app-smart-cloud/object-storage/sub-user/list';
    const subUserAdvancePath = '/app-smart-cloud/object-storage/sub-user-advance/list';
    const s3KeyPath = '/app-smart-cloud/object-storage/s3-key';
    const s3KeyAdvancePath = '/app-smart-cloud/object-storage/s3-key-advance';
    const dashboardPath = '/app-smart-cloud/object-storage/dashboard';
    const dashboardAdvancePath = '/app-smart-cloud/object-storage/dashboard-advance';
    const volumesPath = '/app-smart-cloud/volumes';
    const volumesAdvancePath = '/app-smart-cloud/volumesadvance';
    const instancesPath = '/app-smart-cloud/instances';
    const instancesAdvancePath = '/app-smart-cloud/instanceadvance';

    if (this.url === bucketAdvancePath && regionId !== 7) {
      this.router.navigate([bucketPath]);
    } else if (this.url === bucketPath && regionId === 7) {
      this.router.navigate([bucketAdvancePath]);
    } if (this.url === subUserAdvancePath && regionId !== 7) {
      this.router.navigate([subUserPath]);
    } else if (this.url === subUserPath && regionId === 7) {
      this.router.navigate([subUserAdvancePath]);
    } if (this.url === s3KeyAdvancePath && regionId !== 7) {
      this.router.navigate([s3KeyPath]);
    } else if (this.url === s3KeyPath && regionId === 7) {
      this.router.navigate([s3KeyAdvancePath]);
    } if (this.url === dashboardAdvancePath && regionId !== 7) {
      this.router.navigate([dashboardPath]);
    } else if (this.url === dashboardPath && regionId === 7) {
      this.router.navigate([dashboardAdvancePath]);
    } else if (this.url === volumesAdvancePath && regionId !== 7) {
      this.router.navigate([volumesPath]);
    } else if (this.url === volumesPath && regionId === 7) {
      this.router.navigate([volumesAdvancePath]);
    }else if (this.url === instancesAdvancePath && regionId !== 7) {
      this.router.navigate([instancesPath]);
    } else if (this.url === instancesPath && regionId === 7) {
      this.router.navigate([instancesAdvancePath]);
    }
    
    localStorage.setItem('regionId', JSON.stringify(regionId));
    // this.coreDataService.getProjects(baseUrl, regionId);
    localStorage.removeItem("projects");
    localStorage.removeItem("projectId");
    this.valueChanged.emit(region);
  }
}
