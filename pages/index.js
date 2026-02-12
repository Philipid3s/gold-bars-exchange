import { Component } from 'react'

import reduxApi, { withGoldBars, wrapper } from '../redux/reduxApi.js'

import { createViemClients, ensureAmoyChain } from '../lib/viem'
import { encodeDeployData } from 'viem'
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
import Alert from '@mui/material/Alert';

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
    if (this.props.dispatch) {
      this.props.dispatch(reduxApi.actions.goldbars.sync())
    }
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
      readonly: false,
      addGoldBarError: ''
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

  parseWalletError (error) {
    const nestedCode = error?.cause?.code || error?.cause?.cause?.code
    const code = error?.code || nestedCode
    const details = error?.details || error?.cause?.details || error?.cause?.cause?.details
    const reason = error?.shortMessage || details || error?.message || error?.cause?.message || 'Unknown wallet error'
    const isUserRejected = code === 4001 || code === 'ACTION_REJECTED'

    if (isUserRejected) {
      return { status: 'user_rejected', reason, code, details }
    }

    return { status: 'error', reason, code, details }
  }

  buildErrorDebug (error) {
    if (!error) return null
    return {
      name: error.name,
      message: error.message,
      shortMessage: error.shortMessage,
      details: error.details,
      code: error.code,
      cause: error.cause
        ? {
            name: error.cause.name,
            message: error.cause.message,
            shortMessage: error.cause.shortMessage,
            details: error.cause.details,
            code: error.cause.code
          }
        : null
    }
  }

  buildAddGoldBarErrorMessage (walletError) {
    const raw = (walletError?.reason || '').toLowerCase()
    const details = (walletError?.details || '').toLowerCase()
    if (walletError?.status === 'user_rejected') {
      return 'Transaction canceled in MetaMask.'
    }
    if (raw.includes('exceeds the configured cap') || details.includes('exceeds the configured cap') || details.includes('tx fee')) {
      return 'Deployment blocked by fee cap. Network gas quote is too high right now. Retry in a few minutes or lower fee settings in your wallet/provider.'
    }
    if (details.includes('gas price below minimum') || details.includes('tip cap') || details.includes('minimum needed')) {
      return 'Deployment fee too low for current network minimum gas settings. Please retry.'
    }
    if (raw.includes('insufficient funds')) {
      return 'Insufficient POL balance to deploy the contract and pay gas.'
    }
    if (raw.includes('out of gas') || raw.includes('likely out of gas')) {
      return 'Deployment ran out of gas. Please retry and confirm network fee conditions.'
    }
    if (raw.includes('status: reverted')) {
      return 'Deployment transaction was mined but reverted on-chain. Contract constructor execution failed.'
    }
    if (raw.includes('internal error')) {
      return 'Wallet/RPC returned an internal error during deployment. Please retry, then check wallet network and RPC status if it continues.'
    }
    return `Add gold bar failed: ${walletError?.reason || 'Unknown error'}`
  }

  extractMinimumTipCapFromError (detailsText) {
    if (!detailsText) return null
    const text = String(detailsText)
    const match = text.match(/minimum needed\s+(\d+)/i)
    if (!match || !match[1]) return null
    try {
      return BigInt(match[1])
    } catch (err) {
      return null
    }
  }

  async handleAdd (event) {
    const guard = this.getActionGuardStatus()
    if (!guard.ok) {
      this.showActionGuardMessage(guard.reason)
      return
    }
    const ref = (this.state.reference || '').trim()
    const price = this.state.askingPrice

    if (!ref) {
      this.setState({ addGoldBarError: 'Reference is required.' })
      window.alert('Please enter a gold bar reference before deploying.')
      return
    }

    if (price === '' || Number(price) <= 0) {
      this.setState({ addGoldBarError: 'Asking price must be greater than 0.' })
      window.alert('Please enter a valid asking price greater than 0.')
      return
    }

    const data = goldBarBytecode
    
    this.setState({ inProgress: true, addGoldBarError: '' })

    const { walletClient, publicClient } = this.state
    if (!walletClient || !publicClient) {
      console.error('No wallet client available')
      this.setState({ inProgress: false })
      return
    }

    try {
      const [account] = await walletClient.getAddresses()
      const chainId = await walletClient.getChainId()
      const balance = await publicClient.getBalance({ address: account })
      const onchainConstructorPrice = BigInt(price)
      const deployData = encodeDeployData({
        abi: contractABI,
        bytecode: data,
        args: [ref, onchainConstructorPrice]
      })
      console.log('[ADD GOLD BAR] Click received. Preparing deployment request.', {
        account,
        chainId,
        balanceWei: balance.toString(),
        reference: ref,
        askingPrice: price,
        onchainConstructorPrice: onchainConstructorPrice.toString(),
        deployDataLength: deployData.length
      })
      console.log('[ADD GOLD BAR] Waiting for MetaMask confirmation...')

      let hash
      try {
        hash = await walletClient.sendTransaction({
          account,
          data: deployData
        })
      } catch (deployError) {
        console.error('[ADD GOLD BAR] Initial deploy failed. Retrying with explicit gas.', {
          error: this.buildErrorDebug(deployError)
        })

        let fallbackGas = 1500000
        let fallbackMaxFeePerGas = 45000000000 // 45 gwei
        let fallbackMaxPriorityFeePerGas = 25000000000 // 25 gwei
        console.log('[ADD GOLD BAR] Using fallback deploy params.', {
          fallbackGas: String(fallbackGas)
        })

        try {
          const minTipFromDeployError = this.extractMinimumTipCapFromError(
            deployError?.details || deployError?.cause?.details || deployError?.cause?.cause?.details
          )
          if (minTipFromDeployError) {
            const parsedMinTip = Number(minTipFromDeployError.toString())
            if (Number.isFinite(parsedMinTip) && parsedMinTip > fallbackMaxPriorityFeePerGas) {
              fallbackMaxPriorityFeePerGas = parsedMinTip
            }
          }
          const estimatedFees = await publicClient.estimateFeesPerGas()
          const feeHardCap = 80000000000
          if (estimatedFees.maxPriorityFeePerGas) {
            const estimatedTip = Number(estimatedFees.maxPriorityFeePerGas.toString())
            if (estimatedTip >= fallbackMaxPriorityFeePerGas && estimatedTip <= feeHardCap) {
              fallbackMaxPriorityFeePerGas = estimatedTip
            }
          }
          if (estimatedFees.maxFeePerGas) {
            const estimatedMax = Number(estimatedFees.maxFeePerGas.toString())
            fallbackMaxFeePerGas = estimatedMax <= feeHardCap ? estimatedMax : feeHardCap
          } else {
            fallbackMaxFeePerGas = fallbackMaxPriorityFeePerGas + 10000000000
          }
          if (fallbackMaxFeePerGas < fallbackMaxPriorityFeePerGas) {
            fallbackMaxFeePerGas = fallbackMaxPriorityFeePerGas + 5000000000
          }
          console.log('[ADD GOLD BAR] Fee estimates for fallback deploy.', {
            maxFeePerGas: String(fallbackMaxFeePerGas),
            maxPriorityFeePerGas: String(fallbackMaxPriorityFeePerGas),
            minTipFromDeployError: minTipFromDeployError ? minTipFromDeployError.toString() : null
          })
        } catch (feeError) {
          console.warn('[ADD GOLD BAR] Fee estimation failed. Using capped fallback fees.', {
            maxFeePerGas: String(fallbackMaxFeePerGas),
            maxPriorityFeePerGas: String(fallbackMaxPriorityFeePerGas),
            error: this.buildErrorDebug(feeError)
          })
        }

        // Provider currently enforces ~1 ETH tx-fee cap; keep tx strictly below this cap.
        const providerFeeCapWei = 980000000000000000
        const desiredGas = fallbackGas > 12000000 ? 12000000 : fallbackGas
        const capAwareGas = Math.floor(providerFeeCapWei / fallbackMaxFeePerGas)
        if (capAwareGas < 21000) {
          throw new Error(
            `Provider fee cap prevents deployment at current gas price. capAwareGas=${String(capAwareGas)} maxFeePerGas=${String(fallbackMaxFeePerGas)}`
          )
        }
        if (capAwareGas < desiredGas) {
          console.warn('[ADD GOLD BAR] Reducing fallback gas to satisfy provider fee cap.', {
            desiredGas: String(desiredGas),
            capAwareGas: String(capAwareGas),
            maxFeePerGas: String(fallbackMaxFeePerGas),
            providerFeeCapWei: String(providerFeeCapWei)
          })
        }
        fallbackGas = capAwareGas < desiredGas ? capAwareGas : desiredGas

        const maxTxFeeWei = fallbackGas * fallbackMaxFeePerGas
        if (maxTxFeeWei > providerFeeCapWei) {
          throw new Error(
            `Fallback tx exceeds provider fee cap after adjustment. maxTxFeeWei=${String(maxTxFeeWei)} providerFeeCapWei=${String(providerFeeCapWei)}`
          )
        }
        console.log('[ADD GOLD BAR] Fallback tx cost cap.', {
          gas: String(fallbackGas),
          maxFeePerGas: String(fallbackMaxFeePerGas),
          maxTxFeeWei: String(maxTxFeeWei),
          providerFeeCapWei: String(providerFeeCapWei)
        })

        hash = await walletClient.sendTransaction({
          account,
          data: deployData,
          gas: BigInt(fallbackGas),
          maxFeePerGas: BigInt(fallbackMaxFeePerGas),
          maxPriorityFeePerGas: BigInt(fallbackMaxPriorityFeePerGas)
        })
      }
      console.log('[ADD GOLD BAR] MetaMask submitted transaction.', { txHash: hash })

      const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 180000 })
      console.log('[ADD GOLD BAR] Transaction receipt received.', {
        txHash: receipt.transactionHash,
        status: receipt.status,
        contractAddress: receipt.contractAddress,
        gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : null,
        effectiveGasPrice: receipt.effectiveGasPrice ? receipt.effectiveGasPrice.toString() : null
      })

      if (receipt.status !== 'success') {
        let txGasLimit = null
        let likelyOutOfGas = false
        try {
          const tx = await publicClient.getTransaction({ hash })
          txGasLimit = tx?.gas ? Number(tx.gas.toString()) : null
          if (txGasLimit && receipt.gasUsed) {
            const receiptGasUsed = Number(receipt.gasUsed.toString())
            const threshold = Math.floor(txGasLimit * 0.98)
            likelyOutOfGas = receiptGasUsed >= threshold
          }
        } catch (txLookupError) {
          console.warn('[ADD GOLD BAR] Could not read transaction gas limit for revert diagnostics.', {
            error: this.buildErrorDebug(txLookupError)
          })
        }

        if (likelyOutOfGas) {
          throw new Error(
            `Deployment transaction reverted (likely out of gas). gasUsed=${receipt.gasUsed?.toString() || 'n/a'} gasLimit=${txGasLimit ? txGasLimit.toString() : 'n/a'}`
          )
        }
        throw new Error(`Deployment transaction not successful. Status: ${receipt.status}`)
      }

      const contractAddress = receipt.contractAddress
      if (!contractAddress) throw new Error('No contract address in receipt')

      if (this.state.contract !== contractAddress) {
        console.log('[ADD GOLD BAR] Contract successfully created.', {
          contractAddress
        })

        const onchainCode = await publicClient.getBytecode({ address: contractAddress })
        console.log('[ADD GOLD BAR] On-chain code verification.', {
          contractAddress,
          deployedCodeFound: Boolean(onchainCode && onchainCode !== '0x')
        })

        const newGoldBar = { 
          contract: contractAddress,
          reference: ref,
          owner: this.state.account,
          askingPrice: Number(price),
          state: 'Available',
          buyer: '',
          offerPrice: 0
        }
        const apiHeaders = { 'Content-Type': 'application/json' }
        if (process.env.NEXT_PUBLIC_API_KEY) {
          apiHeaders['x-api-key'] = process.env.NEXT_PUBLIC_API_KEY
        }
        const persistResponse = await fetch('/api/v1/goldbars', {
          method: 'POST',
          headers: apiHeaders,
          body: JSON.stringify(newGoldBar)
        })
        const persistData = await persistResponse.json().catch(() => ({}))

        console.log('[ADD GOLD BAR] Persist request sent to backend.', {
          status: persistResponse.status,
          ok: persistResponse.ok,
          contractAddress,
          owner: this.state.account,
          reference: ref,
          askingPrice: Number(price),
          response: persistData
        })

        if (!persistResponse.ok) {
          throw new Error(persistData.message || `Persist failed with status ${persistResponse.status}`)
        }

        await this.props.dispatch(reduxApi.actions.goldbars.sync())
        this.setState( {contract: contractAddress})
        this.setState({ reference: '', askingPrice: 0, inProgress: false, addGoldBarError: '' })
      }
    } catch (error) {
      const walletError = this.parseWalletError(error)
      const uiMessage = this.buildAddGoldBarErrorMessage(walletError)
      if (walletError.status === 'user_rejected') {
        console.warn('[ADD GOLD BAR] MetaMask request rejected by user.', {
          code: walletError.code,
          reason: walletError.reason
        })
      } else {
        console.error('[ADD GOLD BAR] Deployment failed.', {
          code: walletError.code,
          reason: walletError.reason,
          details: walletError.details,
          debug: this.buildErrorDebug(error)
        })
      }
      window.alert(uiMessage)
      this.setState({ inProgress: false, addGoldBarError: uiMessage })
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

    const goldbarsData = Array.isArray(goldbars?.data)
      ? (
          goldbars.data.length === 1 && Array.isArray(goldbars.data[0]?.items)
            ? goldbars.data[0].items
            : goldbars.data
        )
      : (Array.isArray(goldbars?.data?.items) ? goldbars.data.items : [])

    const goldbarsList = goldbarsData
      ? goldbarsData.map((goldbar, index) => 
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
        {this.state.addGoldBarError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {this.state.addGoldBarError}
          </Alert>
        )}
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

      <Box sx={{ mt: 2, mb: 3 }}>
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
