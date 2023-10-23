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

const ad_critical_min = 0
const ad_critical_max = 0.05
const ad_major_min = 0
const ad_major_max = 3
const ad_warning_min = 4
const ad_warning_max = 30
const ad_info_min = 30
const ad_info_max = 60
const ad_minor_min = 35
const ad_minor_max = 65

export const alarmData = {
  lastHour: [
    {
      sales: 0,
      title: 'Critical',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 2, 2).toFixed(0)}%`
    },
    {
      trendDir: 'down',
      sales: generateGaussianRandom(ad_major_min, ad_major_max, 2).toFixed(0),
      title: 'Major',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: generateGaussianRandom(ad_warning_min, ad_warning_max, 2).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Warning',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: generateGaussianRandom(ad_info_min, ad_info_max, 2).toFixed(0),
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
      sales: 1,
      title: 'Critical',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      trendDir: 'up',
      sales: (generateGaussianRandom(ad_major_min, ad_major_max, 2) * 24).toFixed(0),
      title: 'Major',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_warning_min, ad_warning_max, 2) * 24).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Warning',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_info_min, ad_info_max, 2) * 24).toFixed(0),
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
      sales: 4,
      title: 'Critical',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      trendDir: 'up',
      sales: (generateGaussianRandom(ad_major_min, ad_major_max, 2) * 168).toFixed(0),
      title: 'Major',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_warning_min, ad_warning_max, 2) * 168).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Warning',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_info_min, ad_info_max, 2) * 168).toFixed(0),
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
      sales: 0,
      title: 'Critical',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      trendDir: 'up',
      sales: (generateGaussianRandom(ad_major_min, ad_major_max, 2) * 2).toFixed(0),
      title: 'Major',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_warning_min, ad_warning_max, 2) * 2).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Warning',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_info_min, ad_info_max, 2) * 2).toFixed(0),
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
      sales: 0,
      title: 'Critical',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      trendDir: 'up',
      sales: (generateGaussianRandom(ad_major_min, ad_major_max, 2) * 8).toFixed(0),
      title: 'Major',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_warning_min, ad_warning_max, 2) * 8).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Warning',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_info_min, ad_info_max, 2) * 8).toFixed(0),
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
