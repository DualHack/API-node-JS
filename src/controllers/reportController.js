const { createReport } = require('../services/reportService');

const createReportHandler = async (req, res) => {
  try {
    const { phone, reason, description, source } = req.body;

    if (!phone || !reason || !source) {
      return res.status(400).json({
        success: false,
        message: 'phone, reason and source are required',
      });
    }

    const { report, phoneInfo } = await createReport({ phone, reason, description, source });

    return res.status(201).json({
      success: true,
      data: {
        reportId: report._id,
        phone: phoneInfo.phone,
        reports: phoneInfo.reports,
        riskLevel: phoneInfo.riskLevel,
        riskScore: phoneInfo.riskScore,
        aiInsight: phoneInfo.aiInsight,
      },
    });
  } catch (error) {
    console.error('Create report error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the report',
      error: error.message,
    });
  }
};

module.exports = {
  createReportHandler,
};
