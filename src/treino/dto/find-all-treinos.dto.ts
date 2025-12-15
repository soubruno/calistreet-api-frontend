import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Nivel } from '../../usuario/entity';

export class FindAllTreinosDto extends PaginationQueryDto {

    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        description: 'Filtra por nome do treino (LIKE)',
        example: 'Peito',
    })
    declare nome?: string;

    @IsOptional()
    @IsEnum(Nivel)
    @ApiProperty({
        enum: Nivel,
        required: false,
        description: 'Filtra por nível de dificuldade.',
    })
    declare nivel?: Nivel;

    @IsOptional()
    @IsDateString()
    @ApiProperty({
        required: false,
        description: 'Filtra treinos criados nesta data (YYYY-MM-DD).',
        example: '2025-12-15',
    })
    declare dataCriacao?: string;
}