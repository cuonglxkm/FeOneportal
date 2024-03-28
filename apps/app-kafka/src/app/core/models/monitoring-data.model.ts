export class MonitoringData {
    unit: string;
    time: number[];
    results: any;

}

export class FilterOptionModel {
    resources: string[];
    metrics: string[];
    resourceType: string;
    interval: number;
}
