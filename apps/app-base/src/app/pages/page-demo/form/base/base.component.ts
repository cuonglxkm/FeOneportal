import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { fnCheckForm } from '@utils/tools';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseComponent implements OnInit, OnDestroy {
  @ViewChild('dragTpl', { static: true }) dragTpl!: TemplateRef<NzSafeAny>;
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Basic Form',
    desc: 'Form pages are used to collect or verify information to users, and basic forms are common in scenarios where there are fewer data items. ',
    breadcrumb: ['Home', 'Form', 'Basic Form']
  };
  listOfOption = [
    { label: 'Colleague A', value: 'Colleague A' },
    { label: 'Colleague B', value: 'Colleague B' },
    { label: 'Colleague C', value: 'Colleague C' }
  ];

  validateForm!: FormGroup;

  submitForm(): void {
    if (!fnCheckForm(this.validateForm)) {
      return;
    }
    console.log(this.validateForm.value);
  }

  constructor(private fb: FormBuilder) {}

  initForm(): void {
    this.validateForm = this.fb.group({
      title: [null, [Validators.required]],
      date: [null, [Validators.required]],
      desc: [null, [Validators.required]],
      standard: [null, [Validators.required]],
      client: [null],
      invitedCommenter: [null],
      weights: [null],
      isPublic: [null]
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    console.log('jichu');
  }
}
