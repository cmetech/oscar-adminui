import { useState } from 'react'
import SingleValueCard from 'src/views/cards/SingleValueCard'
import Grid from '@mui/material/Grid'
import { atom, useAtom, useSetAtom } from 'jotai'
import axios from 'axios'
import { parseISO, formatDistance } from 'date-fns'
import { format, zonedTimeToUtc, utcToZonedTime, formatInTimeZone } from 'date-fns-tz'

const data = {
  total_slis: 31,
  total_breached: 30,
  total_ok: 1,
  slo_responses: [
    {
      sli_id: '017c95e3-44a2-4e4b-967c-5150d3aa447c',
      sli_name: 'SLI Example 10',
      slo_percentage: 90.94,
      delta_percentage: -0.73,
      sparkline_slo_percentages: [
        85.71, 92.86, 100, 92.86, 71.43, 92.86, 92.86, 85.71, 92.86, 92.86, 100, 92.86, 92.86, 92.86, 100, 100, 92.86,
        82.35, 100, 92.86, 92.86, 71.43, 85.71, 85.71
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'down',
      target_slo_value: 99.95,
      is_breaching: true
    },
    {
      sli_id: '0668ebde-3b06-487a-a444-f0959009f969',
      sli_name: 'SLI Example 3',
      slo_percentage: 91.3,
      delta_percentage: 0.53,
      sparkline_slo_percentages: [
        92.86, 100, 100, 92.86, 85.71, 92.86, 92.86, 78.57, 85.71, 85.71, 100, 100, 100, 100, 85.71, 85.71, 92.86, 95,
        94.12, 78.57, 92.86, 85.71, 71.43, 100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.8,
      is_breaching: true
    },
    {
      sli_id: '1400be69-6890-47ff-adcf-eae8b60e2e83',
      sli_name: 'SLI_7364319705',
      slo_percentage: 92.26,
      delta_percentage: 1.49,
      sparkline_slo_percentages: [
        78.57, 100, 92.86, 92.86, 92.86, 92.86, 92.86, 85.71, 100, 100, 100, 85.71, 85.71, 92.86, 78.57, 92.86, 100,
        78.57, 100, 92.86, 100, 85.71, 100, 92.86
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.97,
      is_breaching: true
    },
    {
      sli_id: '2d8120d5-8c4c-44af-9b85-06219464820d',
      sli_name: 'SLI Example 1',
      slo_percentage: 89.28,
      delta_percentage: 1.78,
      sparkline_slo_percentages: [
        78.57, 85.71, 85.71, 100, 85.71, 92.86, 85.71, 85.71, 85.71, 78.57, 85.71, 85.71, 92.86, 92.86, 85.71, 100, 100,
        90, 100, 85.71, 92.86, 85.71, 92.86, 85.71
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.95,
      is_breaching: true
    },
    {
      sli_id: '2e92c281-93ae-4482-8cb6-7b3dc097dc1d',
      sli_name: 'SLI_5969649990',
      slo_percentage: 85.42,
      delta_percentage: -8.33,
      sparkline_slo_percentages: [
        50, 100, 100, 100, 100, 50, 100, 0, 50, 100, 50, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'down',
      target_slo_value: 99.64,
      is_breaching: true
    },
    {
      sli_id: '331503d1-08f3-47b9-9d26-5fb07dba1f96',
      sli_name: 'SLI Example 5',
      slo_percentage: 89.47,
      delta_percentage: 4.06,
      sparkline_slo_percentages: [
        0, 100, 100, 100, 50, 100, 100, 100, 100, 100, 100, 100, 100, 50, 100, 100, 50, 100, 100, 100, 100, 50, 100, 100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.6,
      is_breaching: true
    },
    {
      sli_id: '33deda37-423d-4756-9cf9-ef242fe41fc8',
      sli_name: 'SLI_9276607235',
      slo_percentage: 91.67,
      delta_percentage: 1.19,
      sparkline_slo_percentages: [
        100, 100, 100, 92.86, 92.86, 100, 85.71, 100, 85.71, 78.57, 85.71, 100, 78.57, 85.71, 92.86, 92.86, 85.71,
        85.71, 92.86, 100, 92.86, 92.86, 92.86, 85.71
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.5,
      is_breaching: true
    },
    {
      sli_id: '4a3d777f-0882-4968-ab0f-0d0d38388447',
      sli_name: 'SLI Example 30',
      slo_percentage: 90.06,
      delta_percentage: -0.42,
      sparkline_slo_percentages: [
        78.57, 100, 85.71, 78.57, 85.71, 100, 92.86, 100, 92.86, 92.86, 85.71, 71.43, 85.71, 92.86, 92.86, 100, 92.86,
        82.35, 82.35, 85.71, 92.86, 100, 100, 92.86
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'down',
      target_slo_value: 99.8,
      is_breaching: true
    },
    {
      sli_id: '52e4e73e-3dcd-4f99-a865-99f2229643a1',
      sli_name: 'SLI_2990867751',
      slo_percentage: 89.88,
      delta_percentage: -1.49,
      sparkline_slo_percentages: [
        85.71, 85.71, 100, 85.71, 85.71, 92.86, 92.86, 100, 92.86, 92.86, 78.57, 85.71, 85.71, 85.71, 100, 92.86, 85.71,
        92.86, 92.86, 92.86, 92.86, 78.57, 85.71, 92.86
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'down',
      target_slo_value: 99.72,
      is_breaching: true
    },
    {
      sli_id: '594c377d-0fb6-4407-9de2-cb6f25f8f611',
      sli_name: 'SLI_5586000699',
      slo_percentage: 91.67,
      delta_percentage: -4.17,
      sparkline_slo_percentages: [
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'down',
      target_slo_value: 99.7,
      is_breaching: true
    },
    {
      sli_id: '5e2d6ef9-f07b-44bd-9873-94691be8ecab',
      sli_name: 'SLI_1588788241',
      slo_percentage: 95.83,
      delta_percentage: -2.08,
      sparkline_slo_percentages: [
        100, 100, 100, 100, 50, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 100, 100,
        100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'down',
      target_slo_value: 99.73,
      is_breaching: true
    },
    {
      sli_id: '5eb0e5cf-9d6c-4e30-8ee6-adbaeb16ef70',
      sli_name: 'SLI Example 50',
      slo_percentage: 87.04,
      delta_percentage: -2.55,
      sparkline_slo_percentages: [
        100, 100, 100, 100, 100, 100, 50, 100, 100, 50, 100, 100, 100, 50, 100, 100, 50, 100, 80, 100, 50, 50, 100, 100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'down',
      target_slo_value: 99.6,
      is_breaching: true
    },
    {
      sli_id: '6f1d9cbd-6881-4cca-abab-f5c8ba2cdc85',
      sli_name: 'SLI_1629888654',
      slo_percentage: 90.77,
      delta_percentage: -0.3,
      sparkline_slo_percentages: [
        85.71, 92.86, 92.86, 100, 78.57, 71.43, 100, 92.86, 100, 92.86, 92.86, 92.86, 85.71, 78.57, 92.86, 92.86, 92.86,
        85.71, 92.86, 100, 85.71, 92.86, 92.86, 92.86
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'down',
      target_slo_value: 99.77,
      is_breaching: true
    },
    {
      sli_id: '7070e193-24ba-4f3f-b022-40f2dee5e598',
      sli_name: 'SLI_5417070987',
      slo_percentage: 93.15,
      delta_percentage: 3.87,
      sparkline_slo_percentages: [
        92.86, 85.71, 100, 85.71, 92.86, 100, 92.86, 85.71, 100, 100, 92.86, 92.86, 92.86, 100, 78.57, 85.71, 92.86,
        92.86, 100, 92.86, 100, 92.86, 85.71, 100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.58,
      is_breaching: true
    },
    {
      sli_id: '7802cbe2-d324-470f-aac5-ea0bb5679f54',
      sli_name: 'SLO003',
      slo_percentage: 91.73,
      delta_percentage: 4.12,
      sparkline_slo_percentages: [
        92.86, 85.71, 85.71, 100, 85.71, 100, 92.31, 100, 85.71, 64.29, 100, 92.86, 100, 85.71, 93.33, 100, 92.86,
        92.86, 100, 100, 50, 100, 100, 100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 98.2,
      is_breaching: true
    },
    {
      sli_id: '7ec84c23-cb1b-48d7-9e41-1a516ef92c11',
      sli_name: 'SLI Example 4',
      slo_percentage: 92.98,
      delta_percentage: 1.32,
      sparkline_slo_percentages: [
        100, 100, 100, 100, 100, 100, 50, 100, 100, 100, 100, 100, 100, 100, 50, 50, 100, 87.5, 100, 100, 100, 100, 100,
        100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.7,
      is_breaching: true
    },
    {
      sli_id: '91b0c23f-b929-43b6-a836-862ad443c379',
      sli_name: 'SLI_9956423229',
      slo_percentage: 92.56,
      delta_percentage: 0.6,
      sparkline_slo_percentages: [
        100, 100, 78.57, 85.71, 85.71, 100, 100, 85.71, 100, 85.71, 100, 92.86, 100, 85.71, 92.86, 92.86, 92.86, 100,
        85.71, 100, 85.71, 85.71, 92.86, 92.86
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.66,
      is_breaching: true
    },
    {
      sli_id: '94eeec9e-a344-4d0e-84b0-dd5c88c8e142',
      sli_name: 'SLI_1263184806',
      slo_percentage: 91.67,
      delta_percentage: 0,
      sparkline_slo_percentages: [
        100, 100, 100, 50, 100, 100, 100, 100, 100, 100, 100, 50, 100, 50, 50, 100, 100, 100, 100, 100, 100, 100, 100,
        100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'flat',
      target_slo_value: 99.72,
      is_breaching: true
    },
    {
      sli_id: 'a5186dba-45e6-4c14-830a-2cb55b8190f7',
      sli_name: 'SLI_6517165026',
      slo_percentage: 87.5,
      delta_percentage: 2.08,
      sparkline_slo_percentages: [
        100, 50, 100, 100, 100, 50, 50, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 0, 50, 100, 100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.82,
      is_breaching: true
    },
    {
      sli_id: 'aa7cc91d-5aa5-45a0-a2a9-8179798e8a88',
      sli_name: 'SLI_7470867325',
      slo_percentage: 91.67,
      delta_percentage: 1.79,
      sparkline_slo_percentages: [
        85.71, 100, 100, 85.71, 100, 92.86, 100, 92.86, 92.86, 92.86, 92.86, 85.71, 85.71, 92.86, 92.86, 85.71, 78.57,
        92.86, 92.86, 85.71, 85.71, 92.86, 100, 92.86
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.6,
      is_breaching: true
    },
    {
      sli_id: 'b40637ef-b228-4baa-9fe3-7ae1810d555b',
      sli_name: 'SLI Example 40',
      slo_percentage: 83.33,
      delta_percentage: -2.08,
      sparkline_slo_percentages: [
        50, 100, 100, 100, 100, 100, 100, 100, 50, 50, 100, 50, 100, 100, 100, 100, 100, 80, 40, 100, 100, 100, 100, 50
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'down',
      target_slo_value: 99.7,
      is_breaching: true
    },
    {
      sli_id: 'baa369c5-10cc-4120-81bd-641744d6f472',
      sli_name: 'SLI_4144991054',
      slo_percentage: 88.39,
      delta_percentage: 0.89,
      sparkline_slo_percentages: [
        100, 85.71, 100, 78.57, 85.71, 85.71, 78.57, 100, 100, 85.71, 85.71, 78.57, 85.71, 100, 92.86, 100, 85.71,
        71.43, 100, 92.86, 71.43, 85.71, 78.57, 92.86
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.93,
      is_breaching: true
    },
    {
      sli_id: 'bb6b9f83-5752-411e-9006-4d74ce168b24',
      sli_name: 'SLI_7190263003',
      slo_percentage: 86.61,
      delta_percentage: -4.17,
      sparkline_slo_percentages: [
        92.86, 92.86, 100, 100, 85.71, 64.29, 85.71, 85.71, 92.86, 92.86, 57.14, 92.86, 78.57, 92.86, 100, 92.86, 57.14,
        92.86, 100, 71.43, 78.57, 92.86, 100, 78.57
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'down',
      target_slo_value: 99.91,
      is_breaching: true
    },
    {
      sli_id: 'd4ff873a-28c4-4622-852e-ab709d403c03',
      sli_name: 'SLI_8424392127',
      slo_percentage: 95.83,
      delta_percentage: 2.08,
      sparkline_slo_percentages: [
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 100, 100, 50, 100,
        100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.83,
      is_breaching: true
    },
    {
      sli_id: 'db01d9ee-b4f0-402b-91b6-2094fc90ec6d',
      sli_name: 'SLI_7097888039',
      slo_percentage: 87.5,
      delta_percentage: 0,
      sparkline_slo_percentages: [
        100, 50, 50, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 100, 100, 100, 100, 50, 100, 100, 50, 100, 100, 100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'flat',
      target_slo_value: 99.64,
      is_breaching: true
    },
    {
      sli_id: 'db2987cb-a6f0-4210-9b22-0c1e50f8d268',
      sli_name: 'SLI Example 20',
      slo_percentage: 90.74,
      delta_percentage: -3.01,
      sparkline_slo_percentages: [
        100, 100, 100, 100, 100, 100, 50, 100, 50, 100, 100, 100, 100, 100, 100, 100, 100, 80, 80, 50, 100, 100, 100,
        100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'down',
      target_slo_value: 99.9,
      is_breaching: true
    },
    {
      sli_id: 'df3e71cc-c376-424b-9ae0-8c4eaa8e4ccd',
      sli_name: 'SLI_7825145299',
      slo_percentage: 100,
      delta_percentage: 6.25,
      sparkline_slo_percentages: [
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        100, 100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.54,
      is_breaching: false
    },
    {
      sli_id: 'efdb5fc0-6d75-4be9-a66c-430bde6ea728',
      sli_name: 'SLI Example 2',
      slo_percentage: 90.43,
      delta_percentage: -0.93,
      sparkline_slo_percentages: [
        92.86, 100, 100, 100, 92.86, 100, 85.71, 78.57, 92.86, 85.71, 85.71, 100, 78.57, 85.71, 92.86, 85.71, 78.57, 85,
        88.24, 100, 92.86, 85.71, 85.71, 100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'down',
      target_slo_value: 99.9,
      is_breaching: true
    },
    {
      sli_id: 'f8a047b7-3734-4a70-887e-138e81079505',
      sli_name: 'SLI_8098694163',
      slo_percentage: 95.83,
      delta_percentage: 10.42,
      sparkline_slo_percentages: [
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 100, 100, 100, 100, 100, 100, 100, 50, 100,
        100
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.77,
      is_breaching: true
    },
    {
      sli_id: 'f9631f64-c6e8-4186-ba06-7cf902c47933',
      sli_name: 'SLI_3930725496',
      slo_percentage: 89.88,
      delta_percentage: 0.89,
      sparkline_slo_percentages: [
        92.86, 92.86, 92.86, 85.71, 85.71, 100, 85.71, 100, 92.86, 71.43, 85.71, 78.57, 100, 85.71, 100, 92.86, 85.71,
        85.71, 85.71, 92.86, 92.86, 85.71, 100, 85.71
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.99,
      is_breaching: true
    },
    {
      sli_id: 'fa96cbea-1428-4be9-9183-e93e4f157d15',
      sli_name: 'SLI_6039075949',
      slo_percentage: 92.26,
      delta_percentage: 4.76,
      sparkline_slo_percentages: [
        100, 92.86, 92.86, 78.57, 92.86, 100, 85.71, 92.86, 100, 100, 85.71, 85.71, 85.71, 92.86, 92.86, 100, 100,
        92.86, 85.71, 85.71, 92.86, 92.86, 100, 85.71
      ],
      compare_start_time: '2024-04-10T00:00:00',
      compare_end_time: '2024-04-11T00:00:00',
      trend_direction: 'up',
      target_slo_value: 99.83,
      is_breaching: true
    }
  ]
}

const SLOOverviewDashboard = props => {
  const [sloData, setSloData] = useState(data)

  return (
    <Grid container spacing={2}>
      {sloData.slo_responses.map((sloResponse, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <SingleValueCard
            bgcolor={sloResponse.is_breaching ? 'customColors.brandRed' : 'customColors.brandGreen4'}
            title={sloResponse.sli_name}
            value={`${sloResponse.slo_percentage}%`}
            trendDir={sloResponse.trend_direction}
            trendValue={`${sloResponse.delta_percentage}%`}
            showSparkline={true}
            sparklineData={sloResponse.sparkline_slo_percentages}
            linkRoute='/taskrequest'
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default SLOOverviewDashboard
