import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlavorService} from "../../services/flavor.service";
import Flavor, {FlavorSearchForm} from "../../models/flavor.model";

@Component({
  selector: 'one-portal-flavor-select',
  templateUrl: './flavor-select.component.html',
})
export class FlavorSelectComponent implements OnInit{
  @Input() value?: Flavor
  @Input() region?: number
  @Output() onChange = new EventEmitter();

  show: boolean = true
  isBasic: boolean = false
  isVpc: boolean = false
  showAll: boolean = true
  flavorList: Flavor[] = []
  constructor(
    private flavorService: FlavorService
  ) {
  }

  onSelect(flavor: Flavor) {
    this.onChange.emit(flavor);
  }
  getFlavorList () {
    const condition: FlavorSearchForm = {
      show: this.show,
      region: this.region,
      isBasic: this.isBasic,
      isVpc: this.isVpc,
      showAll: this.showAll,
    }
    this.flavorService.search(condition).subscribe(
      (data) => {
        this.flavorList = data
      }
    )
  }

  ngOnInit() {
    this.getFlavorList()
  }
}
