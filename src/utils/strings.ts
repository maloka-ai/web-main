import stringsJson from '@/config/strings.json';

const strings: { [key: string]: string } = stringsJson;

export function getString(key: string): string {
  if(!strings) throw new Error("Strings file not found");
  if(!strings[key]) throw new Error(`String not found for key: ${key}`);
  return strings[key];
}