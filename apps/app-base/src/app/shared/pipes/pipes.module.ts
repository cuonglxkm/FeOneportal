import { NgModule } from '@angular/core';

import { ChangNumberToChinesePipe } from './chang-number-to-chinese.pipe';
import { HtmlPipe } from './html.pipe';
import { MapPipe } from './map.pipe';
import { NumberLoopPipe } from './number-loop.pipe';
import { TableFiledPipe } from './table-filed.pipe';
import { EmailToNamePipe } from './email-to-name.pipe';

const PIPES = [ChangNumberToChinesePipe, NumberLoopPipe, HtmlPipe, MapPipe, TableFiledPipe, EmailToNamePipe];

@NgModule({
  declarations: [...PIPES],
  imports: [],
  exports: [...PIPES]
})
export class PipesModule {}
