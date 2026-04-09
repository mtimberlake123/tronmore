import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('drafts')
export class Draft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'draft_id', unique: true })
  draftId: string;

  @Column()
  type: string; // poster, card

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'json' })
  content: any;

  @Column({ name: 'template_id', nullable: true })
  templateId: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
