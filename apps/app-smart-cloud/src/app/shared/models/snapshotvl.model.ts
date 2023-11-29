import {SnapshotVolumeDto} from "../dto/snapshot-volume.dto";

export class GetListSnapshotVlModel{
  totalCount: number;
  pageSize: number;
  currentPage: number;
  previousPage: number;
  records: SnapshotVolumeDto[];
}
