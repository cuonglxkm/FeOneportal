def image
def imageTag
def appName

pipeline {

    agent { label 'worker-6-agent||jenkins-oneportal' }

    environment {
        registry = "registry.onsmartcloud.com"
        registryCredential = "cloud-harbor-id"
        k8sCredential = "k8s-cred"
        ENV = "test"
    }
    stages {

        stage("Initializing") {
            steps {
                script {
                    appName = env.BRANCH_NAME.tokenize("/").last()
                    imageTag = "${registry}/idg/${appName}-${ENV}:${env.BUILD_NUMBER}"
                    AUTOTEST_BRANCH = "${AUTOTEST_BRANCH}${appName}"
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
                    withCredentials([file(credentialsId: k8sCredential , variable: 'KUBECONFIG')]) {
                        dir("apps/${appName}/deploy") {
                            sh 'for f in *.yaml; do envsubst < $f | kubectl --insecure-skip-tls-verify apply -f - ; done '
                        }
                    }
                }

            }
        }

        stage("Check autotest agent available") {
            options {
              timeout(time: 10, unit: 'SECONDS')   // timeout on this stage
            }
            agent { label AUTOTEST_AGENT }
            steps {
                script {
                    echo "switch agent succeccfully"
                }
            }
        }

        stage("Automation Testing") {
            agent { label AUTOTEST_AGENT }
            steps {
                script {
                    bat """
                        git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
                        git fetch origin
                        git checkout ${AUTOTEST_BRANCH}
                    """
                    def projectFile = "VNPT_OnePortal.prj"
                    def testSuitePath = "Test Suites/VNPT_OnePortal_k8s"
                    bat """
                        set workspace = %cd%
                        katalonc -noSplash -runMode=console -projectPath="%workspace%\\${projectFile}" -retry=0 -testSuitePath="${testSuitePath}" -browserType="Chrome" -executionProfile="one_Portal" -apiKey="a49ac01e-c4ad-4ceb-9ce2-7a009dad4627" --config -proxy.auth.option=NO_PROXY -proxy.system.option=NO_PROXY -proxy.system.applyToDesiredCapabilities=true -webui.autoUpdateDrivers=true
                    """
                }
            }
        }

    }
}
