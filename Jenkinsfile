#!/usr/bin/env groovy
def agentLabel = env.BRANCH_NAME == 'release' ? "it-si-cloud-linux2" : "it-si-cloud-linux1"
pipeline {
    agent { 
        label agentLabel 
    }
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
            when {
                branch "develop"
            }
            steps {
                sh 'docker compose --parallel 2 build'
            }
        }

        stage('Build images test') {
            when {
                branch "release"
            }
            steps {
                sh 'docker compose -f compose-test.yml --parallel 2 build'
            }
        }

        stage('Push images') {
            when {
                branch "develop"
            }
            steps {
                sh 'docker compose push'
            }
        }

        stage('Push images test') {
            when {
                branch "release"
            }
            steps {
                sh 'docker compose -f compose-test.yml push'
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
