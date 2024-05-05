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

function createGradient(baseColor, intensity = 30) {
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

  return `linear-gradient(145deg, ${lightenDarkenColor(baseColor, intensity)}, ${lightenDarkenColor(
    baseColor,
    -intensity
  )})`
}

const Home = () => {
  const theme = useTheme()
  const { data: session } = useSession()

  const userName = session?.user?.name || 'John Doe'
  const firstName = userName.split(' ')[0]

  const cards = [
    {
      title: 'Observability',
      description: 'Consolidate your logs, metrics with purpose build UIs',
      link: '/observability/alerts',
      icon: 'mdi:eye',
      baseColor: '#FCE282'
    },
    {
      title: 'Service Continuity',
      description: 'Ensure service reliability',
      link: '/service-continuity/slo',
      icon: 'mdi:service-toolbox',
      baseColor: '#CEADE2'
    },
    {
      title: 'Analytics',
      description: 'Explore, visualize, and analyze your data using a powerful suite of analytical tools.',
      link: '#',
      icon: 'mdi:analytics',
      baseColor: '#70DBAA'
    },
    {
      title: 'AI/ML',
      description: 'Leverage machine learning',
      link: '#',
      icon: 'mdi:brain',
      baseColor: '#81BAF3'
    }
  ]

  const middleSection = {
    title: 'Get started with OSCAR',
    text: 'OSCAR allows for Observability and ensures Service Continuity by leveraging AI powered Runtime deployed on a containerized environment. Get started with the following:',
    imageUrl: '/images/oscar.png',
    imageTitle: 'OSCAR Academy',
    link: '/oscar/docs',
    imageText:
      'Deploy, scale, and upgrade your stack faster with Elastic Cloud. We’ll help you quickly move your data.',
    actions: [
      { text: 'Add Tasks', icon: 'mdi:subtasks', link: '/service-continuity/tasks' },
      { text: 'Upload Inventory', icon: 'mdi:server-network', link: '/observability/inventory' },
      { text: 'Create SLOs', icon: 'mdi:target', link: '/service-continuity/slo' }
    ]
  }

  const managementTools = [
    {
      title: 'Security',
      description: 'Manage your security settings',
      link: '/monitor-stack',
      icon: 'mdi:application-cog'
    },
    {
      title: 'Runtime',
      description: 'Monitor OSCAR runtime',
      link: '/management/application/services',
      icon: 'mdi:heart-pulse'
    },
    {
      title: 'Inventory',
      description: 'Manage your server inventory',
      link: '/observability/inventory',
      icon: 'mdi:server-network'
    },
    {
      title: 'ML Models',
      description: 'Train and deploy ML models',
      link: '/monitor-stack',
      icon: 'mdi:brain'
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
        Hi {firstName}, I'm OSCAR - nice to meet you!
      </Typography>
      <Grid container spacing={8}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '300px' }}>
              <CardActionArea onClick={() => (window.location.href = card.link)} sx={{ flex: 1 }}>
                <Box sx={{ position: 'relative', height: '125px' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      height: '125px',
                      background: createGradient(card.baseColor) // Apply dynamic gradient
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
          <Typography sx={{ mb: 2 }}>{middleSection.text}</Typography>
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
                  <Icon icon={tool.icon} color='success' fontSize={30} />
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
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ mt: 8, mb: 4 }} />
    </Box>
  )
}

export default Home

Home.getLayout = page => <BlankLayoutWithAppBar>{page}</BlankLayoutWithAppBar>
