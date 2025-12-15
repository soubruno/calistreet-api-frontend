import { QueryInterface, QueryTypes } from 'sequelize';

const exerciciosData = [
  {
    id: '00e4cc7b-8167-47c1-ab89-87d0a800a5ed',
    nome: 'Pistol Squat',
    descricao: 'Agachamento unilateral de alta dificuldade.',
    grupo_muscular: 'INFERIOR',
    subgrupo_muscular: 'QUADRICEPS',
    equipamentos_necessarios: 'Nenhum',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/15.png',
  },
  {
    id: '0f420527-a7a6-498c-a6f6-3279ea7b5df5',
    nome: 'Agachamento Livre',
    descricao: 'Exercício fundamental para pernas e glúteos.',
    grupo_muscular: 'INFERIOR',
    subgrupo_muscular: 'QUADRICEPS',
    equipamentos_necessarios: 'Nenhum',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/11.png',
  },
  {
    id: '3b5309d9-958d-4d1a-a336-61a5e1c00229',
    nome: 'Prancha (Plank)',
    descricao: 'Fortalecimento isométrico do core e lombar.',
    grupo_muscular: 'CORE',
    subgrupo_muscular: 'ABDOMEN',
    equipamentos_necessarios: 'Nenhum',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/6.png',
  },
  {
    id: '48e5ca12-00c1-4e5c-997e-86ea9f132b9a',
    nome: 'Elevação de Panturrilha',
    descricao: 'Fortalecimento da panturrilha, pode ser feito em um degrau.',
    grupo_muscular: 'INFERIOR',
    subgrupo_muscular: 'PANTURRILHA',
    equipamentos_necessarios: 'Degrau',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/13.png',
  },
  {
    id: '5a2a7d17-ced0-436b-9d38-d3ba9983e006',
    nome: 'L-Sit Hold',
    descricao: 'Sustentação em L, exigindo força extrema do abdômen e flexores de quadril.',
    grupo_muscular: 'CORE',
    subgrupo_muscular: 'ABDOMEN',
    equipamentos_necessarios: 'Paralelas',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/7.png',
  },
  {
    id: '63fdc379-1089-4961-bc8d-0758843b0caf',
    nome: 'Afundo',
    descricao: 'Trabalho unilateral de pernas, glúteos e equilíbrio.',
    grupo_muscular: 'INFERIOR',
    subgrupo_muscular: 'QUADRICEPS',
    equipamentos_necessarios: 'Nenhum',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/12.png',
  },
  {
    id: '64df79b8-dfaf-4b16-881b-cebd09fdd5e4',
    nome: 'Push-up Padrão',
    descricao: 'Exercício básico para peito e tríceps, essencial na calistenia.',
    grupo_muscular: 'SUPERIOR',
    subgrupo_muscular: 'PEITO',
    equipamentos_necessarios: 'Nenhum',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/1.png',
  },
  {
    id: '66d906e2-98f2-4190-912e-51a120de7b04',
    nome: 'Chin-up',
    descricao: 'Puxada com pegada supinada para foco no bíceps.',
    grupo_muscular: 'SUPERIOR',
    subgrupo_muscular: 'BICEPS',
    equipamentos_necessarios: 'Barra Alta',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/5.png',
  },
  {
    id: '763450ef-5a58-425f-9e09-a9c8ca4ea030',
    nome: 'Flexão Australiana',
    descricao: 'Remada invertida para trabalhar as costas (requer barra baixa).',
    grupo_muscular: 'SUPERIOR',
    subgrupo_muscular: 'COSTAS',
    equipamentos_necessarios: 'Barra Baixa',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/3.png',
  },
  {
    id: '7dbea38e-278e-425f-b1de-1de854e52764',
    nome: 'Toes to Bar',
    descricao: 'Elevação das pernas até a barra (para abdômen avançado).',
    grupo_muscular: 'CORE',
    subgrupo_muscular: 'ABDOMEN',
    equipamentos_necessarios: 'Barra Alta',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/10.png',
  },
  {
    id: '82e67ef7-39be-4cfd-a6a4-1e52aef0b17c',
    nome: 'Pike Push-up',
    descricao: 'Push-up com quadril elevado para focar nos ombros.',
    grupo_muscular: 'SUPERIOR',
    subgrupo_muscular: 'OMBRO',
    equipamentos_necessarios: 'Nenhum',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/2.png',
  },
  {
    id: 'b7c76026-238d-4815-b6c2-56593dd26754',
    nome: 'Leg Raises',
    descricao: 'Elevação de pernas para o abdômen inferior.',
    grupo_muscular: 'CORE',
    subgrupo_muscular: 'ABDOMEN',
    equipamentos_necessarios: 'Nenhum',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/9.png',
  },
  {
    id: 'bbf525c8-abce-4f67-9789-62ba8231679f',
    nome: 'Super-Homem',
    descricao: 'Fortalecimento da musculatura eretora da coluna (lombar).',
    grupo_muscular: 'CORE',
    subgrupo_muscular: 'LOMBAR',
    equipamentos_necessarios: 'Nenhum',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/8.png',
  },
  {
    id: 'd2435bba-d615-4bb8-8181-bef3bc8b9d1a',
    nome: 'Diamond Push-up',
    descricao: 'Variação para isolar o tríceps e aumentar a dificuldade do push-up.',
    grupo_muscular: 'SUPERIOR',
    subgrupo_muscular: 'TRICEPS',
    equipamentos_necessarios: 'Nenhum',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/4.png',
  },
  {
    id: 'e9c17795-e5e0-4ec9-9662-39255256bfb5',
    nome: 'Ponte de Glúteos',
    descricao: 'Ativação de glúteos e posterior de coxa.',
    grupo_muscular: 'INFERIOR',
    subgrupo_muscular: 'POSTERIOR',
    equipamentos_necessarios: 'Nenhum',
    video_url: 'https://placehold.co/60/007AFF/FFFFFF?text=EX60/14.png',
  },
];

export class ExerciciosIniciaisSeeder {
  static async seed(sequelize: any): Promise<void> {
    const queryInterface = sequelize.getQueryInterface();
    const now = new Date();

    const exerciciosParaInserir = exerciciosData.map(e => ({
      ...e,
      created_at: now,
      updated_at: now,
    }));

    const ids = exerciciosParaInserir.map(e => e.id);

    const existing = await sequelize.query(
      `SELECT id FROM exercicios WHERE id IN (:ids)`,
      { replacements: { ids }, type: QueryTypes.SELECT }
    );

    const existingIds = existing.map((e: any) => e.id);
    const newExercises = exerciciosParaInserir.filter(e => !existingIds.includes(e.id));

    if (newExercises.length > 0) {
      console.log(`[SEEDER] Inserindo ${newExercises.length} exercícios iniciais...`);
      await queryInterface.bulkInsert('exercicios', newExercises);
    } else {
      console.log('[SEEDER] Exercícios iniciais já existem.');
    }
  }

  static async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.bulkDelete('exercicios', {
      id: exerciciosData.map(e => e.id),
    });
  }
}
