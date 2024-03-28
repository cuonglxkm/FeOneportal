import { TemplateRef } from "@angular/core";
import { NzSafeAny } from "ng-zorro-antd/core/types";

export interface PageHeaderType {
    title: string;
    desc: string | TemplateRef<NzSafeAny>;
    extra: string | TemplateRef<NzSafeAny>;
    breadcrumb: string[];
    footer: string | TemplateRef<NzSafeAny>;
}
