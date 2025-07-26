import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { User } from "@prisma/client";
import type { Request } from "express";
import { JwtPayload } from "../interfaces/jwt.interface";

export const Authoroized = createParamDecorator(
    (data: keyof User, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest() as Request & { user: JwtPayload };
        const user = request.user;

        return data ? user[data] : user;
    }
)