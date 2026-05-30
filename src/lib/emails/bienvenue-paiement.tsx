import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview, Heading,
} from '@react-email/components'

interface BienvenueEmailProps {
  firstName: string
  plan: string
  amount: number
  billing: 'monthly' | 'annual'
  nextRenewalDate: string
  dashboardUrl: string
}

export function BienvenueEmail({ firstName, plan, amount, billing, nextRenewalDate, dashboardUrl }: BienvenueEmailProps) {
  const planLabel = plan === 'pro' ? 'Pro' : 'Starter'
  const billingLabel = billing === 'annual' ? 'an' : 'mois'

  return (
    <Html lang="fr">
      <Head />
      <Preview>Bienvenue sur INFOPULSE {planLabel} 🎉</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logo}>✦ INFOPULSE</Heading>
          </Section>

          <Hr style={hr} />

          <Section style={content}>
            <Heading as="h2" style={h2}>Ton abonnement est actif 🎉</Heading>
            <Text style={text}>
              Bonjour {firstName},
            </Text>
            <Text style={text}>
              Bienvenue sur INFOPULSE ! Ton abonnement{' '}
              <strong style={{ color: '#a78bfa' }}>Plan {planLabel}</strong> est maintenant actif.
              Tu as accès à toutes les fonctionnalités incluses dans ton plan.
            </Text>

            {/* Recap box */}
            <Section style={recapBox}>
              <Text style={recapTitle}>Récapitulatif de ton abonnement</Text>
              <Hr style={recapHr} />
              <Section style={recapRow}>
                <Text style={recapLabel}>Plan</Text>
                <Text style={recapValue}>INFOPULSE {planLabel}</Text>
              </Section>
              <Section style={recapRow}>
                <Text style={recapLabel}>Montant</Text>
                <Text style={recapValue}>{amount} € / {billingLabel}</Text>
              </Section>
              <Section style={recapRow}>
                <Text style={recapLabel}>Prochain renouvellement</Text>
                <Text style={recapValue}>{nextRenewalDate}</Text>
              </Section>
            </Section>

            <Section style={btnContainer}>
              <Button href={dashboardUrl} style={button}>
                Accéder à mon dashboard
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Des questions ? Réponds à cet email ou écris-nous à contact@infopulse.fr
            </Text>
            <Text style={footerText}>
              © INFOPULSE · contact@infopulse.fr
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: '#09090b', fontFamily: 'Inter, -apple-system, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }
const logoSection = { textAlign: 'center' as const, padding: '0 0 20px' }
const logo = { color: '#a78bfa', fontSize: '22px', fontWeight: '700', margin: '0', letterSpacing: '-0.5px' }
const hr = { borderColor: '#27272a', margin: '0' }
const content = { padding: '32px 0' }
const h2 = { color: '#fafafa', fontSize: '22px', fontWeight: '600', margin: '0 0 16px' }
const text = { color: '#a1a1aa', fontSize: '15px', lineHeight: '24px', margin: '0 0 16px' }
const recapBox = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}
const recapTitle = { color: '#fafafa', fontSize: '13px', fontWeight: '600', margin: '0 0 12px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }
const recapHr = { borderColor: '#27272a', margin: '0 0 12px' }
const recapRow = { display: 'flex' as const, justifyContent: 'space-between' as const, margin: '0 0 8px' }
const recapLabel = { color: '#71717a', fontSize: '14px', margin: '0' }
const recapValue = { color: '#fafafa', fontSize: '14px', fontWeight: '500', margin: '0' }
const btnContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = {
  backgroundColor: '#7c3aed',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '12px 32px',
  borderRadius: '8px',
  display: 'inline-block',
}
const footer = { padding: '20px 0 0' }
const footerText = { color: '#52525b', fontSize: '12px', textAlign: 'center' as const, margin: '0 0 4px' }
