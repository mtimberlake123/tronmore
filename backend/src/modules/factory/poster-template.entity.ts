import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('poster_templates')
export class PosterTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  category: string; // catering, beauty, general

  @Column()
  scene: string; // review, note, promotion

  @Column({ name: 'thumbnail_url' })
  thumbnailUrl: string;

  @Column({ name: 'template_url' })
  templateUrl: string;

  @Column({ type: 'json' })
  config: {
    width: number;
    height: number;
    elements: any[];
  };

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
