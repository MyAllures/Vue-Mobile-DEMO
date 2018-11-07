// this is for branch (test|master|\S+production)
pipeline {
  agent {
    kubernetes {
      label 'bison-builder'
      yaml """
apiVersion: v1
kind: Pod
metadata:
  annotations:
    branch-name: """+env.BRANCH_NAME+"""
  labels:
    some-label: some-label-value
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
        name: """+env.BRANCH_NAME+"""-bison
  - name: nodejs
    image: node:10-alpine
    command:
    - cat
    envFrom:
    - configMapRef:
        name: """+env.BRANCH_NAME+"""-bison
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
kubectl --namespace=front-end cp dist front-end-$i:/tmp/$NODE_NAME
kubectl --namespace=front-end exec -it front-end-$i -- "mkdir" "-p" "$DIST_PATH/$ENV_CONTAINER/$CDN_PROFILE/$STATIC_CONTAINER"
kubectl --namespace=front-end exec -it front-end-$i -- "rsync" "-av" "--remove-source-files" "--delete" "/tmp/$NODE_NAME/mobile/static" "$DIST_PATH/$ENV_CONTAINER/$CDN_PROFILE/$STATIC_CONTAINER"
kubectl --namespace=front-end exec -it front-end-$i -- "rsync" "-av" "--remove-source-files" "--delete" "/tmp/$NODE_NAME/index.html" "$DIST_PATH/$ENV_CONTAINER/$CDN_PROFILE/"
kubectl --namespace=front-end exec -it front-end-$i -- "rm" "-rf" "/tmp/$NODE_NAME"
done
          '''
        }
      }
    }
  }
  environment {
    STATIC_CONTAINER="mobile"
    DIST_PATH="/usr/src/app/dist"
  }
}