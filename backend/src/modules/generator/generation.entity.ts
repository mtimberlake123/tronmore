import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('generations')
export class Generation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @Column()
  type: string; // review / note

  @Column('text')
  content: string;

  @Column('json', { nullable: true })
  images: any[];

  @Column({ name: 'trace_id' })
  traceId: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  rating: number;

  @Column({ nullable: true, type: 'text' })
  feedback: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}