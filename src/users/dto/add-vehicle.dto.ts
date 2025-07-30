import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class addVehicleDto {
    @IsString()
    @IsNotEmpty({ message: 'VIN cannot be empty' })
    @IsUUID()
    userId: string;

    @IsString()
    @IsNotEmpty({ message: 'Vehicle ID cannot be empty' })
    @IsUUID()
    vehicleId: string;
}
