// pages/_app.js
import React from 'react'
import { Provider } from 'react-redux'
import { wrapper } from '../redux/reduxApi.js'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '../lib/theme'
import AppLayout from '../components/AppLayout'

function MyApp({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest)
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppLayout>
          <Component {...props.pageProps} />
        </AppLayout>
      </ThemeProvider>
    </Provider>
  )
}

export default wrapper.withRedux(MyApp)
