import { NzSafeAny } from "ng-zorro-antd/core/types";

export interface LazyResult {
    path: string;
    status: 'ok' | 'error' | 'loading';
    error?: NzSafeAny;
  }