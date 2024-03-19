def image
def imageTag
def appName

pipeline {
    agent any

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
                    image = docker.build(imageTag, "-f apps/${appName}/Dockerfile .")
                }
            }
        }

        stage("Push image") {
            steps {
                script {
                    docker.withRegistry("https://" + registry, registryCredential) {
                        image.push()
                    }
                }
                
            }
        }

        stage("Cleaning up") {
            steps {
                sh "docker rmi ${imageTag}"
            }
        }

        stage("Deploying to K8s") {
            steps {
                script {
                    withKubeConfig([credentialsId: k8sCredential]) {
                        dir("apps/${appName}/deploy") {
                            sh 'for f in *.yaml; do envsubst < $f | kubectl apply -f - ; done '
                        }
                    }
                }
                
            }
        }

    }
}
