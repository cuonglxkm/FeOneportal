import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TaskManageFormComponent } from '@app/pages/page-demo/form/advanced/task-manage-form/task-manage-form.component';
import { WarehouseManageFormComponent } from '@app/pages/page-demo/form/advanced/warehouse-manage-form/warehouse-manage-form.component';
import { PageHeaderType } from '@app/core/models/interfaces/page';
import { fnCheckForm } from '@utils/tools';
import { NzMessageService } from 'ng-zorro-antd/message';

// custom form
/*https://juejin.cn/post/6844904018922176520*/
@Component({
  selector: 'app-advanced',
  templateUrl: './advanced.component.html',
  styleUrls: ['./advanced.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvancedComponent implements OnInit, OnDestroy {
  @ViewChild('warehouseManageComponent') warehouseManageComponent!: WarehouseManageFormComponent;
  @ViewChild('taskManageComponent') taskManageComponent!: TaskManageFormComponent;
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Avanced Form',
    desc: 'Advanced forms are often used in scenarios where a large amount of data is input and submitted at one time. (demo custom form)',
    breadcrumb: ['Home', 'Form', 'Avanced Form']
  };
  validateForm!: FormGroup;

  constructor(private fb: FormBuilder, public message: NzMessageService) {}

  submit(): void {
    // @ts-ignore
    if (!fnCheckForm(this.validateForm) | this.warehouseManageComponent.checkForm() | this.taskManageComponent.checkForm()) {
      return;
    }
    this.message.info('The console prints out the form data');
    console.log(this.validateForm.value);
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      warehouseManage: [null, [Validators.required]],
      taskManage: [null, [Validators.required]]
    });
  }

  ngOnDestroy(): void {
    console.log('GAOJI');
  }
}
