const WalletBanner = ({
  walletStatus,
  chainId,
  chainOk,
  readonly,
  onSwitchChain,
  onConnect,
  onDisconnect
}) => (
  <div style={{ padding: '0.6em', border: '1px solid #ddd', background: '#fafafa', height: '100%', boxSizing: 'border-box' }}>
    <strong>Wallet:</strong> {walletStatus} | <strong>Chain:</strong> {chainId || 'n/a'} {chainOk ? '(Amoy)' : '(wrong)'}
    {readonly && <span style={{ marginLeft: '0.5em', color: '#555' }}>(readonly)</span>}
    {!chainOk && (
      <button onClick={onSwitchChain} style={{ marginLeft: '0.5em' }}>
        Switch to Amoy
      </button>
    )}
    {walletStatus !== 'connected' && (
      <button onClick={onConnect} style={{ marginLeft: '0.5em' }}>
        Connect wallet
      </button>
    )}
    {walletStatus === 'connected' && (
      <button onClick={onDisconnect} style={{ marginLeft: '0.5em' }}>
        Disconnect
      </button>
    )}
  </div>
)

export default WalletBanner
