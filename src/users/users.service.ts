import { Injectable, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) { }

  async create(dto: UserDto) {
    const { roleId, email, password, number } = dto;

    const exists = await this.prismaService.user.findFirst({
      where: { OR: [{ email }, { number }] },
    });

    if (!exists) {
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
    return this.prismaService.user.findMany();
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
      include: {
        role: true
      }
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const exists = await this.prismaService.user.findFirst({
      where: {
        id
      },
    });

    if (!exists) {
      throw new ConflictException('User not exist');
    }

    const { email, number, password, roleId } = dto;

    let hash = password;
    if (password) {
      hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 10,
        parallelism: 1,
      });
    }

    return this.prismaService.user.update({
      where: {
        id
      },
      data: {
        email,
        number,
        password: hash ? hash : password,
        role_id: roleId
      }
    });
  }

  async remove(id: string) {
    const exists = await this.prismaService.user.findFirst({
      where: {
        id
      },
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
}
