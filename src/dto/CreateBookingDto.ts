import { IsNotEmpty, IsDateString, IsInt, IsPositive, Length, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Transform, Type } from 'class-transformer';

@ValidatorConstraint({ name: 'IsAfterStartDate', async: false })
export class IsAfterStartDateConstraint implements ValidatorConstraintInterface {
  validate(endDate: string, args: ValidationArguments) {
    const object = args.object as any;
    if (!object.start_date || !endDate) return true;
    return new Date(endDate) > new Date(object.start_date);
  }

  defaultMessage(args: ValidationArguments) {
    return 'end_date must be after start_date';
  }
}

export class CreateBookingDto {
  @IsInt({ message: 'property_id must be a valid integer' })
  @IsPositive({ message: 'property_id must be positive' })
  @Type(() => Number)
  property_id: number;

  @IsNotEmpty({ message: 'user_name is required' })
  @Length(1, 100, { message: 'user_name must be between 1 and 100 characters' })
  user_name: string;

  @IsDateString({}, { message: 'start_date must be a valid date in YYYY-MM-DD format' })
  start_date: string;

  @IsDateString({}, { message: 'end_date must be a valid date in YYYY-MM-DD format' })
  @Validate(IsAfterStartDateConstraint)
  end_date: string;
}