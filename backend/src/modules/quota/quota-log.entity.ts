import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('quota_logs')
export class QuotaLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'merchant_id', nullable: true })
  merchantId: string;

  @Column()
  type: string; // allocate, recharge, consume

  @Column()
  amount: number; // 变动数量（正负）

  @Column()
  balance: number; // 变动后余额

  @Column({ nullable: true })
  remark: string;

  @Column({ name: 'operator_id', nullable: true })
  operatorId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
