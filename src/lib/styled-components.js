import React from 'react'
import { styled, useTheme } from '@mui/material/styles'
import { DataGridPro } from '@mui/x-data-grid-pro'
import MuiTabList from '@mui/lab/TabList'

function customCheckbox(theme) {
  return {
    '& .MuiCheckbox-root svg': {
      width: 16,
      height: 16,
      backgroundColor: 'transparent',
      border: `1px solid ${
        theme.palette.mode === 'light' ? theme.palette.customColors.brandGray2 : theme.palette.customColors.brandWhite
      }`,
      borderRadius: 2
    },
    '& .MuiCheckbox-root svg path': {
      display: 'none'
    },
    '& .MuiCheckbox-root.Mui-checked:not(.MuiCheckbox-indeterminate) svg': {
      backgroundColor:
        theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main,
      borderColor: theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main
    },
    '& .MuiCheckbox-root.Mui-checked .MuiIconButton-label:after': {
      position: 'absolute',
      display: 'table',
      border: '2px solid #fff',
      borderTop: 0,
      borderLeft: 0,
      transform: 'rotate(45deg) translate(-50%,-50%)',
      opacity: 1,
      transition: 'all .2s cubic-bezier(.12,.4,.29,1.46) .1s',
      content: '""',
      top: '50%',
      left: '39%',
      width: 5.71428571,
      height: 9.14285714
    },
    '& .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiIconButton-label:after': {
      width: 8,
      height: 8,
      backgroundColor:
        theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.primary.main,
      transform: 'none',
      top: '39%',
      border: 0
    }
  }
}

function customDataGridPanel(theme) {
  return {
    '& .MuiDataGrid-panelHeader .MuiInput-root .MuiInput-input:after': {
      color: theme.palette.mode === 'light' ? '#000' : '#fff'
    }
  }
}

const CustomDataGridRoot = styled(DataGridPro)(({ theme }) => ({
  border: 0,
  color: theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.85)',
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"'
  ].join(','),
  WebkitFontSmoothing: 'auto',
  letterSpacing: 'normal',
  '& .MuiDataGrid-columnsContainer': {
    backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#1d1d1d'
  },
  '& .MuiDataGrid-iconSeparator': {
    display: 'none'
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor:
      theme.palette.mode === 'light' ? theme.palette.customColors.brandGray4 : theme.palette.customColors.brandBlack
  },
  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
    borderRight: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`
  },
  '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
    borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`
  },
  '& .MuiDataGrid-cell': {
    color: theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.65)'
  },
  '& .MuiPaginationItem-root': {
    borderRadius: 0
  },
  '& .MuiDataGrid-toolbarContainer, .MuiButton-root': {
    color: theme.palette.mode === 'dark' ? theme.palette.customColors.brandWhite : theme.palette.customColors.brandBlack
  },
  '& .MuiDataGrid-toolbarContainer .MuiButton-root:hover': {
    color:
      theme.palette.mode === 'dark' ? theme.palette.customColors.brandYellow : theme.palette.customColors.brandBlack,
    border: `1px solid ${
      theme.palette.mode === 'dark' ? theme.palette.customColors.brandWhite : theme.palette.customColors.brandBlack
    }`
  },
  ...customCheckbox(theme),
  ...customDataGridPanel(theme)
}))

export const CustomDataGrid = React.forwardRef(function CustomDataGrid(props, ref) {
  return <CustomDataGridRoot ref={ref} {...props} />
})

export const TabList = styled(MuiTabList)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    minWidth: 65,
    minHeight: 40,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.up('md')]: {
      minWidth: 130
    }
  }
}))
