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

        stage('Build images') {
            steps {
                sh 'docker compose --parallel 2 build'
            }
        }

        stage('Push images') {
            steps {
                sh 'docker compose push'
            }
        }

        stage('Redeploy k8s') {
            steps {
                script {
                    sh 'kubectl -n vnptcloud  rollout restart deployment/app-host-deployment'
                    sh 'kubectl -n vnptcloud  rollout restart deployment/app-smartcloud-deployment'
                }
            }
        }
    }
}
