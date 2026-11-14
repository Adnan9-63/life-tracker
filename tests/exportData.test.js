import assert from 'node:assert/strict';
import test from 'node:test';
import { copyExportDataToClipboard, serializeExportData } from '../src/lib/exportData.js';

test('serializes the same fields used by the backup importer', () => {
  const input = {
    lifeData: { '3': { weeklyScore: 4 } },
    yearData: { '2026': 'A good year' },
    habitLabels: ['Read'],
    birthDate: '1990-01-02',
    userName: 'Ada',
  };

  assert.deepEqual(JSON.parse(serializeExportData(input)), {
    data: input.lifeData,
    yearData: input.yearData,
    habits: input.habitLabels,
    birthDate: input.birthDate,
    userName: input.userName,
  });
});

test('writes the serialized backup through the clipboard API', async () => {
  const written = [];
  const clipboard = {
    async writeText(value) {
      written.push(value);
    },
  };

  await copyExportDataToClipboard(clipboard, '{"data":{}}');

  assert.deepEqual(written, ['{"data":{}}']);
});

test('reports when the clipboard API is unavailable', async () => {
  await assert.rejects(
    copyExportDataToClipboard(undefined, '{}'),
    /Clipboard writeText is unavailable/,
  );
});

test('propagates clipboard permission failures to the caller', async () => {
  const permissionError = new Error('permission denied');
  const clipboard = {
    async writeText() {
      throw permissionError;
    },
  };

  await assert.rejects(
    copyExportDataToClipboard(clipboard, '{}'),
    error => error === permissionError,
  );
});
