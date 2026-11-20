import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { createBackup, localDateKey, parseBackup } from '../store/workoutData';
import type { WorkoutData } from '../store/workoutData';

/**
 * Backups are the escape hatch of a local-first app: a JSON file the user
 * keeps wherever they like (Drive, iCloud, email) to move to a new phone.
 * Native writes a file and opens the share sheet; the web build downloads it.
 */
export async function exportBackup(data: WorkoutData): Promise<void> {
  const json = JSON.stringify(createBackup(data), null, 2);
  const fileName = `forge-backup-${localDateKey()}.json`;

  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(json);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Guardar copia de seguridad',
  });
}

/**
 * Lets the user pick a backup file and returns its validated contents, or
 * null if they cancelled. Throws InvalidBackupError for files that aren't a
 * valid Forge backup — nothing is replaced until the caller confirms.
 */
export async function pickBackup(): Promise<WorkoutData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  const text = Platform.OS === 'web' && asset.file
    ? await asset.file.text()
    : await new File(asset.uri).text();
  return parseBackup(text);
}
