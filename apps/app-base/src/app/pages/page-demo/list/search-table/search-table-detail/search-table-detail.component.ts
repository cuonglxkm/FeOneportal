import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { fnCheckForm } from '@utils/tools';

@Component({
  selector: 'app-search-table-detail',
  templateUrl: './search-table-detail.component.html'
})
export class SearchTableDetailComponent implements OnInit, OnDestroy {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Details',
    // desc: 'A form page is used to collect or validate information from users, and a basic form is commonly used in form scenarios with few data items.',
    breadcrumb: ['Home', 'List Page', 'Search Table', 'Details']
  };
  validateForm!: FormGroup;
  name = '';
  backUrl = '/admin/page-demo/list/search-table';

  constructor(private routeParam: ActivatedRoute, public cdr: ChangeDetectorRef, private fb: FormBuilder) {}

  initForm(): void {
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]]
    });
  }

  submitForm(): void {
    if (!fnCheckForm(this.validateForm)) {
      return;
    }
  }

  _onReuseDestroy(): void {
    console.log('This tab has been destroyed, calling _OnReuseDestroy.');
  }

  ngOnInit(): void {
    this.initForm();
    this.routeParam.params.subscribe(res => {
      this.name = res['name'];
      this.validateForm.get('userName')?.setValue(this.name);
    });
  }

  ngOnDestroy(): void {
    console.log('Component instance is being destroyed, call ngOnDestroy.');
  }
}
