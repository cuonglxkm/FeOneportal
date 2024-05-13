import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { RegionModel, RegionService } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'region-select-dropdown',
  templateUrl: './region-select-dropdown.component.html',
  styleUrls: ['./region-select-dropdown.component.less'],
})
export class RegionSelectDropdownComponent implements OnInit {

  @Input() isDetail = false;
  @Output() valueChanged = new EventEmitter();
  @Output() userChanged = new EventEmitter();
  selectedRegion: RegionModel;
  listRegion: RegionModel[] = []

  constructor(private regionService: RegionService) {
  }

  ngOnInit() {
    if (localStorage.getItem('regions')) {
      this.listRegion = JSON.parse(localStorage.getItem('regions'));
      if (localStorage.getItem('regionId') != null) {
        this.selectedRegion = this.listRegion.find(item => item.regionId == JSON.parse(localStorage.getItem('regionId')));
      } else {
        this.selectedRegion = this.listRegion[0];
        localStorage.setItem('regionId', JSON.stringify(this.listRegion[0].regionId))
      }
    } else {
      this.regionService.getAll().subscribe({
        next :(data) => {
          this.listRegion = data;
          if (this.listRegion.length > 0) {
            if (localStorage.getItem('regionId') != null) {
              this.selectedRegion = this.listRegion.find(item =>
                item.regionId == JSON.parse(localStorage.getItem('regionId')));
            } else {
              this.selectedRegion = this.listRegion[0];
              localStorage.setItem('region', JSON.stringify(this.listRegion[0]))
            }
          }
        }, error : (error) => {
          this.listRegion = []
        }
      });
    }
  }

  regionChanged(region: RegionModel) {
    localStorage.setItem('regionId', JSON.stringify(region.regionId))
    localStorage.removeItem('projectId')
    this.valueChanged.emit(region);
  }
}
