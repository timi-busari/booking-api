import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';

export function validateDto<T extends object>(dtoClass: ClassConstructor<T>, skipMissingProperties = false) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(dtoClass, req.body);
      const errors = await validate(dto, { 
        skipMissingProperties,
        whitelist: true, // strip properties that don't have decorators
        forbidNonWhitelisted: true // throw error if non-whitelisted properties are present
      });

      if (errors.length > 0) {
        const errorMessages = formatValidationErrors(errors);
        return res.status(400).json({
          error: 'Validation failed',
          details: errorMessages
        });
      }

      // replace req.body with the transformed and validated DTO
      req.body = dto;
      next();
    } catch (error) {
      next(error);
    }
  };
}

function formatValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];
  
  errors.forEach(error => {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    
    // handle nested validation errors
    if (error.children && error.children.length > 0) {
      const childMessages = formatValidationErrors(error.children);
      messages.push(...childMessages.map(msg => `${error.property}.${msg}`));
    }
  });
  
  return messages;
}