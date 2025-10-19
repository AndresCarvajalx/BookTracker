#!/bin/bash
set -euo pipefail

MASTER_HOST="db-master"
MASTER_USER_ROOT="root"
MASTER_PASS_ROOT="root"
REPL_USER="repl"
REPL_PASS="replpass"
DB_NAME="booktracker"
DUMP_FILE="/tmp/booktracker_dump.sql"

echo "⏳ Waiting for master to be reachable..."
until mysql -h "${MASTER_HOST}" -u"${MASTER_USER_ROOT}" -p"${MASTER_PASS_ROOT}" -e "SELECT 1;" &> /dev/null; do
  sleep 2
done

echo "✅ Master reachable."

# Create repl user on master (use mysql_native_password to avoid SSL auth requirement)
echo "Creating replication user on master (if not exists)..."
mysql -h "${MASTER_HOST}" -u"${MASTER_USER_ROOT}" -p"${MASTER_PASS_ROOT}" -e "
  CREATE USER IF NOT EXISTS '${REPL_USER}'@'%' IDENTIFIED WITH mysql_native_password BY '${REPL_PASS}';
  GRANT REPLICATION SLAVE ON *.* TO '${REPL_USER}'@'%';
  FLUSH PRIVILEGES;
"

# Check if database exists on this slave already
echo "Checking if database '${DB_NAME}' exists on slave..."
if mysql -u"${MASTER_USER_ROOT}" -p"${MASTER_PASS_ROOT}" -e "USE ${DB_NAME};" &> /dev/null; then
  echo "Database ${DB_NAME} already exists on slave — skipping dump/import."
else
  echo "Database ${DB_NAME} not found on slave. Dumping from master and importing..."

  # Perform dump from master with master-data so we get coordinates exactly at dump time
  mysqldump -h "${MASTER_HOST}" -u"${MASTER_USER_ROOT}" -p"${MASTER_PASS_ROOT}" \
    --single-transaction --master-data=2 --databases "${DB_NAME}" > "${DUMP_FILE}"

  if [ ! -s "${DUMP_FILE}" ]; then
    echo "ERROR: dump file is empty or dump failed."
    exit 1
  fi

  echo "Importing dump into slave..."
  mysql -u"${MASTER_USER_ROOT}" -p"${MASTER_PASS_ROOT}" < "${DUMP_FILE}"

  # Extract MASTER_LOG_FILE and MASTER_LOG_POS from dump header (produced by --master-data)
  MASTER_LOG_FILE=$(grep -o "MASTER_LOG_FILE='[^']*'" "${DUMP_FILE}" | head -n1 | sed "s/MASTER_LOG_FILE='//; s/'//")
  MASTER_LOG_POS=$(grep -o "MASTER_LOG_POS=[0-9]*" "${DUMP_FILE}" | head -n1 | sed "s/MASTER_LOG_POS=//")

  if [ -z "${MASTER_LOG_FILE}" ] || [ -z "${MASTER_LOG_POS}" ]; then
    echo "ERROR: could not extract master log file/pos from dump. Printing first 80 lines of dump for debugging:"
    head -n 80 "${DUMP_FILE}" || true
    exit 1
  fi

  echo "Dump imported. Using master coordinates: ${MASTER_LOG_FILE} / ${MASTER_LOG_POS}"
fi

# Configure the slave to use the master and start replication
echo "Configuring replication on slave..."
mysql -uroot -proot -e "
  CHANGE REPLICATION SOURCE TO
    SOURCE_HOST='${MASTER_HOST}',
    SOURCE_USER='${REPL_USER}',
    SOURCE_PASSWORD='${REPL_PASS}',
    SOURCE_LOG_FILE='${MASTER_LOG_FILE}',
    SOURCE_LOG_POS=${MASTER_LOG_POS};
  START REPLICA;
"

echo "✅ Replication configuration attempted. Check replica status with: SHOW REPLICA STATUS\G"
# keep container alive (if used as entrypoint). If you prefer not to tail, remove last line.
tail -f /dev/null
