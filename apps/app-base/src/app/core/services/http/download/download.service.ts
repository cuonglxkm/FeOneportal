import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseHttpService } from '@services/base-http.service';
import { DownLoadObj } from '@app/core/models/interfaces/download';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  constructor(public http: BaseHttpService) {}

  public fileStreamDownload(downloadDto: DownLoadObj): Observable<string> {
    return this.http.downLoadWithBlob('/file/download/document', downloadDto, { needSuccessInfo: false });
  }
}
