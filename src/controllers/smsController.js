const { createReport } = require('../services/reportService');

const postSmsReportHandler = async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'message is required',
      });
    }

    const normalizedMessage = message.toUpperCase();
    const match = normalizedMessage.match(/DENUNCIAR\s*([+0-9]+)/i);
    const targetPhone = match ? match[1] : phone;

    if (!targetPhone) {
      return res.status(400).json({
        success: false,
        message: 'phone number is required either in body or message text',
      });
    }

    const reason = 'Denúncia via SMS';
    const source = 'SMS';
    const description = `SMS automatico: ${message}`;

    const { report, phoneInfo } = await createReport({
      phone: targetPhone,
      reason,
      description,
      source,
    });

    return res.status(201).json({
      success: true,
      data: {
        reportId: report._id,
        phone: phoneInfo.phone,
        reports: phoneInfo.reports,
        riskLevel: phoneInfo.riskLevel,
        aiInsight: phoneInfo.aiInsight,
      },
    });
  } catch (error) {
    console.error('SMS report error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing SMS report',
      error: error.message,
    });
  }
};

module.exports = {
  postSmsReportHandler,
};
