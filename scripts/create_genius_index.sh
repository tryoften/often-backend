curl -XPUT localhost:9200/genius -d '{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 0,
    "index": {
      "analysis": {
        "analyzer": {
          "custom": {
            "filter": [
              "lowercase",
              "asciifolding"
            ],
            "tokenizer": "standard"
          }
        }
      }
    }
  },
  "mappings": {
    "artist": {
      "properties": {
        "title": {
          "type": "string",
          "analyzer": "standard",
          "fields": {
            "custom": {
              "type": "string",
              "analyzer": "custom"
            },
            "unanalyzed": {
              "type": "string",
              "index": "not_analyzed"
            }
          }
        },
        "author": {
          "type": "string",
          "analyzer": "standard",
          "fields": {
            "custom": {
              "type": "string",
              "analyzer": "custom"
            },
            "unanalyzed": {
              "type": "string",
              "index": "not_analyzed"
            }
          }
        },
        "description": {
          "type": "string",
          "analyzer": "standard"
        }
      }
    },
    "album": {
      "properties": {
        "title": {
          "type": "string",
          "analyzer": "standard",
          "fields": {
            "custom": {
              "type": "string",
              "analyzer": "custom"
            },
            "unanalyzed": {
              "type": "string",
              "index": "not_analyzed"
            }
          }
        },
        "author": {
          "type": "string",
          "analyzer": "standard",
          "fields": {
            "custom": {
              "type": "string",
              "analyzer": "custom"
            },
            "unanalyzed": {
              "type": "string",
              "index": "not_analyzed"
            }
          }
        },
        "description": {
          "type": "string",
          "analyzer": "standard"
        }
      }
    },
     "track": {
      "properties": {
        "title": {
          "type": "string",
          "analyzer": "standard",
          "fields": {
            "custom": {
              "type": "string",
              "analyzer": "custom"
            },
            "unanalyzed": {
              "type": "string",
              "index": "not_analyzed"
            }
          }
        },
        "author": {
          "type": "string",
          "analyzer": "standard",
          "fields": {
            "custom": {
              "type": "string",
              "analyzer": "custom"
            },
            "unanalyzed": {
              "type": "string",
              "index": "not_analyzed"
            }
          }
        },
        "description": {
          "type": "string",
          "analyzer": "standard"
        }
      }
    }
  }
}'