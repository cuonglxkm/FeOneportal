def image
def imageTag
def appName

pipeline {
    agent {
        label agentLabel
    }
    environment {
        PACKAGE_NAME = "oneportal-frontend_${env.GIT_BRANCH.replaceAll("/","_")}_${env.GIT_COMMIT.substring(0, 5)}"
    }
    stages {

        stage("Initializing") {
            steps {
                script {
                    sh 'kubectl -n vnptcloud  rollout restart deployment/app-host-deployment'
                    sh 'kubectl -n vnptcloud  rollout restart deployment/app-smartcloud-deployment'
                }
            }
        }
    }
}
