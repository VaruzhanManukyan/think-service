import { Controller, Get, Post, Body, Patch, Put, Param, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('create')
  @Authorization()
  @Roles([Role.ADMIN])
  create(@Body() createRoleDto: RoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Authorization()
  @Roles([Role.ADMIN])
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Authorization()
  @Roles([Role.ADMIN])
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Authorization()
  @Roles([Role.ADMIN])
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Put(':id')
  @Authorization()
  @Roles([Role.ADMIN])
  replace(@Param('id') id: string, @Body() dto: RoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @Authorization()
  @Roles([Role.ADMIN])
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
