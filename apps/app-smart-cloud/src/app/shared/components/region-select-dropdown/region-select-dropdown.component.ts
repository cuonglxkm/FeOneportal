import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import {
  CoreDataService,
  RegionCoreService,
  RegionModel,
} from '../../../../../../../libs/common-utils/src';
import { RegionID } from '../../enums/common.enum';

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
    private router: Router
  ) {}

  ngOnInit() {
    const bucketPath = '/app-smart-cloud/object-storage/bucket';
    const subUserPath = '/app-smart-cloud/object-storage/sub-user/list';
    const s3KeyPath = '/app-smart-cloud/object-storage/s3-key';
    const dashboardPath = '/app-smart-cloud/object-storage/dashboard';
    const volumesPath = '/app-smart-cloud/volumes';
    const snapshotPath = '/app-smart-cloud/snapshot';
    const snapshotSchedulePath = '/app-smart-cloud/schedule/snapshot';
    const snapshotPackagePath = '/app-smart-cloud/snapshot/packages';
    const instancesPath = '/app-smart-cloud/instances';
    if (localStorage.getItem('regions')) {
     if(this.url.includes('app-smart-cloud/backup-volume') || this.url.includes('app-smart-cloud/backup-vm')|| this.url.includes('app-smart-cloud/schedule/backup') || this.url.includes('app-smart-cloud/backup/packages')) { 
      const listRegionWithoutAdvance = JSON.parse(localStorage.getItem('regions'));
      this.listRegion = listRegionWithoutAdvance.filter(x => x.id === 1)
      this.selectedRegion = this.listRegion.find(
        (item) =>
          item.regionId == JSON.parse(localStorage.getItem('regionId'))
      ); 
      this.setRegionNormal()
     }else{
      this.listRegion = JSON.parse(localStorage.getItem('regions'));
      if (
        localStorage.getItem('regionId') != null && !this.url.includes('advance')
      ) {
        this.selectedRegion = this.listRegion.find(
          (item) =>
            item.regionId == JSON.parse(localStorage.getItem('regionId'))
        );
        if (this.selectedRegion.regionId === RegionID.ADVANCE) {
          if (this.url === bucketPath || this.url === subUserPath || this.url === s3KeyPath || this.url === dashboardPath || this.url === volumesPath || this.url === snapshotPath || this.url === snapshotSchedulePath || this.url === snapshotPackagePath || this.url === instancesPath) {
            this.setRegionNormal()
          } else {
            this.setRegionAdvance()
          }
        } else {
          this.setRegionNormal()
        }
      } else if (
        localStorage.getItem('regionId') != null && this.url.includes('advance')
      ) {
        this.setRegionAdvance()
      }
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
      this.setRegionAdvance()
    } else {
      this.setRegionNormal()
    }
  }

  setRegionNormal() {
    this.selectedRegion = this.listRegion[0];
    localStorage.setItem(
      'regionId',
      JSON.stringify(this.listRegion[0].regionId)
    );
    this.regionChange.emit(this.listRegion[0]);
  }

  setRegionAdvance() {
    this.selectedRegion = this.listRegion[1];
    localStorage.setItem(
      'regionId',
      JSON.stringify(this.listRegion[1].regionId)
    );
    this.regionChange.emit(this.listRegion[1]);
  }

  regionChanged(region: RegionModel) {
    const regionId = region.regionId;

    const bucketPath = '/app-smart-cloud/object-storage/bucket';
    const bucketAdvancePath = '/app-smart-cloud/object-storage-advance/bucket';
    const subUserPath = '/app-smart-cloud/object-storage/sub-user/list';
    const subUserAdvancePath =
      '/app-smart-cloud/object-storage-advance/sub-user/list';
    const s3KeyPath = '/app-smart-cloud/object-storage/s3-key';
    const s3KeyAdvancePath = '/app-smart-cloud/object-storage-advance/s3-key';
    const dashboardPath = '/app-smart-cloud/object-storage/dashboard';
    const dashboardAdvancePath =
      '/app-smart-cloud/object-storage-advance/dashboard';

    const volumesPath = '/app-smart-cloud/volumes';
    const volumesAdvancePath = '/app-smart-cloud/volumes-advance';
    const snapshotPath = '/app-smart-cloud/snapshot';
    const snapshotAdvancePath = '/app-smart-cloud/snapshot-advance';
    const snapshotSchedulePath = '/app-smart-cloud/schedule/snapshot';
    const snapshotScheduleAdvancePath =
      '/app-smart-cloud/schedule/snapshot-advance';
    const snapshotPackagePath = '/app-smart-cloud/snapshot/packages';
    const snapshotPackageAdvancePath =
      '/app-smart-cloud/snapshot-advance/packages';

    const instancesPath = '/app-smart-cloud/instances';
    const instancesAdvancePath = '/app-smart-cloud/instances-advance';

    if (this.url === bucketAdvancePath && regionId !== RegionID.ADVANCE) {
      this.router.navigate([bucketPath]);
    } else if (this.url === bucketPath && regionId === RegionID.ADVANCE) {
      this.router.navigate([bucketAdvancePath]);
    }
    if (this.url === subUserAdvancePath && regionId !== RegionID.ADVANCE) {
      this.router.navigate([subUserPath]);
    } else if (this.url === subUserPath && regionId === RegionID.ADVANCE) {
      this.router.navigate([subUserAdvancePath]);
    }
    if (this.url === s3KeyAdvancePath && regionId !== RegionID.ADVANCE) {
      this.router.navigate([s3KeyPath]);
    } else if (this.url === s3KeyPath && regionId === RegionID.ADVANCE) {
      this.router.navigate([s3KeyAdvancePath]);
    }
    if (this.url === dashboardAdvancePath && regionId !== RegionID.ADVANCE) {
      this.router.navigate([dashboardPath]);
    } else if (this.url === dashboardPath && regionId === RegionID.ADVANCE) {
      this.router.navigate([dashboardAdvancePath]);
    } else if (
      this.url === volumesAdvancePath &&
      regionId !== RegionID.ADVANCE
    ) {
      this.router.navigate([volumesPath]);
    } else if (this.url === volumesPath && regionId === RegionID.ADVANCE) {
      this.router.navigate([volumesAdvancePath]);
    } else if (
      this.url === snapshotAdvancePath &&
      regionId !== RegionID.ADVANCE
    ) {
      this.router.navigate([snapshotPath]);
    } else if (this.url === snapshotPath && regionId === RegionID.ADVANCE) {
      this.router.navigate([snapshotAdvancePath]);
    } else if (
      this.url === snapshotScheduleAdvancePath &&
      regionId !== RegionID.ADVANCE
    ) {
      this.router.navigate([snapshotSchedulePath]);
    } else if (
      this.url === snapshotSchedulePath &&
      regionId === RegionID.ADVANCE
    ) {
      this.router.navigate([snapshotScheduleAdvancePath]);
    } else if (
      this.url === snapshotPackageAdvancePath &&
      regionId !== RegionID.ADVANCE
    ) {
      this.router.navigate([snapshotPackagePath]);
    } else if (
      this.url === snapshotPackagePath &&
      regionId === RegionID.ADVANCE
    ) {
      this.router.navigate([snapshotPackageAdvancePath]);
    } else if (
      this.url === instancesAdvancePath &&
      regionId !== RegionID.ADVANCE
    ) {
      this.router.navigate([instancesPath]);
    } else if (this.url === instancesPath && regionId === RegionID.ADVANCE) {
      this.router.navigate([instancesAdvancePath]);
    }

    localStorage.setItem('regionId', JSON.stringify(regionId));
    // this.coreDataService.getProjects(baseUrl, regionId);
    localStorage.removeItem('projects');
    localStorage.removeItem('projectId');
    this.valueChanged.emit(region);
  }
}
