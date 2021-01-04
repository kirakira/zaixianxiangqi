Set up an MariaDB local instance for development
====
* Install and run MariaDB as a Docker container.
```
$ docker pull mariadb
$ docker run --name mariadb -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -v test_datadir:/var/lib/mysql -p 127.0.0.1:3306:3306/tcp -d mariadb:latest
```

* Restart the mysqld container.
```
$ docker start mariadb
```

* Test connection.
```
$ mysql --host=127.0.0.1 -u root
```

* Create DB or update schema. This requires the `mysql` command line tool.
```
$ DB_CONNECTION=root@/BlurBench go run cmd/init_or_udpate_mariadb/main.go internal/blur_bench/mariadb/schema.sql
```

Run benchmark to compare two versions
====
```
$ cd cmd/blur_bench
$ make && DB_CONNECTION=root@/BlurBench ./blur_bench ${CONTROL_BINARY} ${TREATMENT_BINARY} 2 2>/tmp/bench.log
```

Run experiments server
====
```
$ DB_CONNECTION=root@/BlurBench go run cmd/game_record_viewer/main.go
```
