import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
  Query,
  Req,
  BadRequestException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { UsuarioService } from './service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entity';

import { Roles } from '../common/decorators/roles.decorator';
import { TipoUsuario } from '../common/enums/tipo-usuario.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { FindAllUsuariosDto } from './dto/find-all-usuarios.dto';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // ===============================
  // 1. POST /usuarios (CADASTRO)
  // ===============================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo usuário.' })
  async create(@Body() dto: CreateUsuarioDto): Promise<Usuario> {
    return this.usuarioService.create(dto);
  }

  // ===============================
  // 2. GET /usuarios (LISTAGEM)
  // ===============================
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(TipoUsuario.ADMIN, TipoUsuario.PROFISSIONAL)
  async findAll(@Query() query: FindAllUsuariosDto) {
    return this.usuarioService.findAll(query);
  }

  // ===============================
  // 3. GET /usuarios/me
  // ===============================
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: Request) {
    const userId = (req.user as any)?.id;
    return this.usuarioService.findOne(userId);
  }

  // ===============================
  // 4. PUT /usuarios/me 
  // ===============================
  @Put('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Atualiza o perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  async updateMe(
    @Req() req: Request,
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ): Promise<Usuario> {
    const userId = (req.user as any).id;
    
    console.log(req.user);
    if (!updateUsuarioDto || Object.keys(updateUsuarioDto).length === 0) {
      throw new BadRequestException('Nenhum dado enviado para atualização');
    }

    return this.usuarioService.update(userId, updateUsuarioDto);
  }

  // ===============================
  // 5. GET /usuarios/:id
  // ===============================
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  // ===============================
  // 6. PUT /usuarios/:id
  // ===============================
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUsuarioDto
  ) {
    return this.usuarioService.update(id, dto);
  }

  // ===============================
  // 7. PATCH FOTO
  // ===============================
  @Patch(':id/foto')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateFoto(
    @Param('id') id: string,
    @Body('fotoUrl') fotoUrl: string
  ) {
    return this.usuarioService.updateFoto(id, fotoUrl);
  }

  // ===============================
  // 8. PATCH CAPA
  // ===============================
  @Patch(':id/capa')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateCapa(
    @Param('id') id: string,
    @Body('capaUrl') capaUrl: string
  ) {
    return this.usuarioService.updateCapa(id, capaUrl);
  }

  // ===============================
  // 9. DELETE
  // ===============================
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(TipoUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.usuarioService.remove(id);
  }
}
