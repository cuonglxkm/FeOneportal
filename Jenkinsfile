#!/usr/bin/env groovy
def agentLabel = "it-si-cloud-linux1"
pipeline {
    agent { label 'it-si-cloud-linux1' }
    environment {
        PACKAGE_NAME = "oneportal-frontend_${env.GIT_BRANCH.replaceAll("/","_")}_${env.GIT_COMMIT.substring(0, 5)}"
    }
    stages {
        stage('Show Build environment') {
            steps {
                sh 'env'
                sh 'ip a'
            }
        }

        stage('Build and push images') {
            steps {
                sh 'docker compose --parallel 2 build'
                sh 'docker image prune -f'
                sh 'docker compose push'
            }
        }
    }
}
