const Report = require('../models/Report');

const normalizePhone = (phone) => phone.trim();

const mapScoreToRiskLevel = (score) => {
  if (score >= 80) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
};

const analyzeFraud = async (phone) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const phoneNumber = normalizePhone(phone.phone);

  const reportsLastHour = await Report.countDocuments({
    phone: phoneNumber,
    createdAt: { $gte: oneHourAgo },
  });

  const reportsLastDay = await Report.countDocuments({
    phone: phoneNumber,
    createdAt: { $gte: oneDayAgo },
  });

  let scoreAdjustment = 0;
  let reason = 'Nenhum padrão adicional detectado no momento.';
  let riskLevel = 'LOW';

  if (reportsLastHour >= 4) {
    scoreAdjustment = 35;
    reason = 'Atividade em rajada detectada nas últimas 1h.';
    riskLevel = 'HIGH';
  } else if (reportsLastDay >= 6) {
    scoreAdjustment = 28;
    reason = 'Aumento rápido de denúncias nas últimas 24h.';
    riskLevel = 'HIGH';
  } else if (phone.reports >= 3 && now - phone.createdAt <= 24 * 60 * 60 * 1000) {
    scoreAdjustment = 25;
    reason = 'Número novo com muitas denúncias em pouco tempo.';
    riskLevel = 'HIGH';
  } else if (reportsLastHour >= 2) {
    scoreAdjustment = 18;
    reason = 'Comportamento suspeito detectado em hora recente.';
    riskLevel = 'MEDIUM';
  } else if (reportsLastDay >= 3) {
    scoreAdjustment = 12;
    reason = 'Padrão de denúncias recorrente nas últimas 24h.';
    riskLevel = 'MEDIUM';
  }

  if (phone.trend === 'INCREASING' && scoreAdjustment < 15) {
    scoreAdjustment += 10;
    reason = 'Tendência de denúncias em alta detectada.';
    riskLevel = 'MEDIUM';
  }

  const riskScore = Math.min(100, phone.reports * 4 + scoreAdjustment + (reportsLastHour >= 4 ? 5 : 0));
  const finalRiskLevel = mapScoreToRiskLevel(riskScore);

  return {
    scoreAdjustment,
    riskLevel: finalRiskLevel,
    reason,
    riskScore,
    reportsLastHour,
    reportsLastDay,
  };
};

module.exports = {
  analyzeFraud,
};
