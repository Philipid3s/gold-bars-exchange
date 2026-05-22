import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const explorerUrl = address => `https://amoy.polygonscan.com/address/${address}`
const shortAddress = address => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'n/a'

const AddressLink = ({ address }) => {
  if (!address) {
    return <Typography variant="body2" color="text.secondary">n/a</Typography>
  }

  return (
    <Tooltip title={address}>
      <a href={explorerUrl(address)} target="_blank" rel="noopener noreferrer">
        {shortAddress(address)}
      </a>
    </Tooltip>
  )
}

const statusColor = state => {
  if (state === 'Accepted') return 'success'
  if (state === 'Offer Placed') return 'warning'
  return 'default'
}

const GoldBarItem = ({
  goldbar,
  index,
  inProgress,
  anyTxInProgress,
  handleMakeOffer,
  handleAcceptOffer,
  handleRejectOffer,
  actionsDisabled,
  disabledReason
}) => {
  const buttonDisabled = actionsDisabled || anyTxInProgress
  const tooltipReason = anyTxInProgress ? 'Transaction in progress…' : disabledReason

  const showOffer = !goldbar.state || goldbar.state === 'Available'
  const showAcceptReject = goldbar.state === 'Offer Placed'

  return (
    <TableRow key={index} className={inProgress === goldbar._id ? 'inProgress' : ''}>
      <TableCell component="th" scope="row">
        {goldbar.contract
          ? (
            <Tooltip title={goldbar.contract}>
              <a href={explorerUrl(goldbar.contract)} target="_blank" rel="noopener noreferrer">
                {goldbar.reference}
              </a>
            </Tooltip>
            )
          : goldbar.reference}
      </TableCell>

      <TableCell>
        <AddressLink address={goldbar.owner} />
      </TableCell>

      <TableCell>
        <AddressLink address={goldbar.buyer} />
      </TableCell>

      <TableCell>
        <Chip label={goldbar.state || 'Unknown'} color={statusColor(goldbar.state)} size="small" />
      </TableCell>

      <TableCell align="right">
        {goldbar.askingPrice}
      </TableCell>

      <TableCell align="right">
        {goldbar.offerPrice || '—'}
      </TableCell>

      <TableCell>
        {showOffer && (
          <Tooltip title={buttonDisabled ? tooltipReason : 'Make offer'}>
            <span>
              <IconButton
                size="small"
                color="primary"
                disabled={buttonDisabled}
                onClick={handleMakeOffer.bind(this, index, goldbar._id)}
              >
                <LocalOfferIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {showAcceptReject && (
          <>
            <Tooltip title={buttonDisabled ? tooltipReason : 'Accept offer'}>
              <span>
                <IconButton
                  size="small"
                  color="success"
                  disabled={buttonDisabled}
                  onClick={handleAcceptOffer.bind(this, index, goldbar._id)}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={buttonDisabled ? tooltipReason : 'Reject offer'}>
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={buttonDisabled}
                  onClick={handleRejectOffer.bind(this, index, goldbar._id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}

        {!showOffer && !showAcceptReject && (
          <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>—</Typography>
        )}
      </TableCell>

      <style jsx>{`
        button {
          margin-left: 0.3em;
        }
        .inProgress {
          opacity: 0.3;
        }
      `}</style>
    </TableRow>
  )
}

export default GoldBarItem
