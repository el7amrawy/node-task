import client from "../database";
import bcrypt from "bcrypt";
import encryption from "../services/encryption";

const { SALT, ROUNDS } = process.env;

interface User {
  id: string;
  email: string;
  password?: string;
  username: string;
  name: string;
}

class Users {
  async create(
    email: User["email"],
    password: User["password"],
    username: User["username"],
    name: User["name"]
  ): Promise<User> {
    const hashedPass = bcrypt.hashSync(
      (password as unknown as string) + SALT,
      parseInt(ROUNDS as unknown as string)
    );

    const sql =
      "INSERT INTO users (email,password,username,name) VALUES ($1,$2,$3,$4) RETURNING *";

    try {
      const conn = await client.connect();
      const res = await conn.query(sql, [
        encryption.encrypt(email),
        hashedPass,
        username,
        encryption.encrypt(name),
      ]);
      const user: User = res.rows[0];

      conn.release();

      delete user.password;
      return encryption.decryptObject(user) as unknown as User;
    } catch (err) {
      throw new Error(`couldn't create new user ${err}`);
    }
  }

  async show(username: User["username"]): Promise<User> {
    const sql = "SELECT * FROM users WHERE username=$1";

    try {
      const conn = await client.connect();
      const res = await conn.query(sql, [username]);
      const user: User = res.rows[0];

      return encryption.decryptObject(user) as unknown as User;
    } catch (err) {
      throw new Error(`couldn't show user ${err}`);
    }
  }

  async authenticate(
    username: User["username"],
    password: User["password"]
  ): Promise<User | null> {
    const sql = "SELECT * FROM users WHERE username=$1";

    try {
      const conn = await client.connect();
      const res = await conn.query(sql, [username]);
      const user: User = res.rows[0];

      conn.release();

      if (
        bcrypt.compareSync(
          (password as unknown as string) + SALT,
          user.password as unknown as string
        )
      ) {
        delete user.password;
        return encryption.decryptObject(user) as unknown as User;
      }
      return null;
    } catch (err) {
      throw new Error(`${err}`);
    }
  }

  async getEmail(username: string): Promise<string> {
    const sql = "SELECT * FROM users WHERE username=$1";

    try {
      const conn = await client.connect();
      const res = await conn.query(sql, [username]);
      const user: User = res.rows[0];

      conn.release();

      return encryption.decrypt(user.email);
    } catch (err) {
      throw new Error(`${err}`);
    }
  }

  async updatePass(username: string, password: string): Promise<User> {
    const sql = "UPDATE users SET password=$1 WHERE username=$2 RETURNING *";

    const hashedPass = bcrypt.hashSync(
      (password as unknown as string) + SALT,
      parseInt(ROUNDS as unknown as string)
    );

    try {
      const conn = await client.connect();

      const res = await conn.query(sql, [hashedPass, username]);
      const user: User = res.rows[0];

      conn.release();

      delete user.password;
      return encryption.decryptObject(user) as unknown as User;
    } catch (err) {
      throw new Error(`${err}`);
    }
  }
}

export { User, Users };
