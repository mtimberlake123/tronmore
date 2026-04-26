import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('marketing_video_steps')
export class MarketingVideoStep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'step_id', unique: true })
  stepId: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'step_key' })
  stepKey: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  input: string;

  @Column({ type: 'text', nullable: true })
  output: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 0 })
  cost: number;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
