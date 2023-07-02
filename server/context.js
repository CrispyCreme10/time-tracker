const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DB_PATH = './tmp';
const DB_NAME = 'time_tracker.db';

var db;

async function openDb() {
  try {
    return await open({
      filename: `${DB_PATH}/${DB_NAME}`,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE
    });
  } catch (error) {
    console.log(error);
  }

  return null;
}

async function init() {
  db = await openDb();
  const val = await tableExists('session');
  if(!val) {
    await createSessionTable();
  }

  await close();
}

async function getSessions() {
  db = await openDb();

  try {
    return await db.all(`
      SELECT start_time, end_time, notes
      FROM session
    `);
  } catch (error) {
    console.log(error);
  }

  close();
}

async function tableExists(table) {
  let result;
  try {
    result = await db.get(`
      SELECT name 
      FROM sqlite_master 
      WHERE type = 'table' 
      AND name = ?;
    `, table);
  } catch (error) {
    console.log(error);
  }
  return result !== undefined;
}

async function createSessionTable() {
  db.exec(`
    CREATE TABLE session (
      start_time INT NOT NULL,
      end_time INT NOT NULL,
      notes TEXT,
      PRIMARY KEY (start_time, end_time)
    );
  `);
}

async function insertSession(session) {
  db = await openDb();
  const params = [session.startTime, session.endTime, session.notes];

  try {
    db.run(`
      INSERT INTO session (start_time, end_time, notes)
      VALUES (?, ?, ?)
    `, params)
  } catch (error) {
    console.log(error);
  }

  close();
}

async function close() {
  try {
    await db.close();
  } catch (error) {
    console.log(error); 
  }
}

module.exports = {
  init,
  getSessions,
  insertSession
};