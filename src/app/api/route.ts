import { DatabaseFactory } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  console.log("What");

  const db = new DatabaseFactory().GetDB();

  //db.query<string[]>("CREATE TABLE test (name varchar(255))", []);
  const t = await db.query("SELECT * FROM test", []);
  db.close();

  console.log(t);

  return NextResponse.json(t);
};
