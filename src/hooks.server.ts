import type { Handle } from '@sveltejs/kit';
import { i18n } from '$lib/i18n';
import dotenvFlow from 'dotenv-flow';
import dotenvExpand from 'dotenv-expand';
dotenvExpand.expand(dotenvFlow.config());

const handleParaglide: Handle = i18n.handle();

export const handle: Handle = handleParaglide;