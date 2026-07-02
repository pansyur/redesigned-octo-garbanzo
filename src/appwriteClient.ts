import { Client, TablesDB, ID, Query } from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT as string;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID as string;

export const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
export const tableId = import.meta.env.VITE_APPWRITE_TABLE_ID as string;

if (!endpoint || !projectId || !databaseId || !tableId) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing one or more VITE_APPWRITE_* env vars. Set them in your .env file (see .env.example)."
  );
}

const client = new Client().setEndpoint(endpoint).setProject(projectId);

export const tablesDB = new TablesDB(client);
export { ID, Query };
