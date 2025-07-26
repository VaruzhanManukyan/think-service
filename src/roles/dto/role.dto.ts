import { IsNotEmpty, IsString, Length, IsOptional } from "class-validator";

export class RoleDto {
    @IsNotEmpty()
    @IsString()
    @Length(2, 50)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}
