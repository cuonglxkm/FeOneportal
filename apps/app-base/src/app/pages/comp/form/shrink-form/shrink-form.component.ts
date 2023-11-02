import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';

interface SearchParam {
  ruleName: number;
  desc: string;
}

@Component({
  selector: 'app-shrink-form',
  templateUrl: './shrink-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShrinkFormComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Collapsible form example',
    breadcrumb: ['Home', 'Components', 'Form', 'Collapsible form'],
    desc: 'Collapsible form'
  };

  searchParam: Partial<SearchParam> = {};

  isCollapse = true;

  /*Reset*/
  resetForm(): void {
    this.searchParam = {};
  }

  /*Expand*/
  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor() {}

  ngOnInit(): void {}
}
