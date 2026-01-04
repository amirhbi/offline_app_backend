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
  async create(@Body() dto: CreateFormDto, @Req() req: any) {
    const payload = req?.user as { sub?: string } | undefined;
    const byUserId = payload?.sub;
    const user = byUserId ? await this.usersService.findOne(byUserId) : null;
    return this.formsService.create(dto, { userId: byUserId, username: user?.username });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateFormDto, @Req() req: any) {
    const payload = req?.user as { sub?: string } | undefined;
    const byUserId = payload?.sub;
    const user = byUserId ? await this.usersService.findOne(byUserId) : null;
    return this.formsService.update(id, dto, { userId: byUserId, username: user?.username });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const payload = req?.user as { sub?: string } | undefined;
    const byUserId = payload?.sub;
    const user = byUserId ? await this.usersService.findOne(byUserId) : null;
    return this.formsService.remove(id, { userId: byUserId, username: user?.username });
  }
}
