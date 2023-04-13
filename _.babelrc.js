const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  presets: ['@nrwl/next/babel'],
  plugins:
    process.env.NEXT_PUBLIC_NODE_ENV === 'production'
      ? [
          ['styled-components', { pure: true, ssr: true }],
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ]
      : [['styled-components', { pure: true, ssr: true }]],
}
