const Phone = require('../models/Phone');

// Placeholder: future SOC integration can subscribe to phone risk updates here
// and trigger monitoring / alert pipelines when riskLevel becomes HIGH or CRITICAL.
const determineRiskLevel = (reports) => {
  if (reports >= 30) return 'CRITICAL';
  if (reports >= 10) return 'HIGH';
  if (reports >= 3) return 'MEDIUM';
  return 'LOW';
};

const findOrCreatePhone = async (phoneNumber) => {
  const normalizedPhone = phoneNumber.trim();
  let phone = await Phone.findOne({ phone: normalizedPhone });

  if (!phone) {
    phone = new Phone({ phone: normalizedPhone, reports: 0, riskLevel: 'LOW' });
  }

  return phone;
};

const recordReportForPhone = async (phoneNumber) => {
  const phone = await findOrCreatePhone(phoneNumber);
  phone.reports += 1;
  phone.riskLevel = determineRiskLevel(phone.reports);
  await phone.save();
  return phone;
};

const getPhoneInfo = async (phoneNumber) => {
  const normalizedPhone = phoneNumber.trim();
  const phone = await Phone.findOne({ phone: normalizedPhone }).select('phone reports riskLevel');
  return phone;
};

const getTopReportedPhones = async (limit = 10) => {
  return Phone.find()
    .sort({ reports: -1, updatedAt: -1 })
    .limit(limit)
    .select('phone reports riskLevel');
};

const getSyncPhones = async () => {
  return Phone.find({ reports: { $gt: 0 } })
    .sort({ riskLevel: -1, reports: -1 })
    .select('phone reports riskLevel');
};

module.exports = {
  determineRiskLevel,
  recordReportForPhone,
  getPhoneInfo,
  getTopReportedPhones,
  getSyncPhones,
};
