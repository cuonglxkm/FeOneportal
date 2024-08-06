@Library('cloudportaldevops')_

def listService = [
    [serviceName: 'app-host', dockerFilePath: 'apps/app-host/Dockerfile_prod'],
    [serviceName: 'app-smartcloud', dockerFilePath: 'apps/app-smart-cloud/Dockerfile_prod'],
]

def share = new org.fe.FrontEndCiCd()
def input = new org.fe.FrontEndInput(
    listService: listService
)
share.basePipeline(input)