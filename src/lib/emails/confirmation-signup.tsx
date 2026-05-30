import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview, Heading,
} from '@react-email/components'

interface ConfirmationSignupEmailProps {
  firstName: string
  confirmationLink: string
}

export function ConfirmationSignupEmail({ firstName, confirmationLink }: ConfirmationSignupEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Confirme ton compte INFOPULSE</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Heading style={logo}>✦ INFOPULSE</Heading>
          </Section>

          <Hr style={hr} />

          {/* Content */}
          <Section style={content}>
            <Heading as="h2" style={h2}>Confirme ton compte</Heading>
            <Text style={text}>
              Bonjour {firstName},
            </Text>
            <Text style={text}>
              Tu viens de créer ton compte INFOPULSE. Clique sur le bouton ci-dessous pour confirmer ton adresse email et activer ton accès.
            </Text>
            <Section style={btnContainer}>
              <Button href={confirmationLink} style={button}>
                Confirmer mon compte
              </Button>
            </Section>
            <Text style={textSmall}>
              Le lien expire dans 24 heures.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Si tu n&apos;as pas créé de compte sur INFOPULSE, ignore cet email.
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
const textSmall = { color: '#71717a', fontSize: '13px', margin: '16px 0 0' }
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
