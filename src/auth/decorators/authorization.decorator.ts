import { applyDecorators, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../guards/auth.guards";
import { RolesGuard } from "src/common/guards/role.guard";

export function Authorization() {
    return applyDecorators(UseGuards(JwtGuard, RolesGuard));
}