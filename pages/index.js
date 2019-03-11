import { Component } from 'react'

import reduxApi, { withGoldBars } from '../redux/reduxApi.js'

import Web3 from 'web3'

// import { Link } from '../server/routes.js'
import PageHead from '../components/PageHead'
import GoldBarItem from '../components/GoldBarItem'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';

const getWeb3 = () =>
new Promise(async (resolve, reject) => {
  // Modern dapp browsers...
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.enable();
      console.log("window.ethereum detected.");
      // Acccounts now exposed
      resolve(web3);
    } catch (error) {
      reject(error);
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    try {
      // Use Mist/MetaMask's provider.
      const web3 = new Web3(window.web3.currentProvider);
      console.log("Injected web3 detected.");
      resolve(web3);
    } catch (error) {
      reject(error);
    }
  }
  // Fallback to localhost; use dev console port by default...
  else {
    try {
      const provider = new Web3.providers.HttpProvider(
        process.env.INFURA_URI
      );
      const web3 = new Web3(provider);
      console.log("No web3 instance injected, using Local web3.");
      resolve(web3);
    } catch (error) {
      reject(error);
    }
  }
});

class IndexPage extends Component {

  static async getInitialProps ({ store, isServer, pathname, query }) {
    // Get all Gold Bars
    const goldbars = await store.dispatch(reduxApi.actions.goldbars.sync());
    return { goldbars, query }
  }

  async loadBlockchainData() {
    const web3 = await getWeb3();

    console.log(web3);

    if (typeof web3 !== 'undefined') {
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      
      const isLoggedIn = (accounts.length > 0);
      if (isLoggedIn) {
        this.setState({ isLoggedIn: isLoggedIn, account: accounts[0], etherscan: "https://ropsten.etherscan.io/address/" +  accounts[0]});
      }
    }
  }

  componentWillMount() {
  }
  
  componentDidMount() {
    // Modern dapp browsers...
    if (typeof window.web3 === 'undefined') {
      // no web3, use fallback
      console.error("Please use a web3 browser");
    }
    else {
      if (window.web3.currentProvider.isMetaMask) {
        console.log('Metamask detected');
      }
    }

    this.loadBlockchainData()
  }

  constructor (props) {
    super(props)
    this.state = { 
      contract: '',

      account: '',
      etherscan: '',

      reference: '',
      askingPrice: 0,

      isLoggedIn: false
    }
  }

  handleChangeInputReference (event) {
    this.setState({ reference: event.target.value })
  }

  handleChangeInputAskingPrice (event) {
    this.setState({ askingPrice: event.target.value })
  }

  handleAdd (event) {
    const web3 = new Web3(Web3.givenProvider);

    var ref = this.state.reference ;
    var price = this.state.askingPrice;

    var goldbarexchangeContract = new web3.eth.Contract([{"constant":true,"inputs":[],"name":"Reference","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"OfferPrice","outputs":[{"name":"","type":"int256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"GoldBarBuyer","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"offerPrice","type":"int256"}],"name":"MakeOffer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"Reject","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"AcceptOffer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"GoldBarOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"AskingPrice","outputs":[{"name":"","type":"int256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"State","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"ref","type":"string"},{"name":"price","type":"int256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]);
    var data = '0x608060405234801561001057600080fd5b506040516107fa3803806107fa8339810180604052810190808051820192919060200180519060200190929190505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600281905550816001908051906020019061009d9291906100c9565b506000600360006101000a81548160ff021916908360028111156100bd57fe5b0217905550505061016e565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061010a57805160ff1916838001178555610138565b82800160010185558215610138579182015b8281111561013757825182559160200191906001019061011c565b5b5090506101459190610149565b5090565b61016b91905b8082111561016757600081600090555060010161014f565b5090565b90565b61067d8061017d6000396000f300608060405260043610610099576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680631d915d1b1461009e578063530701521461012e5780637354798a1461015957806385b44a26146101b0578063cba59827146101dd578063d12cd942146101f4578063dd07fc841461020b578063ec69f29f14610262578063f1b6dccd1461028d575b600080fd5b3480156100aa57600080fd5b506100b36102c6565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156100f35780820151818401526020810190506100d8565b50505050905090810190601f1680156101205780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561013a57600080fd5b50610143610364565b6040518082815260200191505060405180910390f35b34801561016557600080fd5b5061016e61036a565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b3480156101bc57600080fd5b506101db60048036038101908080359060200190929190505050610390565b005b3480156101e957600080fd5b506101f261049b565b005b34801561020057600080fd5b50610209610592565b005b34801561021757600080fd5b50610220610613565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561026e57600080fd5b50610277610638565b6040518082815260200191505060405180910390f35b34801561029957600080fd5b506102a261063e565b604051808260028111156102b257fe5b60ff16815260200191505060405180910390f35b60018054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561035c5780601f106103315761010080835404028352916020019161035c565b820191906000526020600020905b81548152906001019060200180831161033f57829003601f168201915b505050505081565b60045481565b600360019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600081141561039e57600080fd5b600060028111156103ab57fe5b600360009054906101000a900460ff1660028111156103c657fe5b1415156103d257600080fd5b3373ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141561042c57600080fd5b33600360016101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550806004819055506001600360006101000a81548160ff0219169083600281111561049357fe5b021790555050565b600160028111156104a857fe5b600360009054906101000a900460ff1660028111156104c357fe5b1415156104cf57600080fd5b3373ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614151561052a57600080fd5b6000600360016101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600360006101000a81548160ff0219169083600281111561058b57fe5b0217905550565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156105ed57600080fd5b6002600360006101000a81548160ff0219169083600281111561060c57fe5b0217905550565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60025481565b600360009054906101000a900460ff16815600a165627a7a7230582090b70da19d731a8ac1332e3027b40c56a89955fb8a94487ac408de777daef2d90029'; 
    
    this.setState({ inProgress: true });

    // Gas estimation
    goldbarexchangeContract.deploy({
      data: data,
      arguments: [ref, price]
    })
    .send({
      from: this.state.account //,gas: '4700000'
    })
    .on('confirmation', (confirmationNumber, receipt) => { 
      if (this.state.contract !== receipt.contractAddress)
      {
        console.log('Contract successfully created: ' + receipt.contractAddress) // contains the new contract address

        // after eth transaction
        const { reference, askingPrice } = this.state
        if (!reference) return
        const callbackWhenDone = () => this.setState({ reference: '', askingPrice: 0, inProgress: false })

        // Actual data request
        const newGoldBar = { 
          contract: receipt.contractAddress,

          reference: reference,
          owner: this.state.account,
          askingPrice: askingPrice,
          state: 'Available',

          buyer: '',
          offerPrice: 0
        }
        this.props.dispatch(reduxApi.actions.goldbars.post({}, { body: JSON.stringify(newGoldBar) }, callbackWhenDone))
        
        this.setState( {contract: receipt.contractAddress});
      }
    })
  }

  handleMakeOffer (goldbar, index, goldbarId, event) {
    const offer = window.prompt('Your offer', goldbar.askingPrice)
    //if (!reference) return
    //const callbackWhenDone = () => this.setState({ inProgress: false })
    //this.setState({ inProgress: goldbarId })
    // Actual data request
    //const newGoldBar = { id: goldbarId, reference: reference }
    //this.props.dispatch(reduxApi.actions.goldbars.put({ id: goldbarId }, { body: JSON.stringify(newGoldBar) }, callbackWhenDone))
  }

  render () {
    const { goldbars } = this.props;

    const isLoggedIn = this.state.isLoggedIn;

    const goldbarsList = goldbars.data
      ? goldbars.data.map((goldbar, index) => 
        <GoldBarItem
          key={index}
          goldbar={goldbar}
          index={index}
          inProgress={this.state.inProgress}
          handleMakeOffer={this.handleMakeOffer.bind(this, goldbar)}
        />
      )
      : []

      
    if (isLoggedIn) {
      return <main>
      <PageHead
        title='Gold bars exchange platform'
        description='Gold bars exchange platform'
      />

      <h1>Gold bars Exchange platform</h1>

      <p>Ethereum account : <a href={this.state.etherscan}>{this.state.account}</a></p>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Gold bar reference</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Buyer</TableCell>
            <TableCell>State</TableCell>
            <TableCell align-right="true">Asking Price</TableCell>
            <TableCell>actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {goldbarsList}
        </TableBody>
      </Table>
      <div>
        <Input placeholder='Enter a gold bar reference' value={this.state.reference} onChange={this.handleChangeInputReference.bind(this)} disabled={this.state.inProgress} />
        <label>  </label>
        <Input value={this.state.askingPrice} onChange={this.handleChangeInputAskingPrice.bind(this)} disabled={this.state.inProgress} />
        <label>  </label>
        <Button variant="contained" color="primary"  onClick={this.handleAdd.bind(this)} disabled={this.state.inProgress}>
          Add gold bar
        </Button>

        <style jsx>{`
          div {
            margin-top: 1em;
          }
        `}</style>
      </div>
    </main>
    }
    else
    {
      return <main>
      <PageHead
        title='Gold bars exchange platform'
        description='Gold bars exchange platform'
      />

      <h1>Gold bars Exchange platform</h1>

      <p>Please, connect your Ethereum account.</p>
    </main>
    }
  };
}

export default withGoldBars(IndexPage)
