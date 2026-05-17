#!/usr/bin/env node
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(root, "docs", "VISUAL_FIDELITY_REPORT.md");

const requiredReferenceFields = [
  "id",
  "source",
  "sourceType",
  "aircraft",
  "variant",
  "usageRights",
  "cropRules",
  "measurementUse",
];

const snapshotSuites = [
  {
    id: "boeing-cdu",
    label: "Boeing CDU",
    directory: "e2e/visual-boeing-cdu.spec.ts-snapshots",
    minimumPngs: 6,
    status: "snapshot-protected",
  },
  {
    id: "airbus-mcdu",
    label: "Airbus MCDU",
    directory: "e2e/visual-airbus-mcdu.spec.ts-snapshots",
    minimumPngs: 4,
    status: "snapshot-protected",
  },
  {
    id: "navigation-display",
    label: "Navigation Display",
    directory: "e2e/visual-navigation-display.spec.ts-snapshots",
    minimumPngs: 4,
    status: "snapshot-protected",
  },
  {
    id: "nd-realism",
    label: "ND realism states",
    directory: "e2e/visual-nd-realism.spec.ts-snapshots",
    minimumPngs: 3,
    status: "snapshot-protected",
  },
  {
    id: "primary-flight-display",
    label: "Primary Flight Display",
    directory: "e2e/visual-pfd.spec.ts-snapshots",
    minimumPngs: 8,
    status: "snapshot-protected",
  },
  {
    id: "cockpit-layouts",
    label: "Cockpit task and focused layouts",
    directory: "e2e/visual/cockpit-layouts.spec.ts-snapshots",
    minimumPngs: 22,
    status: "snapshot-protected",
  },
  {
    id: "cockpit-highres",
    label: "3456x2234 and Retina cockpit layouts",
    directory: "e2e/visual/cockpit-highres.spec.ts-snapshots",
    minimumPngs: 36,
    status: "snapshot-protected",
  },
  {
    id: "critical-screenshots",
    label: "Critical smoke screenshots",
    directory: "e2e/visual/critical-screenshots.spec.ts-snapshots",
    minimumPngs: 3,
    status: "snapshot-protected",
  },
];

const measurementProfiles = [
  {
    id: "boeing-737ng-cdu-measurements",
    label: "Boeing 737 NG CDU geometry profile",
    file: "reference-library/measurements/boeing-737ng-cdu.v1.json",
    status: "initial-derived-fiducials",
  },
  {
    id: "boeing-737ng-cdu-palette",
    label: "Boeing 737 NG CDU palette profile",
    file: "reference-library/palettes/boeing-737ng-cdu.v1.json",
    status: "app-token-baseline",
  },
  {
    id: "canonical-avionics-states",
    label: "Canonical avionics visual states",
    file: "reference-library/states/canonical-avionics-states.v1.json",
    status: "reference-contract",
  },
];

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const raw = await readFile(absolutePath, "utf8");
  return JSON.parse(raw);
}

async function listPngs(relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!(await exists(absoluteDirectory))) {
    return [];
  }

  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
    .map((entry) => path.join(relativeDirectory, entry.name))
    .sort();
}

function table(rows) {
  const [header, ...body] = rows;
  const separator = header.map(() => "---");
  return [header, separator, ...body]
    .map((row) => `| ${row.map((cell) => String(cell).replace(/\n/g, " ")).join(" | ")} |`)
    .join("\n");
}

function formatList(values) {
  if (values.length === 0) {
    return "- None\n";
  }
  return values.map((value) => `- ${value}`).join("\n") + "\n";
}

async function main() {
  const failures = [];
  const warnings = [];
  const references = await readJson("reference-library/references.json");

  for (const reference of references) {
    const missing = requiredReferenceFields.filter((field) => !reference[field]);
    if (missing.length > 0) {
      failures.push(`Reference ${reference.id ?? "<unknown>"} is missing: ${missing.join(", ")}`);
    }
  }

  const profileResults = [];
  for (const profile of measurementProfiles) {
    const filePath = path.join(root, profile.file);
    const present = await exists(filePath);
    let parsedStatus = "missing";
    if (present) {
      const data = await readJson(profile.file);
      parsedStatus = data.status ?? "present";
      if (!data.id) {
        failures.push(`${profile.file} is missing id`);
      }
    } else {
      failures.push(`${profile.file} is missing`);
    }
    profileResults.push({ ...profile, present, parsedStatus });
  }

  const snapshotResults = [];
  let totalSnapshots = 0;
  for (const suite of snapshotSuites) {
    const pngs = await listPngs(suite.directory);
    totalSnapshots += pngs.length;
    if (pngs.length < suite.minimumPngs) {
      failures.push(
        `${suite.label} has ${pngs.length} snapshots; expected at least ${suite.minimumPngs}`,
      );
    }
    snapshotResults.push({ ...suite, pngs });
  }

  const hardwareReadyReferences = references.filter((reference) => {
    const rights = String(reference.usageRights ?? "").toLowerCase();
    const use = String(reference.measurementUse ?? "").toLowerCase();
    return rights.includes("cleared") && !use.includes("candidate");
  });

  if (hardwareReadyReferences.length === 0) {
    warnings.push(
      "No rights-cleared hardware reference crops are approved for pixel measurement yet.",
    );
  }

  const gateStatus = failures.length === 0 ? "PASS" : "FAIL";

  const report = `# Visual Fidelity Measurement Report

Generated by: \`npm run measure:visual\`

## Summary

| Gate | Result |
| --- | --- |
| Overall manifest gate | ${gateStatus} |
| App-owned visual snapshots found | ${totalSnapshots} |
| Reference manifest entries | ${references.length} |
| Hardware pixel-accuracy status | Not measured |

This report is generated by \`npm run measure:visual\`. It verifies that the app-owned visual baselines and reference metadata are present enough to support cockpit fidelity work. It does not claim measured hardware accuracy, pilot review, certified training suitability, or live MSFS/PMDG validation.

## App Baseline Coverage

${table([
  ["Surface", "Status", "Snapshots", "Minimum"],
  ...snapshotResults.map((result) => [
    result.label,
    result.pngs.length >= result.minimumPngs ? result.status : "missing-baselines",
    result.pngs.length,
    result.minimumPngs,
  ]),
])}

## Reference And Measurement Profiles

${table([
  ["Profile", "File", "Status"],
  ...profileResults.map((profile) => [
    profile.label,
    profile.file,
    profile.present ? profile.parsedStatus : "missing",
  ]),
])}

## Reference Intake Status

${table([
  ["Reference", "Aircraft", "Use", "Rights"],
  ...references.map((reference) => [
    reference.id,
    reference.aircraft,
    reference.measurementUse,
    reference.usageRights,
  ]),
])}

## Measurement Classification

| Surface | Snapshot protected | Measured against references | Pilot reviewed | Live validated |
| --- | --- | --- | --- | --- |
| Boeing CDU | Yes | Initial fiducials only | No | No |
| Airbus MCDU | Yes | No | No | No |
| Boeing ND | Yes | No | No | No |
| Airbus ND | Yes | No | No | No |
| Boeing PFD | Yes | No | No | No |
| Airbus PFD | Yes | No | No | No |
| Boeing MCP | Yes | No | No | No |
| Airbus FCU | Yes | No | No | No |
| 3456x2234 cockpit layouts | Yes | App baseline only | No | No |

## Warnings

${formatList(warnings)}
## Failures

${formatList(failures)}
`;

  await writeFile(reportPath, report, "utf8");

  if (failures.length > 0) {
    console.error(`Visual fidelity measurement gate failed. Report: ${reportPath}`);
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`Visual fidelity measurement gate passed. Report: ${reportPath}`);
  for (const warning of warnings) {
    console.log(`Warning: ${warning}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
