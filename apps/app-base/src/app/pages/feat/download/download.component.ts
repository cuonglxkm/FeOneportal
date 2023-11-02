import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { DestroyService } from '@core/services/common/destory.service';
// import { ip } from '@env/environment.prod';
import { DownloadService } from '@services/download/download.service';
import { PageHeaderType } from '@app/core/models/interfaces/page';
import FileSaver from 'file-saver';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Download',
    breadcrumb: ['Home', 'Features', 'Download'],
    desc: 'Various file downloads'
  };

  constructor(private downloadService: DownloadService, private destroy$: DestroyService) {}

  ngOnInit(): void {}

  fileStreamDownload(): void {
    // const downloadDto = {
    //   downloadUrl: `http://${ip}/api/file/图纸实际材料量导入模板.xlsx`
    // };
    // this.downloadService
    //   .fileStreamDownload(downloadDto)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(res => {
    //     const blob = new Blob([res], { type: 'text/plain;charset=utf-8' });
    //     FileSaver.saveAs(blob, '材料库导入模板.xlsx');
    //   });
  }
}
