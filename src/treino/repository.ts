import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Treino } from './entity';
import { TreinoExercicio } from './treino-exercicio.entity';
import { CreateTreinoDto, TreinoItemDto } from './dto/create-treino.dto';
import { Exercicio } from '../exercicio/entity';
import { Usuario } from '../usuario/entity';
import { FindAllTreinosDto } from './dto/find-all-treinos.dto';

@Injectable()
export class TreinoRepository {
  constructor(
    @InjectModel(Treino)
    private readonly treinoModel: typeof Treino,

    @InjectModel(TreinoExercicio)
    private readonly treinoExercicioModel: typeof TreinoExercicio,
  ) {}

  // =====================================================
  // 1️⃣ CRIAÇÃO
  // =====================================================

  async create(
    data: CreateTreinoDto & { isTemplate: boolean; criadoPorId: string },
  ): Promise<Treino> {
    const treino = await this.treinoModel.create(data as Treino);

    const itens = data.itens.map((item) => ({
      ...item,
      treinoId: treino.id,
    }));

    await this.treinoExercicioModel.bulkCreate(itens as any);

    return this.findById(treino.id);
  }

  // =====================================================
  // 2️⃣ LEITURA
  // =====================================================

  async findById(id: string): Promise<Treino> {
    const treino = await this.treinoModel.findByPk(id, {
      include: [
        {
          model: TreinoExercicio,
          as: 'itens',
          separate: true,
          order: [['ordem', 'ASC']],
          include: [
            {
              model: Exercicio,
              attributes: ['id', 'nome', 'grupoMuscular', 'videoUrl'],
            },
          ],
        },
        {
          model: Usuario,
          as: 'criador',
          attributes: ['nome', 'tipo'],
        },
      ],
    });

    if (!treino) {
      throw new NotFoundException(`Treino com ID ${id} não encontrado.`);
    }

    return treino;
  }

  /** 📦 Catálogo público (templates) */
  async findCatalogo(query: any) {
    const limit = Number(query.limit) || 10;
    const offset = (Number(query.page || 1) - 1) * limit;

    return this.treinoModel.findAndCountAll({
      where: {
        isTemplate: true,
        ...(query.nivel && { nivel: query.nivel }),
      },
      include: [
        { model: Usuario, as: 'criador', attributes: ['nome', 'tipo'] },
      ],
      distinct: true,
      limit,
      offset,
      order: [['nome', 'ASC']],
    });
  }

  /** 👤 Treinos do usuário logado */
  async findMeusTreinos(usuarioId: string): Promise<Treino[]> {
    return this.treinoModel.findAll({
      where: {
        criadoPorId: usuarioId,
        isTemplate: false,
      },
      include: [
        {
          model: TreinoExercicio,
          as: 'itens',
          separate: true,          // 🔥 OBRIGATÓRIO
          order: [['ordem', 'ASC']],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  // =====================================================
  // 3️⃣ ATUALIZAÇÃO
  // =====================================================

  async update(
    treinoId: string,
    data: Partial<Treino>,
  ): Promise<Treino> {
    const treino = await this.findById(treinoId);
    await treino.update(data as any);
    return treino;
  }

  async removeItens(treinoId: string): Promise<void> {
    await this.treinoExercicioModel.destroy({
      where: { treinoId },
    });
  }

  async syncItens(treinoId: string, itens: any[]): Promise<void> {
    await this.removeItens(treinoId);
    await this.treinoExercicioModel.bulkCreate(itens as any);
  }

  // =====================================================
  // 4️⃣ REMOÇÃO
  // =====================================================

  async remove(treinoId: string): Promise<void> {
    await this.removeItens(treinoId);

    const deleted = await this.treinoModel.destroy({
      where: { id: treinoId },
    });

    if (!deleted) {
      throw new NotFoundException(
        `Treino com ID ${treinoId} não encontrado para exclusão.`,
      );
    }
  }

  // =====================================================
  // 5️⃣ ITENS DO TREINO
  // =====================================================

  async adicionarItem(
    treinoId: string,
    item: TreinoItemDto,
  ): Promise<TreinoExercicio> {
    return this.treinoExercicioModel.create({
      ...item,
      treinoId,
    } as any);
  }

  async removeTreinoItem(
    treinoId: string,
    exercicioId: string,
  ): Promise<number> {
    return this.treinoExercicioModel.destroy({
      where: { treinoId, exercicioId },
    });
  }

  // =====================================================
  // 6️⃣ MÉTRICAS
  // =====================================================

  async countAll(): Promise<number> {
    return this.treinoModel.count();
  }
}