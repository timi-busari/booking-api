import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Property } from "../entities/Property";
import { PaginatedResponse, PropertyFilters } from "../types";

export class PropertyService {
  private propertyRepository: Repository<Property>;

  constructor() {
    this.propertyRepository = AppDataSource.getRepository(Property);
  }

  async getAllProperties(
    page: number = 1,
    limit: number = 10,
    filters: PropertyFilters = {}
  ): Promise<PaginatedResponse<Property>> {
    const queryBuilder = this.propertyRepository.createQueryBuilder("property");

    // apply filters
    if (filters.available_from) {
      queryBuilder.andWhere("property.available_from <= :availableFrom", {
        availableFrom: filters.available_from,
      });
    }

    if (filters.available_to) {
      queryBuilder.andWhere("property.available_to >= :availableTo", {
        availableTo: filters.available_to,
      });
    }

    // pagination
    const offset = (page - 1) * limit;
    queryBuilder
      .orderBy("property.created_at", "DESC")
      .skip(offset)
      .take(limit);

    const [properties, total] = await queryBuilder.getManyAndCount();

    return {
      data: properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPropertyById(id: number): Promise<Property | null> {
    return await this.propertyRepository.findOneBy({ id });
  }
}
