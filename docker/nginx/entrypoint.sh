#!/bin/sh
# Builds the htpasswd file for the NGINX gate from BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD.
# Runs from /docker-entrypoint.d/ before NGINX starts. The password is bcrypt-hashed, read by
# htpasswd from stdin (never from argv), and neither value is ever printed.
set -eu

target="${BASIC_AUTH_HTPASSWD_FILE:-/etc/nginx/auth/htpasswd}"

# `:?` aborts on unset or empty values, so the gate never starts without credentials.
: "${BASIC_AUTH_USERNAME:?gate: BASIC_AUTH_USERNAME is empty or unset}"
: "${BASIC_AUTH_PASSWORD:?gate: BASIC_AUTH_PASSWORD is empty or unset}"

# The file is created read-only (0400), so a container restart must remove the old one first.
umask 0377
rm -f "$target"

if ! printf '%s\n' "$BASIC_AUTH_PASSWORD" | htpasswd -niB "$BASIC_AUTH_USERNAME" > "$target"; then
  rm -f "$target"
  echo "gate: could not hash the credentials (the username must not contain ':' and the password" \
    "must be at most 72 characters)" >&2
  exit 1
fi

echo "gate: htpasswd file written to $target"
