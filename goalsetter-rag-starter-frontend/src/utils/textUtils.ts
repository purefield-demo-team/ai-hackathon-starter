export interface Section {
  number: number;
  title: string;
  content: string;
}

export function parseResponse(responseText: string): Section[] {
  const sections = responseText.split(/\d+\. /).filter((section) => section.trim() !== '');
  return sections.map((section, index) => ({
    number: index + 1,
    title: section.split('\n')[0].trim(),
    content: section.split('\n').slice(1).join('\n').trim(),
  }));
}
