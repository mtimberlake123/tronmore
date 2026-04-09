import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('prompt_templates')
export class PromptTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'template_id', unique: true })
  templateId: string;

  @Column()
  industry: string; // catering, beauty, general

  @Column()
  style: string; // professional, friendly, promotional

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
