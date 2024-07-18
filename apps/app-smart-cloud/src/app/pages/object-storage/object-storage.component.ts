import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { RegionModel } from '../../../../../../libs/common-utils/src';
import { RegionID } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-object-storage',
  templateUrl: './object-storage.component.html',
  styleUrls: ['./object-storage.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectStorageComponent {
  region = JSON.parse(localStorage.getItem('regionId'));
  constructor(private router: Router) {}
  navigateCreate() {
    if(this.region === RegionID.ADVANCE){
      this.router.navigate(['/app-smart-cloud/object-storage-advance/create']);
    }else{
      this.router.navigate(['/app-smart-cloud/object-storage/create']);
    }
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }
}
