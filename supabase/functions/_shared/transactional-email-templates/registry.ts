import type { ComponentType } from 'npm:react@18.3.1'
import { template as newSignupTemplate } from './new-signup.tsx'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: any) => string)
  displayName?: string
  previewData?: Record<string, unknown>
  /** Optional fixed recipient — overrides the `to` field on the request. */
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'new-signup': newSignupTemplate,
}