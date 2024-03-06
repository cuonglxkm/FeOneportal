import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'one-portal-bucket-list',
  templateUrl: './bucket-list.component.html',
  styleUrls: ['./bucket-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketListComponent implements OnInit {
  searchParam: string = ''
  listBucket: any[] = []
  loading: boolean = true;
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  search() {}

  createBucket() {}
}
