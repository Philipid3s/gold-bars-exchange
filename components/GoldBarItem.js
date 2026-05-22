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
  handleMakeOffer,
  handleAcceptOffer,
  handleRejectOffer,
  actionsDisabled,
  disabledReason
}) => (
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
        {goldbar.offerPrice}
      </TableCell>

      <TableCell>
          <Tooltip title={actionsDisabled ? disabledReason : 'Make offer'}>
            <span>
              <IconButton size="small" color="primary" disabled={actionsDisabled} onClick={handleMakeOffer.bind(this, index, goldbar._id)}>
                <LocalOfferIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={actionsDisabled ? disabledReason : 'Accept offer'}>
            <span>
              <IconButton size="small" color="primary" disabled={actionsDisabled} onClick={handleAcceptOffer.bind(this, index, goldbar._id)}>
                <CheckIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={actionsDisabled ? disabledReason : 'Reject offer'}>
            <span>
              <IconButton size="small" color="secondary" disabled={actionsDisabled} onClick={handleRejectOffer.bind(this, index, goldbar._id)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
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

export default GoldBarItem
