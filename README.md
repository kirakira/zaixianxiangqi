# Run dev test server (Linux)

## Bootstrapping the dev environment

1. Create a dev service account, and assign it to be owner of the test project `zaixianxiangqi-test`. [Doc](https://cloud.google.com/docs/authentication/production#create_service_account).

1. Download the keyfile.
```
$ gcloud iam service-accounts keys create ~/Downloads/zaixianxiangqi-test.json --iam-account=zaixianxiangqi-test@zaixianxiangqi-test.iam.gserviceaccount.com
```

## Run Website
```
$ ./dev_zaixianxiangqi.sh
```

## Run Standalone Engine Server
```
$ ./build_and_run_engine_server_local.sh
```

# Deploy a new version

## Bootstrapping

1. Create Pub/Sub topic.
```
$ gcloud pubsub topics create play-ai-move
```

1. Create service account for engine server "engine-server@$(gcloud config get-value project).iam.gserviceaccount.com".

1. Grant Pub/Sub permissions to generate auth tokens.
```
$ gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
     --member=serviceAccount:service-$(gcloud projects list --filter="$(gcloud config get-value project)" --format="value(PROJECT_NUMBER)")@gcp-sa-pubsub.iam.gserviceaccount.com \
     --role=roles/iam.serviceAccountTokenCreator
```

1. Create service account to represent the Pub/Sub subscription identity.
```
$ gcloud iam service-accounts create cloud-run-pubsub-invoker --display-name "Cloud Run Pub/Sub Invoker"
```

1. After the engine server is deployed,
```
$ gcloud run services add-iam-policy-binding engineserver --platform managed --member=serviceAccount:cloud-run-pubsub-invoker@$(gcloud config get-value project).iam.gserviceaccount.com --role=roles/run.invoker
$ gcloud pubsub subscriptions create engine-server-subscription --topic play-ai-move --push-endpoint="https://engineserver-du3scfgxaq-uc.a.run.app/play" --push-auth-service-account=cloud-run-pubsub-invoker@$(gcloud config get-value project).iam.gserviceaccount.com --expiration-period=never
```

## Website
```
$ gcloud app deploy
```

## Engine server
```
$ gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/engine_server
$ gcloud run deploy engineserver --image gcr.io/$(gcloud config get-value project)/engine_server --platform managed --service-account "engine-server@$(gcloud config get-value project).iam.gserviceaccount.com" --concurrency 1
```
