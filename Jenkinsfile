#!/usr/bin/env groovy
def agentLabel = "it-si-cloud-linux1"
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
<<<<<<< HEAD

        stage("Build image") {
            steps {
                script {
                    sh "docker build -t ${imageTag} -f apps/${appName}/Dockerfile ."
                }
            }
        }

        stage('Build and push images') {
            steps {
                withCredentials([usernamePassword(credentialsId: registryCredential, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh "echo $DOCKER_PASSWORD | docker login ${registry} --username $DOCKER_USERNAME --password-stdin"
                    script {
                        sh "docker push ${imageTag}"
                    }
                }
            }
        }

        stage("Cleaning up") {
            steps {
                sh "docker rmi -f ${imageTag}"
            }
        }

        stage("Deploying to K8s") {
            steps {
                script {
                    env.APP_NAME = appName
                    env.IMAGE_TAG = imageTag
                    withCredentials([file(credentialsId: k8sCred , variable: 'KUBECONFIG')]) {
                        dir("apps/${appName}/deploy") {
                            sh 'for f in *.yaml; do envsubst < $f | kubectl --insecure-skip-tls-verify apply -f - ; done '
                        }
                    }
                }

            }
        }

=======
>>>>>>> origin/develop
    }
}
