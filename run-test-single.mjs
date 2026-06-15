import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const files = [
  'src/components/ui/__tests__/Button.test.tsx',
  'src/components/ui/__tests__/Card.test.tsx',
  'src/components/ui/__tests__/ConfirmDialog.test.tsx',
  'src/components/ui/__tests__/EmptyState.test.tsx',
  'src/components/ui/__tests__/Input.test.tsx',
  'src/components/ui/__tests__/LoadingSkeleton.test.tsx',
  'src/components/ui/__tests__/StatsCard.test.tsx',
  'src/components/ui/__tests__/StatusBadge.test.tsx',
  'src/components/ui/__tests__/StepIndicator.test.tsx',
  'src/components/layout/__tests__/Breadcrumbs.test.tsx',
  'src/components/layout/__tests__/PageHeader.test.tsx',
  'src/components/layout/__tests__/PublicFooter.test.tsx',
  'src/lib/__tests__/api-client.test.ts',
  'src/lib/__tests__/auth-helpers.test.ts',
  'src/lib/__tests__/formatters.test.ts',
  'src/lib/__tests__/motion-variants.test.ts',
  'src/lib/api/__tests__/services.test.ts',
  'src/lib/utils/__tests__/masking.test.ts',
  'src/lib/validation/__tests__/password.test.ts',
  'src/app/actions/__tests__/auth.test.ts',
];

let allOutput = '';
let failures = [];

for (const file of files) {
  try {
    const result = execSync(`npx vitest run ${file} --reporter=verbose 2>&1`, {
      cwd: '/home/user/programming/web-dev-projects/own-projects/my_projects/skill-workshop-management-system/skill-workshop-management-system-frontend',
      maxBuffer: 5 * 1024 * 1024,
      timeout: 60000,
    });
    allOutput += `\n=== PASS: ${file} ===\n${result.toString()}`;
  } catch (e) {
    const output = e.stdout ? e.stdout.toString() : '';
    const err = e.stderr ? e.stderr.toString() : '';
    allOutput += `\n=== FAIL: ${file} ===\n${output}\n${err}`;
    failures.push(file);
  }
}

allOutput += `\n\n=== SUMMARY ===\nTotal: ${files.length}, Passed: ${files.length - failures.length}, Failed: ${failures.length}`;
if (failures.length > 0) {
  allOutput += `\nFailed files:\n${failures.join('\n')}`;
}

writeFileSync('test-results/all-test-output.txt', allOutput);
console.log('Done. Results written to test-results/all-test-output.txt');
console.log(`Total: ${files.length}, Passed: ${files.length - failures.length}, Failed: ${failures.length}`);
if (failures.length > 0) {
  console.log('Failed files:');
  failures.forEach(f => console.log(`  ${f}`));
}
