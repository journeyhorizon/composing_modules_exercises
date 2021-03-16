const composePromises = require('./compose_promises');
const processRecords = require('./process_records');
const getUrlsToHook = require('./get_urls_to_hook');
const handleFireEvents = require('./handle_fire_events');
const handleRescheduledFailedEvents = require('./handle_rescheduled_failed_events');

exports.handler = async (event, context) => {
  const fireHookResult = await composePromises(
    processRecords,
    getUrlsToHook,
    handleFireEvents
  )(event.Records);

  if (!fireHookResult.ok) {
    await handleRescheduledFailedEvents({
      result: fireHookResult,
      tableName: process.env.SCHEDULER_TABLE_NAME
    });
  }

  return `Successfully processed ${event.Records.length} records.`;
};
