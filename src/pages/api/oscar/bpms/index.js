// pages/api/redirect.js
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const workflowEngine = process.env.WORKFLOW_ENGINE || 'airflow';

  let redirectUrl;

  switch (workflowEngine) {
    case 'nifi':
      redirectUrl = `https://${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi`;
      break;
    case 'mageai':
      redirectUrl = `http://${process.env.MAGEAI_HOST}:${process.env.MAGEAI_PORT}`;
      break;
    case 'airflow':
      redirectUrl = `https://${process.env.AIRFLOW_HOST}:${process.env.AIRFLOW_PORT}`;
      break;
    default:
      // Fallback to mageai if the workflow engine type is invalid
      redirectUrl = `https://${process.env.AIRFLOW_HOST}:${process.env.AIRFLOW_PORT}`;
      break;
  }

  res.redirect(redirectUrl);
}
