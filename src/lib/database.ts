import { Connection, connect } from "@planetscale/database";

export const planetScaleQuery = async (query: string, args?: any[]) => {
  const config = {
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  };
  const conn = connect(config);
  const results = await conn.execute(query, args);
  return results;
};

type DatabaseConfig = {
  host: string;
  username: string;
  password: string;
};

interface Database {
  config: DatabaseConfig;
  query<T>(
    query: string,
    args: any[]
  ): Promise<{ rows: T[]; insertId: string }>;
  close(): Database;
  connect(): Database;
}

class PlanetScaleDB implements Database {
  config: DatabaseConfig;
  connection: Connection | undefined = undefined;
  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  close() {
    return this;
  }

  connect() {
    this.connection = connect(this.config);
    return this;
  }

  async query<T>(query: string, args: any[]) {
    const result = await this.connection?.execute(query, args);
    return {
      insertId: result?.insertId as string,
      rows: (result?.rows || []) as T[],
    };
  }
}

export class DatabaseFactory {
  constructor() {}

  GetDB(): Database {
    return new PlanetScaleDB({
      host: process.env.DATABASE_HOST || "",
      username: process.env.DATABASE_USERNAME || "",
      password: process.env.DATABASE_PASSWORD || "",
    }).connect();
  }
}

export const queryDeep = async (query: string, args?: any[]) => {
  const db = new PlanetScaleDB({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  }).connect();
  return await db.query(query, args || []);
};

export const query = async (query: string, args?: any[]) => {
  const db = new PlanetScaleDB({
    host: process.env.DATABASE_HOST || "",
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
  }).connect();
  return (await db.query(query, args || []))!.rows;
};
