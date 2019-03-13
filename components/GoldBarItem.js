import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

const GoldBarItem = ({ goldbar, index, inProgress, handleMakeOffer, handleAcceptOffer, handleRejectOffer }) => (
    <TableRow key={index} className={inProgress === goldbar._id ? 'inProgress' : ''}>
      <TableCell component="th" scope="row">
        <a href={"https://ropsten.etherscan.io/address/" + goldbar.contract}>{goldbar.reference}</a>
      </TableCell>

      <TableCell>
        <a href={"https://ropsten.etherscan.io/address/" + goldbar.owner}>{goldbar.owner}</a>
      </TableCell>

      <TableCell>
        <a href={"https://ropsten.etherscan.io/address/" + goldbar.buyer}>{goldbar.buyer}</a>
      </TableCell>

      <TableCell>
        {goldbar.state}
      </TableCell>

      <TableCell align-right="true">
        {goldbar.askingPrice}
      </TableCell>

      <TableCell align-right="true">
        {goldbar.offer}
      </TableCell>

      <TableCell>   
          <a className='offer' onClick={handleMakeOffer.bind(this, index, goldbar._id)}>Make offer</a>
          <a className='accept' onClick={handleAcceptOffer.bind(this, index, goldbar._id)}>Accept</a>
          <a className='reject' onClick={handleRejectOffer.bind(this, index, goldbar._id)}>Reject</a>
      </TableCell>

      <style jsx>{`
        a {
          margin-left: 0.5em;
          cursor: pointer;
          font-size: 0.8em;
          text-transform: uppercase;
        }
        a.offer {
          color: CornflowerBlue;
        }
        a.accept {
          color: LimeGreen;
        }
        a.reject {
          color: Crimson;
        }
        .inProgress {
          opacity: 0.3;
        }
      `}</style>
    </TableRow>
)

export default GoldBarItem
