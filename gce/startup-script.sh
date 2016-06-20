set -v

cat >~/.npmrc << EOF
//registry.npmjs.org/:_authToken=4d13ffae-98fe-41da-bee3-1d86dd43ab28
scope=often
EOF

SERVER_TYPE=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/attributes/server-type" -H "Metadata-Flavor: Google")

# Install logging monitor. The monitor will automatically pick up logs sent to
# syslog.
curl -s "https://storage.googleapis.com/signals-agents/logging/google-fluentd-install.sh" | bash
service google-fluentd restart &

# Install nodejs
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

# Install dependencies from apt
apt-get update
apt-get install -yq ca-certificates git nodejs build-essential supervisor

# Get the application source code from the Google Cloud Repository.
# git requires $HOME and it's not set during the startup script.
export HOME=/root
git config --global credential.helper gcloud.sh
git clone https://source.developers.google.com/p/acoustic-rider-104419/r/default /opt/app

echo "Installing npm dependencies"
npm install -g tsd typescript

# Install app dependencies
cd /opt/app
npm install
tsd install

echo "Compiling project"
tsc

echo "Node version: "
node --version

# Create a nodeapp user. The application will run as this user.
useradd -m -d /home/nodeapp nodeapp
chown -R nodeapp:nodeapp /opt/app

# Configure supervisor to run the node app.
cat >/etc/supervisor/conf.d/node-app.conf << EOF
[program:nodeapp]
directory=/opt/app
command=node build/app.js $SERVER_TYPE
autostart=true
autorestart=true
user=nodeapp
environment=HOME="/home/nodeapp",USER="nodeapp",NODE_ENV="production"
stdout_logfile_maxbytes=50MB   
stderr_logfile_maxbytes=50MB 
stderr_events_enabled=true 
EOF

supervisorctl reread
supervisorctl update

echo "Finished setup."