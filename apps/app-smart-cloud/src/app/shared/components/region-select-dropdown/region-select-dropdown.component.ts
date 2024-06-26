import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import { RegionModel, RegionCoreService, CoreDataService } from '../../../../../../../libs/common-utils/src';
import {environment} from '@env/environment';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'region-select-dropdown',
  templateUrl: './region-select-dropdown.component.html',
  styleUrls: ['./region-select-dropdown.component.less'],
})
export class RegionSelectDropdownComponent implements OnInit {
    @Input() isAdvance: boolean;
    @Input() isDetail = false;
    @Output() valueChanged = new EventEmitter();
    @Output() userChanged = new EventEmitter();
    @Output() regionChange = new EventEmitter();
    selectedRegion: RegionModel;
    listRegion: RegionModel[] = []
    constructor(private regionService: RegionCoreService, private coreDataService: CoreDataService, private router: Router,private notification: NzNotificationService) {
    }



    ngOnInit() {
      if (localStorage.getItem('regions')) {
        if (localStorage.getItem('regionId') != null) {
          this.selectedRegion = this.listRegion.find(item => item.regionId == JSON.parse(localStorage.getItem('regionId')));
        } else {
          this.selectedRegion = this.listRegion[0];
          localStorage.setItem('regionId', JSON.stringify(this.listRegion[0].regionId))
        }
        this.listRegion = JSON.parse(localStorage.getItem('regions'));
        this.setSelectedRegionFromLocalStorage();
      } else {
        this.regionService.getAll(environment['baseUrl']).subscribe({
          next: (data) => {
            this.listRegion = data;
            localStorage.setItem('regions', JSON.stringify(this.listRegion));
            this.setSelectedRegionFromLocalStorage();
          },
          error: (error) => {
            this.listRegion = [];
          }
        });
      }
    }

    setSelectedRegionFromLocalStorage() {   
      let baseUrl = environment['baseUrl'];
      if (this.isAdvance) {
        this.selectedRegion = this.listRegion[2];
        localStorage.setItem('regionId', JSON.stringify(this.listRegion[2].regionId));
        this.regionChange.emit(this.listRegion[2]);
      } else {
        this.selectedRegion = this.listRegion[1];
        localStorage.setItem('regionId', JSON.stringify(this.listRegion[1].regionId));
        this.regionChange.emit(this.listRegion[1]);
      }
    }

    updateSelectedRegion() {
      let baseUrl = environment['baseUrl'];
      console.log(this.isAdvance);
      if (this.isAdvance) {
        this.selectedRegion = this.listRegion[2];
        localStorage.setItem('regionId', JSON.stringify(this.listRegion[2].regionId));
        this.regionChange.emit(this.listRegion[2]);
      } else {
        this.setSelectedRegionFromLocalStorage();
      }
    }

    regionChanged(region: RegionModel) {
      if(this.isAdvance && region.regionId !== 7){
        this.notification.error('Thất bại', 'Khu vực không hợp lệ!')
        this.router.navigate(['/app-smart-cloud/dashboard'])
      }else if(!this.isAdvance && region.regionId === 7){
        this.notification.error('Thất bại', 'Khu vực không hợp lệ!')
        this.router.navigate(['/app-smart-cloud/dashboard'])
      }else{
        let baseUrl = environment['baseUrl'];
        localStorage.setItem('regionId', JSON.stringify(region.regionId))
        this.coreDataService.getProjects(baseUrl, region.regionId);
        localStorage.removeItem('projectId')
        this.valueChanged.emit(region);
      }
    }
}
