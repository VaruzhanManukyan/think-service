import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { RoleDto } from './dto/role.dto';
import type { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prismaService: PrismaService) { }

  async create(dto: RoleDto) {
    const { name, description } = dto;
    return await this.prismaService.role.create({
      data: {
        name,
        description
      }
    });
  }

  async findAll() {
    return await this.prismaService.role.findMany();
  }

  async findOne(id: string) {
    const exists = this.prismaService.role.findFirst({
      where: {
        id
      }
    });
    
    if (!exists) {
      throw new ConflictException('Role not exists.')
    }

    return await this.prismaService.role.findUnique({
      where: {
        id
      }
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    const exists = this.prismaService.role.findFirst({
      where: {
        id
      }
    });
    
    if (!exists) {
      throw new ConflictException('Role not exists.')
    }

    return await this.prismaService.role.update({
      where: {
        id
      },
      data: dto
    })
  }

  async remove(id: string) {
    const exists = this.prismaService.role.findFirst({
      where: {
        id
      }
    });
    
    if (!exists) {
      throw new ConflictException('Role not exists.')
    }

    return await this.prismaService.role.delete({
      where: {
        id
      }
    })
  }
}
