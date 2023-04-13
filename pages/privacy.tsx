import { chakra, VStack } from '@chakra-ui/react'
import { defaultMetaData } from '@nftmall/sdk'
import { BannerProps, ChakraHeading, ChakraLayout, ChakraText } from '@nftmall/uikit'
import { NextSeo } from 'next-seo'
import dynamic from 'next/dynamic'
import { Fragment, memo } from 'react'

const Banner = memo(dynamic<BannerProps>(() => import('@nftmall/uikit').then((module) => module.Banner)))

function Index() {
  return (
    <Fragment>
      <NextSeo {...defaultMetaData} title={`Privacy Policy | NFTmall`} />
      <Banner from="privacy" />
      <ChakraLayout display="flex">
        <VStack zIndex={1} spacing={8}>
          <VStack align="initial" spacing={4}>
            <ChakraHeading as="h1" fontSize={{ base: '3xl', lg: '5xl', xl: '7xl' }} textTransform="capitalize">
              Privacy Policy
            </ChakraHeading>
            <ChakraText>NFTmall is the administrator of your Personal Data</ChakraText>
            <ChakraText>
              NFTmall is responsible for using information about you in a safe manner, in accordance with applicable
              law, in particular in accordance with the provisions of the GDPR and in accordance with the Regulations.
            </ChakraText>
            <ChakraText>
              We ask you to read the content of this Privacy Policy. If you have any questions related to this Privacy
              Policy or to submit a request for Personal Data, you can contact us via e-mail at info@nftmall.io NFTmall
              is responsible for processing data on this website.
            </ChakraText>
          </VStack>

          <VStack align="initial" spacing={4}>
            <ChakraHeading textTransform="uppercase">website</ChakraHeading>
            <ChakraText>
              To ensure that all necessary steps are taken to protect the privacy of our users, NFTmall created this
              policy in such a way that it fully complies with the GDPR Act. The data collected by us may be transferred
              to, and stored at, a destination outside the UE.
            </ChakraText>
          </VStack>

          <VStack align="initial" spacing={4} width="100%">
            <ChakraHeading textTransform="uppercase">Legal basis for the processing of personal data</ChakraHeading>
            <ChakraText pl={4}>
              1. Art. 6 sec. 1b) GDPR: processing is necessary to perform the order or to take action before its
              implementation.
            </ChakraText>
            <ChakraText pl={4}>
              2. Art. 6 sec. 1c) GDPR: processing is necessary to fulfil legal obligations.
            </ChakraText>
            <ChakraText pl={4}>
              3. Art. 6 sec. 1f) GDPR: processing is necessary for purposes resulting from the legitimate interest of
              data analysis in order to match the offer.
            </ChakraText>
            <ChakraText pl={4}>
              4. Art. 6 sec. 1a) GDPR: based on an explicit and voluntary consent, Personal data is processed for
              marketing purposes.
            </ChakraText>
          </VStack>

          <VStack align="initial" spacing={4}>
            <ChakraHeading textTransform="uppercase">Use of cookies</ChakraHeading>
            <ChakraText>
              To make the overall users experience better, NFTmall may collect data through cookie files. Where
              applicable, a user will be in charge of allowance of the use of cookies on their computer/device by the
              means of our cookie control system. This complies with recent legal requirements of obtaining explicit
              consent from users before storing and/or reading files such as cookies on a user’s computer/device.
              Cookies are small files invented to track, save and store information about the usage of the website and
              user’s interaction on it that are saved to the user’s computer. Collecting this data provide the users
              quality experience within this website.
            </ChakraText>
            <ChakraText>
              Users are advised that in order to deny the use and saving of cookies from this website on to their
              computer’s hard drive they should take necessary steps, such as blocking all cookie files from this
              website in their browser’s security settings. This website uses tracking software to collect data about
              how users use our services. This software is provided by Google Analytics, which may use cookies to track
              visitor usage. For further information, read Google’s privacy policy at
              http://www.google.com/privacy.html.
            </ChakraText>
            <ChakraText>Automatic Data Collection Technologies</ChakraText>
            <ChakraText>
              UNIQLY may use automatic data collection technologies to collect certain information about our Users
              equipment, browsing actions, and patterns, including:
            </ChakraText>
            <chakra.ul pl={8}>
              <li>
                Details of visits to our Website, including traffic data, geolocation data, logs, and other
                communication data and the resources that our Users access and use on the NFTmall Website
              </li>
              <li>
                Information about computer and internet connection, including our Users IP address, operating system,
                and browser type
              </li>
            </chakra.ul>
            <ChakraText>
              The information NFTmall collects automatically is statistical data and may include personal information,
              or we may maintain it or associate it with personal information NFTmall collects in other ways.
            </ChakraText>
            <ChakraText>
              The technologies NFTmall uses for this automatic data collection may include Cookies and Google Analytics
              - a web analytics service from Google Inc. (1600 Amphitheatre Parkway, Mountain View, CA 94043, USA).
            </ChakraText>
          </VStack>

          <VStack align="initial" spacing={4}>
            <ChakraHeading textTransform="uppercase">Contact</ChakraHeading>
            <ChakraText>
              Users contacting NFTmall and/or providing any personal details do that at their own risk and at their own
              discretion. Personal information of any user is stored securely until it has no use or it is no longer
              required, in compliance with GDPR. Any submitted information may be used by us to further provide you with
              information about our products and services or to assist you in answering any questions or queries
              submitted by you. This includes using your details to inform you of important announcements within the
              website. Regarding receiving any email marketing material, we assure you that your details are not passed
              on to any third parties.
            </ChakraText>
          </VStack>

          <VStack align="initial" spacing={4}>
            <ChakraHeading textTransform="uppercase">External Links</ChakraHeading>
            <ChakraText>
              This website will never deliberately include any potentially malicious external links on its servers.
              While we, as NFTmall, seek to improve your overall experience by providing safe and relevant sources, a
              policy of caution should be adopted before clicking on any external links referenced by this website. It
              is for your own safety that you note that any external material is entered by you at your own risk and
              NFTmall cannot be held liable for any damages caused by visiting/interacting with any content on external
              websites.
            </ChakraText>
          </VStack>

          <VStack align="initial" spacing={4}>
            <ChakraHeading textTransform="uppercase">Changes to privacy policy</ChakraHeading>
            <ChakraText>
              It is our right to revise this Privacy Policy if we feed the need to. Any vital change to this Policy will
              be followed with a website-wide notification to all users. Continuing to access or use our website after
              the revision becomes effective is automatically considered a consent to the reviewed Policy, and
              therefore, all users doing so will be bound by it.
            </ChakraText>
          </VStack>

          <VStack align="initial" spacing={4}>
            <ChakraHeading textTransform="uppercase">
              Revocation of consent to the processing of personal data
            </ChakraHeading>
            <ChakraText>
              Many data processing operations are only possible with our Users express consent. Our User may revoke
              consent at any time with future effect. An informal email (send to : info@nftmall.io) making this request
              is sufficient.
            </ChakraText>
            <ChakraText>
              After the expiry of the processing period, Personal data is irreversibly deleted or anonymized.
            </ChakraText>
          </VStack>

          <VStack align="initial" spacing={4}>
            <ChakraHeading textTransform="uppercase">Management and deletion of personal data</ChakraHeading>
            <ChakraText>
              You can exercise the right to protect your Data, resulting from the applicable regulations:
            </ChakraText>
            <VStack align="initial" spacing={4} pl={4}>
              <ChakraText fontSize="lg" fontWeight="bold">
                1. The right to access and manage your Data:
              </ChakraText>
              <ChakraText pl={4}>
                You have the right to know whether we process information about you: specific Personal Data that we have
                collected about you; the categories of Personal Data we have collected about you; categories of sources
                from which your personal data is collected; categories of third parties to whom your Personal Data has
                been disclosed, provided that they have been disclosed and the fulfilment of this obligation is
                permitted by law; the nature of the processing of Personal Data. You do not need an Account to submit a
                request for viewing/accessing Personal Data. If you submit multiple requests to view/access Personal
                Data, we may charge a fee. You will receive information about the amount of the fee before processing
                your request in this regard. We reserve the right to decline a request if it is excessive or manifestly
                unfounded. If we are unable to comply with your request, we will let you know the reason. You can also
                exercise your right to correct or update the information you provide to us. You can exercise this right
                and manage your data by directly updating your Account or by submitting a request to us. You are
                responsible for the information you provide to us and you should keep it accurate and up to date so that
                we can best deliver Products and Services to you. You can also block the use of certain data through the
                settings of your device or browser, which may, however, adversely affect your experience with the
                functionality of NFTmall.io.
              </ChakraText>
              <ChakraText fontWeight="bold">2. The right to remove or limit the processing of your Data:</ChakraText>
              <ChakraText fontSize="lg" pl={4}>
                You have the right to delete some of the Personal Data that you provide to us as part of Account
                registration – if you decide to delete the information, we will not be able to provide Services for you,
                including fulfilling orders. You can exercise the right to delete data by sending us a request (also if
                you do not have an Account and you have provided us with your data by placing an order without
                registration). In some circumstances, we may retain information about you – in order to comply with
                legal obligations (tax, billing, etc.). Some information may remain in backups maintained for data
                integrity and disaster recovery. We make every effort to keep your information no longer than necessary
                and will take steps to delete your information where reasonably possible.
              </ChakraText>
              <ChakraText fontSize="lg" fontWeight="bold">
                3. The right to receive a copy of Personal Data:
              </ChakraText>
              <ChakraText pl={4}>
                Copies of Personal Data may be sent by electronic means, if possible, or by traditional mail. If you
                submit multiple requests for copies of Personal Information, we may charge a fee. You will receive
                information about the amount of the fee before processing your request for sending a copy of Personal
                Data. We reserve the right to decline a request if it is excessive or manifestly unfounded. We will try
                to respond to a correct and confirmed request for copies of Personal Data as soon as possible.
              </ChakraText>
              <ChakraText fontSize="lg" fontWeight="bold">
                4. The right to cancel or modify consent to marketing communications:
              </ChakraText>
              <ChakraText pl={4}>
                You have the right to cancel or modify your consent to receive marketing messages. You can exercise this
                right by logging into your Account and changing your communication preferences. Please note that this
                will not affect the lawfulness of data processing prior to the withdrawal of consent. You can also
                withdraw your consent by sending us an e-mail containing such a request. Please note that you cannot opt
                out of receiving certain administrative, transactional or legal messages that we may send as part of our
                legitimate business if you have a User Account or use certain features available on uniqly.io. A
                complete cessation of sending e-mails is only possible if you submit a request to delete your Account.
              </ChakraText>
            </VStack>
          </VStack>

          <VStack align="initial" spacing={4}>
            <ChakraHeading textTransform="uppercase">Security</ChakraHeading>
            <ChakraText>
              NFTmall have implemented several measures to help protect your personal information. These measures
              include, but are not limited to, minimizing access to personal data to employees who must have access to
              it, and encrypting personal data transmitted through our websites using the SSL/TLS protocol. We update
              our security measures to increase the security of your Personal Data.
            </ChakraText>
            <ChakraText>
              NFTmall regularly reviews the rules governing the processing of Personal Data, including security
              solutions. NFTmall have implemented procedures for dealing with suspected personal data breaches. The
              security of your Personal Data also depends on you. Be sure to choose an Account password that no one else
              knows or can easily guess, and to keep your login details and password confidential. When finished, log
              out of your Account, especially if you are using a shared computer.
            </ChakraText>
            <ChakraText>
              NFTmall is not responsible for the actions of unauthorized persons to whom login details have been
              disclosed. In such cases, we are not responsible for any acquisition or distribution of your Personal Data
              by such an unauthorized party. If you believe that your personal information has been compromised, we
              encourage you to notify us immediately.
            </ChakraText>
          </VStack>

          <VStack align="initial" spacing={4} width="100%">
            <ChakraHeading textTransform="uppercase">Right to file a complain</ChakraHeading>
            <ChakraText>
              In the event of objections to the processing of Personal Data, you own the full right to submit a
              complaint.
            </ChakraText>
          </VStack>
        </VStack>
      </ChakraLayout>
    </Fragment>
  )
}

export default memo(Index)
