const Report = require('../models/Report');
const { recordReportForPhone } = require('./phoneService');

const createReport = async ({ phone, reason, description, source }) => {
  const report = new Report({
    phone: phone.trim(),
    reason: reason.trim(),
    description: description ? description.trim() : '',
    source,
  });

  await report.save();
  const phoneInfo = await recordReportForPhone(phone);

  return {
    report,
    phoneInfo,
  };
};

module.exports = {
  createReport,
};
