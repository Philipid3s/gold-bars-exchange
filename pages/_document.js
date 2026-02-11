import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render () {
    return (
      <Html>
        <Head>
          <link rel='stylesheet' href='/static/app.css' />
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Sora:wght@400;500;600;700&display=swap'
          />
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/icon?family=Material+Icons'
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
