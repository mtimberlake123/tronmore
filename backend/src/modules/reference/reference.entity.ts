import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('references')
export class Reference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ref_id', unique: true })
  refId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column()
  type: string; // note, review

  @Column()
  content: string;

  @Column()
  style: string; // professional, friendly, promotional

  @Column({ nullable: true })
  source: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
