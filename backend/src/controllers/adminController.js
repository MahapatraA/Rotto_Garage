const Booking = require('../models/Booking');

/**
 * GET /api/admin/stats
 * Protected (admin) — single $facet aggregation returning:
 *   - bookingsByStatus
 *   - bookingsByServiceType
 *   - last5Bookings (with car + user populated)
 *   - totalRevenue
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [result] = await Booking.aggregate([
      {
        $facet: {
          bookingsByStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],

          bookingsByServiceType: [
            { $group: { _id: '$serviceType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          last5Bookings: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'cars',
                localField: 'carId',
                foreignField: '_id',
                as: 'car',
              },
            },
            { $unwind: { path: '$car', preserveNullAndEmpty: true } },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: { path: '$user', preserveNullAndEmpty: true } },
            {
              $project: {
                'user.password': 0,
              },
            },
          ],

          totalRevenue: [
            {
              $group: {
                _id: null,
                total: { $sum: '$estimatedCost' },
              },
            },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        bookingsByStatus:      result.bookingsByStatus,
        bookingsByServiceType: result.bookingsByServiceType,
        last5Bookings:         result.last5Bookings,
        totalRevenue:          result.totalRevenue[0]?.total ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAdminStats };