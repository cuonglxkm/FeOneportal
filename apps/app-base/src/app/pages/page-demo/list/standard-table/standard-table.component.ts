import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzProgressStatusType } from 'ng-zorro-antd/progress/typings';

@Component({
  selector: 'app-standard-table',
  templateUrl: './standard-table.component.html',
  styleUrls: ['./standard-table.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandardTableComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Standard List',
    breadcrumb: ['Home', 'List Page', 'Standard List']
  };
  isSpinning = false;
  list: Array<{
    id: number;
    name: string;
    desc: string;
    avatar: string;
    owner: string;
    owner_id: string;
    time: string;
    progress: number;
    progress_status: NzProgressStatusType;
  }> = [
    {
      id: 1,
      name: 'Alipay',
      desc: 'That is something inner, which they cannot reach or touch',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
      owner: 'Fu Xiaoxiao',
      owner_id: '1',
      time: '2020-11-18 15:12',
      progress: 75,
      progress_status: 'active'
    },
    {
      id: 2,
      name: 'Angular',
      desc: 'Hope is a good thing, maybe the best of things, and good things never die.',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png',
      owner: 'Qu Lili',
      owner_id: '2',
      time: '2020-11-19 07:51',
      progress: 93,
      progress_status: 'exception'
    },
    {
      id: 3,
      name: 'Ant Design',
      desc: "Life is like a box of chocolates, you never know what you're gonna get.",
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/dURIMkkrRFpPgTuzkwnB.png',
      owner: 'Lin Dongdong',
      owner_id: '3',
      time: '2020-11-19 05:51',
      progress: 94,
      progress_status: 'active'
    },
    {
      id: 4,
      name: 'Ant Design Pro',
      desc: 'In the city with so many taverns, she happened to walk into mine.',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/sfjbOqnsXXJgNCjCzDBL.png',
      owner: 'Zhou Star Star',
      owner_id: '4',
      time: '2020-11-19 03:51',
      progress: 93,
      progress_status: 'active'
    },
    {
      id: 5,
      name: 'Bootstrap',
      desc: 'At that time, I only knew what I wanted for myself, but never thought about what I already had.',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/siCrBXXhmvTQGWPNLBow.png',
      owner: 'Wu Jiahao',
      owner_id: '5',
      time: '2020-11-19 01:51',
      progress: 91,
      progress_status: 'exception'
    }
  ];

  constructor() {}

  edit(item: NzSafeAny): void {}

  deleteItem(item: NzSafeAny): void {}

  ngOnInit(): void {}
}
