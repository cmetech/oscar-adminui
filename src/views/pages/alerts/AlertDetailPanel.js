import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CustomDataGrid } from 'src/lib/styled-components';
import { useTranslation } from 'react-i18next';

const AlertDetailPanel = ({ alertGroup }) => {
  const { t } = useTranslation();

  // Helper function to find the value for a specific label or annotation by name
  const findValueByName = (arr, name) => arr.find(item => item.name === name)?.value || 'N/A';

  // Prepare rows for the DataGrid from alertGroup's alerts
  const alertRows = alertGroup.alerts.map((alert, index) => ({
    id: index, // Assuming unique index is sufficient for key, adjust as needed
    alertId: alert.id,
    status: alert.status,
    startsAt: alert.startsAt || 'N/A', // Display 'N/A' if startsAt is null or undefined
    endsAt: alert.endsAt || 'N/A', // Display 'N/A' if endsAt is null or undefined
    summary: alert.annotations.find(ann => ann.name === "summary")?.value || 'N/A',
    severity: alert.labels.find(lbl => lbl.name === "severity")?.value || 'N/A',
    alertname: alert.labels.find(lbl => lbl.name === "alertname")?.value || 'N/A',
  }));

  // Define columns for the DataGrid
  const alertColumns = [
    { field: 'alertId', headerName: t('ID'), width: 100 },
    { field: 'alertname', headerName: t('Alert Name'), width: 200 },
    { field: 'status', headerName: t('Status'), width: 100 },
    { field: 'startsAt', headerName: t('Start Time'), width: 150 },
    { field: 'endsAt', headerName: t('End Time'), width: 150 },
    { field: 'summary', headerName: t('Summary'), width: 500 },
    { field: 'severity', headerName: t('Severity'), width: 100 },
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
     <CustomDataGrid
        rows={alertRows}
        columns={alertColumns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        autoHeight
      />
    </Box>
  );
};

export default AlertDetailPanel;
