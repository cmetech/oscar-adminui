#!/bin/bash
# no verbose
set +x

# config
envFilename='.env.production'
nextFolder='./.next/'
serverFile='./server.js'

function apply_path {
  # read all config file
  while read line; do
    # no comment or not empty
    if [ "${line:0:1}" == "#" ] || [ "${line}" == "" ]; then
      continue
    fi

    # split
    configName="$(cut -d'=' -f1 <<<"$line")"
    configValue="$(cut -d'=' -f2 <<<"$line")"
    # get system env
    envValue=$(env | grep "^$configName=" | grep -oe '[^=]*$');

    # if config found
    if [ -n "$configValue" ] && [ -n "$envValue" ]; then
      # replace all in .next folder
      echo "Replace in .next: ${configValue} with: ${envValue}"
      find $nextFolder -type f -print0 | xargs -0 sed -i "s#$configValue#$envValue#g"
    fi

    # replace all in server.js
    echo "Replace in server.js: ${configValue} with: ${envValue}"
    sed -i "s#$configValue#$envValue#g" $serverFile
  done < $envFilename
}

apply_path
exec "$@"
