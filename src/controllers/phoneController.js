const {
  getPhoneInfo,
  getTopReportedPhones,
  getSyncPhones,
} = require('../services/phoneService');

const getPhoneHandler = async (req, res) => {
  try {
    const { phone } = req.params;
    const phoneInfo = await getPhoneInfo(phone);

    if (!phoneInfo) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: phoneInfo,
    });
  } catch (error) {
    console.error('Get phone info error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving phone information',
      error: error.message,
    });
  }
};

const getTopReportedHandler = async (req, res) => {
  try {
    const phones = await getTopReportedPhones();
    return res.status(200).json({
      success: true,
      data: phones,
    });
  } catch (error) {
    console.error('Get top reported phones error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving top reported phones',
      error: error.message,
    });
  }
};

const getSyncPhonesHandler = async (req, res) => {
  try {
    const phones = await getSyncPhones();
    return res.status(200).json({
      success: true,
      data: phones,
    });
  } catch (error) {
    console.error('Sync phones error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while preparing sync data',
      error: error.message,
    });
  }
};

module.exports = {
  getPhoneHandler,
  getTopReportedHandler,
  getSyncPhonesHandler,
};
