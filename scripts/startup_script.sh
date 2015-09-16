#! /bin/bash

# [START startup]
# Talk to the metadata server to get the project id
PROJECTID=$(curl -s "http://metadata.google.internal/computeMetadata/v1/project/project-id" -H "Metadata-Flavor: Google")
SERVER_TYPE=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/attributes/server-type" -H "Metadata-Flavor: Google")
FIREBASE=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/attributes/firebase-root" -H "Metadata-Flavor: Google")
ELASTICSEARCH=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/attributes/elasticsearch-root" -H "Metadata-Flavor: Google")

# Install logging monitor and configure it to pickup application logs
# [START logging]
curl -s "https://storage.googleapis.com/signals-agents/logging/google-fluentd-install.sh" | bash

cat >/etc/google-fluentd/config.d/nodeapp.conf << EOF
<source>
  type tail
  format json
  path /opt/app/request.log
  pos_file /var/tmp/fluentd.nodeapp-request.pos
  tag nodeapp-request
</source>

<source>
  type tail
  format json
  path /opt/app/error.log
  pos_file /var/tmp/fluentd.nodeapp-error.pos
  tag nodeapp-error
</source>

<source>
  type tail
  format json
  path /opt/app/general.log
  pos_file /var/tmp/fluentd.nodeapp-general.pos
  tag nodeapp-general
</source>
EOF

service google-fluentd restart &
# [END logging]

# Add nodejs repository (NodeSource)
curl -sL https://deb.nodesource.com/setup_0.12 | bash -

# Install dependencies from apt
apt-get install -y git nodejs build-essential supervisor pkg-config

# Install other dependencies
curl -s https://raw.githubusercontent.com/lovell/sharp/master/preinstall.sh | bash -

# Remove the remote
rm -rf /opt/app

# Get the source code
git config --global credential.helper gcloud.sh
git clone https://source.developers.google.com/p/$PROJECTID /opt/app

# Install app dependencies
cd /opt/app
npm install

echo "NPM install finished"

# Create a nodeapp user. The application will run as this user.
useradd -m -d /home/nodeapp nodeapp
echo "Node app user created"
chown -R nodeapp:nodeapp /opt/app
echo "Node app users owner changed"

# Configure supervisor to run the node app.
cat >/etc/supervisor/conf.d/node-app.conf << EOF
[program:nodeapp]
directory=/opt/app
command=npm start
autostart=true
autorestart=true
user=nodeapp
environment=HOME="/home/nodeapp",USER="nodeapp",NODE_ENV="production"
EOF

supervisorctl reread
supervisorctl update

# Application should now be running under supervisor
# [END startup]

echo "Installing grunt"
npm install -g grunt-cli

echo "Launching grunt"
grunt

echo "Node version: "
node --version

echo "Launching app"
node build/app.js $SERVER_TYPE --firebase-root=$FIREBASE --elasticsearch-root=$ELASTICSEARCH

echo "Finished setup."