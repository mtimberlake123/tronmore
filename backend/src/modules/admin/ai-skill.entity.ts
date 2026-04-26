import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ai_skills')
export class AiSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'skill_id', unique: true })
  skillId: string;

  @Column()
  name: string;

  @Column({ name: 'agent_type' })
  agentType: string;

  @Column({ type: 'text' })
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
