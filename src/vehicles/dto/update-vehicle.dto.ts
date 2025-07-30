import { PartialType } from '@nestjs/mapped-types';
import { VehicleDto } from './vehicle.dto';

export class UpdateVehicleDto extends PartialType(VehicleDto) {}
