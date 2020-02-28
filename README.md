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
$ cd web
$ make js/zaixianxiangqi.js
```

# Deploy a new version

## Bootstrap

1. Create clould task queue.
```
$ gcloud tasks queues create play-ai-move
```

2. Create service account for engine server "engine-server@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com".

## Website
```
$ gcloud app deploy
```

## Engine server
```
$ gcloud builds submit --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/engine_server
$ gcloud run deploy engineserver --image gcr.io/${GOOGLE_CLOUD_PROJECT}/engine_server --platform managed --service-account "engine-server@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com" --concurrency 1
```
