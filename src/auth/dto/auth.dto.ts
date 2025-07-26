import { IsNotEmpty, IsString, IsUUID, Matches } from "class-validator";

export class RegisterAuthDto {
    @IsString()
    @IsNotEmpty()
    role: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[0-9]{9,11}$/, { message: 'Phone number must be valid' })
    number: string;
}

export class LoginAuthDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[0-9]{9,11}$/, { message: 'Phone number must be valid' })
    number: string;
}

export class LogoutAuthDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    userId: string;
}


