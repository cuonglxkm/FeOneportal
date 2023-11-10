import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { InstancesModel } from '../instances.model';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { VMService } from '../instances.service';

@Component({
  selector: 'one-portal-instances-detail',
  templateUrl: './instances-detail.component.html',
  styleUrls: ['./instances-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstancesDetailComponent implements OnInit {
  instancesModel: InstancesModel;
  id: number;
  constructor(
    private dataService: VMService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.dataService.getById(this.id, false).subscribe((data: any) => {
      this.instancesModel = data;
    });
  }
}
