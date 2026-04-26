import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ai_agent_configs')
export class AiAgentConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'agent_id', unique: true })
  agentId: string;

  @Column()
  name: string;

  @Column({ name: 'step_key' })
  stepKey: string;

  @Column({ nullable: true })
  model: string;

  @Column({ name: 'temperature', default: 0.7 })
  temperature: number;

  @Column({ name: 'max_iterations', default: 3 })
  maxIterations: number;

  @Column({ name: 'system_prompt', type: 'text' })
  systemPrompt: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
