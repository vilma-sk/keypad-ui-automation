import path from 'path';
import { pathToFileURL } from 'url';

export const keypadUrl = pathToFileURL(
  path.resolve(__dirname, '../../apps/Automation task - keypad.html')
).href;