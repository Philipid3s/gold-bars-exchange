import { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import CloseIcon from '@mui/icons-material/Close'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import BlockIcon from '@mui/icons-material/Block'
import LoopIcon from '@mui/icons-material/Loop'
import UndoIcon from '@mui/icons-material/Undo'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'

const Section = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
      {title}
    </Typography>
    {children}
  </Box>
)

const Step = ({ number, children }) => (
  <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.85rem',
        flexShrink: 0,
        mt: 0.2
      }}
    >
      {number}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2" component="div">{children}</Typography>
    </Box>
  </Box>
)

const Rule = ({ icon, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
    <Box sx={{ color: 'text.secondary', mt: 0.1, flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography variant="body2">{children}</Typography>
  </Box>
)

const CodeBlock = ({ children }) => (
  <Box
    component="pre"
    sx={{
      bgcolor: '#f5f5f5',
      border: '1px solid #e0e0e0',
      borderRadius: 1,
      p: 1.5,
      mt: 0.5,
      mb: 1,
      fontSize: '0.82rem',
      fontFamily: 'monospace',
      overflowX: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }}
  >
    {children}
  </Box>
)

const HelpDialog = () => {
  const [open, setOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex' }}>
      <Button
        variant="outlined"
        startIcon={<HelpOutlineIcon />}
        onClick={() => setOpen(true)}
        sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
      >
        Guide
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
              Gold Bars Exchange - Guide
            </Typography>
            <Chip label="Testnet" size="small" color="warning" variant="outlined" />
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>

          {/* ── Testnet notice ── */}
          <Alert severity="warning" sx={{ mb: 3 }}>
            This is a <strong>prototype on Polygon Amoy testnet</strong>. No real funds or physical assets are involved.
            All transactions use free test POL tokens. Prices are reference numbers only — no cryptocurrency is transferred between parties.
          </Alert>

          {/* ── Objective ── */}
          <Section title="What is this?">
            <Typography variant="body2" paragraph>
              Gold Bars Exchange demonstrates how physical commodity trading can be made transparent
              using blockchain. Each gold bar listing deploys its own smart contract on Polygon Amoy.
              Offers, acceptances, and rejections are recorded on-chain as an immutable audit trail,
              while metadata (reference, owner, price) is stored in MongoDB for fast querying.
            </Typography>
          </Section>

          <Divider sx={{ mb: 3 }} />

          {/* ── Workflow ── */}
          <Section title="Trading Workflow">
            <Step number="1">
              <strong>Connect wallet</strong> - Click "Connect wallet" to link your MetaMask account.
              If you are on the wrong network, click "Switch to Amoy".
            </Step>
            <Step number="2">
              <strong>List a gold bar</strong> - Fill in a reference (e.g. serial number) and an asking
              price, then click "Add gold bar". MetaMask will prompt you to confirm the smart-contract
              deployment transaction (gas fees in test POL apply).{' '}
              <Typography variant="body2" component="span" sx={{ color: 'text.secondary' }}>
                The price is a plain integer reference number, not an amount of cryptocurrency.
              </Typography>
            </Step>
            <Step number="3">
              <strong>Make an offer</strong> - On a listing you do not own with status <em>Available</em>,
              click the offer icon and enter your price. This calls <code>MakeOffer</code> on the
              listing's contract and sets its status to <em>Offer Placed</em>.
            </Step>
            <Step number="4">
              <strong>Accept or reject</strong> - The listing owner can accept or reject the pending offer
              via the action buttons. <strong>Accepting</strong> calls <code>AcceptOffer</code> and marks
              the listing as <em>Accepted</em>. <strong>Rejecting</strong> calls <code>Reject</code>,
              clears the buyer and offer price, and resets the listing back to <em>Available</em> so new
              offers can be made.
            </Step>
            <Step number="5">
              <strong>View status</strong> - The table refreshes after each action. Each row shows the
              current state, owner, buyer, prices, and available action buttons.
            </Step>
          </Section>

          {/* ── Rules callout ── */}
          <Box
            sx={{
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.200',
              borderLeft: '4px solid',
              borderLeftColor: 'primary.main',
              borderRadius: 1,
              p: 2,
              mb: 3
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Rules at a glance
            </Typography>
            <Rule icon={<BlockIcon fontSize="small" />}>
              You cannot make an offer on your own listing.
            </Rule>
            <Rule icon={<LoopIcon fontSize="small" />}>
              Only one offer can be active at a time. The owner must reject it before a new offer can be placed.
            </Rule>
            <Rule icon={<UndoIcon fontSize="small" />}>
              Rejecting an offer resets the listing to <em>Available</em> and clears the buyer.
            </Rule>
            <Rule icon={<AttachMoneyIcon fontSize="small" />}>
              Prices are reference numbers only — no cryptocurrency is transferred between parties.
            </Rule>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* ── Polygon Setup ── */}
          <Section title="Set Up a Polygon Amoy Test Account">
            <Typography variant="body2" paragraph>
              Follow these steps to get a wallet with free test tokens so you can interact with the smart contracts.
            </Typography>

            <Step number="1">
              <strong>Install MetaMask</strong><br />
              Go to{' '}
              <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">
                metamask.io
              </a>{' '}
              and install the browser extension. Create a new wallet and save your seed phrase securely.
            </Step>

            <Step number="2">
              <strong>Add the Polygon Amoy network</strong><br />
              Open MetaMask, go to Settings, then Networks, then Add a network, and enter:
              <CodeBlock>
{`Network Name:      Polygon Amoy Testnet
RPC URL:           https://rpc-amoy.polygon.technology/
Chain ID:          80002
Currency Symbol:   POL
Block Explorer:    https://amoy.polygonscan.com/`}
              </CodeBlock>
              Save and switch to the new network.
            </Step>

            <Step number="3">
              <strong>Get free test tokens (POL)</strong><br />
              Visit the Polygon faucet:{' '}
              <a href="https://faucet.polygon.technology" target="_blank" rel="noopener noreferrer">
                faucet.polygon.technology
              </a>
              <br />
              Select the <strong>Amoy</strong> network, paste your MetaMask wallet address, and request tokens.
              You should receive test POL within a few seconds.
            </Step>

            <Step number="4">
              <strong>Verify your balance</strong><br />
              Back in MetaMask, confirm your POL balance is greater than 0. You can also check on the
              block explorer:{' '}
              <a href="https://amoy.polygonscan.com" target="_blank" rel="noopener noreferrer">
                amoy.polygonscan.com
              </a>
            </Step>

            <Step number="5">
              <strong>Connect to the app</strong><br />
              Return to Gold Bars Exchange and click "Connect wallet".
              MetaMask will ask you to approve the connection. Once connected, your address appears
              in the header and you can start creating listings and trading.
            </Step>
          </Section>

        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setOpen(false)} variant="contained" size="small">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default HelpDialog
