import { Injectable, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { addVehicleDto } from './dto/add-vehicle.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) { }

  async create(dto: UserDto) {
    const { roleId, email, password, number } = dto;

    const exists = await this.prismaService.user.findFirst({
      where: { OR: [{ email }, { number }] },
    });

    if (exists) {
      throw new ConflictException('Email or phone number already in use');
    }


    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 10,
      parallelism: 1,
    });

    return this.prismaService.user.create({
      data: {
        role_id: roleId,
        email,
        password: hash,
        number
      }
    });
  }

  async findAll() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        number: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });
  }

  async findOne(id: string) {
    const exists = await this.prismaService.user.findFirst({
      where: {
        id
      },
    });

    if (!exists) {
      throw new ConflictException('User not exist');
    }

    return this.prismaService.user.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        email: true,
        number: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const exists = await this.prismaService.user.findFirst({
      where: { id },
    });

    if (!exists) {
      throw new ConflictException('User not exist');
    }

    const { email, number, password, roleId } = dto;

    const data: any = { email, number, role_id: roleId };

    if (password) {
      data.password = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 10,
        parallelism: 1,
      });
    }

    return this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const exists = await this.prismaService.user.findFirst({
      where: { id },
    });

    if (!exists) {
      throw new ConflictException('User not exist');
    }

    return this.prismaService.user.delete({
      where: {
        id
      }
    });
  }

  async addVehicle(dto: addVehicleDto) {
    const { userId, vehicleId } = dto;

    const [userExists, vehicleExists] = await Promise.all([
      this.prismaService.user.findUnique({ where: { id: userId } }),
      this.prismaService.vehicle.findUnique({ where: { id: vehicleId } }),
    ]);
    if (!userExists) throw new ConflictException('User does not exist');
    if (!vehicleExists) throw new ConflictException('Vehicle does not exist');

    const existing = await this.prismaService.userVehicle.findUnique({
      where: {
        user_id_vehicle_id: {
          user_id: userId,
          vehicle_id: vehicleId,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        `User ${userId} is already linked to vehicle ${vehicleId}`,
      );
    }

    return await this.prismaService.userVehicle.create({
      data: {
        user_id: userId,
        vehicle_id: vehicleId,
      },
      include: {
        vehicle: true,
      },
    });
  }

  async findVehicles(id: string) {
    const exists = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new ConflictException('User does not exist');
    }

    const userVehicles = await this.prismaService.userVehicle.findMany({
      where: { user_id: id },
      include: { vehicle: true },
    });

    console.log(userVehicles);

    return userVehicles.map((uv) => uv.vehicle);
  }
}
