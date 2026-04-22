/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl, token }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your login link for {siteName}{token ? ` · code ${token}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandHeader}><Text style={brandText}>Econology</Text></Section>
        <Heading style={h1}>Sign in to {siteName}</Heading>
        <Text style={text}>
          {token ? 'Use the code below or click the button to log in. This expires shortly.' : 'Click the button below to log in. This link expires shortly.'}
        </Text>
        {token ? (
          <>
            <Text style={codeLabel}>Sign-in code</Text>
            <Section style={codeWrapper}><Text style={codeStyle}>{token}</Text></Section>
          </>
        ) : null}
        <Button style={button} href={confirmationUrl}>Log In</Button>
        <Text style={footer}>If you didn't request this link, you can safely ignore this email.</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const brandHeader = { borderRadius: '12px', background: 'linear-gradient(135deg, hsl(255, 70%, 60%), hsl(230, 75%, 58%))', padding: '18px 24px', marginBottom: '28px', textAlign: 'center' as const }
const brandText = { color: '#ffffff', fontSize: '20px', fontWeight: 'bold' as const, margin: '0', letterSpacing: '0.5px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: 'hsl(240, 30%, 20%)', margin: '0 0 16px' }
const text = { fontSize: '15px', color: 'hsl(240, 20%, 35%)', lineHeight: '1.6', margin: '0 0 24px' }
const codeLabel = { fontSize: '13px', color: 'hsl(240, 15%, 50%)', margin: '0 0 8px', textTransform: 'uppercase' as const, letterSpacing: '1px', fontWeight: '600' as const, textAlign: 'center' as const }
const codeWrapper = { background: 'linear-gradient(135deg, hsl(255, 45%, 96%), hsl(230, 50%, 96%))', border: '1px solid hsl(240, 30%, 90%)', borderRadius: '12px', padding: '20px', margin: '0 0 24px', textAlign: 'center' as const }
const codeStyle = { fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace', fontSize: '34px', fontWeight: 'bold' as const, color: 'hsl(255, 70%, 50%)', letterSpacing: '8px', margin: '0' }
const button = { background: 'linear-gradient(135deg, hsl(255, 70%, 60%), hsl(230, 75%, 58%))', color: '#ffffff', fontSize: '15px', fontWeight: '600' as const, borderRadius: '10px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '13px', color: 'hsl(240, 15%, 55%)', margin: '28px 0 0', lineHeight: '1.5' }
