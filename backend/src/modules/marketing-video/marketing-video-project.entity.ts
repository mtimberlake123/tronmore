import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('marketing_video_projects')
export class MarketingVideoProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id', unique: true })
  projectId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'merchant_id', nullable: true })
  merchantId: string;

  @Column()
  title: string;

  @Column()
  type: string;

  @Column({ name: 'type_name' })
  typeName: string;

  @Column({ default: '项' })
  mark: string;

  @Column({ name: 'current_step', default: 'script' })
  currentStep: string;

  @Column({ default: 'draft' })
  status: string;

  @Column({ default: 0 })
  progress: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
