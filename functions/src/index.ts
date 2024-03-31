import * as functions from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {createPool, Pool} from "mysql2/promise";
import {Connector} from "@google-cloud/cloud-sql-connector";

initializeApp();

// Configure the Cloud SQL connector
const connector = new Connector();

/**
 * Get a database connection pool.
 * @return {Promise<Pool>} A promise that resolves to a database connection
 *                         pool.
 */
async function getPool(): Promise<Pool> {
  const clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME!,
  });

  return createPool({
    ...clientOpts,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 5,
  });
}

export const verifyEmailAndAddUser = functions.region("us-east4").auth.user()
  .beforeCreate(async (user) => {
    const email = user.email;

    // Check if the email is provided
    if (!email) {
      throw new functions.https.HttpsError("invalid-argument",
        "Email is required.");
    }

    // Check if the email is from cmu.edu domain
    if (!email.endsWith("cmu.edu")) {
      throw new functions.https.HttpsError("invalid-argument",
        "Only CMU email addresses are allowed.");
    }

    try {
      // Establish a connection to the database
      const pool = await getPool();
      const conn = await pool.getConnection();

      // Insert the user into the MySQL database
      const andrewId = email.split("@")[0]; // Extract the Andrew ID
      const query = `INSERT INTO UserDao (andrewId, teamDaoGithubUsername)
                    VALUES (?, ?)`;
      const values = [andrewId, null];

      await conn.query(query, values);

      console.log(`User ${andrewId} added to the database.`);

      conn.release();
      await pool.end();
    } catch (error) {
      console.error("Error adding user to the database:", error);
    } finally {
      connector.close();
    }
  });
