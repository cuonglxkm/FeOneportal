import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@Injectable({
    providedIn: 'root'
})
export class TranslationLoader {
    constructor(private http: HttpClient) { }

    getTranslation(lang: string) {
        return new TranslateHttpLoader(this.http, `../assets/i18n/`, '.json').getTranslation(lang);
    }
}
