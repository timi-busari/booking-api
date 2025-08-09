import { Router, Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/PropertyService';
import { BookingService } from '../services/BookingService';

const router = Router();
const propertyService = new PropertyService();
const bookingService = new BookingService();

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: Get all properties
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: available_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by availability start date
 *       - in: query
 *         name: available_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by availability end date
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    
    const filters = {
      available_from: req.query.available_from as string,
      available_to: req.query.available_to as string
    };

    const result = await propertyService.getAllProperties(page, limit, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /properties/{id}/availability:
 *   get:
 *     summary: Get availability for a specific property
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Available date ranges
 *       404:
 *         description: Property not found
 */
router.get('/:id/availability', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = parseInt(req.params.id);
    const availableRanges = await bookingService.getAvailableDateRanges(propertyId);
    
    res.json({
      property_id: propertyId,
      available_ranges: availableRanges
    });
  } catch (error) {
    next(error);
  }
});

export default router;