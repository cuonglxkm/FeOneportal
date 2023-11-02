import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';

@Component({
  selector: 'app-strength-meter',
  templateUrl: './strength-meter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StrengthMeterComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Password Strength Verification Component',
    breadcrumb: ['Home', 'Components', 'Password Verification'],
    desc: 'Check if your password strength is enough'
  };
  passwordVisible = false;
  newPassword!: string;

  constructor() {}

  ngOnInit(): void {}
}
