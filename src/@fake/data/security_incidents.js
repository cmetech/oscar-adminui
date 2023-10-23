function generateGaussianRandom(min, max, standardDeviation) {
  let u, v, s
  do {
    u = 2 * Math.random() - 1
    v = 2 * Math.random() - 1
    s = u * u + v * v
  } while (s >= 1 || s === 0)

  let multiplier = Math.sqrt((-2.0 * Math.log(s)) / s)
  let randomValue = u * multiplier

  // Scale and shift the value to the desired range
  let mean = (max + min) / 2
  let value = randomValue * standardDeviation + mean

  // Ensure the value is within the specified range
  return Math.min(Math.max(min, value), max)
}

const ad_compliance_max = 0.05
const ad_compliance_min = 0
const ad_access_min = 0
const ad_access_max = 3
const ad_anomoly_min = 1
const ad_anomoly_max = 10
const ad_vulnerability_min = 1
const ad_vulnerability_max = 20
const ad_minor_min = 10
const ad_minor_max = 20

export const securityData = {
  lastHour: [
    {
      sales: generateGaussianRandom(ad_compliance_min, ad_compliance_max, 2).toFixed(0),
      title: 'Critical',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 2, 2).toFixed(0)}%`
    },
    {
      trendDir: 'down',
      sales: generateGaussianRandom(ad_access_min, ad_access_max, 2).toFixed(0),
      title: 'Major',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: generateGaussianRandom(ad_anomoly_min, ad_anomoly_max, 2).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Warning',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: generateGaussianRandom(ad_vulnerability_min, ad_vulnerability_max, 2).toFixed(0),
      title: 'Info',
      color: 'customColors.brandBlue1',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: generateGaussianRandom(ad_minor_min, ad_minor_max, 2).toFixed(0),
      title: 'Minor',
      color: 'customColors.brandBlack',
      trendDir: 'up',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    }
  ],
  today: [
    {
      sales: (generateGaussianRandom(ad_compliance_min, ad_compliance_max, 2) * 24).toFixed(0),
      title: 'Critical',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      trendDir: 'up',
      sales: (generateGaussianRandom(ad_access_min, ad_access_max, 2) * 24).toFixed(0),
      title: 'Major',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_anomoly_min, ad_anomoly_max, 2) * 24).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Warning',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_vulnerability_min, ad_vulnerability_max, 2) * 24).toFixed(0),
      title: 'Info',
      color: 'customColors.brandBlue1',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_minor_min, ad_minor_max, 2) * 24).toFixed(0),
      title: 'Minor',
      color: 'customColors.brandBlack',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    }
  ],
  last7days: [
    {
      sales: (generateGaussianRandom(ad_compliance_min, ad_compliance_max, 2) * 168).toFixed(0),
      title: 'Critical',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      trendDir: 'up',
      sales: (generateGaussianRandom(ad_access_min, ad_access_max, 2) * 168).toFixed(0),
      title: 'Major',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_anomoly_min, ad_anomoly_max, 2) * 168).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Warning',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_vulnerability_min, ad_vulnerability_max, 2) * 168).toFixed(0),
      title: 'Info',
      color: 'customColors.brandBlue1',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_minor_min, ad_minor_max, 2) * 168).toFixed(0),
      title: 'Minor',
      color: 'customColors.brandBlack',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    }
  ],
  next2hrs: [
    {
      sales: (generateGaussianRandom(ad_compliance_min, ad_compliance_max, 2) * 2).toFixed(0),
      title: 'Critical',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      trendDir: 'up',
      sales: (generateGaussianRandom(ad_access_min, ad_access_max, 2) * 2).toFixed(0),
      title: 'Major',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_anomoly_min, ad_anomoly_max, 2) * 2).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Warning',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_vulnerability_min, ad_vulnerability_max, 2) * 2).toFixed(0),
      title: 'Info',
      color: 'customColors.brandBlue1',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_minor_min, ad_minor_max, 2) * 2).toFixed(0),
      title: 'Minor',
      color: 'customColors.brandBlack',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    }
  ],
  next8hrs: [
    {
      sales: (generateGaussianRandom(ad_compliance_min, ad_compliance_max, 2) * 8).toFixed(0),
      title: 'Critical',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      trendDir: 'up',
      sales: (generateGaussianRandom(ad_access_min, ad_access_max, 2) * 8).toFixed(0),
      title: 'Major',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_anomoly_min, ad_anomoly_max, 2) * 8).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Warning',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_vulnerability_min, ad_vulnerability_max, 2) * 8).toFixed(0),
      title: 'Info',
      color: 'customColors.brandBlue1',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_minor_min, ad_minor_max, 2) * 8).toFixed(0),
      title: 'Minor',
      color: 'customColors.brandBlack',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    }
  ]
}
