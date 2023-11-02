import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { DriverService } from '@core/services/common/driver.service';
import { PageHeaderType } from '@app/core/models/interfaces/page';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Setup',
    breadcrumb: ['Home', 'Setup'],
    desc: 'Used to guide the user'
  };

  constructor(private driverService: DriverService) {}

  go(): void {
    this.driverService.load();
  }

  ngOnInit(): void {}
}
