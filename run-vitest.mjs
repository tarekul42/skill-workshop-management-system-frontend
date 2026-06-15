import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
  const result = execSync('npx vitest run --reporter=verbose 2>&1', {
    cwd: '/home/user/programming/web-dev-projects/own-projects/my_projects/skill-workshop-management-system/skill-workshop-management-system-frontend',
    maxBuffer: 10 * 1024 * 1024,
    timeout: 300000,
  });
  writeFileSync('test-results/vitest-output.txt', result);
} catch (e) {
  const output = e.stdout ? e.stdout.toString() : '';
  const err = e.stderr ? e.stderr.toString() : '';
  writeFileSync('test-results/vitest-output.txt', output + '\n=== STDERR ===\n' + err + '\n=== EXIT CODE ===\n' + e.status);
}
