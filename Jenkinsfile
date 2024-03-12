def image 

pipeline {
    agent any

    environment {        
        branchName="${env.BRANCH_NAME}"
        buildNumber="${env.BUILD_NUMBER}"
        registry = "https://registry.onsmartcloud.com"
        registryRepository = "registry.onsmartcloud.com/idg"
        registryCredential = "cloud-harbor-id"
        imageTag = "${registryRepository}/${branchName}:${buildNumber}"
        IMAGE_TAG = "${imageTag}"
        APP_NAME = "${branchName}"
    }

    stages {

        stage("Build image") {
            steps {
                script {
                    image = docker.build(imageTag, "-f apps/${branchName}/Dockerfile .")
                }
            }
        }

        stage("Push image") {
            steps {
                script {
                    docker.withRegistry(registry, registryCredential) {
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
                    withKubeConfig([credentialsId: 'k8s-cred']) {
                        dir("apps/${branchName}/deploy") {
                            sh 'for f in *.yaml; do envsubst < $f | kubectl apply -f - ; done '
                        }
                    }
                }
                
            }
        }

    }
}
