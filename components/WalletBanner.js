import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

const WALLET_LABEL = {
  connected: 'Connected',
  locked: 'Locked',
  no_wallet: 'No wallet',
  read_only: 'Read only',
  connecting: 'Connecting…',
  error: 'Error',
  unknown: 'Detecting…'
}

const WALLET_COLOR = {
  connected: 'success',
  locked: 'warning',
  no_wallet: 'default',
  read_only: 'default',
  connecting: 'info',
  error: 'error',
  unknown: 'default'
}

const WalletBanner = ({ walletStatus, chainId, chainOk, readonly, onSwitchChain, onConnect, onDisconnect }) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    px: 1.5,
    py: 0.75,
    bgcolor: 'background.paper'
  }}>
    <Chip
      icon={<AccountBalanceWalletIcon />}
      label={WALLET_LABEL[walletStatus] || walletStatus}
      color={WALLET_COLOR[walletStatus] || 'default'}
      size="small"
      variant="outlined"
    />

    <Tooltip title={chainOk ? 'Polygon Amoy testnet' : chainId ? `Chain ${chainId} — switch to Amoy` : 'No chain detected'}>
      <Chip
        icon={chainOk ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
        label={chainOk ? 'Amoy' : chainId ? `Chain ${chainId}` : 'No chain'}
        color={chainOk ? 'success' : chainId ? 'error' : 'default'}
        size="small"
        variant="outlined"
      />
    </Tooltip>

    {readonly && <Chip label="Readonly" size="small" variant="outlined" color="warning" />}

    {!chainOk && walletStatus === 'connected' && (
      <Button size="small" variant="outlined" color="warning" onClick={onSwitchChain} sx={{ textTransform: 'none' }}>
        Switch to Amoy
      </Button>
    )}

    {walletStatus !== 'connected' && (
      <Button size="small" variant="contained" onClick={onConnect} sx={{ textTransform: 'none' }}>
        Connect wallet
      </Button>
    )}

    {walletStatus === 'connected' && (
      <Button size="small" variant="outlined" color="inherit" onClick={onDisconnect} sx={{ textTransform: 'none' }}>
        Disconnect
      </Button>
    )}
  </Box>
)

export default WalletBanner
