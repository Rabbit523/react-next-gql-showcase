import { chakra, VStack } from '@chakra-ui/react'
import { defaultMetaData } from '@nftmall/sdk'
import { BannerProps, ChakraHeading, ChakraLayout, ChakraText } from '@nftmall/uikit'
import dynamic from 'next/dynamic'
import { NextSeo } from 'next-seo'
import { Fragment, memo } from 'react'

const Banner = memo(dynamic<BannerProps>(() => import('@nftmall/uikit').then((module) => module.Banner)))

function Index() {
  return (
    <Fragment>
      <NextSeo {...defaultMetaData} title={`Terms of Use | NFTmall`} />
      <Banner from="terms" />
      <ChakraLayout display="flex">
        <VStack zIndex={1} spacing={8}>
          <VStack align="initial" spacing={4} width="100%">
            <ChakraHeading as="h1" fontSize={{ base: '3xl', lg: '5xl', xl: '7xl' }} textTransform="capitalize">
              Terms of Use
            </ChakraHeading>
            <ChakraHeading as="h3">
              Welcome to NFTmall (&quot;Us&quot; or &quot;Our&quot; or &quot;We&quot;) website and thank you for
              visiting.
            </ChakraHeading>
            <ChakraText fontSize="lg" pt={8}>
              This agreement governs your access and use of the site.
            </ChakraText>
            <ChakraText fontSize="lg">
              This site also allows you to create, sell and purchase Crypto Assets via the Marketplace
              (&quot;Marketplace&quot;).
            </ChakraText>
            <ChakraText fontSize="lg">
              By performing any one of the below listed actions, you agree to be bound by this agreement and all of the
              terms incorporated herein by preference.If you do not agree to this Agreement, you may not access or use
              the Site or purchase the Crypto Assets.
            </ChakraText>
            <chakra.ul pl={8}>
              <chakra.li pb={2}>COMPLETING THE ACCOUNT REGISTRATION PROCESS</chakra.li>
              <chakra.li pb={2}>USING OUR SERVICES</chakra.li>
              <chakra.li pb={2}>LINKED METAMASK OR OTHER ETHEREUM WALLETS</chakra.li>
              <chakra.li pb={2}>PURCHASING CRYPTO ASSETS</chakra.li>
              <chakra.li pb={2}>ACCESSING, DOWNLOADING, OR USING ANY OF THE NFTmall DAPPS</chakra.li>
              <chakra.li pb={2}>
                CREATING/Minting ANY Digital Art ON THE NFTmall DAPPS AND/OR TRADING, BUYING, SELLING, TRANSFERRING OR
                RECEIVING ANY Digital Art THAT WAS CREATED ON A NFTmall DAPP
              </chakra.li>
              <chakra.li pb={2}>INTERACTING WITH THE NFTmalls smart contract SYSTEM</chakra.li>
              <chakra.li pb={2}>USING, TRANSFERRING, VOTING, BUYING, SELLING, OR RECEIVING THE GEM TOKEN OR</chakra.li>
              <chakra.li pb={2}>PARTICIPATING IN NFTmall GOVERNANCE.</chakra.li>
            </chakra.ul>
            <ChakraText>
              THIS TERMS OF USE AGREEMENT (&quot;AGREEMENT&quot;) IS IMPORTANT AND AFFECTS YOUR LEGAL RIGHTS, SO PLEASE
              READ IT CAREFULLY. PLEASE BE INFORMED THERE IS AN ARBITRATION AGREEMENT WHICH WILL, WITH LIMITED
              EXCEPTIONS, REQUIRE DISPUTES BETWEEN US TO BE SUBMITTED TO BINDING AND FINAL ARBITRATION. UNLESS YOU OPT
              OUT OF THE ARBITRATION AGREEMENT: (1) YOU WILL ONLY BE PERMITTED TO PURSUE CLAIMS AND SEEK RELIEF AGAINST
              US ON AN INDIVIDUAL BASIS, NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS OR REPRESENTATIVE ACTION OR
              PROCEEDING; AND (2) YOU ARE WAIVING YOUR RIGHT TO SEEK RELIEF IN A COURT OF LAW AND TO HAVE A JURY TRIAL
              ON YOUR CLAIMS. YOU HAVE THE OPTION TO OPT OUT OF THE BINDING ARBITRATION AGREEMENT, SUBJECT TO CERTAIN
              NOTICE REQUIREMENTS.
            </ChakraText>
            <ChakraText>
              NFTmall reserves the right to change or modify this Agreement at any time and in our sole discretion. If
              we make changes to this Agreement, we will provide notice of such changes, such as by sending an email
              notification, providing notice through the Site, or updating the &quot;Last Updated&quot; date at the
              beginning of this Agreement. By continuing to access or use the Site, you confirm your acceptance of the
              revised Agreement and all of the terms incorporated therein by reference. We encourage you to review the
              Agreement frequently to ensure that you understand the terms and conditions that apply when you access or
              use the Site. If you do not agree to the revised Agreement, you may not access or use the Site.
            </ChakraText>
          </VStack>

          <VStack align="initial" spacing={4} width="100%">
            <ChakraHeading fontSize={{ base: '2xl', lg: '3xl', xl: '5xl' }} textTransform="uppercase">
              AGREEMENT
            </ChakraHeading>
            <ChakraHeading as="h2" textTransform="uppercase">
              1. Certain defined terms and related information
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={2} width="100%">
              <ChakraText fontSize="lg" fontWeight="bold">
                1.1 NFTs and Digital Art
              </ChakraText>
              <VStack align="initial" pl={4} spacing={2} width="100%">
                <ChakraText>
                  (I). "NFTs" means Ethereum-based tokens complying with the ERC-721 standard, ERC-1155 standard, or any
                  other similar token standard.
                </ChakraText>
                <ChakraText>(II). Digital Art</ChakraText>
                <ChakraText>
                  (III). "Digital Art" means the association on Ethereum of an NFT conforming to the ERC-721 Metadata,
                  JSON Schema, ERC-1155 Metadata, or URI JSON.
                </ChakraText>
                <ChakraText>
                  (IV). The Digital Art ID of a Digital Art specifies the properties of the Digital Art, including the
                  name and description of the Digital Art (the "Digital Art Description"), a URI identifying any image
                  file associated with the Digital Art (the "Digital Art Image") and potentially other "metadata"
                  associated with the Digital Art (the Digital Art Description, Digital Art Image and such other
                  metadata, collectively, the "Digital Art Metadata"). The Digital Art Metadata for Digital Art created
                  through the NFTmall DApps are typically stored on IPFS or on other decentralised storage services
                  through an IPFS node operated by NFTmall. The Digital Art Metadata for Digital Art created outside the
                  NFTmall DApps may be stored in other ways, depending on how such Digital Art was created.
                </ChakraText>
                <ChakraText>
                  (V). As NFTmall is an open decentralised marketplace where we do not have control over the creation of
                  NFT and uploading of the work, we do not guarantee the originality or authenticity of the works
                  uploaded. Creator`s and Collector`s Rights is clearly outlined in Section 2.6 and 2.7. If there is any
                  dispute or copyright issues, please write in with full details to info@nftmall.io
                </ChakraText>
                <ChakraText>
                  (VI). NFTmall may decide to mask or make certain NFTs unavailable for search or display or for trading
                  at our discretion. Such decisions will be in extreme circumstances such as when a copyright claim has
                  been lodged or is in dispute. Such NFTs may still be visible on Third-party sites where the request
                  for removal shall be directed to the third-party sites directly.
                </ChakraText>
              </VStack>
            </VStack>
            <VStack align="initial" pl={4} spacing={2} width="100%">
              <ChakraText fontSize="lg" fontWeight="bold">
                1.2 Offerings
              </ChakraText>
              <VStack align="initial" pl={4} spacing={2} width="100%">
                <ChakraText>
                  (I). "Offerings" means the NFTmall Platform and all uses thereof, the NFTmall DApps, NFTmall DEX
                  System, GEM, NFTmall DAO and the NFTmall Governance Platform.
                </ChakraText>
                <ChakraText>
                  (II). "GEM" means the tokens with the string constant public name "NFTmall" and the string constant
                  public symbol "GEM".Each GEM entitles the holder to one vote per proposal in the NFTmall DAO or other
                  forms of Community Voting using GEM tokens
                </ChakraText>
                <ChakraText>
                  (III). "NFTmall" means the consumer software applications created, operated, and made publicly
                  available by NFTmall for transactions involving Digital Art and the NFTmall DEX System, other than the
                  NFTmall DEX System itself. On the date these Terms were first published, the NFTmall DApps consisted
                  of the world wide web application hosted at https://nftmall.io// (the "NFTmall Website"). In the
                  future, NFTmall may release one or more mobile applications (the "NFTmall Mobile Apps").
                </ChakraText>
                <ChakraText>
                  (IV). "NFTmall" means NFTmall is a decentralised project managed by NFTmall DAO and community.
                </ChakraText>
                <ChakraText>
                  (V). "NFTmall" means the unincorporated association of GEM holders. **(f)**"NFTmall DEX System" means
                  the bytecodes (aka "smart contracts") for creating, buying, selling, and transferring NFTs and Digital
                  Art that are officially supported in the NFTmall DApps. The NFTmall DEX System is comprised of the
                  bytecodes deployed to the following BSC network and visible on the NFTmall official Github.(g)
                  "NFTmall Governance Platform" means the websites, forums, technologies, and methods established from
                  time to time by NFTmall for the coordination, voting and other official activities of GEM holders in
                  connection with the NFTmall DAO.(h) "NFTmall Platform" means the NFTmall DApps and NFTmall DEX System,
                  collectively.
                </ChakraText>
              </VStack>
            </VStack>
            <VStack align="initial" pl={4} spacing={2} width="100%">
              <ChakraText fontSize="lg" fontWeight="bold">
                1.3 "BSC" means the Binance Smart chain test net and in case of a fork, the chain that is legitimately
                acknowledged to be the test chain by the BSC Foundation.
              </ChakraText>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              2. Certain general terms
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg">
                <strong>2.1 User Responsible for Accounts / Addresses.</strong> Users are responsible for all matters
                relating to their accounts (if any) on the NFTmall DApps or the blockchain accounts or addresses through
                which they interact with the Offerings, and for ensuring that all uses thereof comply fully with these
                Terms. Users are responsible for protecting the confidentiality of their login information and passwords
                (if applicable) for the NFTmall DApps or the private keys controlling the relevant blockchain accounts
                or addresses through which they interact with the Offerings.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>2.2 Right To Discontinue Offerings.</strong> NFTmall shall have the right at any time to change
                or discontinue any or all aspects or features of the Offerings.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>2.3 Right To Deny Access to Offerings.</strong> NFTmall reserves the right to terminate a User's
                access to or use of any or all of the Offerings at any time, with or without notice, for violation of
                these Terms or for any other reason, or based on the discretion of NFTmall.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>2.4 Monitoring.</strong> NFTmall shall have the right, but not the obligation, to monitor the
                content of the Offerings, to determine compliance with these Terms this Terms of Usage (TOU) and any
                operating rules established by NFTmall and to satisfy any law, regulation, or authorised government
                request. NFTmall shall have the right in its sole discretion to edit, refuse to post, or remove any
                material submitted to or posted through the Offerings. Without limiting the foregoing, NFTmall shall
                have the right to remove any material that NFTmall, in its sole discretion, finds to be in violation of
                the provisions hereof or otherwise objectionable.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>2.5 Creator's Terms.</strong> The Creator reserves all exclusive copyrights to Digital Artwork,
                including but not limited to the right to reproduce, to prepare derivative works, to display, to
                perform, and to distribute the Products.
              </ChakraText>
              <VStack align="initial" pl={4} spacing={2} width="100%">
                <ChakraText>
                  Creators expressly represent and warrant that their Product is an original creation. Creators are
                  prohibited from selling Products that consist of unlicensed or unauthorised copyrighted content,
                  including any imagery, design, audio, video, human likeness, or other unoriginal content not created
                  by the Creator, not authorised for use by the Creator, not in the public domain, or otherwise without
                  a valid claim of fair use.
                </ChakraText>
                <ChakraText>
                  Creator expressly represents and warrants that their Products listed on NFTmall contain only original
                  content otherwise authorised for use by the Creator. To the extent a Product contains unoriginal
                  content, including content from Products by other Creators, the Creator further represents and
                  warrants that it has permission to incorporate the unoriginal content.
                </ChakraText>
                <ChakraText>
                  Creator represents and warrants that the display or performance of the Product for sale on the
                  Platform is not a violation of any agreement, contract, or obligation owed to a third-party.
                </ChakraText>
                <ChakraText>
                  Failure to abide by these Terms may result in, without limitation, suspension or deletion of the
                  Creator's account, revocation of the Creator's permissions to NFTmall, delisting the Creator's items
                  on the Site, or Creator paying monetary damages.
                </ChakraText>
                <ChakraText>
                  NFTmall has the unilateral authority and discretion to remove, suspend, or revoke Creators' access to
                  NFTmall.
                </ChakraText>
                <ChakraText>
                  Creator hereby agrees to indemnify NFTmall and be held liable for any claim against NFTmall arising
                  out of the Creator's breach of these Terms.
                </ChakraText>
                <ChakraText>
                  Creator hereby releases and forever discharges NFTmall from any damages or causes of action resulting
                  from a sale of any of the Creator's listed Products occurring after the Creator's breach of these
                  Terms.
                </ChakraText>
              </VStack>
              <ChakraText fontSize="lg">
                <strong>2.6 Creator's Rights.</strong> The Creator owns all legal right, title, and interest in all
                intellectual property rights to the creative Digital Artwork underlying the Products minted by the
                Creator on the Platform, including but not limited to copyrights and trademarks. As the copyright owner,
                the Creator enjoys several exclusive rights to the Digital Artwork, including the right to reproduce,
                the right to prepare derivative Digital Artwork, the right to distribute, and the right to display or
                perform the Art.
              </ChakraText>
              <VStack align="initial" pl={4} spacing={2} width="100%">
                <ChakraText>
                  Creators hereby acknowledges, understands, and agrees that selling a Digital Artwork on NFTmall
                  constitutes an express representation, warranty, and covenant that the Creator has not, will not, and
                  will not cause another to sell, tokenize, or create another cryptographic token representing a digital
                  Digital Art for the same Digital Artwork, excepting, without limitation, the Creator's ability to
                  sell, tokenize, or create a cryptographic token or other digital asset representing a legal, economic,
                  or other interest relating to any of the exclusive rights belonging to the Creator under copyright
                  law.
                </ChakraText>
                <ChakraText>
                  The Creator hereby acknowledges, understands, and agrees that launching a Digital Artwork on NFTmall
                  constitutes an express and affirmative grant to NFTmall, its affiliates and successors, a
                  non-exclusive, world-wide, assignable, sublicensable, perpetual, and royalty-free license to make
                  copies of, display, perform, reproduce, and distribute the Digital Artwork on any media whether now
                  known or later discovered for the broad purpose of operating, promoting, sharing, developing,
                  marketing, and advertising the Site, or any other purpose related to NFTmall, including without
                  limitation, the express right to: (i) display or perform the Digital Artwork on the Site, a third
                  party platform, social media posts, blogs, editorials, advertising, market reports, virtual galleries,
                  museums, virtual environments, editorials, or to the public; (ii) create and distribute digital or
                  physical derivative Digital Artwork based on the Digital Artwork; (iii) indexing the Digital Artwork
                  in electronic databases, indexes, catalogues; and (iv) hosting, storing, distributing, and reproducing
                  one or more copies of the Digital Artwork within a distributed file keeping system, node cluster, or
                  other database (e.g., IPFS), or causing, directing, or soliciting others to do so.
                </ChakraText>
                <ChakraText>
                  Creators irrevocably release, acquit, and forever discharge NFTmall and its subsidiaries, affiliates,
                  officers, and successors of any liability for direct or indirect copyright or trademark infringement
                  for NFTmall's use of a Digital Artwork in accordance with these Terms.
                </ChakraText>
              </VStack>
              <ChakraText fontSize="lg">
                <strong>2.7 Collector's Rights.</strong> Collectors receive a cryptographic token representing the
                Creator's creative work as a piece of property, but do not own the creative work itself. Collectors may
                show off their ownership of collected Products by displaying and sharing the Product, but Collectors do
                not have any legal ownership, right, or title to any copyrights, trademarks, or other intellectual
                property rights to the Product, excepting the limited license granted by these Terms to Digital Artwork.
              </ChakraText>
              <VStack align="initial" pl={4} spacing={2} width="100%">
                <ChakraText>
                  Collectors receive a limited, worldwide, non-assignable, non-sublicensable, royalty-free license to
                  display the Digital Artwork legally owned and properly obtained by the Collector.
                </ChakraText>
                <ChakraText>
                  The Collector's limited license to display the Digital Artwork, includes, but is not limited to, the
                  right to display the Digital Artwork privately or publicly: (i) for the purpose of promoting or
                  sharing the Collector's purchase, ownership, or interest, (ii) for the purpose of sharing, promoting,
                  discussing, or commenting on the Digital Artwork; (iii) on third party marketplaces, exchanges,
                  platforms, or applications in association with an offer to sell, or trade, the Digital Artwork; and
                  (iv) within decentralised virtual environments, virtual worlds, virtual galleries, virtual museums, or
                  other navigable and perceivable virtual environments.
                </ChakraText>
                <ChakraText>
                  Collectors have the right to sell, trade, transfer, or use their Products, but Collectors may not make
                  "commercial use" of the Digital Artwork.
                </ChakraText>
                <ChakraText>
                  The Collector agrees that it may not, nor permit any third party, to do, or attempt to do, any of the
                  foregoing without the Creator's express prior written consent in each case or stated explicitly in the
                  description of the NFT: (i) modify, distort, mutilate, or perform any other modification to the Work
                  which would be prejudicial to the Creator's honour or reputation; (ii) use the Digital Artwork to
                  advertise, market, or sell any third party product or service; (iii) use the Digital Artwork in
                  connection with images, videos, or other forms of media that depict hatred, intolerance, violence,
                  cruelty, or anything else that could reasonably be found to constitute hate speech or otherwise
                  infringe upon the rights of others; (iv) incorporate the Digital Artwork in movies, videos, video
                  games, or any other forms of media for a commercial purpose, except to the limited extent that such
                  use is expressly permitted by these Terms or solely for your Collector's personal, non-commercial use;
                  (v) sell, distribute for commercial gain, or otherwise commercialise merchandise that includes,
                  contains, or consists of the Digital Artwork; (vi) attempt to trademark, copyright, or otherwise
                  acquire additional intellectual property rights in or to the Digital Artwork; (vii) attempt to mint,
                  tokenize, or create an additional cryptographic token representing the same Digital Artwork, whether
                  on or off of the NFTmall Platform; (viii) falsify, misrepresent, or conceal the authorship of the
                  Digital Artwork or the Product; or (ix) otherwise utilise the Digital Artwork for the Collector's or
                  any third party's commercial benefit.
                </ChakraText>
                <ChakraText>
                  Collectors irrevocably release, acquit, and forever discharge NFTmall and its subsidiaries,
                  affiliates, officers, and successors of any liability for direct or indirect copyright or trademark
                  infringement for NFTmall use of a Digital Artwork in accordance with these Terms.
                </ChakraText>
              </VStack>
              <ChakraText fontSize="lg">
                <strong>2.8 Display and Sales On Third Party Platforms.</strong> In the event that an NFT has been
                deemed banned due to copyright or other illegal content and has been ceased to be displayed or allowed
                to be sold and transferred on the NFTmall Platform, there are third-party marketplaces where such works
                may still be able to be displayed and sold. Both Creators and Collectors will indemnify NFTmall from any
                claims arising from such a situation. Any claims from works displayed by third-party sites should be
                directed to the said third-party site without the involvement or assistance of NFTmall.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>2.9 Copyright Notice.</strong> "NFTmall" and its logos are trademarks of NFTmall. All rights
                reserved. All other trademarks appearing in the Offerings are the property of their respective owners.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>2.10 Privacy Policy.</strong> To access the Offerings, a User must explicitly consent to
                NFTmall's privacy and data security practices, which can be found by visiting our privacy policy at
                https://NFTmall.io/privacy.
              </ChakraText>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              3. Account registration and operation
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg" fontWeight="bold">
                3.1 Account Opening and Operation.
              </ChakraText>
              <VStack align="initial" pl={4} spacing={2} width="100%">
                <ChakraText>
                  <strong>1. Connecting Ethereum Wallets.</strong> In order to use certain features of the Site, you
                  must connect an acceptable BSC wallet such as Metamask to the Site ("Wallet"). You represent and
                  warrant that you are the exclusive owner and controller of the Wallet. You are responsible for
                  maintaining the confidentiality of any financial information related to your Wallet.
                </ChakraText>
                <ChakraText>
                  <strong>2. Creating a Profile.</strong> Once you have connected your Wallet, you may choose to create
                  a profile on the Site by choosing a username and uploading an avatar. If you choose to create a
                  profile, you may choose a username.
                </ChakraText>
                <ChakraText>
                  <strong>3. Signing Out.</strong> You may sign out of the Site by disconnecting your Wallet from the
                  Site at any time, for any reason. You can do this by going onto the Site, clicking "Connect to a
                  wallet" and "Disconnect".
                </ChakraText>
                <ChakraText>
                  <strong>4. Deleting Your Profile.</strong> You may permanently delete your profile from the Site by
                  disconnecting your Wallet from your username and avatar, at any time, for any reason. You can do this
                  on the Site by clicking on "Edit Profile" and choosing the option to delete. NFTmall may also
                  permanently delete your profile.
                </ChakraText>
                <ChakraText>
                  <strong>
                    5. Consent to access, processing, and storage of your personally identifiable information ("PII").
                  </strong>{' '}
                  You consent to us accessing, processing, and retaining any personal information you provide to us for
                  the purpose of us providing Marketplace Services to you. This consent is not related to, and does not
                  affect, any rights or obligations we or you have in accordance with data protection laws, privacy
                  laws, and regulations. Please see our Privacy Policy for further information about how we process your
                  PII, and the rights you have in respect of this.
                </ChakraText>
              </VStack>
              <ChakraText fontSize="lg">
                <strong>3.2 Communication.</strong> By creating an Account, you also consent to receive electronic
                communications from NFTmall (e.g., via email or by posting notices to the Site). These communications
                may include notices about your Account (e.g., password changes, other transactional information or
                future mandatory request for information required by law) and are part of your relationship with us.
              </ChakraText>
              <VStack align="initial" pl={4} spacing={2} width="100%">
                <ChakraText>
                  You agree that any notices, agreements, disclosures or other communications that we send to you
                  electronically will satisfy any legal communication requirements, including, but not limited to, that
                  such communications be in writing. You should maintain copies of electronic communications from us by
                  printing a paper copy or saving an electronic copy. We may also send you promotional communications
                  via email, including, but not limited to, newsletters, special offers, surveys, and other news and
                  information we think will be of interest to you.
                </ChakraText>
                <ChakraText>
                  You may opt out of receiving these promotional emails at any time by following the unsubscribe
                  instructions provided therein.
                </ChakraText>
              </VStack>
              <ChakraText fontSize="lg">
                <strong>3.3 Equipment.</strong> You must provide all equipment and software necessary to connect to the
                Site and services, including but not limited to, a mobile device that is suitable to connect with and
                use the Site and services, in cases where the Site offers a mobile component. You are solely responsible
                for any fees, including Internet connection or mobile fees, that you incur when accessing the Site or
                services.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>3.4 Access Via Mobile App.</strong> These terms of use shall apply to future access to the
                NFTmall website via iOS, Android mobile apps or Mobile App Simulator either through the official app
                store or through the independent download of the software.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>3.5 Ownership of Account.</strong> Notwithstanding anything to the contrary herein, you
                acknowledge and agree that you shall have no ownership or other property interest in your Account, and
                you further acknowledge and agree that all rights in and to your Account are and shall forever be owned
                by and inure to the benefit of NFTmall.
              </ChakraText>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              4. The NFTmall Dex System and NFTmall Dapps
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg">
                <strong>4.1 Nature of NFTmall DEX System.</strong> The NFTmall DEX System is a public software utility
                deployed on Ethereum, which is accessible directly through any Ethereum node or indirectly through any
                compatible BSC "wallet" application which interacts with such a node. Through the NFTmall DEX System,
                any person may create, buy, sell, and transfer Digital Art.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>4.2 Relationship of NFTmall DEX System and NFTmall DApps.</strong> Interacting with the NFTmall
                DEX System does not require the use of the NFTmall DApps, but the NFTmall DApps provide a potentially
                more convenient and user-friendly method of reading and displaying data (including Digital Art Metadata)
                from the NFTmall DEX System and generating standard transaction messages compatible with the NFTmall DEX
                System. Interacting with the NFTmall DEX System through the NFTmall DApps requires the use of an
                independent, User-operated BSC wallet application through which the user may broadcast the transaction
                message to BSC for processing by BSC nodes. The NFTmall DApps may be used to generate standard
                transaction messages for interacting with the NFTmall DEX System and transmitting those messages to the
                wallet application. Through the wallet application, a User may broadcast the transaction message to BSC
                for processing by BSC nodes. Assuming normal operation of the wallet and the relevant BSC nodes, the BSC
                nodes should utilise such transaction messages to make function calls against the relevant bytecode, and
                ultimately include the results of such computations in an Ethereum transaction block, thus effectuating
                an interaction with the BSC DEX System.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>4.3 License to Use the NFTmall Platform.</strong> Each User, subject to and conditioned upon
                such User's acceptance of and adherence to these Terms, is hereby granted a non-transferable, personal,
                non-sublicensable license to use the NFTmall DEX System and NFTmall DApps for their intended purposes.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>4.4 Alterations to NFTmall DEX System.</strong> NFTmall may, from time to time, alter the list
                of smart contracts which are included in the NFTmall DEX System by adding or removing bytecode addresses
                from the official list of smart contracts supported by the NFTmall DApps, including pursuant to
                upgrades, forks, security incident responses or chain migrations. In the event, any bytecode is removed
                from the NFTmall DEX System, users may no longer be able to interact with or read the data that is
                associated with such bytecode through the NFTmall DApps. It is intended (though cannot be guaranteed)
                that Users would continue to be able to interact with such bytecode directly through any BSC node or
                indirectly through any compatible BSC wallet application, but such interactions may require technical
                expertise beyond those of most Users.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>4.5 Content.</strong> All content on the NFTmall Platform is created by Users. NFTmall makes no
                representations or warranties as to the quality, origin, or ownership of any content found in the
                Offerings. NFTmall shall not be liable for any errors, misrepresentations, or omissions in, of, and
                about, the content, nor for the availability of the content. NFTmall shall not be liable for any losses,
                injuries, or damages from the purchase, inability to purchase, display, or use of content.
              </ChakraText>
              <ChakraText fontSize="lg" fontWeight="bold">
                4.6 Copyright Infringement
              </ChakraText>
              <VStack align="initial" pl={4} spacing={2} width="100%">
                <ChakraText>
                  <strong> Removal Requests.</strong> NFTmall will respond to notices of alleged copyright infringement.
                  Please contact us with details of the copyright jurisdiction, your proof of copyright ownership, the
                  item said to be infringed, a signed legal declaration and your legal contact details to
                  copyright@NFTmall
                </ChakraText>
              </VStack>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              5. Fees, Commissions, Royalties and other charges
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg">
                <strong>Fees.</strong> Fees are collected on this platform in order to support the NFTmall platform
                through a buy back scheme and distribution at 60% to stakers, 10% buyback and burnGEM and 30% to
                Treasury, Fees will be payable by GEM, BNB etc. but may be changed at the discretion of NFTmall. All
                fees collected in BNB, GEM etc.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Royalty.</strong> During inception, the Creator will receive 100% of the primary sales proceeds
                and NFTmall will receive ZERO additional as Platform Fees and Royalty fees are chosen by Creator. While,
                the secondary market sales will generate a royalty of chosen% for the creator and chosen% to the seller,
                and NFTmall will receive 1% of the additional as Platform Fees. All fees are processed through one or
                several smart contracts on the BSC network and the buyer authorises the automatic collection and
                disbursement of the creator's royalty.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Automated Collection and Disbursement of Fees.</strong> The User agrees and understands that all
                fees, commissions, and royalties are transferred, processed, or initiated directly through one or more
                of the Smart Contracts on the BSC blockchain network. By transacting on the platform and by using the
                Smart Contracts, the User hereby acknowledges, consents to, and accepts all automated fees, commissions,
                and royalties for the sale of Items on the NFTmall Platform. The User hereby consents to and agrees to
                be bound by the Smart Contracts' execution and distribution of the fees, commissions, and royalties.
                Users hereby waive any entitlement to royalties or fees paid to another by operation of the Smart
                Contracts.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Consent to Automated Royalties to Creators.</strong> The User consents to the automated
                collection and disbursement to Creators of royalties for Secondary Market sales of NFTmall Items. The
                User hereby waives any first sale defense or argument with respect to Secondary Market activities
                resulting in royalty to an NFTmall Creator.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>No Representations on Price.</strong> Users acknowledge and consent to the risk that the price
                of an item purchased on the NFTmall marketplace may have been influenced by User activity outside of the
                control of NFTmall or the NFTmall Platform. NFTmall does not represent, guarantee, or warrant the
                accuracy or fairness of the price of any NFTmall Item sold or offered for sale on or off of the
                Marketplace. The User agrees and acknowledges that NFTmall is not a fiduciary nor owes any duties to any
                User of the platform, including the duty to ensure fair pricing of NFTmall Items or to police User
                behaviour on the Marketplace.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Off Market Transactions.</strong> NFTmall does not generally collect any fees, commissions, or
                royalties for transactions occurring outside of the NFTmall Marketplace and not involving the NFTmall
                Smart Contracts. To support the NFTmall Creators and the Platform, we encourage Collectors to list Items
                for sale on the NFTmall Marketplace, however, Collectors are permitted to sell or transfer their Items
                on third party exchanges. The Creator and all other Users hereby waive any entitlement to royalties or
                fees for off market transactions. The User irrevocably releases, acquits, and forever discharges NFTmall
                and its subsidiaries, affiliates, officers, and successors of any liability for royalties, fines, or
                Fees not received by the User from any off-market transaction.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>All transactions are final and non-refundable.</strong> All transactions that are done are
                subject to the immutable nature of the BSC public blockchain and may not be reversed and are final once
                it is confirmed and non-refundable.
              </ChakraText>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              6. User Conduct
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg">
                <strong>6.1 Acceptable Uses.</strong> The NFTmall and other Offerings are reserved exclusively for
                lawful consumer entertainment and Creatoric purposes (the "Permitted Uses").
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>6.2 Prohibited Uses.</strong> NFTmall is an open and decentralised platform that operates on
                full transparency and requires all participants to avoid malicious actions that may harm the platform or
                the users. Thus, Users are prohibited from the following:
              </ChakraText>
              <VStack align="initial" pl={4} spacing={2} width="100%">
                <ChakraText>
                  1. employing any device, scheme or artifice to defraud, or otherwise materially mislead, and/or
                  engaging in any act, practice, or course of business resulting in fraudulent act on NFTmall, NFTmall
                  DAO, or any member of the NFTmall Community, including impersonating or assuming any false identity.
                </ChakraText>
                <ChakraText>
                  2. creating, buy, selling, or using any Digital Art that infringes upon or in a manner infringing upon
                  the copyright, trademark, patent, trade secret, or any other intellectual property or any other
                  proprietary rights of others.
                </ChakraText>
                <ChakraText>
                  3. Users are expressly forbidden from accepting, soliciting, offering, bidding, engaging with the
                  Smart Contracts, or otherwise transacting on or off of the NFTmall Platform with the intent to
                  artificially devalue, inflate, or otherwise deceptively influence, misrepresent, or cause to be
                  misrepresented, the price of an NFTmall Item, groups of NFTmall Items, or NFTmall Items created by
                  particular Creators.
                </ChakraText>
                <ChakraText>
                  4. NFTmall Creators, Owners, and Collectors that list Items for sale on the NFTmall Marketplace are
                  expressly forbidden from bidding, purchasing, or making offers on their own listed NFTmall Items,
                  especially for the purpose of artificially influencing the price of the listed Item(s).
                </ChakraText>
                <ChakraText>
                  5. Engaging or attempting to engage in or assist any hack of, or attack, on the NFTmall DApps, NFTmall
                  DEX System, NFTmall DAO, or any member of the NFTmall Community, including any form of attack or theft
                  of Digital Art, GEM or funds, or upload of files that contain malicious software that may damage the
                  operation of another's computer or property.
                </ChakraText>
                <ChakraText>
                  6. Users are expressly and generally forbidden from engaging in any conduct that may prevent
                  competitive bidding on the NFTmall Marketplace, such as, but not limited to, "puffing," "chill
                  bidding," "shill bidding," "sham bidding," "sock puppet bidding," or "wash trading".
                </ChakraText>
                <ChakraText>
                  7. Users are expressly forbidden from engaging in any transaction on the NFTmall Marketplace for the
                  purpose of concealing economic activity not relating to NFTmall Item transactions. For example, and
                  without limitation, Users are forbidden from using the Marketplace to launder money, conceal or
                  transfer proceeds relating to criminal activity, or make payments to people for consideration other
                  than an NFTmall Item. (
                </ChakraText>
                <ChakraText>
                  8. Users agree to report suspicious market activity of other NFTmall Users. If a User suspects that
                  one or more NFTmall Users are in violation of these Terms, the User should promptly inform the NFTmall
                  team at oversight@NFTmall
                </ChakraText>
                <ChakraText>
                  9. Violating, breaching, or failing to comply with any applicable provision of these Terms or any
                  other Terms, Privacy Policy, trading policy, or other contract governing the use of any of the
                  Offerings or of any relevant NFTs or Digital Art.
                </ChakraText>
                <ChakraText>
                  10. The User hereby agrees and acknowledges that any forbidden Marketplace conduct described herein
                  may be a violation of national or international law and/or these Terms. NFTmall hereby reserves the
                  right to completely or partially restrict or revoke a User's access to the Site for violating these
                  Terms.
                </ChakraText>
                <ChakraText>
                  11. NFTmall reserves the right to continue or extend the time of an auction, close an auction, retract
                  bids, and/or re-list any Items which may have been acquired or attempted to have been acquired by a
                  User(s) in violation of these Terms. NFTmall reserves the right to amend, rectify, edit, or otherwise
                  alter NFTmall Market transaction data to mitigate market harm caused by a User's violation of these
                  terms.
                </ChakraText>
                <ChakraText>
                  12. The User irrevocably releases, acquits, and forever discharges NFTmall and its subsidiaries,
                  affiliates, officers, and successors for and against any and all past or future causes of action,
                  suits, or controversies arising out of another User's violation of the NFTmall Marketplace code of
                  conduct.
                </ChakraText>
                <ChakraText>
                  <strong>User Conduct.</strong> You agree that you will not violate any law, contract, intellectual
                  property or other third party right, and that you are solely responsible for your conduct, while
                  accessing or using the Site or participating in any Auction. You agree that you will abide by this
                  Agreement and will not:
                </ChakraText>
                <chakra.ul pl={8}>
                  <li>Provide false or misleading information to NFTmall</li>
                  <li>Use or attempt to use another user's Account without authorization from such user and NFTmall</li>
                  <li>
                    Use the Site in any manner that could interfere with, disrupt, negatively affect, or inhibit other
                    users from fully enjoying the Site, or that could damage, disable, overburden, or impair the
                    functioning of the Site in any manner
                  </li>
                  <li>
                    Reverse engineer any aspect of the Site, or do anything that might discover source code or bypass or
                    circumvent measures employed to prevent or limit access to any Service, area or code of the Site
                  </li>
                  <li>
                    Attempt to circumvent any content-filtering techniques we employ, or attempt to access any feature
                    or area of the Site that you are not authorised to access
                  </li>
                  <li>
                    Use any robot, spider, crawler, scraper, script, browser extension, offline reader, or other
                    automated means or interface not authorised by us to access the Site, extract data or otherwise
                    interfere with or modify the rendering of Site pages or functionality
                  </li>
                  <li>
                    Use data collected from our Site for any direct marketing activity (including and without
                    limitation, email marketing, SMS marketing, telemarketing, and direct marketing)
                  </li>
                  <li>Bypass or ignore instructions that control all automated access to the Site or</li>
                  <li>
                    Use the Site for any illegal or unauthorised purpose, or engage in, encourage or promote any
                    activity that violates this Agreement.
                  </li>
                  <li>
                    Use the Ethereum Platform to carry out any illegal activities, including but not limited to money
                    laundering, terrorist financing, or deliberately engaging in activities designed to adversely affect
                    the performance of the Ethereum Platform, or the Site.
                  </li>
                </chakra.ul>
              </VStack>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              7. Ownership
            </ChakraHeading>
            <ChakraText>
              All works Minted on the Platform are subject to the NFTmall License, the terms of which are described
              below. All users who receive an NFTmall Item acknowledge and agree to accept or purchase the Item subject
              to the conditions of the License.
            </ChakraText>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText>
                <strong>Ownership of an NFTmall item.</strong> Owning an NFTmall Item is similar to owning a piece of
                physical art. You own a cryptographic token representing the Creator's creative Work as a piece of
                property, but you do not own the creative underlying Work itself. Collectors may show off their
                ownership of collected NFTmall Items by displaying and sharing the Underlying Artwork, but Collectors do
                not have any legal ownership, right, or title to any copyrights, trademarks, or other intellectual
                property rights to the underlying Artwork, excepting the limited license granted by these Terms to
                Underlying Artwork. The Creator reserves all exclusive copyrights to Artworks underlying NFTmall Items
                Minted by the Creator on the Platform, including but not limited to the right to reproduce, to prepare
                derivative works, to display, to perform, and to distribute the Artworks.
              </ChakraText>
              <ChakraText>
                <strong>The Collector's Limited License to a Minted Artwork.</strong> Owning an NFTmall Item is also
                different than owning a piece of physical art. Art on the NFTmall Platform is digital, meaning that it
                is inherently easier to share, display, replicate, and distribute around cyberspace. Our community guide
                encourage Collectors to show off, promote, and share their collected Items, but the Collectors may not
                infringe on any of the exclusive rights of the copyright holder (i.e., the Creator). Collectors receive
                a limited, worldwide, non-assignable, non-sublicensable, royalty-free license to display the Artwork
                underlying NFTmall Items legally owned and properly obtained by the Collector.
              </ChakraText>
              <ChakraText>
                <strong>Collectors May Display the Artwork.</strong> The Collector's limited license to display the
                Work, or perform the Work in the case of audiovisual works, includes, but is not limited to, the right
                to display or perform the Work privately or publicly: (i) for the purpose of promoting or sharing the
                Collector's purchase, ownership, or interest in the Work, for example, on social media platforms, blogs,
                digital galleries, or other Internet-based media platforms; (ii) for the purpose of sharing, promoting,
                discussing, or commenting on the Work; (iii) on third party Marketplaces, exchanges, Platforms, or
                applications in association with an offer to sell, or trade, the Token associated with Work; and (iv)
                within decentralised virtual environments, virtual worlds, virtual galleries, virtual museums, or other
                navigable and perceivable virtual environments, including the simultaneous display of multiple copies of
                the Work within one or more virtual environments.
              </ChakraText>
              <ChakraText>
                <strong>Collectors Shall Not Make Commercial Use of Artwork.</strong> Collectors have the right to sell,
                trade, transfer, or use their NFTmall Items, but Collectors may not make "commercial use" of the
                underlying Work including, for example, by selling copies of Work, selling access to the Work, selling
                derivative works embodying the Work, or otherwise commercially exploiting the Work.
              </ChakraText>
              <ChakraText>
                <strong>Other Restrictions on the Collector's Limited License.</strong> The Collector agrees that it may
                not, nor permit any third party to, do or attempt to do any of the foregoing without the Creator's
                express prior written consent in each case: (i) modify, distort, mutilate, or perform any other
                modification to the Work which would be prejudicial to the Creator's honour or reputation; (ii) use the
                Work to advertise, market, or sell any third party product or service; (iii) use the Work in connection
                with images, videos, or other forms of media that depict hatred, intolerance, violence, cruelty, or
                anything else that could reasonably be found to constitute hate speech or otherwise infringe upon the
                rights of others; (iv) incorporate the Work in movies, videos, video games, or any other forms of media
                for a commercial purpose, except to the limited extent that such use is expressly permitted by these
                Terms or solely for your Collector's personal, non-commercial use; (v) sell, distribute for commercial
                gain, or otherwise commercialise merchandise that includes, contains, or consists of the Work; (vi)
                attempt to trademark, copyright, or otherwise acquire additional intellectual property rights in or to
                the Work; (vii) attempt to Mint, tokenize, or create an additional cryptographic token representing the
                same Work, whether on or off of the NFTmall Platform; (viii) falsify, misrepresent, or conceal the
                authorship of the Work or the NFTmall Item; or (ix) otherwise utilise the Work for the Collector's or
                any third party's commercial benefit.
              </ChakraText>
              <ChakraText>
                <strong>Limited License Belongs Only to the Current Owner of an NFTmall Item.</strong> The User agrees
                and acknowledges that the lawful ownership, possession, and title to a NFTmall Item is a necessary and
                sufficient condition precedent to receive the limited license rights to the underlying Work provided by
                these Terms. Any subsequent transfer, dispossession, burning, or other relinquishment of a NFTmall Item
                will immediately terminate the former Owner's rights and interest in the license or NFTmall Item as
                provided by these Terms.
              </ChakraText>
              <ChakraText>
                <strong>Creator's Rights and Restrictions.</strong> The Creator owns all legal right, title, and
                interest in all intellectual property rights to creative Works underlying NFTmall Items Minted by the
                Creator on the Platform, including but not limited to copyrights and trademarks. As the copyright owner,
                the Creator enjoys several exclusive rights to the Work, including the right to reproduce, the right to
                prepare derivative works, the right to distribute, and the right to display or perform the Art. Subject
                to, and in accordance with these Terms, the Creator hereby acknowledges, understands, and agrees that
                Minting a Work on the Platform constitutes an express and affirmative grant of the limited license
                rights to the Work to all subsequent Owners of the NFTmall Item, as provided herein.
              </ChakraText>
              <ChakraText>
                <strong>Creator Agrees Not to Create More Than One NFT For The Same Artwork.</strong> Creator hereby
                acknowledges, understands, and agrees that Minting a Work on the Platform constitutes an express
                representation, warranty, and covenant that the Creator has not, will not, and will not cause another to
                Mint, tokenize, or create another cryptographic token representing a digital collectable for the same
                Work on NFTmall or any other NFT Platforms, excepting, without limitation, the Creator's ability to
                Mint, tokenize, or create a cryptographic token or other digital asset representing a legal, economic,
                or other interest relating to any of the exclusive rights belonging to the Creator under copyright law.
              </ChakraText>
              <ChakraText>
                <strong>Creator Grants NFTmall a License to All Minted Works.</strong> The Creator hereby acknowledges,
                understands, and agrees that Minting a Work on the Platform constitutes an express and affirmative grant
                to NFTmall, its affiliates and successors, a non-exclusive, world-wide, assignable, sublicensable,
                perpetual, and royalty-free license to make copies of, display, perform, reproduce, and distribute the
                Work on any media whether now known or later discovered for the broad purpose of operating, promoting,
                sharing, developing, marketing, and advertising the Platform, the Site, the Marketplace, or any other
                purpose related to the NFTmall Platform or business, including without limitation, the express right to:
                (i) display or perform the Work on the Site, a third party platform, social media posts, blogs,
                editorials, advertising, market reports, virtual galleries, museums, virtual environments, editorials,
                or to the public; (ii) create and distribute digital or physical derivative works based on the Work,
                including without limitation, compilations, collective works, and anthologies; (iii) indexing the Work
                in electronic databases, indexes, catalogues, the Smart Contracts, or ledgers; and (iv) hosting,
                storing, distributing, and reproducing one or more copies of the Work within a distributed file keeping
                system, node cluster, or other database (e.g., IPFS) or causing, directing, or soliciting others to do
                so.
              </ChakraText>
              <ChakraText>
                <strong>Creator Grants Collector Exceptions.</strong> The Creator may grant the Collector exceptions to
                the NFTmall standard licensing by clearly stating this exception which may include the sales of
                Copyright or other permissible usage.
              </ChakraText>
              <ChakraText>
                <strong>User Releases NFTmall from Copyright Claims.</strong> The Creator and all Users irrevocably
                release, acquit, and forever discharge NFTmall and its subsidiaries, affiliates, officers, and
                successors of any liability for direct or indirect copyright or trademark infringement for NFTmall's use
                of a Work in accordance with these Terms, including without limitation, NFTmall's solicitation,
                encouragement, or request for Users or third parties to host the Work for the purpose of operating a
                distributed database and NFTmall's deployment or distribution of a reward, a token, or other digital
                assets to Users or third parties for hosting Works on a distributed database.
              </ChakraText>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              8. The NFTmall Dao & GEM Voting
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg">
                <strong>8.1 Purposes of NFTmallDAO</strong> The NFTmall DAO was established by NFTmall to foster
                community among the Creators, collectors, traders, and other users of the NFTmall Platform (the "NFTmall
                Community") and provide them with a voice in how the NFTmall Platform is run, maintained, marketed,
                improved, and otherwise governed ("Governance Decisions").
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>8.2 Purposes of GEM</strong> GEM is intended to be utilized by the NFTmall Community to
                participate in the NFTmall DAO, including by voting on proposed Governance Decisions ("Governance
                Proposals").
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>8.3 NFTmall DAO</strong> The NFTmall DAO is intended to be the caretaker of the NFTmall platform
                through governance decisions by GEM token holders. The governance DAO shall be developed and deployed as
                a fully automated solution responsible for all major decisions including the Platform Fees and
                allocations for platform maintenance and growth. A vote shall be undertaken to decide whether a legal
                entity is required to be set up for NFTmall DAO and the NFTmall Platform.
              </ChakraText>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              9. Supply, Allocation and distribution of GEM
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg">
                <strong>9.1 NFTmall Supply</strong> The total number of GEM is fixed at 20,000,000 GEM (the "Total
                Supply").
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>9.2 Overview of GEM Allocation and Distribution</strong> NFTmall has published its intention to
                allocate the Total Supply as follows:
              </ChakraText>
              <ChakraText fontSize="lg" fontWeight="bold">
                GEM Token Distribution:
              </ChakraText>
              <chakra.ul pl={8}>
                <li>5% (1 million) for Private sale.</li>
                <li>15% (3 million) for Public sale.</li>
                <li>5% (1 million) for Exchange Liquidity.</li>
                <li>2% (0.4 million) for Liquidity Mining.</li>
                <li>30% (6 million) for Marketplace Mining.</li>
                <li>15% (3 million) for Marketing & Educational Program.</li>
                <li>5% (1 million) for Technical Bounty & Hackathon.</li>
                <li>5% (1 million) for Strategic Partnerships.</li>
                <li>8% (1.6 million) for Team & Advisors.</li>
                <li>10% (2 million) for Foundational Reserve.</li>
              </chakra.ul>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              10. Representations and warranties of GEM receipients
            </ChakraHeading>
            <ChakraText>
              Each User hereby represents and warrants to NFTmall that the following statements and information are
              accurate and complete at all relevant times. In the event that any such statement or information becomes
              untrue as to a User, said User shall immediately divest and cease using all GEM and cease accessing and
              using all other Offerings.
            </ChakraText>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg">
                <strong>10.1 Status</strong> If a User is an individual, said User is of legal age in the jurisdiction
                in which the User resides (and in any event is older than thirteen years of age) and is of sound mind.
                If a User is a business entity, said User is duly organized, validly existing, and in good standing
                under the laws of the jurisdiction in which it is organized, and has all requisite power and authority
                for a business entity of its type to carry on its business as presently conducted.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>10.2 Power and Authority</strong> A User has all requisite capacity, power, and authority to
                accept the Terms and Conditions of these Terms, and to carry out and perform its obligations under these
                Terms. These Terms constitute a legal, valid and binding obligation of any User and are enforceable
                against any User in accordance with its terms.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>10.3 No Conflict; Compliance with the law</strong> A User agreeing to these Terms and buying,
                selling, holding, using, or receiving GEM accepts that said actions do not constitute, and would not
                reasonably be expected to result in (with or without notice, the lapse of time, or both) a breach,
                default, contravention, or violation of any law applicable to said User, or any contract or agreement to
                which said User is a party or by which the User is bound.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>10.4 Absence of Sanctions</strong> User is not (and, if User is an entity, User is not owned or
                controlled by any other person who is), acting on behalf of any other person who is identified on any
                list of prohibited parties under any law or by any nation or government, state, or other political
                subdivision thereof, any entity exercising legislative, judicial, or administrative functions of, or
                pertaining to a government, such as the lists maintained by the United Nations Security Council, the
                U.S. Government (including the U.S. Treasury Department's Specially Designated Nationals list and
                Foreign Sanctions Evaders list), the European Union (EU) or its member states, and the government of the
                User's home country. User is not, (and, if User is an entity, User is not owned or controlled by any
                other person who is), acting on behalf of any other person who is located in, an ordinarily resident of,
                organized, established, or domiciled in Venezuela, Cuba, I.R. Iran, North Korea, Sudan, Syria, the
                Crimea region (including Sevastopol), or any other country or jurisdiction against which the U.S.
                maintains economic sanctions or an arms embargo. The tokens or other funds a User uses to participate in
                the NFTmall Platform or acquire Digital Art or GEM are not derived from and do not otherwise represent
                the proceeds of, any activities are done in violation or contravention of any law.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>10.5 No Claim, Loan, Ownership Interest or Investment Purpose</strong> User understands and
                agrees that the User's purchase, sale, holding, receipt, and use of GEM and any other Offerings does
                not: (a) represent or constitute a loan, or a contribution of capital to, or other investment in NFTmall
                or any business or venture; (b) provide User with any ownership interest, equity, security, or right to
                or interest in the assets, rights, properties, revenues or profits of, or voting rights whatsoever in,
                NFTmall or any other business or venture; and (c) create or imply or entitle User to the benefits of any
                fiduciary or other agency relationship between NFTmall or any of its directors, officers, employees,
                agents or affiliates, on the one hand, and User, on the other hand. User is not entering into these
                Terms or buying, selling, holding, receiving or using GEM for the purpose of making an investment with
                respect to NFTmall or its securities, but solely wishes to use the NFTmall Platform for its intended
                purposes and participate in the NFTmall DAO in order to participate in the protection and improvement of
                the use and enjoyment of the NFTmall Platform for such purposes. The user understands and agrees that
                NFTmall will not accept, or take custody over, any Digital Art, GEM, cryptocurrencies, or other assets
                of User, and has no responsibility or control over the foregoing.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>10.6 Non-Reliance</strong> The user is knowledgeable, experienced, and sophisticated in using
                and evaluating blockchains and blockchain-related technologies and assets, including Ethereum, NFTs,
                Digital Art, and "smart contracts" (bytecode deployed to Ethereum or another blockchain). User has
                conducted its own thorough independent investigation and analysis of the NFTmall Platform, GEM, and the
                all other matters contemplated by these Terms, and has not relied upon any information, statement,
                omission, representation, or warranty, express or implied, written or oral, made by or on behalf of
                NFTmall in connection therewith, except as expressly set forth by NFTmall in these Terms.
              </ChakraText>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              11. Risks, disclaimers and limitations of liability
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg">
                <strong>11.1 No Consequential, Incidental or Punitive Damages</strong> Notwithstanding anything to the
                contrary contained in these Terms, NFTmall shall not be liable to any person, whether in contract, tort
                (including pursuant to any cause of action alleging negligence), warranty or otherwise, for special,
                incidental, consequential, indirect, punitive or exemplary damages (including but not limited to lost
                data, lost profits or savings, loss of business or other economic loss) arising out of or related to
                these Terms, whether or not NFTmall has been advised or knew of the possibility of such damages, and
                regardless of the nature of the cause of action or theory asserted.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>11.2 Limitation of Liability</strong> NFTmall's liability for damages to each User shall in all
                cases be limited to, and under no circumstances shall exceed NFTmall's service fees actually received by
                NFTmall's from such User.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>11.3 Disclaimer of Representations</strong> The Offerings are being provided on an "AS IS" and
                "AS AVAILABLE" basis. To the fullest extent permitted by law, NFTmall is not making, and hereby
                disclaims, any and all information, statements, omissions, representations and warranties, express or
                implied, written or oral, equitable, legal or statutory, in connection with the Offerings and all other
                matters contemplated by these Terms, including any representations or warranties of title,
                non-infringement, merchantability, usage, security, uptime, reliability, suitability, or fitness for any
                particular purpose, workmanship or technical quality of any code or software used in or relating to the
                Offerings. User acknowledges and agrees that any and all use of the Offerings is at the User's own risk.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>11.4 No Responsibility for Digital Art</strong> NFTmall has no responsibility for the Digital
                Art created or traded by Users on the NFTmall's Platform. NFTmall does not investigate and cannot
                guarantee or warrant the authenticity, originality, uniqueness, marketability, legality, or value of any
                Digital Art created or traded by Users on the NFTmall Platform. NFTmall does not investigate, and cannot
                guarantee or warrant, the items or services which are offered by the NFT listing such as a higher
                resolution artwork, music file, token airdrops, and any and all such items offered in the NFT listing
                and may be delivered via unlocked content.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>11.5 No Professional Advice or Liability</strong> All information provided by or on behalf of
                NFTmall is for informational purposes only.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>11.6 Limited Period for Claims</strong> Any claim or cause for action by a User must be filed
                within One month (Thirty days) from the event.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>11.7 Third-Party Offerings and Content</strong> NFTmall does not endorse or assume any
                responsibility for any activities of, or resources, products, services, content or promotions owned,
                controlled, operated or sponsored by third parties. Users use solely at their own risk and waives and
                releases NFTmall from all liability arising from Users' use. NFTmall shall not be responsible or liable,
                directly or indirectly, for any damage or loss caused, or alleged to be caused by, or in connection
                with, the use of, or reliance on, any such resources, products, services, content or promotions from
                third parties.
              </ChakraText>
              <ChakraText fontSize="lg" fontWeight="bold">
                11.8 Risks
              </ChakraText>
              <VStack align="initial" pl={4} spacing={2} width="100%">
                <ChakraText>
                  <strong>1. Use of Blockchain Technology</strong> NFTmall utilizes experimental cryptographic
                  technologies and blockchain technologies, including tokens, cryptocurrencies, stablecoins, "smart
                  contracts," consensus algorithms, voting systems, and distributed, decentralized or peer-to-peer
                  networks or systems in performing the Offerings. Each User acknowledges and agrees that such
                  technologies are novel, experimental, and speculative and that therefore there is significant
                  uncertainty regarding the operation and effects and risks thereof and the application of existing law
                  thereto.
                </ChakraText>
                <ChakraText>
                  <strong>2. Risks of Blockchain Technology</strong> The technology utilized in delivering the Offerings
                  depends on public peer-to-peer networks such as BSC that are not under the control or influence of
                  NFTmall and are subject to many risks and uncertainties. Such technologies include the NFTmall DEX
                  System, which NFTmall may have limited or no ability to change, other than ceasing to support certain
                  "smart contracts" and adding support for new "smart contracts".
                </ChakraText>
                <ChakraText>
                  <strong>3. Private Keys</strong> Since the NFTmall Platform is a non-custodial NFT DEX, each user is
                  responsible to generate and store their own private key or seed words associated with the Ethereum
                  public address. Should this private key be lost, the user shall lose access to the account and NFTmall
                  will not be able to restore or issue any refund in respect of any Digital Art or GEM.
                </ChakraText>
                <ChakraText>
                  <strong>4. Risks of Smart Contract</strong> In the event that the NFTmall DEX System or any other
                  smart contracts are affected by malfunctions, bugs, defects, malfunctions, hacking, theft, attacks,
                  negligent coding, or design choices, or changes to the protocol rules of BSC, Users may be exposed to
                  a risk of total loss and forfeiture of all Digital Art, GEM, and other relevant digital assets.
                  NFTmall assumes no liability or responsibility for any of the foregoing matters.
                </ChakraText>
                <ChakraText>
                  <strong>5. Volatile Asset Prices</strong> The prices of BNB, GEM token, and NFT Digital Art are
                  volatile, unpredictable, and subject to low liquidity. Fluctuations in the price of other digital
                  assets could materially and adversely affect the Crypto Assets, which may also be subject to
                  significant price volatility. We cannot guarantee that any purchasers of Crypto Assets will not lose
                  money. Users who engage in trading shall be aware of the nature and risks of such assets.
                </ChakraText>
                <ChakraText>
                  <strong>6. Low Liquidity Risks</strong> There may be times when the liquidity provided to the GEM
                  token market on centralised exchanges, or decentralised exchanges, is not sufficient to enable an
                  efficient price discovery process, or results in trades with a high level of slippage, or affects the
                  ability to undertake a relatively large order in comparison with the available pool size. NFT items
                  are NFTmall which are similar to the art market which tends to have low liquidity. NFTmall Platform
                  makes no expressed guarantees against such risks, and Users agree to fully indemnify NFTmall Platform
                  in such an event.
                </ChakraText>
                <ChakraText>
                  <strong>7. BSC Gas Price</strong> The NFTmall Platform is built on the BSC network, and thus, to
                  enable any transactions or processes on the BSC mainnet, payments in terms of Platform Fees are
                  required. This is also referred to as "Gas." Users must be aware that the price of BNB is volatile and
                  Gas is primarily determined by a bidding system and affected by network congestion. The fees are paid
                  directly to the BSC network and the NFTmall platform does not earn any share of the Gas fees.
                </ChakraText>
                <ChakraText>
                  <strong>8. Regulatory Risks</strong> The cryptocurrency and blockchain industry is subject to changing
                  regulatory environments. At the moment, the current FATF Travel Rule does not require AML/KYC for
                  non-custodial exchange platforms such as Uniswap, Pancakeswap or NFTmall. There are also no
                  requirements for Decentralised Autonomous Organisations (DAOs) to be registered or to have a legal
                  entity. The NFTmall Platform is subject to the decisions and direction set by the NFTmall DAO
                  Governance which shall do its best to comply with any and all relevant rules and regulations
                  worldwide.
                </ChakraText>
                <ChakraText>
                  <strong>9. Technology and Cryptography Risks</strong> Computer technology, cryptocurrency, and
                  cryptography are fields of study which are rapidly progressing and thus new and unforeseen risks (in
                  addition to those which have been identified) to the core and peripheral technology employed by the
                  NFTmall Platform will emerge and could threaten the operation and security of our platform with or
                  without our prior knowledge. The NFTmall Platform has no control over such developments, and Users
                  shall fully indemnify NFTmall from all claims arising from such events.
                </ChakraText>
                <ChakraText>
                  <strong>10. Fork Handling</strong> In the event of a fork on BSC resulting in a separate set of
                  NFTmall smart contract(s) on a new chain, the community governance shall decide whether to ignore the
                  smart contract(s) on the new chain or to proceed with deployment of a new system on a new chain,
                  keeping both chains active. The community governance vote shall be binding and considered the
                  collective decision by all creators and collectors whether they have or have not participated in the
                  vote. In such a case, there will also be duplication of the NFT and corresponding artwork, or content
                  on the new chain, which all creators and collectors shall acknowledge and accept mandatorily.
                </ChakraText>
                <ChakraText>
                  <strong>11. Software Dependencies</strong> The NFTmall DEX System, Ethereum smart contract, Metamask,
                  Infura and IPFS, as well as other essential software required to access and operate the NFTmall
                  Platform, are public software utilities without which the NFTmall Platform cannot operate and thus no
                  assurance and guarantees will be given as to the continued and unimpeded operation of the platform due
                  to the failure of such services.
                </ChakraText>
                <ChakraText>
                  <strong>12. Non-Delivery</strong> TheNFTmall Platform expects NFTs created on our platform to
                  represent digital artworks only. However, this can utilised by the users for other purposes which may
                  include token airdrops, delivery of physical items, discount vouchers, contracts, etc. There is also
                  the possibility of creators on the NFTmall Platform being commissioned by Users to deliver a custom
                  artwork or other works. There may be cases where the said works or items are not as per described or
                  of satisfactory quality. As the offer to treat and deliver the item is purely the responsibility of
                  the creator honouring such items, Users agree to do their own due diligence of such creators and
                  offerers and hold them directly liable for any breach of contract. Users agree to indemnify the
                  NFTmall Platform from any liabilities arising from the manifestation of such risks.
                </ChakraText>
                <ChakraText>
                  <strong>13. Taxes</strong> You are solely responsible for determining what, if any, taxes apply to
                  your Crypto Assets transactions. Neither NFTmall nor any other NFTmall Party is responsible for
                  determining the taxes that apply to Crypto Assets transactions.
                </ChakraText>
                <ChakraText>
                  <strong>14. Non Custodial</strong> Our Site does not store, send, or receive Crypto Assets on behalf
                  of users. This is because Crypto Assets exist only by virtue of the ownership record maintained on its
                  supporting blockchain. Any transfer of Crypto Assets occurs within the supporting blockchain and not
                  on this Site.
                </ChakraText>
                <ChakraText>
                  <strong>15. Market Risk</strong> A lack of use or public interest in the creation and development of
                  distributed ecosystems could negatively impact the development of the NFTmall Ecosystem and therefore
                  the potential utility or value of Crypto Assets.
                </ChakraText>
                <ChakraText>
                  <strong>16. Third Party Platforms</strong> The Site will rely on third-party platforms such as
                  MetaMask to perform the transactions for the creation and transaction of Crypto Assets. If we are
                  unable to maintain a good relationship with such platform providers; if the terms and conditions or
                  pricing of such platform providers change; if we violate or cannot comply with the terms and
                  conditions of such platforms; or if any such platforms loses market share or falls out of favor or is
                  unavailable for a prolonged period of time, access to and use of the Site will suffer.
                </ChakraText>
                <ChakraText>
                  <strong>17. Smart Contract May Change</strong> All works Minted on the Platform are subject to the
                  NFTmall License, the terms of which are described below. All Users who receive a NFTmall Item
                  acknowledge and agree to accept or purchase the Item subject to the conditions of the License.
                </ChakraText>
                <ChakraText>
                  <strong>18. Other Risks</strong> There may be other unidentified risks to the continued performance of
                  the platform which are outside of the control of the NFTmall Platform. Users agree to indemnify the
                  NFTmall Platform from liability as a result of such risks manifesting.
                </ChakraText>
              </VStack>
              <ChakraText fontSize="lg">
                <strong>11.9 Legal Limitations on Disclaimers</strong> Some jurisdictions do not allow the exclusion of
                certain warranties or the limitation or exclusion of certain liabilities and damages. Accordingly, some
                of the disclaimers and limitations set forth in these Terms may not apply in full to specific Users. The
                disclaimers and limitations of liability provided in these terms shall apply to the fullest extent
                permitted by applicable law.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>11.10 Personnel</strong> All provisions of these Terms, which disclaim or limit obligations or
                liabilities of NFTmall, shall also apply to all team members and affiliates of NFTmall.
              </ChakraText>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              12. Dispute resolution
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg">
                <strong>12.1 Agreement to Binding, Exclusive Arbitration.</strong> In case of dispute, buyer and seller
                parties will seek mutually final and binding arbitration through the nomination of a trusted and
                impartial body of industry professionals to be decided by NFTmall. Pre-arbitration proceedings shall
                begin by collecting claims and evidence from all partieswithin 7 days. Arbitration will be according to
                the decision of the arbitrators and shall be binding. Each of the parties will waive all rights for a
                jury trial. Invalidation of any of the terms and conditions set forth is not allowed. The proceedings
                and the knowledge of the existence of the arbitration shall be kept confidential by all parties.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>12.2 No Class Actions Permitted or Enforceable.</strong> Users shall only bring forth individual
                claims and represent only themselves; and ensure that no class action or representative action is
                undertaken or is enforceable.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>12.3 End-User Consumer Rights.</strong> No end user consumer rights will be applicable as this
                is a decentralised project that does not reside in any legal jurisdiction.
              </ChakraText>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              13. License to use our site and access content
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg">
                <strong>13.1 Limited Rights.</strong> You are hereby granted a limited, nonexclusive, non-transferable,
                revocable, non-sublicensable license to access and use the Site and Content. However, such license is
                subject to this Agreement and does not include any right to (a) sell, resell, or use commercially the
                Site or Contents, (b) distribute, publicly perform, or publicly display any Content, (c) modify or
                otherwise make any derivative uses of the Site or Content, or any portion thereof, (d) use any data
                mining, robots, or similar data gathering or extraction methods, (e) download (other than page caching)
                any portion of the Site or Content, except as expressly permitted by NFTmall, and (f) use the Site or
                Content other than for its intended purposes.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>13.2 User Content.</strong> NFTmall does not claim ownership of your User Materials. You are and
                remain the owner of your own User Materials. However, when you as a user create, upload, send, receive,
                post, publish, or store your User Materials, such as text, photos, audio, visual works, video, or other
                materials and information ("User Materials"), on, through, or in the Site, you represent that (a) you
                either are the sole and exclusive owner of all User Materials that you make available on or through the
                Site; (b) you have all rights, licenses, consents and releases that are necessary to grant to NFTmall
                the rights in and to such User Materials, as contemplated under these Terms, including without
                limitation, that you have a royalty-free, perpetual, irrevocable, worldwide, non-exclusive right
                (including any moral rights) and license to use, license, reproduce, modify, adapt, publish, translate,
                create derivative works from, distribute, derive revenue or other remuneration from, and communicate to
                the public, perform, and display your User Materials (in whole or in part) worldwide and/or to
                incorporate it in other works in any form, media, or technology now known or later developed, for the
                full term of any worldwide intellectual property right that may exist in your User Materials; (c)
                neither the User Materials nor your posting, uploading, publication, submission, or transmittal of the
                User Materials, or NFTmall's use of the User Materials (or any portion thereof) will infringe,
                misappropriate, or violate a third party's patent, copyright, trademark, trade secret, moral rights, or
                other proprietary or intellectual property rights, or rights of publicity or privacy, or result in the
                violation of any applicable law or regulation.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>13.3 Rights Assigned By User.</strong> By creating, uploading, posting, sending, receiving,
                storing, or otherwise making available any User Materials on, in, or through the Site, you grant to
                NFTmall a non-exclusive, worldwide, royalty-free, license to such User Materials to access, use, store,
                copy, modify, prepare derivative works of, distribute, publish, transmit, stream, broadcast, and
                otherwise distribute such User Materials solely for the purpose of providing and/or promoting the Site,
                such as featuring your User Materials within our Site and promoting it through our marketing ecosystem.
                To the extent applicable and permissible by law, you hereby waive any and all claims that you may now or
                hereafter have in any jurisdiction to so-called "moral rights" or right of "Droit moral" with respect to
                any of your User Materials. You may request to remove your User Materials in accordance with our privacy
                policy, which is hereby incorporated by reference.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>13.4 Survivability.</strong> If you sell your artwork to another user on the Site, then the
                license granted above with respect to such artwork shall survive termination of this Agreement.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>13.5 Removal.</strong> We have the right to remove or refuse to post any User Materials (a) for
                any or no reason in our sole discretion; (b) take any action with respect to any User Materials that we
                deem necessary or appropriate in our sole discretion, including if we believe that such User Materials
                violate the Terms of Use, infringe any intellectual property right of any person or entity, threaten the
                personal safety of users of the Site or the public, or could create liability for NFTmall; (c) disclose
                your identity or other information about you to any third party who claims that material posted by you
                violates their rights, including their intellectual property rights, or their right to privacy; (d) take
                appropriate legal action, including without limitation, referral to law enforcement, for any illegal or
                unauthorized use of the Site; (e) terminate or suspend your access to all or part of the Site for any or
                no reason, including without limitation, any violation of these Terms. Without limiting the foregoing,
                we have the right to cooperate fully with any law enforcement authorities or court order requesting or
                directing us to disclose the identity or other information of anyone posting any materials on or through
                the Site. YOU WAIVE AND HOLD HARMLESS NFTmall AND ITS AFFILIATES, LICENSEES, AND SERVICE PROVIDERS, FROM
                ANY CLAIMS RESULTING FROM ANY ACTION TAKEN BY ANY OF THE FOREGOING PARTIES DURING OR TAKEN AS A
                CONSEQUENCE OF, INVESTIGATIONS BY EITHER SUCH PARTIES OR LAW ENFORCEMENT AUTHORITIES.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>13.6 Indemnity.</strong> We cannot undertake to review all User Materials before it is posted on
                the Site, and cannot ensure prompt removal of objectionable User Material after it has been posted.
                Accordingly, we assume no liability for any action regarding transmissions, communications, or content
                provided by any User or third party.
              </ChakraText>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              14. Auctions (Future Feature)
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg">
                <strong>Static Auctions.</strong> A bid placed by a Collector in a Static Auction is a legally binding,
                revocable offer to purchase the Item at the bid price capable of immediate acceptance by the Owner of
                the Item. By placing a bid in a Static Auction, the Collector agrees to temporarily send and lose
                control over an amount of ETH equivalent to the bid price to a Smart Contract. The Smart Contract is
                configured to hold the ETH bid until either the bid is accepted by the Owner of the Item, a higher bid
                is received, or the bid is revoked. The Owner of the auctioned Item has the unilateral authority to
                accept the bid.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Bids Are Binding Offers.</strong> Collectors may obtain NFTmall Items by placing a successful
                bid during one of the bidding formats supported by the NFTmall Platform. By using the Site or Platform
                to bid on an item, the User agrees and acknowledges that a bid constitutes a legally binding offer
                exclusively between the Item Owner and the bidding User.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Transactions By Smart Contracts.</strong> All transactions on the NFTmall Marketplace (the
                "Marketplace"), including transfers, offers, sales, or purchases of NFTmall Items are initiated at the
                sole discretion of the Users. To initiate a transaction on the NFTmall Marketplace, a User must
                voluntarily invoke one or more Smart Contract operations from a BSC Wallet. The Smart Contracts are
                configured to facilitate the execution of a voluntary User offer, an acceptance of an offer, or other
                confirmation to purchase, sell, Mint, or transfer an NFTmall Item. The User agrees to be bound by the
                outcome of any Smart Contract operation by invoking, calling, requesting, or otherwise engaging with the
                Smart Contract, whether or not the Smart Contract behaves as the user expects.
              </ChakraText>
            </VStack>

            <ChakraHeading as="h2" textTransform="uppercase">
              15. Miscellaneous
            </ChakraHeading>
            <VStack align="initial" pl={4} spacing={4} width="100%">
              <ChakraText fontSize="lg">
                <strong>NFTmall is Not a Party to Marketplace Transactions.</strong> The User acknowledges and agrees
                that NFTmall is not a party to any agreement or transaction between any Users involving the purchase,
                sale, or transfer of NFTmall Items on the Platform. NFTmall reserves the right to execute Smart Contract
                transactions on the NFTmall Marketplace as a collector of NFTmall items.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Force Majeure.</strong> NFTmall shall not incur any liability or penalty for not performing any
                act or fulfilling any duty or obligation hereunder, or in connection with, the matters contemplated
                hereby by reason of any occurrence that is not within its control.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Terms Amendment and Modification.</strong> We reserve the right to amend, modify, or otherwise
                alter at any time without notice these Terms and Conditions. The most current version of these Terms
                will be published on the site and effective when the user accesses the website. Users are deemed to have
                accepted the updated terms and conditions upon access to the site.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Modifications to the Site.</strong> We reserve the right in our sole discretion to modify,
                suspend or discontinue, temporarily or permanently, the Sites (or any features or parts thereof) or
                suspend or discontinue the Auction at any time and without liability therefor.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Hyperlinks.</strong> You are granted a limited, nonexclusive, revocable, non-transferable,
                non-sublicensable right to create a text hyperlink to the Site for noncommercial purposes, provided that
                such link does not portray NFTmall or our affiliates or any of our products or services in a false,
                misleading, derogatory, or otherwise defamatory manner, and provided further that the linking site does
                not contain any adult or illegal material or any material that is offensive, harassing or otherwise
                objectionable. This limited right may be revoked at any time. You may not use a logo or other
                proprietary graphic of NFTmall to link to the Site or Content without our express written permission.
                Further, you may not use, frame or utilize framing techniques to enclose any NFTmall trademark, logo or
                other proprietary information, including the images found on the Site, the content of any text or the
                layout or design of any page, or form contained on a page, on the Site without our express written
                consent.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Third-Party Services.</strong> The Site may contain links to third-party websites ("Third-Party
                Websites") and applications ("Third-Party Applications"). When you click on a link to a Third-Party
                Website or Third-Party Application, we will not warn you that you have left our Site and are subject to
                the Agreement and Conditions (including privacy policies) of another website or destination. Such
                Third-Party Websites and Third-Party Applications are not under the control of NFTmall. NFTmall is not
                responsible for any Third-Party Websites or Third-Party Applications. NFTmall provides these Third-Party
                Websites and Third-Party Applications only as a convenience and does not review, approve, monitor,
                endorse, warrant, or make any representations with respect to Third-Party Websites or Third-Party
                Applications, or their products or services. You use all links in Third-Party Websites, and Third-Party
                Applications at your own risk. When you leave our Site, our Agreement and policies no longer govern. You
                should review any applicable agreements and policies, including privacy and data gathering practices, of
                any Third-Party Websites or Third-Party Applications, and should make whatever investigation you feel
                necessary or appropriate before proceeding with any transaction with any third party.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>External Sites.</strong> The Platform or Site may include hyperlinks to other websites or
                resources (collectively, "External Sites"), which are provided solely as a convenience to our users. We
                have no control over any External Sites. You acknowledge and agree that we are not responsible for the
                availability of any External Sites, and that we do not endorse any advertising, products, or other
                materials on, or made available from, any External Sites. Furthermore, you acknowledge and agree that we
                are not liable for any loss or damage which may be incurred as a result of the availability or
                unavailability of the External Sites, or as a result of any reliance placed by you upon the
                completeness, accuracy, or existence of any advertising, products or other materials on, or made
                available from, any External Sites.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>User Must Be Eighteen Years Old.</strong> You affirm that you are over the age of 18, as the
                platform is not intended for children under 18. If you are 13 or older but under the age of 18, or the
                legal age of majority where you reside if that jurisdiction has an older age of majority, then you agree
                to review these terms with your parent or guardian to make sure that both you and your parent or
                guardian understand and agree to these terms. You agree to have your parent or guardian review and
                accept these terms on your behalf. If you are a parent or guardian agreeing to the terms for the benefit
                of a child over 13, then you agree to, and accept full responsibility for, that child's use of the
                platform, including all financial charges and legal liability that he or she may incur.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>User Feedback.</strong> You may choose to submit comments, bug reports, ideas, or other feedback
                about the Platform by writing to info@nftmall.io, including without limitation about how to improve the
                Platform (collectively, "Feedback"). By submitting any Feedback, you agree that we are free to use such
                Feedback at our discretion and without additional compensation to you, and to disclose such Feedback to
                third parties (whether on a non-confidential basis or otherwise). You hereby grant us a perpetual,
                irrevocable, non-exclusive, worldwide license under all rights necessary for us to incorporate and use
                your Feedback for any purpose.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Indemnification.</strong> To the fullest extent permitted by applicable law, you agree to
                indemnify, defend, and hold harmless NFTmall, and our respective past, present, and future employees,
                officers, directors, contractors, consultants, equity holders, suppliers, vendors, service providers,
                parent companies, subsidiaries, affiliates, agents, representatives, predecessors, successors and
                assigns (individually and collectively, the "NFTmall Parties"), from and against all actual or alleged
                third party claims, damages, awards, judgments, losses, liabilities, obligations, penalties, interest,
                fees, expenses (including, without limitation, attorneys' fees and expenses) and costs (including,
                without limitation, court costs, costs of settlement and costs of pursuing indemnification and
                insurance), of every kind and nature whatsoever, whether known or unknown, foreseen or unforeseen,
                matured or unmatured, or suspected or unsuspected, in law or equity, whether in tort, contract, or
                otherwise (collectively, "Claims"), including, but not limited to, damages to property or personal
                injury, that are caused by, arise out of, or are related to (a) your use or misuse of the Site, Content
                or Crypto Assets, (b) any Feedback you provide, (c) your violation of this Agreement, and (d) your
                violation of the rights of a third party, including another user or MetaMask. You agree to promptly
                notify NFTmall of any third party Claims and cooperate with the NFTmall Parties in defending such
                Claims. You further agree that the NFTmall Parties shall have control of the defense or settlement of
                any third party Claims. THIS INDEMNITY IS IN ADDITION TO, AND NOT IN LIEU OF, ANY OTHER INDEMNITIES SET
                FORTH IN A WRITTEN AGREEMENT BETWEEN YOU AND NFTmall.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Ownership.</strong> Unless otherwise indicated in writing by us, the Site and all content and
                other materials contained therein, including, without limitation, the NFTmall logo and all designs,
                text, graphics, pictures, information, data, software, sound files, other files and the selection and
                arrangement thereof (collectively, "Content"), are the proprietary property of NFTmall or our
                affiliates, licensors or users, as applicable. All data that is generated on the NFTmall platform
                including blockchain transactions and smart contract interaction is owned by NFTmall and can be used to
                provide anonymised datasets to a third-party. Notwithstanding anything to the contrary in this
                Agreement, the Site and Content may include software components provided by NFTmall or its affiliates or
                a third party that are subject to separate license terms, in which case those license terms will govern
                such software components.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Termination.</strong> Notwithstanding anything contained in this Agreement, we reserve the
                right, without notice and in our sole discretion, to terminate your right to access or use the Site at
                any time and for any or no reason, and you acknowledge and agree that we shall have no liability or
                obligation to you in such event, and that you will not be entitled to a refund of any amounts that you
                have already paid to us, to the fullest extent permitted by applicable law.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Confidentiality.</strong> Users may voluntarily contact NFTmall to report serious misuses of the
                NFTmall Platform including, for example, suspicious market activity, hate speech, or other serious
                violations of these Terms. User agrees to keep confidential all private correspondence with any members
                of the NFTmall Team pertaining to another member's alleged violation of these Terms or other inquiries
                about NFTmall's policies.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Severability.</strong> If any term, clause or provision of this Agreement is held invalid or
                unenforceable, then that term, clause or provision will be severable from this Agreement and will not
                affect the validity or enforceability of any remaining part of that term, clause or provision, or any
                other term, clause or provision of this Agreement.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Survival.</strong> The following sections will survive the expiration or termination of this
                Agreement and the termination of your Account: all defined terms and all sections.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Entire Agreement.</strong> This Agreement along with any additional rules constitutes the entire
                agreement between you and NFTmall relating to your access to and use of the Sites and Content, and your
                participation in the sale, purchase or Auction transaction. This Agreement, and any rights and licenses
                granted hereunder, may not be transferred or assigned by you without the prior written consent of
                NFTmall prior, concurrent, or subsequent circumstance, and NFTmall's failure to assert any right or
                provision under this Agreement shall not constitute a waiver of such right or provision. Except as
                otherwise provided herein, this Agreement is intended solely for the benefit of the parties and is not
                intended to confer third-party beneficiary rights upon any other person or entity.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>No Assignment of the Terms.</strong> Neither party may assign or transfer any rights or
                obligations under this Agreement without the prior written consent of the other party, provided that
                NFTmall may assign this Agreement without your prior consent to any of NFTmall's affiliates, or to its
                successors in interest of any business associated with the services provided by NFTmall. This Agreement
                shall be binding upon the permitted assigns or transferees of each party.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Prevailing Language.</strong> If this Terms of Use is translated into a language other than
                English, and if the translated version is different from the English language version, the English
                language version will take precedence.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Disclaimers.</strong> Except as expressly provided to the contrary in writing by NFTmall, the
                site, content contained therein, and crypto assets listed therein are provided on an "as is" and "as
                available" basis without warranties or conditions of any kind, either express or implied. NFTmall (and
                its suppliers) make no warranty that the site: a) will meet your requirements; (b) will be available on
                an uninterrupted, timely, secure, or error-free basis; or (c) will be accurate, reliable, complete,
                legal, or safe. NFTmall disclaims all other warranties or conditions, express or implied, including
                without limitation, implied warranties or conditions of merchantability, fitness for a particular
                purpose, title and non-infringement as to the site content contained therein. NFTmall does not represent
                or warrant that content on the site is accurate, complete, reliable, current or error-free. NFTmall will
                not be liable for any loss of any kind from any action taken, or taken in reliance on, material or
                information contained on the site. While NFTmall attempts to make your access to and use of the site and
                content safe, NFTmall cannot and does not represent or warrant that the site, content, any crypto assets
                listed on our site, or our servers are free of viruses or other harmful components. We cannot guarantee
                the security of any data that you disclose online. You accept the inherent security risks of providing
                information and dealing online over the internet and will not hold us responsible for any breach of
                security unless it is due to our gross negligence.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Prevailing Language.</strong> If this Terms of Use is translated into a language other than
                English, and if the translated version is different from the English language version, the English
                language version will take precedence.
              </ChakraText>
              <VStack align="initial" width="100%" spacing={2}>
                <ChakraText>
                  We will not be responsible or liable to you for any loss and take no responsibility for, and will not
                  be liable to you for, any use of crypto assets, including but not limited to, any losses, damages, or
                  claims arising from: (a) user error such as forgotten passwords, incorrectly constructed transactions,
                  or mistyped addresses; (b) server failure or data loss; (c) corrupted wallet files; (d) unauthorized
                  access to applications; (e) any unauthorized third party activities, including without limitation, the
                  use of viruses, phishing, bruteforcing or other means of attack against the site or crypto assets.
                </ChakraText>
                <ChakraText>
                  Crypto assets are intangible digital assets. They exist only by virtue of the ownership record
                  maintained in the BSC network. Any transfer of title that might occur in any unique digital asset
                  occurs on the decentralized ledger within the BSC platform. We do not guarantee that NFTmall or any
                  NFTmall party can affect the transfer of title or right in any crypto assets.
                </ChakraText>
                <ChakraText>
                  NFTmall is not responsible for sustained casualties due to vulnerability, or any kind of failure,
                  abnormal behavior of software (e.g., wallet, smart contract), blockchains or any other features of the
                  Crypto Assets. NFTmall is not responsible for casualties due to late reports by developers or
                  representatives (or no report at all) of any issues with the blockchain supporting Crypto Assets
                  including forks, technical node issues, or any other issues having fund losses as a result.Nothing in
                  this Agreement shall exclude or limit liability of either party for fraud, death, or bodily injury
                  caused by negligence, violation of laws, or any other activity that cannot be limited or excluded by
                  legitimate means. Some jurisdictions do not allow the exclusion of implied warranties in contracts
                  with consumers, so the above exclusion may not apply to you.
                </ChakraText>
              </VStack>
              <ChakraText fontSize="lg">
                <strong>Additional Services.</strong> In the event that our platform develops and deploys additional
                services, additional terms for specific services will be specified. Those additional terms and
                conditions, which are available with the relevant services, then become part of your agreement with us
                if you use those services.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Suggestions.</strong> We welcome and encourage you to provide feedback, comments and suggestions
                for improvements to the Site ("Feedback"). You may submit Feedback by emailing us at info@nftmall.io
                only. Any Feedback you submit to us will be considered non-confidential and non-proprietary to you. By
                submitting Feedback to us, you grant us a non-exclusive, worldwide, royalty-free, irrevocable,
                sub-licensable, perpetual license to use and publish those ideas and materials for any purpose, without
                compensation to you.
              </ChakraText>
              <ChakraText fontSize="lg">
                <strong>Effective Agreement.</strong> The terms set here shall supersede all prior agreement between
                parties. NFTmall reserves the right to change or modify these Terms at any time and at our sole
                discretion. If we make changes to these Terms, we will provide notice of such changes, such as by
                sending an email notification, providing notice through the Service or updating the "Last Updated" date
                at the beginning of these Terms. By continuing to access or use the Service, you confirm your acceptance
                of the revised Terms and all of the terms incorporated therein by reference. We encourage you to review
                the Terms frequently to ensure that you understand the terms and conditions that apply when you access
                or use the Service. If you do not agree to the revised Terms, you may not access or use the Service.
              </ChakraText>
            </VStack>
          </VStack>
        </VStack>
      </ChakraLayout>
    </Fragment>
  )
}

export default memo(Index)
