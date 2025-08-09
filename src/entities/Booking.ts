import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { IsNotEmpty, IsDateString, Length, IsInt, IsPositive } from 'class-validator';
import { Property } from './Property';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsInt()
  @IsPositive()
  property_id: number;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  @Length(1, 100)
  user_name: string;

  @Column({ type: 'date' })
  @IsDateString()
  start_date: string;

  @Column({ type: 'date' })
  @IsDateString()
  end_date: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Property, property => property.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @BeforeInsert()
  @BeforeUpdate()
  validateDates() {
    if (new Date(this.end_date) <= new Date(this.start_date)) {
      throw new Error('end_date must be after start_date');
    }
  }
}