import {VmDto} from "../dto/vm.dto";

export class GetAllVmModel {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  previousPage: number;
  records: VmDto[];

}
