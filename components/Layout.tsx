import {
  Flex,
  Heading,
  Image,
  Link,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { NavMenu } from './NavMenu';

const FULL_PAGE_ROUTES = ['/'];

export const Layout: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { pathname } = useRouter();

  const isFullPage = FULL_PAGE_ROUTES.includes(pathname);

  return (
    <Flex direction="column" minH="100vh">
      <VStack
        as="header"
        background="dark"
        pt={6}
        position="fixed"
        px={{ base: 4, lg: 6 }}
        top={0}
        left={0}
        right={0}
        align="stretch"
        zIndex={1000}
      >
        <Flex
          align="center"
          h="100%"
          justify="start"
          borderBottom="1px solid white"
          pb={4}
        >
          <Link
            as={NextLink}
            href="/"
            ml={{ base: 2, lg: 4 }}
            _hover={{ color: 'accent', textDecoration: 'none' }}
          >
            <Heading fontSize="22px" textTransform="uppercase">
              CharacterSheets
            </Heading>
          </Link>
          <Spacer />
          <NavMenu />
        </Flex>
      </VStack>
      <VStack
        align="stretch"
        as="main"
        mt={20}
        spacing={0}
        w="100%"
        {...(isFullPage
          ? {}
          : {
              maxW: '100rem',
              mx: 'auto',
              py: 12,
            })}
      >
        {children}
      </VStack>
      <Flex
        align="center"
        as="footer"
        background="black"
        borderTop="5px solid black"
        h={24}
        justify="center"
        marginTop="auto"
      >
        <Link as={NextLink} href="https://raidguild.org" isExternal>
          <Text
            alignItems="center"
            display="flex"
            fontFamily="Texturina"
            gap={2}
          >
            Built by{' '}
            <Image alt="RaidGuild logo" h="28px" src="/favicon.ico" w="28px" />{' '}
            RaidGuild
          </Text>
        </Link>
      </Flex>
    </Flex>
  );
};
