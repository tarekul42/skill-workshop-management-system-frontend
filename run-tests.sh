#!/bin/bash
cd /home/user/programming/web-dev-projects/own-projects/my_projects/skill-workshop-management-system/skill-workshop-management-system-frontend
npx vitest run --reporter=verbose 2>&1 | tail -80 > test-results/tail-output.txt
echo "=== SUMMARY ===" >> test-results/tail-output.txt
npx vitest run 2>&1 | grep -E "(Test Files|Tests|FAIL|PASS|Error)" >> test-results/summary.txt 2>&1 || true
