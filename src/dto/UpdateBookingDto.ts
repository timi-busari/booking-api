import { IsOptional, IsNotEmpty, IsDateString, Length, Validate } from 'class-validator';
import { IsAfterStartDateConstraint } from './CreateBookingDto';

export class UpdateBookingDto {
  @IsOptional()
  @IsNotEmpty({ message: 'user_name cannot be empty' })
  @Length(1, 100, { message: 'user_name must be between 1 and 100 characters' })
  user_name?: string;

  @IsOptional()
  @IsDateString({}, { message: 'start_date must be a valid date in YYYY-MM-DD format' })
  start_date?: string;

  @IsOptional()
  @IsDateString({}, { message: 'end_date must be a valid date in YYYY-MM-DD format' })
  @Validate(IsAfterStartDateConstraint)
  end_date?: string;
}
