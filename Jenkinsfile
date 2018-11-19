// this is for branch (test|master|\S+production)
env.PROJECT_NAME = 'bison'
pipeline {
  agent {
    kubernetes {
      label "${env.PROJECT_NAME}-builder"
      defaultContainer 'worker'
      yaml """
apiVersion: v1
kind: Pod
metadata:
  annotations:
    branch-name: ${env.BRANCH_NAME}
  labels:
    role: worker
spec:
  imagePullSecrets:
    - name: ciunnotech
  serviceAccountName: manager
  containers:
  - name: worker
    image: unnotechlottery/jenkins-general-worker
    command:
    - cat
    tty: true
    envFrom:
    - configMapRef:
        name: ${env.BRANCH_NAME}-${env.PROJECT_NAME}
  - name: nodejs
    image: node:10-alpine
    command:
    - cat
    envFrom:
    - configMapRef:
        name: ${env.BRANCH_NAME}-${env.PROJECT_NAME}
    tty: true
"""
    }
  }
  stages {
    stage('yarn install') {
      steps {
        container('nodejs'){
          sh 'env'
          sh 'yarn install'
        }
      }
    }
    stage('yarn build') {
      steps {
        container('nodejs'){
          sh 'yarn build'
        }
      }
    }
    stage('deploy') {
      steps {
        container('worker'){
          sh '''
for i in 0 1; do
kubectl --namespace=front-end cp dist front-end-$i:/tmp/$RANDOM_DIR
kubectl --namespace=front-end exec -it front-end-$i -- "mkdir" "-p" "$DIST_PATH/$ENV_CONTAINER/$CDN_PROFILE/$STATIC_CONTAINER"
kubectl --namespace=front-end exec -it front-end-$i -- "rsync" "-av" "--remove-source-files" "--delete" "/tmp/$RANDOM_DIR/mobile/static" "$DIST_PATH/$ENV_CONTAINER/$CDN_PROFILE/$STATIC_CONTAINER"
kubectl --namespace=front-end exec -it front-end-$i -- "rsync" "-av" "--remove-source-files" "--delete" "/tmp/$RANDOM_DIR/index.html" "$DIST_PATH/$ENV_CONTAINER/$CDN_PROFILE/"
kubectl --namespace=front-end exec -it front-end-$i -- "rsync" "-av" "--remove-source-files" "--delete" "/tmp/$RANDOM_DIR/app.html" "$DIST_PATH/$ENV_CONTAINER/$CDN_PROFILE/"
kubectl --namespace=front-end exec -it front-end-$i -- "rm" "-rf" "/tmp/$RANDOM_DIR"
done
          '''
        }
      }
    }
  }
  environment {
    RANDOM_DIR = UUID.randomUUID().toString()
    STATIC_CONTAINER = "mobile"
    DIST_PATH = "/usr/src/app/dist"
  }
}
