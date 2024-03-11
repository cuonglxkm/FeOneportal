import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-bucket-list',
  templateUrl: './bucket-list.component.html',
  styleUrls: ['./bucket-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketListComponent implements OnInit {
  searchParam: string = '';
  listBucket: any[] = [];
  loading: boolean = true;

  constructor(
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  search() {}

  createBucket() {
    this.router.navigate(['/app-smart-cloud/object-storage/bucket/create']);
  }

  extendObjectStorage() {}

  updateObjectStorage() {}

  deleteObjectStorage() {}
}
