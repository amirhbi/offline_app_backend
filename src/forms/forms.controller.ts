import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { FormsService } from './forms.service.js';
import { CreateFormDto } from './dto/create-form.dto.js';
import { UpdateFormDto } from './dto/update-form.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { UsersService } from '../users/users.service.js';

@UseGuards(new AuthGuard())
@Controller('forms')
export class FormsController {
  constructor(
    private readonly formsService: FormsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async findAll(@Req() req: any) {
    const payload = req?.user as { sub?: string; role?: string } | undefined;
    if (!payload) {
      return this.formsService.findAll();
    }
    if (payload.role === 'super_admin') {
      return this.formsService.findAll();
    }
    if (payload.sub) {
      const user = await this.usersService.findOne(payload.sub);
      const ids: string[] = [
        ...((user?.forms as string[] | undefined) || []),
        ...((user?.forms_view as string[] | undefined) || []),
      ].map((id) => id?.toString?.() || id);
      const unique = Array.from(new Set(ids)).filter(Boolean);
      if (unique.length === 0) return [];
      return this.formsService.findManyByIds(unique);
    }
    return [];
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFormDto) {
    return this.formsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFormDto) {
    return this.formsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formsService.remove(id);
  }
}
