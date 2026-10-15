type ActionResult = { success: true } | { success: false; error: string };

// Runs a server action from the admin panel. A request that never reaches the
// action (no internet, Vercel's 4.5 MB body limit, a new deploy while the panel
// was open) rejects instead of returning a result; inside startTransition that
// would crash the whole page to a blank screen, so turn it into an error result.
export async function callAction(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await fn();
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Server bilan bogʻlanib boʻlmadi. Sahifani yangilab (F5), qaytadan urinib koʻring.",
    };
  }
}
