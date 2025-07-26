import { IsEmail, IsNotEmpty, IsString, IsUUID, Length, Matches } from "class-validator";

export class UserDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    roleId: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(8, 50)
    password: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\+?[0-9]{9,15}$/, {
        message: 'Number must be a valid phone number',
    })
    number: string;
}
