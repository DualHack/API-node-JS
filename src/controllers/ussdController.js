const { createReport } = require('../services/reportService');
const { getPhoneInfo } = require('../services/phoneService');

const postUssdHandler = async (req, res) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'input is required',
      });
    }

    const normalized = input.trim();
    const command = normalized.split(/\s+/)[0].toUpperCase();
    const argument = normalized.split(/\s+/).slice(1).join(' ').trim();

    if (command === 'DENUNCIAR' && argument) {
      const { report, phoneInfo } = await createReport({
        phone: argument,
        reason: 'Denúncia via USSD',
        description: `USSD input: ${input}`,
        source: 'USSD',
      });

      return res.status(201).json({
        success: true,
        message: `Número denunciado com sucesso.`,
        data: {
          phone: phoneInfo.phone,
          reports: phoneInfo.reports,
          riskLevel: phoneInfo.riskLevel,
          aiInsight: phoneInfo.aiInsight,
        },
      });
    }

    if ((command === 'VERIFICAR' || command === 'CONSULTAR') && argument) {
      const phoneInfo = await getPhoneInfo(argument);
      if (!phoneInfo) {
        return res.status(200).json({
          success: true,
          message: `Número ${argument} não encontrado. Você pode denunciá-lo usando DENUNCIAR ${argument}.`,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Este número é ${phoneInfo.riskLevel} e ${phoneInfo.aiInsight.toLowerCase()}`,
        data: phoneInfo,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'MENU USSD:\n1. VERIFICAR <número>\n2. DENUNCIAR <número>\n3. AJUDA',
    });
  } catch (error) {
    console.error('USSD error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing USSD input',
      error: error.message,
    });
  }
};

module.exports = {
  postUssdHandler,
};
