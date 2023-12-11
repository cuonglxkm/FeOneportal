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
        "jsonData": "{\"name\": \"xinchao\", \"des\": \"nothing\"}"
      },
      {
        "id": 999,
        "name": "yenPro",
        "type": "Quản lý",
        "description": "nothinggg",
        "jsonData": "{\"name\": \"gaptoi\", \"des\": \"mo ta\"}"
      }
    ],
    "pageSize": 5,
    "currentPage": 0,
    "previousPage": 0
  },

  'GET /policy/permission': {
    "totalCount": 11,
    "records": [
      {
        "id": 344,
        "name": "Tạo mới policy",
        "description": "Tạo mới thôi",
      },
      {
        "id": 433,
        "name": "Xóa policy",
        "description": "Mô tả xóa",
      }
    ],
    "pageSize": 5,
    "currentPage": 0,
    "previousPage": 0
  }
};
