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

const ad_completed_max = 74000
const ad_completed_min = 70000
const ad_inprogress_min = 10000
const ad_inprogress_max = 58000
const ad_reprocessed_min = 500
const ad_reprocessed_max = 3000
const ad_grossfallout_min = 100
const ad_grossfallout_max = 700
const ad_netfallout_min = 40
const ad_netfallout_max = 10

export const orderData = {
  lastHour: [
    {
      sales: generateGaussianRandom(ad_completed_min, ad_completed_max, 2).toFixed(0),
      title: 'Response Time < SLA',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 2, 2).toFixed(0)}%`
    },
    {
      trendDir: 'down',
      sales: generateGaussianRandom(ad_inprogress_min, ad_inprogress_max, 2).toFixed(0),
      title: 'Response Time = SLA',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: generateGaussianRandom(ad_reprocessed_min, ad_reprocessed_max, 2).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Response Time > SLA, No Error',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: generateGaussianRandom(ad_grossfallout_min, ad_grossfallout_max, 2).toFixed(0),
      title: 'Recoverable Error',
      color: 'customColors.brandBlue1',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: generateGaussianRandom(ad_netfallout_min, ad_netfallout_max, 2).toFixed(0),
      title: 'Fallouts',
      color: 'customColors.brandBlack',
      trendDir: 'up',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    }
  ],
  today: [
    {
      sales: (generateGaussianRandom(ad_completed_min, ad_completed_max, 2) * 24).toFixed(0),
      title: 'Response Time < SLA',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      trendDir: 'up',
      sales: (generateGaussianRandom(ad_inprogress_min, ad_inprogress_max, 2) * 24).toFixed(0),
      title: 'Response Time = SLA',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_reprocessed_min, ad_reprocessed_max, 2) * 24).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Response Time > SLA, No Error',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_grossfallout_min, ad_grossfallout_max, 2) * 24).toFixed(0),
      title: 'Recoverable Error',
      color: 'customColors.brandBlue1',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_netfallout_min, ad_netfallout_max, 2) * 24).toFixed(0),
      title: 'Fallouts',
      color: 'customColors.brandBlack',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    }
  ],
  last7days: [
    {
      sales: (generateGaussianRandom(ad_completed_min, ad_completed_max, 2) * 168).toFixed(0),
      title: 'Response Time < SLA',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      trendDir: 'up',
      sales: (generateGaussianRandom(ad_inprogress_min, ad_inprogress_max, 2) * 168).toFixed(0),
      title: 'Response Time = SLA',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_reprocessed_min, ad_reprocessed_max, 2) * 168).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Response Time > SLA, No Error',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_grossfallout_min, ad_grossfallout_max, 2) * 168).toFixed(0),
      title: 'Recoverable Error',
      color: 'customColors.brandBlue1',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_netfallout_min, ad_netfallout_max, 2) * 168).toFixed(0),
      title: 'Fallouts',
      color: 'customColors.brandBlack',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    }
  ],
  next2hrs: [
    {
      sales: (generateGaussianRandom(ad_completed_min, ad_completed_max, 2) * 2).toFixed(0),
      title: 'Response Time < SLA',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      trendDir: 'up',
      sales: (generateGaussianRandom(ad_inprogress_min, ad_inprogress_max, 2) * 2).toFixed(0),
      title: 'Response Time = SLA',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_reprocessed_min, ad_reprocessed_max, 2) * 2).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Response Time > SLA, No Error',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_grossfallout_min, ad_grossfallout_max, 2) * 2).toFixed(0),
      title: 'Recoverable Error',
      color: 'customColors.brandBlue1',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_netfallout_min, ad_netfallout_max, 2) * 2).toFixed(0),
      title: 'Fallouts',
      color: 'customColors.brandBlack',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    }
  ],
  next8hrs: [
    {
      sales: (generateGaussianRandom(ad_completed_min, ad_completed_max, 2) * 8).toFixed(0),
      title: 'Response Time < SLA',
      trendDir: 'down',
      color: 'customColors.brandRed1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      trendDir: 'up',
      sales: (generateGaussianRandom(ad_inprogress_min, ad_inprogress_max, 2) * 8).toFixed(0),
      title: 'Response Time = SLA',
      color: 'customColors.brandOrange1',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_reprocessed_min, ad_reprocessed_max, 2) * 8).toFixed(0),
      trendDir: 'up',
      color: 'customColors.brandYellow1',
      title: 'Response Time > SLA, No Error',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_grossfallout_min, ad_grossfallout_max, 2) * 8).toFixed(0),
      title: 'Recoverable Error',
      color: 'customColors.brandBlue1',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    },
    {
      sales: (generateGaussianRandom(ad_netfallout_min, ad_netfallout_max, 2) * 8).toFixed(0),
      title: 'Fallouts',
      color: 'customColors.brandBlack',
      trendDir: 'down',
      trendNumber: `${generateGaussianRandom(1, 5, 2).toFixed(0)}%`
    }
  ]
}
