// ** MUI Imports
import CustomChip from 'src/@core/components/mui/chip'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const ServiceCustomChip = props => {
  return (
    <CustomChip
      size={props.size}
      label={props.label}
      color={props.color}
      variant={props.variant}
      icon={props.icon ? <Icon icon={props.icon} fontSize={20} /> : null}
      sx={props.sx ? props.sx : {}}
    />
  )
}

export default ServiceCustomChip
