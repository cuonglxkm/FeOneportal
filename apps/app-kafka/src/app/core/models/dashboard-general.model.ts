export class DashboardGeneral {
    partitions: number;
    offline_partitions: number;
    topics: number;
    messages: number;

    constructor() {
        this.partitions = 0;
        this.offline_partitions = 0;
        this.topics = 0;
        this.messages = 0;
    }
}
