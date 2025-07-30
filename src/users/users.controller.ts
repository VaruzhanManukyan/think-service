import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { addVehicleDto } from './dto/add-vehicle.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Authorization()
  @Roles([Role.ADMIN])
  @Post('create')
  create(@Body() userDto: UserDto) {
    return this.usersService.create(userDto);
  }

  @Authorization()
  @Roles([Role.ADMIN])
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Authorization()
  @Roles([Role.ADMIN])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Authorization()
  @Roles([Role.ADMIN])
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Authorization()
  @Roles([Role.ADMIN])
  @Put(':id')
  replace(@Param('id') id: string, @Body() dto: UserDto) {
    return this.usersService.update(id, dto);
  }
  
  @Authorization()
  @Roles([Role.ADMIN])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Authorization()
  @Roles([Role.ADMIN, Role.USER, Role.MASTER])
  @Post('addVehicle')
  addVehicle(@Body() dto: addVehicleDto) {
    return this.usersService.addVehicle(dto);
  }

  @Authorization()
  @Roles([Role.ADMIN, Role.USER, Role.MASTER])
  @Get('findVehicles/:id')
  findVehicles(@Param('id') id: string) {
    return this.usersService.findVehicles(id);
  }
}
