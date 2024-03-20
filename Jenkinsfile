def image
def imageTag
def appName

pipeline {
    
    agent { label 'jenkins-oneportal' }

    environment {
        registry = "registry.onsmartcloud.com"
        registryCredential = "cloud-harbor-id"
        k8sCredential = "k8s-cred"
    }

    stages {

        stage("Initializing") {
            steps {
                script {
                    appName = env.BRANCH_NAME
                    imageTag = "${registry}/idg/${appName}:${env.BUILD_NUMBER}"
                }
            }
        }

        stage("Build image") {
            steps {
                script {
                    sh "docker build -t ${imageTag} -f apps/${appName}/Dockerfile ."
                }
            }
        }

        stage("Push image") {
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
                    withCredentials([file(credentialsId: 'k8s-cred', variable: 'KUBECONFIG')]) {
                        dir("apps/${appName}/deploy") {
                            sh 'for f in *.yaml; do envsubst < $f | kubectl apply -f - ; done '
                        }
                    }
                }

            }
        }

    }
}
