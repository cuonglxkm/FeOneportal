import {MockRequest} from "@delon/mock";

export const POLICY = {
  'GET /policy': {
    "totalCount": 11,
    "records": [
      {
        "id": 1,
        "name": "sonChu",
        "type": "Dev quèn",
        "description": "Đẹp trai",
        "jsonData": {"name": "xinchao", "des": "nothing"}
      },
      {
        "id": 999,
        "name": "yenPro",
        "type": "Quản lý",
        "description": "nothinggg",
        "jsonData": {"name": "check it", "des": "pro vip"}
      }
    ],
    "pageSize": 5,
    "currentPage": 0,
    "previousPage": 0
  },

  'GET /services': {
    "totalCount": 11,
    "records": [
      {
        "id": 1,
        "name": "ssh Key",
        "description": "Tạo mới thôi",
      },
      {
        "id": 2,
        "name": "IP Pulic",
        "description": "Mô tả xóa",
      }
    ],
    "pageSize": 5,
    "currentPage": 0,
    "previousPage": 0
  }
};
