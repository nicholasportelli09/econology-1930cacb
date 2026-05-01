import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface NewSignupProps {
  email?: string
  userId?: string
  signedUpAt?: string
  provider?: string
}

export const NewSignupEmail = ({
  email = 'unknown@example.com',
  userId = 'unknown',
  signedUpAt = new Date().toISOString(),
  provider = 'email',
}: NewSignupProps) => (
  <Html>
    <Head />
    <Preview>New Econology signup: {email}</Preview>
    <Body style={body}>
      <Container style={container}>
        <Heading style={h1}>🎉 New signup on Econology</Heading>
        <Text style={text}>A new user just created an account.</Text>
        <Section style={card}>
          <Row label="Email" value={email} />
          <Row label="Signup method" value={provider} />
          <Row label="Signed up at" value={signedUpAt} />
          <Row label="User ID" value={userId} />
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          You're getting this because you're the Econology admin.
        </Text>
      </Container>
    </Body>
  </Html>
)

const Row = ({ label, value }: { label: string; value: string }) => (
  <Text style={rowText}>
    <strong style={rowLabel}>{label}:</strong> {value}
  </Text>
)

const body = { backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }
const container = { margin: '0 auto', padding: '32px 24px', maxWidth: '560px' }
const h1 = { color: '#0f172a', fontSize: '22px', fontWeight: 700, margin: '0 0 16px' }
const text = { color: '#334155', fontSize: '15px', lineHeight: '22px', margin: '0 0 20px' }
const card = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px 24px',
}
const rowText = { color: '#0f172a', fontSize: '14px', margin: '6px 0' }
const rowLabel = { color: '#475569' }
const hr = { borderColor: '#e2e8f0', margin: '28px 0 16px' }
const footer = { color: '#94a3b8', fontSize: '12px' }

export const template = {
  component: NewSignupEmail,
  displayName: 'New User Signup',
  subject: (data: NewSignupProps) => `New Econology signup: ${data?.email ?? 'new user'}`,
  to: 'nicholasportelli09@gmail.com',
  previewData: {
    email: 'jane@example.com',
    userId: 'abc-123',
    signedUpAt: new Date().toISOString(),
    provider: 'email',
  },
} satisfies TemplateEntry