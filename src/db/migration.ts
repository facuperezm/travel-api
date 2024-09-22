export const up = async (db) => {
  await db.execute(`
    ALTER TABLE trips
    ALTER COLUMN owner_id SET NOT NULL;
  `);
};

export const down = async (db) => {
  await db.execute(`
    ALTER TABLE trips
    ALTER COLUMN owner_id DROP NOT NULL;
  `);
};
