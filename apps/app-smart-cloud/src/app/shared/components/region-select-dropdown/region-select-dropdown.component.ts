import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import { RegionModel, RegionCoreService, CoreDataService } from '../../../../../../../libs/common-utils/src';
import {environment} from '@env/environment';

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
  @Output() initComplete = new EventEmitter<void>();
  selectedRegion: RegionModel;
  listRegion: RegionModel[] = []

  constructor(private regionService: RegionCoreService, private coreDataService: CoreDataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isAdvance']) {
      this.updateSelectedRegion();
    }
  }

  ngOnInit() {
    if (localStorage.getItem('regions')) {
      this.listRegion = JSON.parse(localStorage.getItem('regions'));
      this.setSelectedRegionFromLocalStorage();
      this.initComplete.emit();
    } else {
      this.regionService.getAll(environment['baseUrl']).subscribe({
        next: (data) => {
          this.listRegion = data;
          localStorage.setItem('regions', JSON.stringify(this.listRegion));
          this.setSelectedRegionFromLocalStorage();
          this.initComplete.emit();
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
      this.coreDataService.getProjects(baseUrl, this.listRegion[2].regionId);
      localStorage.removeItem('projectId')
    } else {
        this.selectedRegion = this.listRegion[1];
        localStorage.setItem('regionId', JSON.stringify(this.listRegion[1].regionId));
        console.log(this.listRegion[1].regionId);
        
        this.coreDataService.getProjects(baseUrl, this.listRegion[1].regionId);
        localStorage.removeItem('projectId')
    }
  }

   updateSelectedRegion() {
    debugger
    console.log(this.isAdvance);
    let baseUrl = environment['baseUrl'];
    if (this.isAdvance) {
      this.selectedRegion = this.listRegion[2];
      localStorage.setItem('regionId', JSON.stringify(this.listRegion[2].regionId));
      this.coreDataService.getProjects(baseUrl, this.listRegion[2].regionId);
      localStorage.removeItem('projectId')
    } else {
      this.setSelectedRegionFromLocalStorage();
    }
  }

  regionChanged(region: RegionModel) {
    let baseUrl = environment['baseUrl'];
    localStorage.setItem('regionId', JSON.stringify(region.regionId))
    this.coreDataService.getProjects(baseUrl, region.regionId);
    localStorage.removeItem('projectId')
    this.valueChanged.emit(region);
  }
}
