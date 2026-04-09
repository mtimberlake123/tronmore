import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('analytics_logs')
export class AnalyticsLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @Column({ name: 'qr_id', nullable: true })
  qrId: string;

  @Column({ name: 'event_type' })
  eventType: string; // pv, uv, gen, jump

  @Column({ name: 'device_fingerprint', nullable: true })
  deviceFingerprint: string;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  type: string; // review, note

  @Column({ name: 'target_platform', nullable: true })
  targetPlatform: string;

  @Column({ name: 'trace_id', nullable: true })
  traceId: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ name: 'client_time', nullable: true })
  clientTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}