const EventEmitter = require('events');

class EventBus extends EventEmitter {}

const eventBus = new EventBus();

// Simple real-time simulation for SOC-like event flow.
eventBus.on('report_created', (payload) => {
  console.log('[eventBus] report_created', {
    phone: payload.report.phone,
    source: payload.report.source,
    reason: payload.report.reason,
  });
});

eventBus.on('risk_updated', (payload) => {
  console.log('[eventBus] risk_updated', {
    phone: payload.phone.phone,
    previousRiskLevel: payload.previousRiskLevel,
    newRiskLevel: payload.phone.riskLevel,
    reason: payload.reason,
  });
});

module.exports = eventBus;
