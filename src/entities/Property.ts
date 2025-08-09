import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { IsNotEmpty, IsPositive, IsDateString, Length, Min } from 'class-validator';
import { Booking } from './Booking';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @Length(1, 255)
  title: string;
 
  @Column({ type: 'text' })
  @IsNotEmpty()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsPositive()
  @Min(0)
  price_per_night: number;

  @Column({ type: 'date' })
  @IsDateString()
  available_from: string; 

  @Column({ type: 'date' })
  @IsDateString()
  available_to: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Booking, booking => booking.property, { cascade: true })
  bookings: Booking[];

  @BeforeInsert()
  @BeforeUpdate()
  validateDates() {
    if (new Date(this.available_to) <= new Date(this.available_from)) {
      throw new Error('available_to must be after available_from');
    }
  }
}