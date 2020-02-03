# Prerequisite

Set environment variable `PROJECT_ID` to the GCP project id.

# Local dev environment

1. Set enviroment variable `GOOGLE_APPLICATION_CREDENTIALS` to your GCP service account file.
2. Run `./build_and_run_local.sh`.

# Deploy

```
$ gcloud builds submit --tag gcr.io/${PROJECT_ID}/engine_server
$ gcloud run deploy engineserver --image gcr.io/${PROJECT_ID}/engine_server --platform managed --update-env-vars DATASTORE_PROJECT_ID=${PROJECT_ID} --concurrency 1
```
