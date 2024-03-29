import { Request, Response } from "express";
import { User, Users } from "../models/users";

const u = new Users();

const checkUsername = async (req: Request, res: Response, next: Function) => {
  try {
    const { username } = req.body.user;
    const user = await u.show(username);

    if (!user?.name?.length) {
      return next();
    }
    throw new Error("");
  } catch (err) {
    res.status(403).json("username already used");
  }
};

export default checkUsername;
