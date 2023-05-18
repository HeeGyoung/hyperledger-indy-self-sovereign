#!/usr/bin/env bash

set -e

mongosh <<EOF
use $DB_DATABASE
db.createUser({
  user: '$DB_USER',
  pwd: '$DB_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: '$DB_DATABASE'
  }]
})
db.createCollection("credentials")
EOF