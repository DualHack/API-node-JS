const Phone = require('../models/Phone');
const Report = require('../models/Report');

const getAnalyticsSummaryHandler = async (req, res) => {
  try {
    const totalPhones = await Phone.countDocuments();
    const totalReports = await Report.countDocuments();
    const criticalPhones = await Phone.countDocuments({ riskLevel: 'CRITICAL' });

    const fraudTrends = await Phone.aggregate([
      {
        $group: {
          _id: '$trend',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          trend: '$_id',
          count: 1,
        },
      },
    ]);

    const reportedPhones = await Phone.find({ reports: { $gt: 0 } })
      .sort({ reports: -1, riskScore: -1 })
      .select('phone reports riskLevel riskScore trend lastReportedAt');

    return res.status(200).json({
      success: true,
      data: {
        totalPhones,
        totalReports,
        criticalPhones,
        fraudTrends,
        reportedPhones,
      },
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving analytics summary',
      error: error.message,
    });
  }
};

module.exports = {
  getAnalyticsSummaryHandler,
};
