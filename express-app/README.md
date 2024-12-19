install dependencies
```
npm install
```

run the server
```
npm run dev
```


install elasticsearch

docker pull docker.elastic.co/elasticsearch/elasticsearch:8.12.1

docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.enrollment.enabled=false" -e "xpack.security.http.ssl.enabled=false" -e "xpack.security.transport.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.12.1
