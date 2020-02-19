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

## Website
```
$ gcloud app deploy
```

## Engine server
```
$ gcloud builds submit --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/engine_server
$ gcloud run deploy engineserver --image gcr.io/${GOOGLE_CLOUD_PROJECT}/engine_server --platform managed --concurrency 1
```
