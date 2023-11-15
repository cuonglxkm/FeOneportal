import {MockRequest} from "@delon/mock";

export const IP_PUBLIC = {
  'GET /ip': {
    "totalCount": 11,
    "records": [
      {
        "ipAddress": "11111",
        "portCloudId": "d9bbaca3-b247-4ab4-8225-8d982f1db2fc",
        "customerId": 669,
        "attachedVmId": null,
        "region": 3,
        "regionText": "Hà Nội 2",
        "createDate": "2023-11-06T11:17:41.407",
        "status": 2,
        "cloudIdentity": 91,
        "projectName": "vpc-toanv1",
        "projectId": 4079,
        "networkId": "5062a2d0-c46e-4fbc-bdf4-9dd6ae8df038",
        "iPv6Address": null,
        "serviceStatus": "CREATE",
        "id": 4731
      },
      {
        "ipAddress": "111111111222",
        "portCloudId": "48ca1d11-7081-429b-a52c-e2909ae91a2a",
        "customerId": 669,
        "attachedVmId": null,
        "region": 3,
        "regionText": "Hà Nội 2",
        "createDate": "2023-11-06T10:15:53.567",
        "status": 0,
        "cloudIdentity": 91,
        "projectName": "vpc-toanv1",
        "projectId": 4079,
        "networkId": "5062a2d0-c46e-4fbc-bdf4-9dd6ae8df038",
        "iPv6Address": "ahihi",
        "serviceStatus": "IN_USE",
        "id": 4730
      },
      {
        "ipAddress": null,
        "portCloudId": "93cd387e-8e19-4d2d-9bc1-1f2f3a28a539",
        "customerId": 669,
        "attachedVmId": null,
        "region": 3,
        "regionText": "Hà Nội 2",
        "createDate": "2023-10-31T14:38:52.517",
        "status": 0,
        "cloudIdentity": 91,
        "projectName": "toannv8669",
        "projectId": 310,
        "networkId": "9bb20595-5039-4540-ac4b-47bc48af6102",
        "iPv6Address": null,
        "serviceStatus": null,
        "id": 4729
      },
      {
        "ipAddress": null,
        "portCloudId": "93cd387e-8e19-4d2d-9bc1-1f2f3a28a539",
        "customerId": 669,
        "attachedVmId": null,
        "region": 3,
        "regionText": "Hà Nội 2",
        "createDate": "2023-10-31T14:37:03.97",
        "status": 0,
        "cloudIdentity": 91,
        "projectName": "toannv8669",
        "projectId": 310,
        "networkId": "9bb20595-5039-4540-ac4b-47bc48af6102",
        "iPv6Address": null,
        "serviceStatus": null,
        "id": 4728
      },
      {
        "ipAddress": null,
        "portCloudId": "93cd387e-8e19-4d2d-9bc1-1f2f3a28a539",
        "customerId": 669,
        "attachedVmId": null,
        "region": 3,
        "regionText": "Hà Nội 2",
        "createDate": "2023-10-31T14:14:47.437",
        "status": 0,
        "cloudIdentity": 91,
        "projectName": "toannv8669",
        "projectId": 310,
        "networkId": "9bb20595-5039-4540-ac4b-47bc48af6102",
        "iPv6Address": null,
        "serviceStatus": null,
        "id": 4727
      }
    ],
    "pageSize": 5,
    "currentPage": 0,
    "previousPage": 0
  },

  'POST /ip-public': (req: MockRequest) => {
    const data = req.body;
    if (!(data.ten === 'admin' && data.sdt === 'user') && data.password !== 'ng-alain.com') {
      return { msg: 'Invalid username'  };
    }
    return {
      msg: 'ok',
      user: {
        token: '123456789',
        name: data.userName,
        email: 'email',
        id: 10000,
        time: +new Date(),
      }
    };
  }
};
