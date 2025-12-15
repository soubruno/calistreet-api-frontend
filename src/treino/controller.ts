import { Controller, Post, Get, Put, Delete, Body, HttpCode, HttpStatus, Param, UseGuards, Query, Req, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TreinoService } from './service';
import { CreateTreinoDto, TreinoItemDto } from './dto/create-treino.dto';
import { UpdateTreinoDto } from './dto/update-treino.dto';
import { FindAllTreinosDto } from './dto/find-all-treinos.dto';

@ApiTags('Treinos')
@ApiBearerAuth()
@Controller('treinos')
export class TreinoController {
  constructor(private readonly treinoService: TreinoService) {}

  // =====================================================
  // 1️⃣ ENDPOINTS DE ESCRITA / GERENCIAMENTO
  // =====================================================

  /** Criar treino (template ou personalizado) */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Cria um novo plano de treino.' })
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateTreinoDto, @Req() req: any) {
    return this.treinoService.create(dto, req.user.id);
  }

  /** Atualizar treino */
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Atualiza um plano de treino.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTreinoDto,
    @Req() req: any,
  ) {
    return this.treinoService.update(id, dto, req.user.id);
  }

  /** Excluir treino */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um plano de treino.' })
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    return this.treinoService.remove(id, req.user.id);
  }

  // =====================================================
  // 2️⃣ ENDPOINTS DE LEITURA (SEPARADOS CORRETAMENTE)
  // =====================================================

  /** 📦 CATÁLOGO PÚBLICO (apenas templates) */
  @Get('catalogo')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lista treinos do catálogo público (templates).' })
  async findCatalogo(@Query() query: FindAllTreinosDto) {
    return this.treinoService.findCatalogo(query);
  }

  /** 👤 MEUS TREINOS (apenas do usuário logado) */
  @Get('meus')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lista os treinos criados pelo usuário logado.' })
  async findMeusTreinos(@Req() req: any) {
    return this.treinoService.findMeusTreinos(req.user.id);
  }

  /** 🔍 Visualizar treino específico */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Visualiza um treino pelo ID.' })
  async findOne(@Param('id') id: string) {
    return this.treinoService.findOne(id);
  }

  // =====================================================
  // 3️⃣ GERENCIAMENTO DE ITENS DO TREINO
  // =====================================================

  /** Adicionar exercício ao treino */
  @Post(':id/exercicios')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Adiciona um exercício ao treino.' })
  async adicionarExercicio(
    @Param('id') treinoId: string,
    @Body() dto: TreinoItemDto,
    @Req() req: any,
  ) {
    return this.treinoService.adicionarExercicio(treinoId, dto, req.user.id);
  }

  /** Remover exercício do treino */
  @Delete(':id/exercicios/:exercicioId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um exercício do treino.' })
  async removerExercicio(
    @Param('id') treinoId: string,
    @Param('exercicioId') exercicioId: string,
    @Req() req: any,
  ): Promise<void> {
    return this.treinoService.removeExercicio(
      treinoId,
      exercicioId,
      req.user.id,
    );
  }

  /** Listar exercícios do treino */
  @Get(':id/exercicios')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lista os exercícios do treino.' })
  async listarItensTreino(@Param('id') treinoId: string) {
    return this.treinoService.findOne(treinoId);
  }

  // =====================================================
  // 4️⃣ FLUXO DE EXECUÇÃO DO TREINO
  // =====================================================

  @Post(':id/iniciar')
  @UseGuards(AuthGuard('jwt'))
  async iniciarTreino(@Param('id') treinoId: string, @Req() req: any) {
    return { message: `Iniciando treino ${treinoId} para ${req.user.id}` };
  }

  @Post(':id/pausar')
  @UseGuards(AuthGuard('jwt'))
  async pausarTreino(@Param('id') treinoId: string) {
    return { message: `Treino ${treinoId} pausado.` };
  }

  @Post(':id/concluir')
  @UseGuards(AuthGuard('jwt'))
  async concluirTreino(@Param('id') treinoId: string) {
    return { message: `Treino ${treinoId} concluído.` };
  }

  @Patch(':id/marcar-exercicio/:exercicioId')
  @UseGuards(AuthGuard('jwt'))
  async marcarExercicioFeito(
    @Param('id') treinoId: string,
    @Param('exercicioId') exercicioId: string,
  ) {
    return {
      message: `Exercício ${exercicioId} marcado como feito no treino ${treinoId}.`,
    };
  }
}