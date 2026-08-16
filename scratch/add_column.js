const { Client } = require('pg');

const client = new Client('postgres://postgres:mw9iehelugvXf79N@db.mwqytojuseqzsyyxkumh.supabase.co:5432/postgres');

client.connect()
  .then(() => {
    return client.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT');
  })
  .then(() => {
    console.log("Added column avatar_url to profiles");
    client.end();
  })
  .catch(console.error);
