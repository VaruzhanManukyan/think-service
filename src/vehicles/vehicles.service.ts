import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleDto } from './dto/vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: VehicleDto) {
    const exists = await this.prismaService.vehicle.findFirst({
      where: { vin: dto.vin },
    });

    if (exists) {
      throw new ConflictException('Vehicle with this VIN already exists');
    }

    return this.prismaService.vehicle.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prismaService.vehicle.findMany();
  }

  async findOne(id: string) {
    return this.prismaService.vehicle.findUnique({
      where: { id },
    });
  }

  async update(id: string, dto: UpdateVehicleDto) {
    return this.prismaService.vehicle.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prismaService.vehicle.delete({
      where: { id },
    });
  }
}
