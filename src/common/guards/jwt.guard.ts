import { UnauthorizedException, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
    handleRequest(error, user, info: Error) {
        if (error || !user) {
            throw new UnauthorizedException('Invalid or missing access token');
        }
        return user;
    }
}
