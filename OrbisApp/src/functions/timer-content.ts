// import { InvocationContext, Timer, app } from "@azure/functions";
// import { startCrawl } from "../common/graphClient";

// app.timer('incrementalCrawl', {
//   // every 24 hour
//   schedule: '24 * * * *',
//   handler: async (timer: Timer, context: InvocationContext) => {
//     context.log(`Enqueuing request for incremental crawl...`);
//     startCrawl('incremental');
//   }
// });

// app.timer('removeDeleted', {
//   // 24 past every hour
//   schedule: '24 * * * *',
//   handler: async (timer: Timer, context: InvocationContext) => {
//     context.log(`Enqueuing request for cleaning deleted items...`);
//     startCrawl('removeDeleted');
//   }
// });