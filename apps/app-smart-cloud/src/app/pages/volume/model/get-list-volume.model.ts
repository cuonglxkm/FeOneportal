import {VolumeDTO} from "../dto/volume.dto";

export class GetListVolumeModel {
    totalCount: number;
    records: VolumeDTO[];
    pageSize: number;
    currentPage: number;
    previousPage: number;
}
