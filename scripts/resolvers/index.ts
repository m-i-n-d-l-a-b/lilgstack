/**
 * RESOLVERS record — maps {{PLACEHOLDER}} names to generator functions.
 * Each resolver takes a TemplateContext and returns the replacement string.
 */

import type { TemplateContext, ResolverFn } from './types';

import { generatePreamble } from './preamble';
import { generateCommandReference, generateSnapshotFlags, generateBrowseSetup } from './browse';

export const RESOLVERS: Record<string, ResolverFn> = {
  PREAMBLE: generatePreamble,
  COMMAND_REFERENCE: generateCommandReference,
  SNAPSHOT_FLAGS: generateSnapshotFlags,
  BROWSE_SETUP: generateBrowseSetup,
};
