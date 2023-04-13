import { CLOUDNIARY_THEME_URL, SaleType, SocialLink } from '@nftmall/sdk'
import {
  Blog,
  CanvasIconSVG,
  DigitalIconSVG,
  ENV,
  FixedSaleSVG,
  PieceIconSVG,
  PrintIconSVG,
  reactIcons,
  TimedAuctionSVG,
  TShirtIconSVG,
  UnlimitedAuctionSVG,
} from '@nftmall/uikit'
import { ChainId, Token } from '@sushiswap/core-sdk'
import { AiFillGithub, AiFillLinkedin, AiOutlineGlobal, AiOutlineTwitter } from 'react-icons/ai'
// import { ETH } from './tokens'

export const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV || ENV.PROD
// @nftgeek
export const supportedChainIds =
  NODE_ENV === 'production'
    ? [ChainId.THUNDERCORE, ChainId.BSC, ChainId.BTTC] // ChainId.THUNDERCORE, ChainId.AVALANCHE, ChainId.BSC, ChainId.ETHEREUM, ChainId.MATIC]
    : [ChainId.THUNDERCORE, ChainId.BSC, ChainId.BTTC] // ChainId.THUNDERCORE, ChainId.AVALANCHE_TESTNET, ChainId.BSC_TESTNET, ChainId.RINKEBY, ChainId.MATIC_TESTNET]

export const NetworkContextName = 'NETWORK'

// a list of tokens by chain
// type ChainTokenList = {
//   readonly [chainId in ChainId]: Token[]
// }
// used to construct intermediary pairs for trading
// export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
//   [ChainId.ETHEREUM]: [],
//   [ChainId.RINKEBY]: [],
//   [ChainId.BSC]: [WETH[ChainId.BSC], ETH],
//   [ChainId.BSC_TESTNET]: [WETH[ChainId.BSC_TESTNET]],
// }

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20
export const ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E'

// used to construct the list of all pairs we consider by default in the frontend
// export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
//   [ChainId.ETHEREUM]: [],
//   [ChainId.RINKEBY]: [],
//   [ChainId.BSC]: [WETH[ChainId.BSC]],
//   [ChainId.BSC_TESTNET]: [WETH[ChainId.BSC_TESTNET]],
// }
export const PINNED_PAIRS: {
  readonly [chainId in ChainId]?: [Token, Token][]
} = {
  [ChainId.BSC]: [],
}
// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = []
// Referred from pancake

export const sampleSocialLinks: SocialLink[] = [
  { label: 'Twitter', icon: reactIcons['twitter'], href: '#' },
  { label: 'Facebook', icon: reactIcons['facebook'], href: '#' },
  { label: 'Instagram', icon: reactIcons['instagram'], href: '#' },
  { label: 'LinkedIn', icon: reactIcons['linkedin'], href: '#' },
]

export const defaultBlogs: Blog[] = [
  {
    title: 'For Innovative Projects',
    description: 'Apply for New NFT Listing',
    sub_des: 'Submit Your NFT Collection information. We will give you our best support.',
    btnName: 'Submit Your Collection',
    link: 'https://forms.gle/irLdTgojhMgZGdWe9',
    src: CLOUDNIARY_THEME_URL + 'blogs/image1.png',
    isExternal: true,
  },
  {
    title: 'How can we help you?',
    description: 'Frequently Asked Questions',
    sub_des:
      'Questions about NFT, what it is and its purpose? Questions about royalties, how to mint, buy and sell? Check out our FAQs for answers.',
    btnName: 'See More',
    link: 'https://docs.nftmall.io/faq',
    src: CLOUDNIARY_THEME_URL + 'blogs/image2.png',
    isExternal: true,
  },
  {
    title: 'Join Our Community',
    description: 'Decentralized NFT Marketplace For Everyone',
    sub_des: 'Fully transparent and healthy NFT ecosystem harnessing the power of DeFi and eCommerce',
    tooltips: [
      {
        title: 'Creators',
        data: 'NFTmall is the most creator-friendly NFT marketplace built for mainstream digital artists. Receive the full price and ongoing royalties of your artwork while paying ZERO fees.',
      },
      {
        title: 'Affiliates',
        data: "Anyone can promote favorite creator's NFTs for affiliate commission. Creators set this commission.",
      },
      {
        title: 'Collectors',
        data: 'At NFTmall, the copyright and quality of NFTs are protected. Buy with confidence.',
      },
      {
        title: 'Curators',
        data: 'Anyone can earn rewards by contributing to keep our marketplace authentic and safe.',
      },
    ],
    btnName: 'Join Community',
    link: 'https://t.me/nftmallio',
    src: CLOUDNIARY_THEME_URL + 'blogs/image3.png',
    isExternal: true,
  },
  {
    title: 'Dream To Redeem',
    description: 'Physically Redeemable NFTs',
    sub_des: 'We create a bridge between digital NFT and physical products secured with blockchain.',
    btnName: 'Create NFTs',
    link: '/create',
    src: CLOUDNIARY_THEME_URL + 'blogs/image4.png',
    isExternal: false,
  },
  {
    title: 'About Us',
    description: 'Next generation, decentralized NFT marketplace',
    sub_des: 'Designed to empower young talents and allow leading artists and creators bring their dreams to life.',
    btnName: 'Learn more About Us',
    link: 'https://nftmall.docsend.com/view/hv7mx4savkksnqb7',
    // hasVector: true,
    src: CLOUDNIARY_THEME_URL + 'blogs/image5.png',
    isExternal: true,
  },
]
export const templateBlogs = [
  {
    href: 'https://nftmall.docsend.com/view/hv7mx4savkksnqb7',
    media: CLOUDNIARY_THEME_URL + 'blogs/blog-pitch-deck.jpg',
    title: 'Pitch Deck',
    description: '',
    author: { name: 'Rakib. A | CEO', href: '' },
    date: 'March, 2021',
  },
  {
    href: 'https://nftmall.docsend.com/view/aqitrk9vsfhbahe8',
    media: CLOUDNIARY_THEME_URL + 'blogs/blog-white-paper.jpg',
    title: 'White Paper',
    description: '',
    author: { name: 'Rakib. A | CEO', href: '' },
    date: 'March, 2021',
  },
  {
    href: 'https://www.notion.so/nftmall/NFTmall-vs-Leading-NFT-Marketplaces-dd20600dfe924c40b5f220bfed7969c2',
    media: CLOUDNIARY_THEME_URL + 'blogs/blog-token-econmics.jpg',
    title: 'NFTmall vs Leading NFT Marketplaces',
    description: '',
    author: { name: 'Eduardo. M | CTO', href: '' },
    date: 'March, 2021',
  },
]
export const companyTeam = [
  {
    image: CLOUDNIARY_THEME_URL + 'team/Rakib.jpg',
    name: 'MD Rakib Ahamed',
    title: 'Founder & CEO',
    summary: `Rakib Ahamed is a PGD in International Business Administration, from Anglia Ruskin University, Cambridge. He is experienced in Economics, Business Administration & Management, and passionate about blockchain research and development. He is also a Blockchain & Cryptography enthusiast and a dedicated supporter, his passion for Blockchain & Technology along with his Business expertise creates a unique blend!
    `,
    links: [
      {
        label: 'linkedin',
        href: 'https://www.linkedin.com/in/md-rakib-ahamed-156886158',
        icon: AiFillLinkedin,
      },
      {
        label: 'twitter',
        href: 'https://twitter.com/wolverinv2',
        icon: AiOutlineTwitter,
      },
    ],
  },
  {
    image: CLOUDNIARY_THEME_URL + 'team/Eduardo.jpg',
    name: 'Eduardo Moreira',
    title: 'Chief Technology Officer',
    summary: `Eduardo has international experience working and living in the United States, Latin America, and Europe. With an MBA in background and experience as an IT Director, CTO, and CEO in various multinational companies such as Clover Technology (1.3bn revenue per year based in Chicago) and Mind Gym(40M based in London). He also owns a software company called EYSS! He is now helping others achieve technical efficiencies and positive market disruptions using decentralized technologies as part of our Digital Transformation programs. He previously served as an advisor at Polkalokr, PAIR Tech, Orion Protocol and Alliance Block.`,
    links: [
      {
        label: 'linkedin',
        href: 'https://www.linkedin.com/in/itdirectoreduardomoreira/',
        icon: AiFillLinkedin,
      },
    ],
  },
  // {
  //   image: CLOUDNIARY_THEME_URL + 'team/Arsani.jpg',
  //   name: 'Arsani Boshra',
  //   title: 'Backend Engineer & Techlead',
  //   summary: `An international software engineer with 12+ years of experience in software development. Wearing different hats and holding up to executive roles within international companies/teams in Egypt, KSA, USA, Europe, UK and more, while working on, designing and managing many successful projects and products in a wide variety of domains such as E-commerce, CRM, ERP, Mobile apps, Big Data, AI & ML, Distributed Systems and more. He has been focusing primarily on the development of Blockchain and decentralized solutions since 2019.`,
  //   links: [
  //     {
  //       label: 'linkedin',
  //       href: 'https://eg.linkedin.com/in/arsani-boshra-570698192',
  //       icon: AiFillLinkedin,
  //     },
  //   ],
  // },
  {
    image: CLOUDNIARY_THEME_URL + 'team/Stephen.jpg',
    name: 'Stephen Newton',
    title: 'Chief Financial Officer',
    summary: `Stephen was a founding member and CFO of Lindacoin, where they brought many first of there kind products to the market. He first entered the crypto space in 2016. He brings a plethora of knowledge to the DeFi and NFT space with experiences in the procurement of capital inflows, organizing partners, creating social media content & marketing strategies. He has a passion for the blockchain space that drives the envelope of innovation for tomorrow's future.`,
    links: [
      {
        label: 'linkedin',
        href: 'https://www.linkedin.com/in/stephen-newton-1a1b53101/',
        icon: AiFillLinkedin,
      },
    ],
  },
  {
    image: CLOUDNIARY_THEME_URL + 'team/Sunny.jpg',
    name: 'Utkarsh Baviskar',
    title: 'Chief Marketing Officer',
    summary: `Utkarsh has worked in the Blockchain industry for 3 years, gaining experience in Reserach, NFT, DEFI and Blockchain. As a seasoned Chief Marketing Officer, he is passionate about  Leadership, Team Management and Achieving Goals. In addition to Blockchain, he is also involved in Organizing meetups with developers to exchange knowledge and build a community. Outside of the office, Utkarsh enjoys MMA, Playing Drums and Learning new languages.
    He also has hands on experience of Financial tools in the following markets namely NSE/BSE, BYMA, NIKKEI, NYSE , Forex, LXSE and Crypto
    Swiss army knife`,
    links: [
      {
        label: 'linkedin',
        href: 'https://www.linkedin.com/in/sunt001/',
        icon: AiFillLinkedin,
      },
      {
        label: 'twitter',
        href: 'https://twitter.com/tisistheway',
        icon: AiOutlineTwitter,
      },
    ],
  },
  {
    image: CLOUDNIARY_THEME_URL + 'team/Brian.jpg',
    name: 'Brian Young',
    title: 'Full-stack Software Engineer',
    summary: `Brian Young is a full stack software engineer and has worked in the Blockchain industry for 3 years, gaining experience in Reserach, NFT, DeFi and Blockchain. As a seasoned Chief Developer, he is passionate about Leadership, Team Management and Achieving Goals. He has a passion for the blockchain space that drives the envelope of innovation for tomorrow's future.`,
    links: [
      {
        label: 'github',
        href: 'https://github.com/luckypal',
        icon: AiFillGithub,
      },
    ],
  },
  {
    image: CLOUDNIARY_THEME_URL + 'team/Haimson2.jpg',
    name: 'Yair Haimson',
    title: 'Business Development Manager',
    summary:
      'Entered the crypto space in 2016, gaining a comprehensive knowledge of crypto development. Working as a crypto consultant in a known firm. Yair is a former CMO at DeFi of Thrones, and big crypto enthusiastic 🤘',
    links: [
      {
        label: 'linkedin',
        href: 'https://www.linkedin.com/in/yair-haimson/',
        icon: AiFillLinkedin,
      },
      {
        label: 'twitter',
        href: 'https://twitter.com/yairhaims',
        icon: AiOutlineTwitter,
      },
    ],
  },
  {
    image: CLOUDNIARY_THEME_URL + 'team/Tony.jpg',
    name: 'Tony Ignatious',
    title: 'Director of Creative Arts',
    summary: `Tony Ignatious is a self-taught visual artist and art director who lives and works in Kerala, India. His creations reflect his vision of the future and his wonder of what lies beyond what we know. He has worked with numerous film and TV productions including the Indian Film Project, TED events while also being an active member in the NFT community making his own pieces while also working with leading NFT collectible projects.`,
    links: [
      {
        label: 'twitter',
        href: 'https://twitter.com/thelonetusker',
        icon: AiOutlineTwitter,
      },
      {
        label: 'site',
        href: 'https://www.thelonetusker.com/',
        icon: AiOutlineGlobal,
      },
    ],
  },
  {
    image: '',
    name: '+6',
    title: '',
    summary: '+6 software engineers, designers and marketers.',
    links: [],
  },
]
export const defaultHomeBlogs: Blog[] = [defaultBlogs[2], defaultBlogs[1], defaultBlogs[0]]
export const nftSelectFormats = [
  {
    title: 'Digital',
    src: <DigitalIconSVG />,
  },
  {
    title: 'Canvas',
    src: <PieceIconSVG />,
  },
  {
    title: 'Framed Canvas',
    src: <CanvasIconSVG />,
  },
  {
    title: 'Framed Print',
    src: <PrintIconSVG />,
  },
  {
    title: 'T-Shirt',
    src: <TShirtIconSVG />,
  },
]

export const nftDrawTypes = [
  {
    title: 'Piece',
    src: <PieceIconSVG />,
  },
  {
    title: 'Canvas',
    src: <CanvasIconSVG />,
  },
  {
    title: 'Print',
    src: <PrintIconSVG />,
  },
]

export const saleTypes = [
  {
    type: SaleType.FIXED_PRICE,
    title: 'Fixed price',
    src: <FixedSaleSVG />,
  },
  {
    type: SaleType.AUCTION_TIMED,
    title: 'Timed auction',
    src: <TimedAuctionSVG />,
  },
  {
    type: SaleType.AUCTION_UNLIMITED,
    title: 'Open for bids',
    src: <UnlimitedAuctionSVG />,
  },
]

export const SecurityCheckMsg =
  'Welcome to NFTmall!\n\nClick to sign in and accept the NFTmall Terms of Services: https://nftmall.io/terms\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nYour authentication status wil reset after 24 hours. \n\n'

export const TOPBAR_TEXT = '💎 Trade NFTs using $GEM, and enjoy 0% fees on all trades! 💎'
export const TOPBAR_LINK =
  'https://nftmall.medium.com/trading-nfts-with-gem-is-enabled-now-with-0-trading-fees-e86bb141cbbd'

export const REVALIDATE_1_MIN = 60 * 1
export const REVALIDATE_2_MIN = 60 * 2
export const REVALIDATE_3_MIN = 60 * 3
export const REVALIDATE_5_MIN = 60 * 5
export const REVALIDATE_10_MIN = 60 * 10
export const REVALIDATE_20_MIN = 60 * 20
export const REVALIDATE_30_MIN = 60 * 30
export const REVALIDATE_1_HOUR = 60 * 60
export const REVALIDATE_2_HOUR = 60 * 60 * 2
export const REVALIDATE_3_HOUR = 60 * 60 * 3
export const REVALIDATE_4_HOUR = 60 * 60 * 4
export const REVALIDATE_6_HOUR = 60 * 60 * 6
export const REVALIDATE_8_HOUR = 60 * 60 * 8
export const REVALIDATE_12_HOUR = 60 * 60 * 12
export const REVALIDATE_1_DAY = 60 * 60 * 24
export const REVALIDATE_7_DAY = 60 * 60 * 24 * 7
