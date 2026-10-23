// Rubric 0.1. Weights, sub-criteria and caps per W. Mirrors references/scoring-rubric.md.
// Ratings and cap activation are judgments recorded in state; this file only holds the numbers.

export const RUBRIC_VERSION = "0.1";
export const DEFAULT_GATE = 90;

export const WS = [
	{
		key: "why",
		label: "WHY",
		criteria: [
			{ key: "pain-severity", weight: 30 },
			{ key: "broken-workaround", weight: 25 },
			{ key: "value-capture", weight: 25 },
			{ key: "success-metric", weight: 20 },
		],
		caps: [{ id: "why-no-workaround", max: 60, condition: "the user cannot say how people work around the problem today" }],
	},
	{
		key: "who",
		label: "WHO",
		criteria: [
			{ key: "beachhead-persona", weight: 30 },
			{ key: "switching-trigger-and-objections", weight: 25 },
			{ key: "distribution", weight: 25 },
			{ key: "buyer-user-anti-persona", weight: 20 },
		],
		caps: [{ id: "who-everyone", max: 55, condition: "the audience is everyone or general consumers with no named segment" }],
	},
	{
		key: "what",
		label: "WHAT",
		criteria: [
			{ key: "core-loop", weight: 30 },
			{ key: "v1-must-haves", weight: 25 },
			{ key: "explicit-anti-scope", weight: 25 },
			{ key: "day-one-inputs", weight: 20 },
		],
		caps: [{ id: "what-unbounded-scope", max: 65, condition: "v1 lists more than five features or has no anti-scope list" }],
	},
	{
		key: "which",
		label: "WHICH",
		criteria: [
			{ key: "primary-form-factor", weight: 30 },
			{ key: "workflow-fit", weight: 25 },
			{ key: "device-and-environment-constraints", weight: 25 },
			{ key: "integration-boundary", weight: 20 },
		],
		caps: [{ id: "which-native-without-reason", max: 70, condition: "a native app store download is chosen with no hardware, notification or habit reason over the web" }],
	},
	{
		key: "whether",
		label: "WHETHER",
		criteria: [
			{ key: "unit-economics", weight: 30 },
			{ key: "technical-bottlenecks", weight: 25 },
			{ key: "legal-privacy-security", weight: 25 },
			{ key: "persona-ux-edge-cases", weight: 20 },
		],
		caps: [{ id: "whether-no-unit-cost", max: 50, condition: "the product depends on paid model or API calls and no cost per active user has been estimated" }],
	},
	{
		key: "when",
		label: "WHEN",
		criteria: [
			{ key: "builder-bandwidth", weight: 30 },
			{ key: "proof-of-concept", weight: 25 },
			{ key: "mvp-date", weight: 25 },
			{ key: "cut-line", weight: 20 },
		],
		caps: [{ id: "when-scope-exceeds-capacity", max: 65, condition: "the What and Which cannot be built within the stated bandwidth and date" }],
	},
];

export const EVIDENCE_LEVELS = ["unknown", "assumption", "user", "source", "observed"];

export const W_KEYS = WS.map((w) => w.key);

export function wByKey(key) {
	return WS.find((w) => w.key === key);
}
