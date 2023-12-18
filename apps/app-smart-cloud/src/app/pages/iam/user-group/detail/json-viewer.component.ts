import {Component, Input} from '@angular/core';
import {JsonEditorOptions} from "@maaxgr/ang-jsoneditor";
@Component({
    selector: 'one-portal-json-viewer',
    templateUrl: './json-viewer.component.html',
})
export class JsonViewerComponent {
    @Input() value: {}

    public editorOptions: JsonEditorOptions;
    public initialData: any;
    public visibleData: any;


    constructor() {
        this.editorOptions = new JsonEditorOptions()
        this.editorOptions.mode = 'view'
        this.editorOptions.statusBar = false;
        // this.editorOptions.aceEd
        this.initialData = this.value
        console.log('value', this.value)
        this.visibleData = this.initialData

    }

    showJson(d: Event) {
        this.visibleData = d;
        this.editorOptions.expandAll=false
    }
}
