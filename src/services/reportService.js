const Report = require('../models/Report');
const { recordReportForPhone } = require('./phoneService');
const eventBus = require('../events/eventBus');

const createReport = async ({ phone, reason, description, source }) => {
  const report = new Report({
    phone: phone.trim(),
    reason: reason.trim(),
    description: description ? description.trim() : '',
    source,
  });

  await report.save();
  const phoneInfo = await recordReportForPhone(phone, report);

  eventBus.emit('report_created', {
    report: {
      id: report._id,
      phone: report.phone,
      source: report.source,
      reason: report.reason,
      createdAt: report.createdAt,
    },
    phone: {
      phone: phoneInfo.phone.phone,
      riskLevel: phoneInfo.phone.riskLevel,
      riskScore: phoneInfo.phone.riskScore,
      reports: phoneInfo.phone.reports,
    },
  });

  return {
    report,
    phoneInfo,
  };
};

module.exports = {
  createReport,
};
