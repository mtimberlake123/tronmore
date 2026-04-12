import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tenant_id', unique: true })
  tenantId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @Column({ name: 'total_quota', default: 0 })
  totalQuota: number;

  @Column({ name: 'used_quota', default: 0 })
  usedQuota: number;

  @Column({ default: 0 })
  balance: number;

  @Column({ default: 1 })
  status: number; // 0: 禁用, 1: 正常, 2: 欠费

  @Column({ name: 'is_admin', default: false })
  isAdmin: boolean; // 是否为平台管理员

  @Column({ name: 'api_key', unique: true, nullable: true })
  apiKey: string; // API Key

  @Column({ default: 'user' })
  role: string; // 角色: user, admin, operator, finance

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}