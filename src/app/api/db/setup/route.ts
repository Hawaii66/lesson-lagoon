import { DatabaseFactory } from "@/lib/database";

export const GET = async () => {
  const db = new DatabaseFactory().GetDB();

  await db.query(
    "CREATE TABLE queries (userid varchar(255), text varchar(255))",
    []
  );

  db.close();
};
