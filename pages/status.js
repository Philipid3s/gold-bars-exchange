import { Component } from 'react'
import PageHead from '../components/PageHead'
import { createViemClients, ensureAmoyChain } from '../lib/viem'
import { networks } from '../contracts/networks'
import WalletBanner from '../components/WalletBanner'

class StatusPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      account: '',
      chainId: null,
      chainOk: false,
      walletConnected: false,
      error: '',
      walletClient: null
    }
  }

  async componentDidMount() {
    const clients = await createViemClients()
    if (!clients) {
      this.setState({ error: 'No wallet/provider detected.' })
      return
    }

    const { walletClient } = clients
    if (!walletClient) {
      this.setState({ error: 'Wallet client not available.' })
      return
    }

    try {
      const accounts = await walletClient.getAddresses()
      const chainId = await walletClient.getChainId()
      this.setState({
        account: accounts[0] || '',
        chainId,
        chainOk: chainId === networks.polygonAmoy.chainId,
        walletConnected: accounts.length > 0,
        walletClient
      })
    } catch (err) {
      this.setState({ error: err.message || 'Failed to load wallet status.' })
    }
  }

  async handleConnectWallet () {
    const { walletClient } = this.state
    if (!walletClient) {
      this.setState({ error: 'Wallet client not available.' })
      return
    }
    try {
      await walletClient.requestAddresses()
      const accounts = await walletClient.getAddresses()
      const chainId = await walletClient.getChainId()
      this.setState({
        account: accounts[0] || '',
        chainId,
        chainOk: chainId === networks.polygonAmoy.chainId,
        walletConnected: accounts.length > 0
      })
    } catch (err) {
      this.setState({ error: err.message || 'Failed to connect wallet.' })
    }
  }

  async handleSwitchChain () {
    const { walletClient } = this.state
    if (!walletClient) {
      this.setState({ error: 'Wallet client not available.' })
      return
    }
    const result = await ensureAmoyChain(walletClient)
    if (result.ok) {
      this.setState({ chainId: result.chainId, chainOk: true })
    } else {
      this.setState({ error: 'Failed to switch chain.' })
    }
  }

  handleDisconnectWallet () {
    this.setState({
      account: '',
      walletConnected: false
    })
  }

  render () {
    const { account, chainId, chainOk, walletConnected, error } = this.state
    return (
      <main>
        <PageHead
          title='Wallet / Chain Status'
          description='Wallet and chain status'
        />

        <h2>Wallet / Chain Status</h2>

        {error && <p>{error}</p>}

        <WalletBanner
          walletStatus={walletConnected ? 'connected' : 'locked'}
          chainId={chainId}
          chainOk={chainOk}
          readonly={false}
          onSwitchChain={this.handleSwitchChain.bind(this)}
          onConnect={this.handleConnectWallet.bind(this)}
          onDisconnect={this.handleDisconnectWallet.bind(this)}
        />

        <p>Wallet connected: {walletConnected ? 'yes' : 'no'}</p>
        <p>Account: {account || 'n/a'}</p>
        <p>Chain ID: {chainId || 'n/a'}</p>
        <p>Expected: {networks.polygonAmoy.chainId} ({networks.polygonAmoy.name})</p>
        <p>On Amoy: {chainOk ? 'yes' : 'no'}</p>
        {!chainOk && (
          <button onClick={this.handleSwitchChain.bind(this)}>Switch to Amoy</button>
        )}
        {!walletConnected && (
          <div>
            <p>Wallet locked or no accounts.</p>
            <button onClick={this.handleConnectWallet.bind(this)}>Connect wallet</button>
          </div>
        )}
      </main>
    )
  }
}

export default StatusPage
