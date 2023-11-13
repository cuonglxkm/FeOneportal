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
  listRegion: RegionModel[] = [
    {
      "id": 1,
      "cloudId": "Hanoi",
      "regionId": 1,
      "regionDisplayName": "Hà Nội 1"
    }
  ]

  constructor(private regionService: RegionService) {
  }

  ngOnInit() {
    this.regionService.getAll().subscribe(data => {
      console.log(data);
      this.listRegion = data;

      if (this.listRegion.length > 0) {
        this.selectedRegion = this.listRegion[0];
        this.valueChanged.emit(this.listRegion[0])
      }
    }, error => {
      this.listRegion = []
    });
  }

  regionChanged(region: RegionModel) {
    this.valueChanged.emit(region);
  }

}
