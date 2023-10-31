import {
  AspectRatio,
  Box,
  Button,
  Flex,
  GridItem,
  Heading,
  HStack,
  Image,
  Link,
  Modal,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Text,
  Tooltip,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { CharacterActionMenu } from '@/components/ActionMenus/CharacterActionMenu';
import { EXPLORER_URLS } from '@/utils/constants';
import { shortenAddress, shortenText } from '@/utils/helpers';
import { Character } from '@/utils/types';

import { ClassTag } from './ClassTag';
import { ItemTag } from './ItemTag';
import { XPDisplay, XPDisplaySmall } from './XPDisplay';

export const CharacterCard: React.FC<{
  chainId: number;
  character: Character;
  dummy?: boolean;
}> = ({ chainId, character, dummy }) => {
  const { isConnected } = useAccount();

  const {
    characterId,
    account,
    classes,
    heldItems,
    equippedItems,
    description,
    experience,
    image,
    jailed,
    name,
  } = character;

  const items = useMemo(() => {
    const items = [...equippedItems];

    heldItems.forEach(item => {
      if (!items.find(i => i.itemId === item.itemId)) {
        items.push(item);
      }
    });

    return items;
  }, [equippedItems, heldItems]);

  const itemTotal = useMemo(() => {
    return items
      .reduce((total, item) => total + BigInt(item.amount), BigInt(0))
      .toString();
  }, [items]);

  return (
    <SimpleGrid
      columns={{ base: 1, md: 2 }}
      spacing={10}
      w="100%"
      border="1px solid white"
      p={6}
      maxW="72rem"
    >
      <Box pos="relative">
        <AspectRatio ratio={10 / 13} w="full">
          <Image
            alt="character avatar"
            filter={jailed ? 'grayscale(100%)' : 'none'}
            w="100%"
            h="100%"
            borderRadius="lg"
            objectFit="cover"
            src={image}
          />
        </AspectRatio>
        {jailed && (
          <Text
            bg="black"
            color="red"
            fontWeight="bold"
            left="50%"
            pos="absolute"
            top="50%"
            transform="translate(-50%, -50%)"
            variant="secondary"
          >
            JAILED
          </Text>
        )}
        <HStack pos="absolute" top={4} left={4}>
          <XPDisplay experience={experience} />
        </HStack>
      </Box>
      <VStack align="flex-start" spacing={6}>
        <Heading>{name}</Heading>
        <Link
          alignItems="center"
          textDecor="underline"
          display="flex"
          fontSize="sm"
          gap={2}
          href={dummy ? '/' : `${EXPLORER_URLS[chainId]}/address/${account}`}
          isExternal
          p={0}
        >
          {shortenAddress(account)}
        </Link>
        <Wrap spacing={4}>
          {classes.map(classEntity => (
            <WrapItem key={classEntity.classId + classEntity.name}>
              <ClassTag {...classEntity} />
            </WrapItem>
          ))}
        </Wrap>
        <Text fontSize="sm" fontWeight={300} lineHeight={5}>
          {shortenText(description, 100)}
        </Text>
        {isConnected && !dummy && <CharacterActionMenu character={character} />}
        {items.length > 0 && (
          <>
            <HStack justify="space-between" w="full">
              <HStack spacing={4} align="center">
                <Image
                  alt="users"
                  height="20px"
                  src="/icons/items.svg"
                  width="20px"
                />
                <Text
                  letterSpacing="3px"
                  fontSize="2xs"
                  textTransform="uppercase"
                >
                  Inventory ({itemTotal})
                </Text>
              </HStack>
              <Button variant="ghost" size="xs">
                show all
              </Button>
            </HStack>
            <SimpleGrid columns={2} spacing={4} w="full">
              {items.map(item => (
                <GridItem key={item.itemId + item.name}>
                  <ItemTag item={item} holderId={characterId} />
                </GridItem>
              ))}
            </SimpleGrid>
          </>
        )}
      </VStack>
    </SimpleGrid>
  );
};

export const CharacterCardSmall: React.FC<{
  chainId: number;
  character: Character;
}> = ({ chainId, character }) => {
  const { isConnected } = useAccount();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const { classes, experience, heldItems, image, jailed, name } = character;

  const itemTotal = useMemo(() => {
    return heldItems
      .reduce((total, item) => total + BigInt(item.amount), BigInt(0))
      .toString();
  }, [heldItems]);

  return (
    <VStack spacing={3}>
      <Box
        border="1px solid white"
        h="375px"
        onClick={onOpen}
        overflow="hidden"
        p={3}
        transition="transform 0.3s"
        w="220px"
        _hover={{
          cursor: 'pointer',
          transform: 'rotateY(15deg)',
        }}
      >
        <Box pos="relative">
          <AspectRatio ratio={10 / 13} w="full">
            <Image
              alt="character avatar"
              borderRadius="lg"
              filter={jailed ? 'grayscale(100%)' : 'none'}
              h="100%"
              objectFit="cover"
              src={image}
              w="100%"
            />
          </AspectRatio>
          {jailed && (
            <Text
              bg="black"
              color="red"
              fontWeight="bold"
              left="50%"
              pos="absolute"
              top="50%"
              transform="translate(-50%, -50%)"
              variant="secondary"
            >
              JAILED
            </Text>
          )}
          <HStack
            bottom={4}
            left="50%"
            pos="absolute"
            transform="translateX(-50%)"
          >
            <XPDisplaySmall experience={experience} />
          </HStack>
        </Box>
        <VStack py={4} spacing={5}>
          <Text fontSize="lg" fontWeight={500}>
            {name}
          </Text>
          <HStack justify="space-between" w="full">
            <Wrap spacing={2}>
              {classes.map(classEntity => (
                <WrapItem key={classEntity.classId + classEntity.name}>
                  <ClassTag {...classEntity} size="xs" />
                </WrapItem>
              ))}
            </Wrap>
            <Tooltip
              aria-label={`${itemTotal} item${
                Number(itemTotal) === 1 ? '' : 's'
              } in inventory`}
              label={`${itemTotal} item${
                Number(itemTotal) === 1 ? '' : 's'
              } in inventory`}
            >
              <Flex align="center" gap={3}>
                <Text>{itemTotal}</Text>
                <Image
                  alt="users"
                  height="16px"
                  src="/icons/items.svg"
                  width="16px"
                />
              </Flex>
            </Tooltip>
          </HStack>
        </VStack>
      </Box>
      {isConnected && (
        <CharacterActionMenu character={character} variant="solid" />
      )}
      <Modal
        autoFocus={false}
        isOpen={isOpen}
        onClose={onClose}
        returnFocusOnClose={false}
      >
        <ModalOverlay />
        <ModalContent>
          <CharacterCard chainId={chainId} character={character} />
        </ModalContent>
      </Modal>
    </VStack>
  );
};
