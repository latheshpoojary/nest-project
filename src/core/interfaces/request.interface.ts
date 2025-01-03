import { Request } from "express";

export interface User{
    id:number,
    role:'USER'|'ADMIN'
}

export interface RequestWithUser extends Request{
    user:User
}