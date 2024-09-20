// ** Third Party Imports
import axios from 'axios'

// ** Demo Components Imports
import AccountSettings from 'src/views/pages/account-settings/AccountSettings'

const AccountSettingsTab = ({ tab }) => {
  return <AccountSettings tab={tab} />
}

export const getStaticPaths = () => {
  return {
    paths: [{ params: { tab: 'account' } }, { params: { tab: 'security' } }],
    fallback: false
  }
}

export const getStaticProps = async ({ params }) => {
  return {
    props: {
      tab: params?.tab
    }
  }
}

AccountSettingsTab.acl = {
  action: 'read',
  subject: 'accountsettings'
}

export default AccountSettingsTab
