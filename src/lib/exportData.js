export function serializeExportData({ lifeData, yearData, habitLabels, birthDate, userName }) {
  return JSON.stringify({
    data: lifeData,
    yearData,
    habits: habitLabels,
    birthDate,
    userName,
  });
}

export async function copyExportDataToClipboard(clipboard, data) {
  if (typeof clipboard?.writeText !== 'function') {
    throw new Error('Clipboard writeText is unavailable.');
  }

  await clipboard.writeText(data);
}
