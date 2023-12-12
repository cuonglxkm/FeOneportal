export const GROUPCREATEUSER = {
    'GET /groupCreateUsers':{
    "totalCount": 3,
    "records": [
      {
        "id": 1,
        "name": "SI",
        "numberUsers": 12,
        "attachedPolicies": [],
        "createdTime": "2023-11-20T01:34:12.367Z",
      },
      {
        "id": 2,
        "name": "VNPTIT",
        "numberUsers": 3,
        "attachedPolicies": ['customer manager'],
        "createdTime": "2023-11-20T01:34:12.367Z",
      },
      {
        "id": 3,
        "name": "BU",
        "numberUsers": 0,
        "attachedPolicies": ['customer manager', 'portal manager', 'Admin'],
        "createdTime": "2023-11-20T01:34:12.367Z",
      }
    ],
    "pageSize": 5,
    "currentPage": 0,
    "previousPage": 0
  },
};