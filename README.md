# Run dev test server (Linux)

## Website
```
$ gcloud beta emulators datastore start
$ ./dev_zaixianxiangqi.sh
```

## Engine server
```
$ ./build_and_run_engine_server_local.sh
```

# Compile Javascript files
```
$ cd web && make && cd ..
```

# Deploy a new version

## Bootstrap

1. Create Pub/Sub topic.
```
$ gcloud pubsub topics create play-ai-move
```

1. Create service account for engine server "engine-server@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com".

1. Grant Pub/Sub permissions to generate auth tokens.
```
$ gcloud projects add-iam-policy-binding ${GOOGLE_CLOUD_PROJECT} \
     --member=serviceAccount:service-${PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com \
     --role=roles/iam.serviceAccountTokenCreator
```

1. Create service account to represent the Pub/Sub subscription identity.
```
$ gcloud iam service-accounts create cloud-run-pubsub-invoker --display-name "Cloud Run Pub/Sub Invoker"
```

1. After the engine server is deployed,
```
$ gcloud run services add-iam-policy-binding engineserver --platform managed --member=serviceAccount:cloud-run-pubsub-invoker@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com --role=roles/run.invoker
$ gcloud pubsub subscriptions create engine-server-subscription --topic play-ai-move --push-endpoint="https://engineserver-du3scfgxaq-uc.a.run.app/play" --push-auth-service-account=cloud-run-pubsub-invoker@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com --expiration-period=never
```

## Website
```
$ gcloud app deploy
```

## Engine server
```
$ gcloud builds submit --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/engine_server
$ gcloud run deploy engineserver --image gcr.io/${GOOGLE_CLOUD_PROJECT}/engine_server --platform managed --service-account "engine-server@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com" --concurrency 1
```
