
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { faker } from "@faker-js/faker";

const seed = async () => {
  const db = await open({
    filename: "data/testdata.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstname TEXT,
      lastname TEXT,
      login TEXT UNIQUE,
      email TEXT,
      password TEXT
    )
  `);

  await db.exec("DELETE FROM users");

  for (let i = 0; i < 1; i++) {
    const firstname = faker.person.firstName();
    const lastname = faker.person.lastName();

    const login = faker.internet.username().toLowerCase();
    const email = faker.internet.email().toLowerCase();
    const password = faker.internet.password({ length: 8 });

    await db.run(
      `INSERT INTO users (firstname, lastname, login, email, password)
       VALUES (?, ?, ?, ?, ?)`,
      [firstname, lastname, login, email, password]
    );
  }

  console.log("testdata.db seeded with faker users!");
  await db.close();
};

seed().catch((err) => {
  console.error("Error seeding DB:", err);
});
