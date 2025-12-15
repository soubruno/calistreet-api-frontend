import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { TreinoRepository } from './repository';
import { CreateTreinoDto, TreinoItemDto } from './dto/create-treino.dto';
import { UpdateTreinoDto } from './dto/update-treino.dto';
import { ExercicioService } from '../exercicio/service';
import { Treino } from './entity';
import { UsuarioService } from '../usuario/service';
import { TipoUsuario } from '../common/enums/tipo-usuario.enum';

@Injectable()
export class TreinoService {
  constructor(
    private readonly treinoRepository: TreinoRepository,
    private readonly exercicioService: ExercicioService,
    private readonly usuarioService: UsuarioService,
  ) {}

  // =====================================================
  // 1️⃣ CRIAÇÃO
  // =====================================================

  async create(
    createTreinoDto: CreateTreinoDto,
    criadoPorId: string,
  ): Promise<Treino> {
    // 1. Valida exercícios
    for (const item of createTreinoDto.itens) {
      try {
        await this.exercicioService.findOne(item.exercicioId);
      } catch {
        throw new BadRequestException(
          `O exercício com ID ${item.exercicioId} é inválido ou não existe.`,
        );
      }
    }

    // 2. Regra de template
    const usuario = await this.usuarioService.findOne(criadoPorId);

    const isTemplate =
      createTreinoDto.isTemplate &&
      [TipoUsuario.ADMIN, TipoUsuario.PROFISSIONAL].includes(usuario.tipo);

    // 3. Persistência
    return this.treinoRepository.create({
        ...createTreinoDto,
        isTemplate: Boolean(isTemplate),
        criadoPorId,
    } as CreateTreinoDto & { isTemplate: boolean; criadoPorId: string });
  }

  // =====================================================
  // 2️⃣ LEITURA
  // =====================================================

  async findOne(id: string): Promise<Treino> {
    return this.treinoRepository.findById(id);
  }

  /** 📦 Catálogo público (templates) */
  async findCatalogo(query: any) {
    const { count, rows } = await this.treinoRepository.findCatalogo(query);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      hasNextPage: page * limit < count,
    };
  }

  /** 👤 Treinos do usuário logado */
  async findMeusTreinos(usuarioId: string) {
    return this.treinoRepository.findMeusTreinos(usuarioId);
  }

  // =====================================================
  // 3️⃣ ATUALIZAÇÃO
  // =====================================================

  async update(
    treinoId: string,
    data: UpdateTreinoDto,
    usuarioLogadoId: string,
  ): Promise<Treino> {
    const treino = await this.treinoRepository.findById(treinoId);
    const usuario = await this.usuarioService.findOne(usuarioLogadoId);

    const isCriador = treino.criadoPorId === usuarioLogadoId;
    const isAdmin = usuario.tipo === TipoUsuario.ADMIN;

    if (!isCriador && !isAdmin) {
      throw new UnauthorizedException(
        'Você não tem permissão para editar este treino.',
      );
    }

    // Valida novos itens
    if (data.itens) {
      for (const item of data.itens) {
        try {
          await this.exercicioService.findOne(item.exercicioId);
        } catch {
          throw new BadRequestException(
            `O exercício com ID ${item.exercicioId} é inválido ou não existe.`,
          );
        }
      }

      await this.treinoRepository.removeItens(treinoId);

      await this.treinoRepository.syncItens(
        treinoId,
        data.itens.map((item) => ({ ...item, treinoId })),
      );
    }

    const { itens, ...treinoData } = data;
    return this.treinoRepository.update(treinoId, treinoData);
  }

  // =====================================================
  // 4️⃣ REMOÇÃO
  // =====================================================

  async remove(treinoId: string, usuarioLogadoId: string): Promise<void> {
    const treino = await this.treinoRepository.findById(treinoId);
    const usuario = await this.usuarioService.findOne(usuarioLogadoId);

    const isCriador = treino.criadoPorId === usuarioLogadoId;
    const isAdmin = usuario.tipo === TipoUsuario.ADMIN;

    if (!isCriador && !isAdmin) {
      throw new UnauthorizedException(
        'Você não tem permissão para excluir este treino.',
      );
    }

    await this.treinoRepository.remove(treinoId);
  }

  // =====================================================
  // 5️⃣ ITENS DO TREINO
  // =====================================================

  async adicionarExercicio(
    treinoId: string,
    itemDto: TreinoItemDto,
    usuarioLogadoId: string,
  ): Promise<Treino> {
    const treino = await this.treinoRepository.findById(treinoId);
    const usuario = await this.usuarioService.findOne(usuarioLogadoId);

    const isCriador = treino.criadoPorId === usuarioLogadoId;
    const isAdmin = usuario.tipo === TipoUsuario.ADMIN;

    if (!isCriador && !isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para modificar este treino.',
      );
    }

    try {
      await this.exercicioService.findOne(itemDto.exercicioId);
    } catch {
      throw new BadRequestException(
        `O exercício com ID ${itemDto.exercicioId} é inválido ou não existe.`,
      );
    }

    await this.treinoRepository.adicionarItem(treinoId, itemDto);

    return this.treinoRepository.findById(treinoId);
  }

  async removeExercicio(
    treinoId: string,
    exercicioId: string,
    usuarioLogadoId: string,
  ): Promise<void> {
    const treino = await this.treinoRepository.findById(treinoId);
    const usuario = await this.usuarioService.findOne(usuarioLogadoId);

    const isCriador = treino.criadoPorId === usuarioLogadoId;
    const isAdmin = usuario.tipo === TipoUsuario.ADMIN;

    if (!isCriador && !isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para modificar este treino.',
      );
    }

    const removed = await this.treinoRepository.removeTreinoItem(
      treinoId,
      exercicioId,
    );

    if (!removed) {
      throw new NotFoundException(
        'O item de prescrição não foi encontrado.',
      );
    }
  }
}