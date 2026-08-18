// ponytail: rough cost estimate based on average token counts for PR-03 + PR-04
// Economy model pricing (Gemini Flash)
const COST_PER_1K_INPUT = 0.0001;  // ~$0.10 / 1M input tokens
const COST_PER_1K_OUTPUT = 0.0004; // ~$0.40 / 1M output tokens

const AVG_INPUT_TOKENS_PER_SOURCE = 3000;  // source text + prompt
const AVG_OUTPUT_TOKENS_PER_SOURCE = 800;  // brief + fit JSON
const CONTEXT_TOKENS = 2000; // user context, roughly constant

export function estimateBatchCost(sourceCount: number): number {
  const inputPerSource = AVG_INPUT_TOKENS_PER_SOURCE + CONTEXT_TOKENS;
  const totalInput = inputPerSource * sourceCount;
  const totalOutput = AVG_OUTPUT_TOKENS_PER_SOURCE * sourceCount;
  return (totalInput / 1000) * COST_PER_1K_INPUT +
    (totalOutput / 1000) * COST_PER_1K_OUTPUT;
}

export function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}
