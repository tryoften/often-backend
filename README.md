# Often Backend

Backend service for Often. A backend service written in Node.js that handles ingesting RSS feeds and pushing new content to Firebase / ElasticSearch.

## Endpoints
All endpoints are in Firebase and are queues. The workers implemented in this service are in charge of taking tasks off the queues and processing them.

* /queues/search
* /queues/user
* /queues/feeds

## Setup
Tested on node v0.12.7. Steps:

1. Install libvips: [General Instructions](https://github.com/jcupitt/libvips), [Mac OS X Instructions](http://www.vips.ecs.soton.ac.uk/index.php?title=Build\_on\_OS\_X)
2. `npm install`

## Running the dashboard

Run the following commands
`npm install -g serve`
`cd client && serve .`

## License

Copyright &copy; 2015 - &infin;, Project Surf, Inc. All rights reserved.
