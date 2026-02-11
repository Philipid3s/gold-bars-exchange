import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

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
        <a href={"https://amoy.polygonscan.com/address/" + goldbar.contract}>{goldbar.reference}</a>
      </TableCell>

      <TableCell>
        <a href={"https://amoy.polygonscan.com/address/" + goldbar.owner}>{goldbar.owner}</a>
      </TableCell>

      <TableCell>
        <a href={"https://amoy.polygonscan.com/address/" + goldbar.buyer}>{goldbar.buyer}</a>
      </TableCell>

      <TableCell>
        {goldbar.state}
      </TableCell>

      <TableCell align-right="true">
        {goldbar.askingPrice}
      </TableCell>

      <TableCell align-right="true">
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
