/**
 * Cloudflare Worker Wrapper with Cron Support
 *
 * This wrapper extends the OpenNext-generated worker to support scheduled events (Cron Triggers).
 * It maintains all existing HTTP functionality while adding automated resume cache refresh.
 */
import worker from './.open-next/worker.js';

const workerWrapper = {
  /**
   * HTTP Request Handler (existing functionality)
   * Handles all incoming HTTP requests to the website
   */
  async fetch(request, env, ctx) {
    return worker.fetch(request, env, ctx);
  },

  /**
   * Scheduled Event Handler (Cron Trigger)
   * Executes every 5 minutes to refresh resume cache
   *
   * @param {Object} event - Contains scheduledTime and cron expression
   * @param {Object} env - Environment bindings (DB, secrets, SITE_URL, etc.)
   * @param {Object} ctx - Worker execution context
   */
  async scheduled(event, env, _ctx) {
    const scheduledTime = new Date(event.scheduledTime);
    console.log(
      '[Cron] Resume cache refresh triggered at:',
      scheduledTime.toISOString(),
    );

    // Construct the internal API endpoint URL
    // Falls back to production URL if SITE_URL is not set
    const baseUrl = env.SITE_URL || 'https://yujimin.dev';
    const refreshUrl = `${baseUrl}/api/resume/refresh`;

    try {
      // Call the refresh endpoint with proper authentication
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CRON_SECRET}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare-Worker-Cron/1.0',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Cron] ✅ Resume cache refreshed successfully:', {
          duration: data.data?.duration || 'N/A',
          timestamp: data.data?.timestamp || scheduledTime.toISOString(),
        });
      } else {
        const errorText = await response.text();
        console.error('[Cron] ❌ Resume refresh failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
      }
    } catch (error) {
      console.error('[Cron] ❌ Exception during resume refresh:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  },
};

export default workerWrapper;
