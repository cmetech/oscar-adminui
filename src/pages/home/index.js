import React from 'react'
import BlankLayoutWithAppBar from 'src//layouts/UserBlankLayoutWithAppBar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CardActions from '@mui/material/CardActions'
import CardActionArea from '@mui/material/CardActionArea'
import CardMedia from '@mui/material/CardMedia'
import Grid from '@mui/material/Grid'
import Icon from 'src/@core/components/icon'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import { styled, useTheme } from '@mui/material/styles'
import { useSession } from 'next-auth/react'
import getConfig from 'next/config'

function createGradient(baseColor, themeMode, intensity = 30) {
  const adjustIntensity = themeMode === 'dark' ? intensity : intensity + 20 // Darker gradient in light mode

  const lightenDarkenColor = (col, amt) => {
    let usePound = false
    if (col[0] === '#') {
      col = col.slice(1)
      usePound = true
    }
    let num = parseInt(col, 16)
    let r = (num >> 16) + amt
    if (r > 255) r = 255
    else if (r < 0) r = 0
    let b = ((num >> 8) & 0x00ff) + amt
    if (b > 255) b = 255
    else if (b < 0) b = 0
    let g = (num & 0x0000ff) + amt
    if (g > 255) g = 255
    else if (g < 0) g = 0

    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
  }

  return `linear-gradient(145deg, ${lightenDarkenColor(baseColor, adjustIntensity)}, ${lightenDarkenColor(
    baseColor,
    -adjustIntensity
  )})`
}

const Home = () => {
  const theme = useTheme()
  const middleSectionColor = theme.palette.mode === 'dark' ? '#FFCA64' : '#444'
  const { data: session } = useSession()
  const { publicRuntimeConfig } = getConfig()
  const docs_host = publicRuntimeConfig.MKDOCS_HOST || 'localhost'

  const userName = session?.user?.name || 'John Doe'
  const firstName = userName.split(' ')[0]

  const cards = [
    {
      title: 'Observe',
      description:
        'Collect, Consolidate, and Aggregate data from logs, metrics and events for comprehensive system insights',
      link: '/api/oscar/ui?path=explore',
      icon: 'mdi:eye',
      baseColorDark: '#FCE282',
      baseColorLight: '#FAD22D',
      externalLink: true,
      openInNewTab: true
    },
    {
      title: 'Detect',
      description: 'AI/ML techniques to identify anomalies and pinpoint the root cause of service continuity issues',
      link: '/service-continuity/slo',
      icon: 'mdi:ear-hearing',
      baseColorDark: '#CEADE2',
      baseColorLight: '#AF78D2'
    },
    {
      title: 'Analyze',
      description:
        'Explore, Visualize, and Predict potential issues and resource capacity constraints for proactive measures',
      link: '/api/oscar/ui?path=d/bdkxfkrhtor28b/server-monitoring?orgId=1',
      icon: 'mdi:brain',
      baseColorDark: '#70DBAA',
      baseColorLight: '#0C9B5B',
      externalLink: true,
      openInNewTab: true
    },
    {
      title: 'Automate',
      description: 'Easily perform complex Business Process automations, data ETL Workflows, and AI/ML based pipelines',
      link: '/service-continuity/workflows',
      icon: 'mdi:touch-reading',
      baseColorDark: '#81BAF3',
      baseColorLight: '#4D97ED'
    }
  ]

  const middleSection = {
    title: 'Let\'s Get Started',
    text: 'OSCAR allows for Observability and ensures Service Continuity by leveraging AI powered Runtime deployed on a containerized environment. Get started with the following:',
    imageUrl: '/images/oscar.png',
    imageTitle: 'OSCAR Academy',
    link: `https://${docs_host}/ext/docs/?theme=${theme.palette.mode}`,
    imageText:
      'Offers comprehensive tutorials and resources to help you manage and operate effectively. Find step-by-step instructions to common tasks.',
    actions: [
      { text: 'Probes', icon: 'mdi:eye-circle-outline', link: '/service-continuity/probes' },
      { text: 'SLOs', icon: 'mdi:target', link: '/service-continuity/slo' },
      { text: 'Tasks', icon: 'mdi:subtasks', link: '/service-continuity/tasks' },
      { text: 'Workflows', icon: 'mdi:workflow', link: '/service-continuity/workflows' },

    ]
  }

  const managementTools = [
    {
      title: 'Connections',
      description: 'Manage your connection settings',
      link: '/management/application/connections',
      icon: 'mdi:transit-connection-variant'
    },
    {
      title: 'Inventory',
      description: 'Manage your server inventory',
      link: '/observability/inventory',
      icon: 'mdi:server-network'
    },
    {
      title: 'Notifiers',
      description: 'Manage your notifier settings',
      link: '/management/application/notifiers',
      icon: 'mdi:notifications-active'
    },
    {
      title: 'Runtime',
      description: 'Monitor OSCAR services for runtime issues',
      link: '/api/oscar/services',
      icon: 'mdi:heart-pulse'
    }
  ]

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        mb: 20,
        mx: 'auto',
        maxWidth: 1200
      }}
    >
      <Typography variant='h4' sx={{ mb: 6, textAlign: 'left', fontWeight: 900 }}>
        Hi {firstName}, I'm OSCAR - I Can ...
      </Typography>
      <Grid container spacing={8}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '300px' }}>
              <CardActionArea
                onClick={() => {
                  if (card.externalLink && card.openInNewTab) {
                    window.open(card.link, '_blank', 'noopener,noreferrer')
                  } else {
                    window.location.href = card.link
                  }
                }}
                sx={{ flex: 1 }}
              >
                <Box sx={{ position: 'relative', height: '125px' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      height: '125px',
                      background: createGradient(
                        theme.palette.mode === 'dark' ? card.baseColorDark : card.baseColorLight,
                        theme.palette.mode,
                        30
                      )
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Icon icon={card.icon} color='white' fontSize={64} />
                    </Box>
                  </Box>
                </Box>
                <CardContent
                  sx={{
                    flexGrow: 1,
                    backgroundColor:
                      theme.palette.mode == 'dark'
                        ? theme.palette.customColors.brandGray1
                        : theme.palette.customColors.brandWhite,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color:
                      theme.palette.mode == 'dark'
                        ? theme.palette.customColors.brandWhite
                        : theme.palette.customColors.brandBlack,
                    height: '175px'
                  }}
                >
                  <Typography
                    variant='h6'
                    component='div'
                    fontWeight={900}
                    sx={{
                      color:
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandWhite
                          : theme.palette.customColors.brandBlack
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      textAlign: 'center',
                      color:
                        theme.palette.mode == 'dark'
                          ? theme.palette.customColors.brandWhite
                          : theme.palette.customColors.brandBlack
                    }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ mt: 8, mb: 4 }} />
      <Grid container spacing={6} sx={{ my: 4, alignItems: 'center' }}>
        <Grid item xs={12} md={6}>
          <Typography variant='h5' sx={{ mb: 2, fontWeight: 900 }}>
            {middleSection.title}
          </Typography>
          <Typography sx={{ mb: 2 }}>
            <span style={{ fontWeight: 'bold', color: middleSectionColor }}>OSCAR</span> allows for{' '}
            <span style={{ fontWeight: 'bold', textDecoration: 'underline', color: middleSectionColor }}>O</span>
            <strong>bservability</strong> and ensures{' '}
            <span style={{ fontWeight: 'bold', textDecoration: 'underline', color: middleSectionColor }}>S</span>
            <strong>ervice</strong>{' '}
            <span style={{ fontWeight: 'bold', textDecoration: 'underline', color: middleSectionColor }}>C</span>
            <strong>ontinuity</strong> by leveraging{' '}
            <span style={{ fontWeight: 'bold', textDecoration: 'underline', color: middleSectionColor }}>A</span>
            <strong>I</strong> powered{' '}
            <span style={{ fontWeight: 'bold', textDecoration: 'underline', color: middleSectionColor }}>R</span>
            <strong>untime</strong> deployed on a containerized environment. Get started with the following:
          </Typography>
          {middleSection.actions.map(action => (
            <Button
              key={action.text}
              variant='contained'
              color={theme.palette.mode == 'dark' ? 'warning' : 'primary'}
              startIcon={<Icon icon={action.icon} fontSize={20} />}
              href={action.link}
              sx={{ margin: '0.5rem', textTransform: 'none' }}
            >
              {action.text}
            </Button>
          ))}
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={10}
            sx={{
              width: '100%',
              p: 2,
              backgroundColor:
                theme.palette.mode == 'dark'
                  ? theme.palette.customColors.brandGray1
                  : theme.palette.customColors.brandWhite
            }}
          >
            <Grid container spacing={2}>
              <Grid item>
                <CardMedia
                  component='img'
                  sx={{
                    width: 250,
                    height: 175,
                    objectFit: 'contain',
                    p: 1,
                    display: 'block',
                    mx: 'auto'
                  }}
                  image={middleSection.imageUrl}
                  alt={middleSection.imageText}
                />
              </Grid>
              <Grid item xs>
                <Typography variant='h6' sx={{ mt: 2, fontWeight: 900 }}>
                  {middleSection.imageTitle}
                </Typography>
                <Typography variant='body1' sx={{ mt: 2 }}>
                  {middleSection.imageText}
                </Typography>
                <Button
                  variant='contained'
                  color={theme.palette.mode == 'dark' ? 'warning' : 'primary'}
                  startIcon={<Icon icon='mdi:school' fontSize={20} />}
                  sx={{ mt: 4, mb: 2 }}
                  href={middleSection.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore OSCAR Academy
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Divider sx={{ mt: 4, mb: 4 }} />
      <Typography variant='h5' sx={{ mt: 20, mb: 4, textAlign: 'left', fontWeight: 900 }}>
        Management
      </Typography>
      <Grid container spacing={2}>
        {managementTools.map((tool, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={10}
              sx={{
                height: '100%',
                p: 2,
                backgroundColor:
                  theme.palette.mode == 'dark'
                    ? theme.palette.customColors.brandGray1
                    : theme.palette.customColors.brandWhite
              }}
            >
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  backgroundColor:
                    theme.palette.mode == 'dark'
                      ? theme.palette.customColors.brandGray1
                      : theme.palette.customColors.brandWhite
                }}
              >
                <CardActionArea onClick={() => (window.location.href = tool.link)} sx={{ flex: 1 }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'top' }}>
                    <Icon icon={tool.icon} fontSize={30} />
                    <Box
                      sx={{
                        textAlign: 'left',
                        flexGrow: 1,
                        ml: 2, // Adjusted from 6 for closer alignment
                        width: '80%', // Set specific width relative to parent
                        maxWidth: 300 // Ensures the Box does not grow beyond 300px
                      }}
                    >
                      <Typography
                        variant='subtitle1'
                        sx={{
                          fontWeight: 900,
                          color:
                            theme.palette.mode == 'dark'
                              ? theme.palette.customColors.brandWhite
                              : theme.palette.customColors.brandBlack
                        }}
                      >
                        {tool.title}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          color:
                            theme.palette.mode == 'dark'
                              ? theme.palette.customColors.brandWhite
                              : theme.palette.customColors.brandBlack
                        }}
                      >
                        {tool.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ mt: 8, mb: 4 }} />
    </Box>
  )
}

export default Home

Home.getLayout = page => <BlankLayoutWithAppBar>{page}</BlankLayoutWithAppBar>
