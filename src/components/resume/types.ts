import type { ParsedResume } from '@/app/api/resume/schema';

export type ExperienceNode = ParsedResume['Experience'][number];
export type OpenSourceNode = ParsedResume['Open Source'][number];
export type LeadershipNode = ParsedResume['Leadership & Community'][number];
