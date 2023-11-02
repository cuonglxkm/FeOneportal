import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TaskStateSearchCheckPeriodEnum, TaskStateSearchEnum } from '@app/core/models/enum';
import { TaskObj } from '@app/core/models/interfaces/task';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { ModalBtnStatus } from '@widget/base-modal';
import { AppendFormModalService } from '@widget/biz-widget/form/append-form-modal/append-form-modal.service';

@Component({
  selector: 'app-append-form',
  templateUrl: './append-form.component.html',
  styleUrls: ['./append-form.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppendFormComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Form addition and deletion example',
    breadcrumb: ['Home', 'Components', 'Form', 'Append Form'],
    desc: 'Example of adding and removing form fields'
  };
  taskStateSearchEnum = TaskStateSearchEnum;
  taskState = TaskStateSearchEnum.All;
  taskCheckPeriodState = TaskStateSearchCheckPeriodEnum.All;
  pageObj = {
    pageSize: 3,
    pageNum: 1
  };
  showTaskList: TaskObj[] = [];
  showAllTaskList: TaskObj[] = [
    {
      id: 1,
      taskName: 'One task',
      taskDesc: 'One task',
      taskEvaluate: null,
      equipmentId: 1,
      equipmentName: 'One task',
      systemName: 'One task',
      systemId: 1,
      taskState: 1,
      userName: 'Xiaohua',
      taskStateName: 'One task',
      taskUserId: 'One task',
      checkPeriod: 'One task',
      createTime: 1,
      updateTime: 1,
      endTime: 1,
      startTime: 1,
      finishRate: 1
    },
    {
      id: 2,
      taskName: 'One task',
      taskDesc: 'One task',
      taskEvaluate: null,
      equipmentId: 1,
      equipmentName: 'One task',
      systemName: 'One task',
      systemId: 1,
      taskState: 1,
      userName: '小张',
      taskStateName: 'One task',
      taskUserId: 'One task',
      checkPeriod: 'One task',
      createTime: 1,
      updateTime: 1,
      endTime: 1,
      startTime: 1,
      finishRate: 1
    },
    {
      id: 1,
      taskName: 'One task',
      taskDesc: 'One task',
      taskEvaluate: null,
      equipmentId: 1,
      equipmentName: 'One task',
      systemName: 'One task',
      systemId: 1,
      taskState: 1,
      userName: 'Xiao Zhang',
      taskStateName: 'One task',
      taskUserId: 'One task',
      checkPeriod: 'One task',
      createTime: 1,
      updateTime: 1,
      endTime: 1,
      startTime: 1,
      finishRate: 1
    },
    {
      id: 1,
      taskName: 'One task',
      taskDesc: 'One task',
      taskEvaluate: null,
      equipmentId: 1,
      equipmentName: 'One task',
      systemName: 'One task',
      systemId: 1,
      taskState: 1,
      userName: 'Xiaolin',
      taskStateName: 'One task',
      taskUserId: 'One task',
      checkPeriod: 'One task',
      createTime: 1,
      updateTime: 1,
      endTime: 1,
      startTime: 1,
      finishRate: 1
    }
  ];
  taskCheckPeriodStateEnum = TaskStateSearchCheckPeriodEnum;
  loading = false;
  constructor(private modalService: AppendFormModalService, private cdr: ChangeDetectorRef) {}

  pageSizeChange(event: number): void {
    this.pageObj = { ...this.pageObj, pageSize: event };
    this.getData(1);
  }

  searchTask(event: number, type: 'checkPeriod' | 'taskState'): void {
    this.pageObj = { ...this.pageObj, pageNum: 1 };

    this.showAllTaskList = this.showAllTaskList.filter(item => {
      return true;
    });

    this.pageSizeChange(this.pageObj.pageSize);
  }

  add(): void {
    this.modalService.show({ nzTitle: 'New' }).subscribe(({ modalValue, status }) => {
      if (status === ModalBtnStatus.Cancel) {
        return;
      }
      this.showAllTaskList.push(modalValue);
      this.getData(1);
      console.log(modalValue);
    });
  }

  onEllipsisChange(ellipsis: boolean): void {
    // console.log(ellipsis);
  }

  // Paging to get data
  getData(event: number = this.pageObj.pageNum): void {
    this.pageObj = { ...this.pageObj, pageNum: event };
    this.showTaskList = [...this.showAllTaskList.slice((this.pageObj.pageNum - 1) * this.pageObj.pageSize, this.pageObj.pageNum * this.pageObj.pageSize)];
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    this.getData(1);
  }
}
