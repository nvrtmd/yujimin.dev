import type { ParseSchema, GetParsedType } from '@yuji-min/google-docs-parser';

export const PARSE_SCHEMA = {
  sections: [
    {
      title: { name: 'Skills', namedStyleType: 'HEADING_2' },
      content: {
        kind: 'list',
        keyDelimiter: ':',
        delimiter: ',',
      },
    },
    {
      title: { name: 'Experience', namedStyleType: 'HEADING_2' },
      content: {
        kind: 'tree',
        node: {
          title: {
            namedStyleType: 'HEADING_3',
            delimiter: '|',
            keys: ['role', 'company', 'period'],
          },
          content: { kind: 'list' },
        },
      },
    },
    {
      title: { name: 'Open Source', namedStyleType: 'HEADING_2' },
      content: {
        kind: 'tree',
        node: {
          title: {
            namedStyleType: 'HEADING_3',
            delimiter: '|',
            keys: ['project_info', 'links', 'period'],
          },
          content: { kind: 'list' },
        },
      },
    },
    {
      title: { name: 'Leadership & Community', namedStyleType: 'HEADING_2' },
      content: {
        kind: 'tree',
        node: {
          title: {
            namedStyleType: 'HEADING_3',
            delimiter: '|',
            keys: ['role', 'organization', 'period'],
          },
          content: { kind: 'list' },
        },
      },
    },
    {
      title: { name: 'Education', namedStyleType: 'HEADING_2' },
      content: {
        kind: 'list',
        delimiter: '|',
        keys: ['degree_info', 'institution'],
      },
    },
  ],
} as const satisfies ParseSchema;

export type ParsedResume = GetParsedType<typeof PARSE_SCHEMA>;
export type ResumeData = ParsedResume & { pdfUrl: string };
