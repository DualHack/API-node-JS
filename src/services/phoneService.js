const Phone = require('../models/Phone');
const eventBus = require('../events/eventBus');
const { analyzeFraud } = require('./fraudIntelligenceService');

const riskValues = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const determineRiskLevel = (reports) => {
  if (reports >= 30) return 'CRITICAL';
  if (reports >= 10) return 'HIGH';
  if (reports >= 3) return 'MEDIUM';
  return 'LOW';
};

const combineRiskLevels = (baseLevel, analysisLevel) => {
  const baseIndex = riskValues.indexOf(baseLevel);
  const analysisIndex = riskValues.indexOf(analysisLevel);
  return riskValues[Math.max(baseIndex, analysisIndex)];
};

const determineTrend = (phone, previousReports, now = new Date()) => {
  if (!phone.lastReportedAt) return 'STABLE';

  const diffMs = now.getTime() - new Date(phone.lastReportedAt).getTime();
  if (diffMs <= 60 * 60 * 1000 && phone.reports > previousReports) {
    return 'INCREASING';
  }

  if (diffMs >= 24 * 60 * 60 * 1000) {
    return 'DECREASING';
  }

  return 'STABLE';
};

const buildAiInsight = (phone) => {
  if (!phone) return 'Sem informacoes adicionais disponiveis.';

  if (phone.riskLevel === 'CRITICAL') {
    return 'Este numero apresenta padrao critico de fraude com denuncias consistentes e alto risco.';
  }

  if (phone.trend === 'INCREASING' && phone.riskScore >= 50) {
    return 'Este numero apresenta padrao suspeito devido ao aumento rapido de denuncias em curto periodo.';
  }

  if (phone.riskScore >= 60) {
    return 'Detectado comportamento tipico de fraude em massa com alta intensidade de denuncias.';
  }

  if (phone.riskScore >= 30) {
    return 'Numero com atividade inconsistente e elevada taxa de denuncias.';
  }

  return 'Numero com perfil de risco baixo, monitorizado pelo sistema.';
};

const computeRiskScore = (phone, analysis) => {
  const baseScore = Math.min(80, phone.reports * 4 + (phone.reports >= 10 ? 10 : 0));
  const score = Math.min(100, baseScore + analysis.scoreAdjustment + (phone.trend === 'INCREASING' ? 8 : 0));
  return score;
};

const findOrCreatePhone = async (phoneNumber) => {
  const normalizedPhone = phoneNumber.trim();
  let phone = await Phone.findOne({ phone: normalizedPhone });

  if (!phone) {
    phone = new Phone({
      phone: normalizedPhone,
      reports: 0,
      riskLevel: 'LOW',
      riskScore: 0,
      trend: 'STABLE',
    });
  }

  return phone;
};

const recordReportForPhone = async (phoneNumber, report) => {
  const phone = await findOrCreatePhone(phoneNumber);
  const previousReports = phone.reports;
  const previousRiskLevel = phone.riskLevel;

  phone.reports += 1;
  phone.lastReportedAt = new Date();
  phone.trend = determineTrend(phone, previousReports, phone.lastReportedAt);

  const analysis = await analyzeFraud(phone);
  const ruleLevel = determineRiskLevel(phone.reports);
  const finalRiskLevel = combineRiskLevels(ruleLevel, analysis.riskLevel);

  phone.riskLevel = finalRiskLevel;
  phone.riskScore = computeRiskScore(phone, analysis);
  await phone.save();

  const insight = buildAiInsight(phone);

  const riskUpdated = previousRiskLevel !== finalRiskLevel;
  eventBus.emit('risk_updated', {
    phone: {
      phone: phone.phone,
      reports: phone.reports,
      riskLevel: phone.riskLevel,
      riskScore: phone.riskScore,
      trend: phone.trend,
      lastReportedAt: phone.lastReportedAt,
    },
    previousRiskLevel,
    reason: analysis.reason,
  });

  return {
    phone: {
      phone: phone.phone,
      reports: phone.reports,
      riskLevel: phone.riskLevel,
      riskScore: phone.riskScore,
      lastReportedAt: phone.lastReportedAt,
      trend: phone.trend,
    },
    aiInsight: insight,
    analysis,
    riskUpdated,
  };
};

const getPhoneInfo = async (phoneNumber) => {
  const normalizedPhone = phoneNumber.trim();
  const phone = await Phone.findOne({ phone: normalizedPhone }).select(
    'phone reports riskLevel riskScore lastReportedAt trend'
  );
  if (!phone) return null;

  return {
    phone: phone.phone,
    reports: phone.reports,
    riskLevel: phone.riskLevel,
    riskScore: phone.riskScore,
    lastReportedAt: phone.lastReportedAt,
    trend: phone.trend,
    aiInsight: buildAiInsight(phone),
  };
};

const getTopReportedPhones = async (limit = 10) => {
  const phones = await Phone.find()
    .sort({ reports: -1, riskScore: -1, updatedAt: -1 })
    .limit(limit)
    .select('phone reports riskLevel riskScore trend lastReportedAt');

  return phones.map((phone) => ({
    phone: phone.phone,
    reports: phone.reports,
    riskLevel: phone.riskLevel,
    riskScore: phone.riskScore,
    trend: phone.trend,
    lastReportedAt: phone.lastReportedAt,
    aiInsight: buildAiInsight(phone),
  }));
};

const getSyncPhones = async () => {
  const phones = await Phone.find({ riskLevel: { $in: ['HIGH', 'CRITICAL'] } })
    .sort({ riskScore: -1, reports: -1 })
    .select('phone reports riskLevel riskScore trend lastReportedAt');

  return phones.map((phone) => ({
    phone: phone.phone,
    reports: phone.reports,
    riskLevel: phone.riskLevel,
    riskScore: phone.riskScore,
    trend: phone.trend,
    lastReportedAt: phone.lastReportedAt,
    aiInsight: buildAiInsight(phone),
  }));
};

module.exports = {
  determineRiskLevel,
  recordReportForPhone,
  getPhoneInfo,
  getTopReportedPhones,
  getSyncPhones,
};
