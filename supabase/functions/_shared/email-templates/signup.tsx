/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  token?: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
  token,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Econology verification code{token ? `: ${token}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandHeader}>
          <Text style={brandText}>Econology</Text>
        </Section>
        <Heading style={h1}>Welcome to {siteName} 👋</Heading>
        <Text style={text}>
          Thanks for signing up! Enter the verification code below to confirm{' '}
          <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>{' '}
          and start mastering money & markets.
        </Text>

        {token ? (
          <>
            <Text style={codeLabel}>Your verification code</Text>
            <Section style={codeWrapper}>
              <Text style={codeStyle}>{token}</Text>
            </Section>
            <Text style={smallText}>
              This code expires in 1 hour. Enter it on the verification page to continue.
            </Text>
          </>
        ) : null}

        <Text style={text}>
          Or click the button below to verify automatically:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify Email
        </Button>

        <Text style={footer}>
          If you didn't create an Econology account, you can safely ignore this email.
        </Text>
        <Text style={footerBrand}>
          © Econology · The science of smart money ·{' '}
          <Link href={siteUrl} style={footerLink}>{siteUrl.replace(/^https?:\/\//, '')}</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}
const container = {
  padding: '32px 28px',
  maxWidth: '560px',
  margin: '0 auto',
}
const brandHeader = {
  borderRadius: '12px',
  background: 'linear-gradient(135deg, hsl(255, 70%, 60%), hsl(230, 75%, 58%))',
  padding: '18px 24px',
  marginBottom: '28px',
  textAlign: 'center' as const,
}
const brandText = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: 'bold' as const,
  margin: '0',
  letterSpacing: '0.5px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: 'hsl(240, 30%, 20%)',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(240, 20%, 35%)',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const smallText = {
  fontSize: '13px',
  color: 'hsl(240, 15%, 50%)',
  lineHeight: '1.5',
  margin: '0 0 28px',
  textAlign: 'center' as const,
}
const codeLabel = {
  fontSize: '13px',
  color: 'hsl(240, 15%, 50%)',
  margin: '12px 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  fontWeight: '600' as const,
  textAlign: 'center' as const,
}
const codeWrapper = {
  background: 'linear-gradient(135deg, hsl(255, 45%, 96%), hsl(230, 50%, 96%))',
  border: '1px solid hsl(240, 30%, 90%)',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 12px',
  textAlign: 'center' as const,
}
const codeStyle = {
  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
  fontSize: '34px',
  fontWeight: 'bold' as const,
  color: 'hsl(255, 70%, 50%)',
  letterSpacing: '8px',
  margin: '0',
}
const link = { color: 'hsl(255, 70%, 50%)', textDecoration: 'underline' }
const button = {
  background: 'linear-gradient(135deg, hsl(255, 70%, 60%), hsl(230, 75%, 58%))',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '10px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = {
  fontSize: '13px',
  color: 'hsl(240, 15%, 55%)',
  margin: '32px 0 16px',
  lineHeight: '1.5',
}
const footerBrand = {
  fontSize: '12px',
  color: 'hsl(240, 15%, 60%)',
  margin: '0',
  borderTop: '1px solid hsl(240, 20%, 92%)',
  paddingTop: '16px',
}
const footerLink = { color: 'hsl(255, 70%, 55%)', textDecoration: 'none' }
