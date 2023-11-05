import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import {preloaderFinished} from "@delon/theme";
import {ViewEncapsulation} from "@angular/core";
import {NzSafeAny} from "ng-zorro-antd/core/types";

preloaderFinished();
// platformBrowserDynamic()
//   .bootstrapModule(AppModule)
//   .catch((err) => console.error(err));
platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    defaultEncapsulation: ViewEncapsulation.Emulated,
    preserveWhitespaces: false
  })
  .then(res => {
    const win = window as NzSafeAny;
    if (win && win.appBootstrap) {
      win.appBootstrap();
    }
    return res;
  })
  .catch(err => console.error(err));
