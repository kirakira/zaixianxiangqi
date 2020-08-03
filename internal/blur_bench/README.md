Set up an MariaDB local instance for development
====
* Install and run MariaDB as a Docker container.
```
$ docker pull mariadb
$ docker run --name mariadb -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -v test_datadir:/var/lib/mysql -p 127.0.0.1:3306:3306/tcp -d mariadb:latest
```

* Test connection.
```
$ mysql --host=127.0.0.1 -u root
```

Run benchmark to compare two versions
====
```
$ cd cmd/blur_bench
$ make && ./blur_bench ${CONTROL_BINARY} ${TREATMENT_BINARY} 2 2>/tmp/bench.log
```

Run experiments server
====
```
$ go run cmd/game_record_viewer/main.go cmd/blur_bench/games_data/
```
