import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1886;

export class VehicleDto {
  @IsString()
  @IsNotEmpty({ message: 'VIN cannot be empty' })
  @Length(17, 17, { message: 'VIN must be exactly 17 characters long' })
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/, {
    message:
      'VIN can only contain letters (A–H, J–N, P–R, S–Z) and digits, excluding I/O/Q',
  })
  vin: string;

  @IsString()
  @IsNotEmpty({ message: 'Make cannot be empty' })
  @Length(1, 50, { message: 'Make must be between 1 and 50 characters' })
  make: string;

  @IsString()
  @IsNotEmpty({ message: 'Model cannot be empty' })
  @Length(1, 50, { message: 'Model must be between 1 and 50 characters' })
  model: string;

  @Type(() => Number)
  @IsInt({ message: 'Year must be an integer' })
  @IsNotEmpty({ message: 'Year cannot be empty' })
  @Min(MIN_YEAR, { message: `Year must be at least ${MIN_YEAR}` })
  @Max(CURRENT_YEAR, {
    message: `Year cannot be in the future (max ${CURRENT_YEAR})`,
  })
  year: number;
}
