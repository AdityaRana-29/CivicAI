const Department = require('../models/Department');

/**
 * Route a report to the correct department
 * @param {string} issueType
 * @param {[number, number]} coordinates - [longitude, latitude]
 * @returns {Promise<{departmentId: string, needsManualReview: boolean}>}
 */
const routeDepartment = async (issueType, coordinates) => {
  try {
    // First try to match by issueType
    const departments = await Department.find({ issueTypes: issueType });

    if (departments.length === 0) {
      // No match — find or create General department
      const general = await Department.findOne({ name: 'General' });
      return { departmentId: general?._id?.toString() || null, needsManualReview: true };
    }

    if (departments.length === 1) {
      return { departmentId: departments[0]._id.toString(), needsManualReview: false };
    }

    // Multiple departments — try jurisdiction filter
    const withBounds = departments.filter(
      (d) => d.jurisdictionBounds && d.jurisdictionBounds.coordinates?.length
    );

    if (withBounds.length > 0) {
      // Use first matching department with bounds (Mongoose geoWithin query)
      const [lon, lat] = coordinates;
      for (const dept of withBounds) {
        const match = await Department.findOne({
          _id: dept._id,
          jurisdictionBounds: {
            $geoIntersects: {
              $geometry: { type: 'Point', coordinates: [lon, lat] },
            },
          },
        });
        if (match) {
          return { departmentId: match._id.toString(), needsManualReview: false };
        }
      }
    }

    // Fallback: first match
    return { departmentId: departments[0]._id.toString(), needsManualReview: false };
  } catch (error) {
    console.error('Department routing error:', error.message);
    const general = await Department.findOne({ name: 'General' });
    return { departmentId: general?._id?.toString() || null, needsManualReview: true };
  }
};

module.exports = { routeDepartment };
