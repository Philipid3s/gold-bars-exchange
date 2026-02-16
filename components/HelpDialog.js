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
import CloseIcon from '@mui/icons-material/Close'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

const Section = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
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
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            Gold Bars Exchange — Guide
          </Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {/* ── Objective ── */}
          <Section title="Prototype Objective">
            <Typography variant="body2" paragraph>
              Gold Bars Exchange is a proof-of-concept demonstrating how physical commodity trading
              (gold bars) can be secured and made transparent using blockchain technology.
            </Typography>
            <Typography variant="body2" paragraph>
              Each gold bar listing deploys its own smart contract on Polygon Amoy (testnet).
              Offers, acceptances, and rejections are recorded on-chain, providing an immutable
              audit trail while metadata (reference, owner, price) is stored in MongoDB for fast querying.
            </Typography>
            <Typography variant="body2">
              This is a <strong>testnet prototype</strong> — no real funds or assets are involved.
              All transactions use free test tokens on Polygon Amoy.
            </Typography>
          </Section>

          <Divider sx={{ mb: 3 }} />

          {/* ── Workflow ── */}
          <Section title="Trading Workflow">
            <Step number="1">
              <strong>Connect wallet</strong> — Click "Connect wallet" to link your MetaMask account.
              If you are on the wrong network, click "Switch to Amoy".
            </Step>
            <Step number="2">
              <strong>List a gold bar</strong> — Fill in a reference (e.g. serial number) and an asking price,
              then click "Add gold bar". MetaMask will prompt you to confirm the smart-contract deployment transaction.
            </Step>
            <Step number="3">
              <strong>Make an offer</strong> — On a listing you do not own, click the offer icon and enter your
              price. This calls the <code>MakeOffer</code> function on the listing's contract.
            </Step>
            <Step number="4">
              <strong>Accept or reject</strong> — The owner of the listing can accept or reject the pending
              offer via the corresponding action buttons, which call <code>AcceptOffer</code> or <code>Reject</code> on-chain.
            </Step>
            <Step number="5">
              <strong>View status</strong> — The table updates in real time. Each row shows the current
              state (Available, Offer Placed, Accepted), owner, buyer, prices, and action buttons.
            </Step>
          </Section>

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
              Open MetaMask → Settings → Networks → Add a network, then enter:
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
