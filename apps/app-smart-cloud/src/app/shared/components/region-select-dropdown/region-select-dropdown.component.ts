import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {RegionModel} from "../../models/region.model";
import {RegionService} from "../../services/region.service";

@Component({
  selector: 'region-select-dropdown',
  templateUrl: './region-select-dropdown.component.html',
  styleUrls: ['./region-select-dropdown.component.less'],
})
export class RegionSelectDropdownComponent implements OnInit {

  @Output() valueChanged = new EventEmitter();
  selectedRegion: RegionModel;
  listRegion: RegionModel[] = []

  constructor(private regionService: RegionService) {
  }

  ngOnInit() {
    this.regionService.getAll().subscribe(data => {
      // console.log(data);
      this.listRegion = data;
      if (this.listRegion.length > 0) {
        if (localStorage.getItem('region') != null) {
          this.selectedRegion = this.listRegion.find(item =>
            item.regionId == JSON.parse(localStorage.getItem('region')).regionId);
          this.valueChanged.emit(this.selectedRegion)
        } else {
          this.selectedRegion = this.listRegion[0];
          this.valueChanged.emit(this.listRegion[0])
          localStorage.setItem('region', JSON.stringify(this.listRegion[0]))
        }

      }
    }, error => {
      this.listRegion = []
    });
  }

  regionChanged(region: RegionModel) {
    localStorage.setItem('region', JSON.stringify(region))
    localStorage.removeItem('projectId')
    this.valueChanged.emit(region);
  }

}
