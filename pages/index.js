import { Component } from 'react'

import reduxApi, { withGoldBars, wrapper } from '../redux/reduxApi.js'

import { createViemClients, ensureAmoyChain } from '../lib/viem'
import { goldBarAbi, goldBarBytecode } from '../contracts/goldbar'
import { networks } from '../contracts/networks'

// import { Link } from '../server/routes.js'
import PageHead from '../components/PageHead'
import Link from 'next/link'
import GoldBarItem from '../components/GoldBarItem'
import WalletBanner from '../components/WalletBanner'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Icon from '@mui/material/Icon';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

const contractABI = goldBarAbi

class IndexPage extends Component {
  async loadBlockchainData() {
    const clients = await createViemClients()
    if (!clients) {
      this.setState({ walletStatus: 'no_wallet' })
      return
    }

    const { walletClient, publicClient } = clients
    this.setState({ walletClient, publicClient })

    if (walletClient) {
      try {
        const chainId = await walletClient.getChainId()
        const chainOk = chainId === networks.polygonAmoy.chainId
        const accounts = await walletClient.getAddresses()
        const isLoggedIn = (accounts.length > 0)
        const walletStatus = isLoggedIn ? 'connected' : 'locked'
        if (isLoggedIn) {
          this.setState({
            isLoggedIn: true,
            account: accounts[0],
            etherscan: networks.polygonAmoy.explorer + "/address/" + accounts[0],
            chainId,
            chainOk,
            walletStatus
          })
        } else {
          this.setState({ chainId, chainOk, walletStatus })
        }
      } catch (error) {
        console.error(error)
        this.setState({ walletStatus: 'error' })
      }
    } else {
      this.setState({ walletStatus: 'read_only' })
    }
  }

  componentDidMount() {
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

      isLoggedIn: false,
      walletClient: null,
      publicClient: null,
      chainId: null,
      chainOk: false,
      walletStatus: 'unknown',
      readonly: false
    }
  }

  getActionGuardStatus () {
    if (this.state.readonly) return { ok: false, reason: 'readonly' }
    if (!this.state.chainOk) return { ok: false, reason: 'wrong_chain' }
    if (!this.state.isLoggedIn) return { ok: false, reason: 'no_wallet' }
    return { ok: true }
  }

  getActionDisabledReason () {
    const guard = this.getActionGuardStatus()
    if (guard.ok) return ''
    if (guard.reason === 'readonly') return 'Readonly mode enabled'
    if (guard.reason === 'wrong_chain') return 'Wrong network: switch to Polygon Amoy'
    if (guard.reason === 'no_wallet') return 'Connect wallet to perform actions'
    return 'Action blocked'
  }

  showActionGuardMessage (reason) {
    if (reason === 'readonly') {
      window.alert('Readonly mode enabled. Disable it to perform actions.')
      return
    }
    if (reason === 'wrong_chain') {
      window.alert('Wrong network. Please switch to Polygon Amoy.')
      return
    }
    if (reason === 'no_wallet') {
      window.alert('Please connect your wallet.')
    }
  }

  async handleConnectWallet () {
    let { walletClient } = this.state
    if (!walletClient) {
      const clients = await createViemClients()
      if (clients && clients.walletClient) {
        walletClient = clients.walletClient
        this.setState({ walletClient })
      }
    }
    if (!walletClient) {
      this.setState({ walletStatus: 'no_wallet' })
      return
    }
    try {
      this.setState({ walletStatus: 'connecting' })
      await walletClient.requestAddresses()
      const accounts = await walletClient.getAddresses()
      const isLoggedIn = (accounts.length > 0)
      if (isLoggedIn) {
        this.setState({
          isLoggedIn: true,
          account: accounts[0],
          etherscan: networks.polygonAmoy.explorer + "/address/" + accounts[0],
          walletStatus: 'connected'
        })
      } else {
        this.setState({ walletStatus: 'locked' })
      }
    } catch (err) {
      this.setState({ walletStatus: 'error' })
    }
  }

  async handleSwitchChain () {
    const { walletClient } = this.state
    if (!walletClient) {
      this.setState({ walletStatus: 'no_wallet' })
      return
    }
    const result = await ensureAmoyChain(walletClient)
    if (result.ok) {
      this.setState({ chainId: result.chainId, chainOk: true })
    } else {
      this.setState({ chainOk: false })
    }
  }

  handleDisconnectWallet () {
    this.setState({
      isLoggedIn: false,
      account: '',
      etherscan: '',
      walletStatus: 'locked'
    })
  }

  handleChangeInputReference (event) {
    this.setState({ reference: event.target.value })
  }

  handleChangeInputAskingPrice (event) {
    this.setState({ askingPrice: event.target.value })
  }

  async handleAdd (event) {
    const guard = this.getActionGuardStatus()
    if (!guard.ok) {
      this.showActionGuardMessage(guard.reason)
      return
    }
    var ref = this.state.reference
    var price = this.state.askingPrice

    var data = goldBarBytecode
    
    this.setState({ inProgress: true })

    const { walletClient, publicClient } = this.state
    if (!walletClient || !publicClient) {
      console.error('No wallet client available')
      this.setState({ inProgress: false })
      return
    }

    try {
      const [account] = await walletClient.getAddresses()
      const hash = await walletClient.deployContract({
        abi: contractABI,
        bytecode: data,
        args: [ref, BigInt(price)],
        account
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const contractAddress = receipt.contractAddress
      if (!contractAddress) throw new Error('No contract address in receipt')

      if (this.state.contract !== contractAddress) {
        console.log('Contract successfully created: ' + contractAddress)

        const { reference, askingPrice } = this.state
        if (!reference) return
        const callbackWhenDone = () => this.setState({ reference: '', askingPrice: 0, inProgress: false })

        const newGoldBar = { 
          contract: contractAddress,
          reference: reference,
          owner: this.state.account,
          askingPrice: askingPrice,
          state: 'Available',
          buyer: '',
          offerPrice: 0
        }
        this.props.dispatch(reduxApi.actions.goldbars.post({}, { body: JSON.stringify(newGoldBar) }, callbackWhenDone))
        
        this.setState( {contract: contractAddress})
      }
    } catch (error) {
      console.error(error.message || error)
      this.setState({ inProgress: false })
    }
  }

  async handleMakeOffer (goldbar, index, goldbarId, event) {
    const guard = this.getActionGuardStatus()
    if (!guard.ok) {
      this.showActionGuardMessage(guard.reason)
      return
    }

    if (goldbar.state != "Available") {
      window.alert('Gold bar not available.')
      return
    }

    if (this.state.account == goldbar.owner) {
      window.alert("You are the owner, you can't make an offer.")
      return
    }

    const offer = window.prompt('Your offer:', goldbar.askingPrice)
    if (!offer) return

    this.setState({ inProgress: true })

    const { walletClient, publicClient } = this.state
    if (!walletClient || !publicClient) {
      console.error('No wallet client available')
      this.setState({ inProgress: false })
      return
    }

    try {
      const [account] = await walletClient.getAddresses()
      const hash = await walletClient.writeContract({
        address: goldbar.contract,
        abi: contractABI,
        functionName: 'MakeOffer',
        args: [BigInt(offer)],
        account
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Transaction confirmed: ' + receipt.transactionHash)

      const callbackWhenDone = () => this.setState({ inProgress: false })

      goldbar.offerPrice = offer
      goldbar.buyer = this.state.account
      goldbar.state = "Offer Placed"

      this.props.dispatch(reduxApi.actions.goldbars.put({ id: goldbarId }, { body: JSON.stringify(goldbar) }, callbackWhenDone))
    } catch (error) {
      console.error(error.message || error)
      this.setState({ inProgress: false })
    }
  }

  async handleAcceptOffer (goldbar, index, goldbarId, event) {
    const guard = this.getActionGuardStatus()
    if (!guard.ok) {
      this.showActionGuardMessage(guard.reason)
      return
    }

    if (goldbar.state != "Offer Placed") {
      window.alert('No offer has been placed.')
      return
    }

    if (this.state.account != goldbar.owner) {
      window.alert("You are not the owner, you can't accept the offer.")
      return
    }

    this.setState({ inProgress: true })

    const { walletClient, publicClient } = this.state
    if (!walletClient || !publicClient) {
      console.error('No wallet client available')
      this.setState({ inProgress: false })
      return
    }

    try {
      const [account] = await walletClient.getAddresses()
      const hash = await walletClient.writeContract({
        address: goldbar.contract,
        abi: contractABI,
        functionName: 'AcceptOffer',
        args: [],
        account
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Transaction confirmed: ' + receipt.transactionHash)

      const callbackWhenDone = () => this.setState({ inProgress: false })

      goldbar.state = "Accepted"

      this.props.dispatch(reduxApi.actions.goldbars.put({ id: goldbarId }, { body: JSON.stringify(goldbar) }, callbackWhenDone))
    } catch (error) {
      console.error(error.message || error)
      this.setState({ inProgress: false })
    }
  }

  async handleRejectOffer (goldbar, index, goldbarId, event) {
    const guard = this.getActionGuardStatus()
    if (!guard.ok) {
      this.showActionGuardMessage(guard.reason)
      return
    }

    if (goldbar.state != "Offer Placed") {
      window.alert('No offer has been placed.')
      return
    }

    if (this.state.account != goldbar.owner) {
      window.alert("You are not the owner, you can't reject the offer.")
      return
    }

    this.setState({ inProgress: true })

    const { walletClient, publicClient } = this.state
    if (!walletClient || !publicClient) {
      console.error('No wallet client available')
      this.setState({ inProgress: false })
      return
    }

    try {
      const [account] = await walletClient.getAddresses()
      const hash = await walletClient.writeContract({
        address: goldbar.contract,
        abi: contractABI,
        functionName: 'Reject',
        args: [],
        account
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Transaction confirmed: ' + receipt.transactionHash)

      const callbackWhenDone = () => this.setState({ inProgress: false })

      goldbar.state = "Available"
      goldbar.buyer = ""

      this.props.dispatch(reduxApi.actions.goldbars.put({ id: goldbarId }, { body: JSON.stringify(goldbar) }, callbackWhenDone))
    } catch (error) {
      console.error(error.message || error)
      this.setState({ inProgress: false })
    }
  }

  render () {
    const { goldbars } = this.props;

    const isLoggedIn = this.state.isLoggedIn;
    const { chainOk, chainId, walletStatus, readonly } = this.state
    const actionsDisabled = !this.getActionGuardStatus().ok
    const disabledReason = this.getActionDisabledReason()

    const goldbarsList = goldbars.data
      ? goldbars.data.map((goldbar, index) => 
        <GoldBarItem
          key={index}
          goldbar={goldbar}
          index={index}
          inProgress={this.state.inProgress}
          actionsDisabled={actionsDisabled}
          disabledReason={disabledReason}
          handleMakeOffer={this.handleMakeOffer.bind(this, goldbar)}
          handleAcceptOffer={this.handleAcceptOffer.bind(this, goldbar)}
          handleRejectOffer={this.handleRejectOffer.bind(this, goldbar)}
        />
      )
      : []

      
    if (isLoggedIn) {
      return <main>
      <PageHead
        title='Gold bars exchange platform'
        description='Gold bars exchange platform'
      />

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              <Icon color="primary">account_balance</Icon> Gold bars exchange
            </Typography>
            <Typography component="h6" gutterBottom>
              Blockchain-Based Platform for the Physical Trade of Commodities
            </Typography>
          </Box>
          <WalletBanner
            walletStatus={walletStatus}
            chainId={chainId}
            chainOk={chainOk}
            readonly={readonly}
            onSwitchChain={this.handleSwitchChain.bind(this)}
            onConnect={this.handleConnectWallet.bind(this)}
            onDisconnect={this.handleDisconnectWallet.bind(this)}
          />
        </Box>
        <Divider sx={{ mt: 2 }} />
      </Box>
      {!chainOk && (
        <Typography variant="body2" color="error" gutterBottom>
          Wrong network: please switch to Polygon Amoy to use actions.
        </Typography>
      )}
      {readonly && (
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Readonly mode enabled. Actions are disabled.
        </Typography>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Trade Physical Gold, Secured On-Chain
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Create listings, place offers, and finalize trades with transparent ownership and pricing.
        </Typography>
      </Box>

      <Typography variant="body2" gutterBottom>
        Polygon account <a href={this.state.etherscan}>{this.state.account}</a>
        {' '}| <Link href="/status">wallet/chain status</Link>
      </Typography>

      <Box sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Gold bar reference</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Buyer</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align-right="true">Ask Price</TableCell>
            <TableCell align-right="true">Last Offer</TableCell>
            <TableCell>actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {goldbarsList}
        </TableBody>
      </Table>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          List a new gold bar
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <Input className="inputText" placeholder='Enter a gold bar reference' value={this.state.reference} onChange={this.handleChangeInputReference.bind(this)} disabled={this.state.inProgress} />
          <Input className="inputText" type="number" value={this.state.askingPrice} onChange={this.handleChangeInputAskingPrice.bind(this)} disabled={this.state.inProgress} />
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleAdd.bind(this)}
            disabled={this.state.inProgress || actionsDisabled}
          >
            Add gold bar
          </Button>
        </Stack>
      </Box>
    </main>
    }
    else
    {
      return <main>
      <PageHead
        title='Gold bars exchange platform'
        description='Gold bars exchange platform'
      />
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              <Icon color="primary">account_balance</Icon> Gold bars exchange
            </Typography>
            <Typography component="h6" gutterBottom>
              Blockchain-Based Platform for the Physical Trade of Commodities
            </Typography>
          </Box>
          <WalletBanner
            walletStatus={walletStatus}
            chainId={chainId}
            chainOk={chainOk}
            readonly={readonly}
            onSwitchChain={this.handleSwitchChain.bind(this)}
            onConnect={this.handleConnectWallet.bind(this)}
            onDisconnect={this.handleDisconnectWallet.bind(this)}
          />
        </Box>
        <Divider sx={{ mt: 2 }} />
      </Box>
      {!chainOk && (
        <Typography variant="body2" color="error" gutterBottom>
          Wrong network: please switch to Polygon Amoy to use actions.
        </Typography>
      )}
      {readonly && (
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Readonly mode enabled. Actions are disabled.
        </Typography>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Trade Physical Gold, Secured On-Chain
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Connect your wallet to create listings and manage offers on Polygon Amoy.
        </Typography>
      </Box>

      <p>Please, connect your Polygon account.</p>
      {walletStatus === 'locked' && <p>Wallet locked or no accounts. Unlock MetaMask and retry.</p>}
      {walletStatus === 'no_wallet' && <p>No wallet detected. Install MetaMask.</p>}
      {walletStatus === 'read_only' && <p>Read-only provider detected. Connect a wallet for transactions.</p>}
      {walletStatus === 'connecting' && <p>Connecting to wallet...</p>}
      {walletStatus === 'error' && <p>Wallet error. Please retry.</p>}
      <p>
        <label>
          <input
            type="checkbox"
            checked={readonly}
            onChange={(e) => this.setState({ readonly: e.target.checked })}
          />
          {' '}Readonly mode
        </label>
      </p>
      </main>
    }
  };
}

IndexPage.getInitialProps = wrapper.getInitialPageProps((store) => async ({ query }) => {
  const goldbars = await store.dispatch(reduxApi.actions.goldbars.sync())
  return { goldbars, query }
})

export default withGoldBars(IndexPage)
