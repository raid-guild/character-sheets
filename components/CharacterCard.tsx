import {
  Box,
  Button,
  HStack,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useToast,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useMemo } from 'react';

import { PlayerActions, useActions } from '@/contexts/ActionsContext';
import { EXPLORER_URLS } from '@/utils/constants';
import { shortenAddress, shortenText } from '@/utils/helpers';
import { Character } from '@/utils/types';

import { ClassTag, VillagerClassTag } from './ClassTag';
import { ItemTag } from './ItemTag';

const DEMO_WARRIOR_IMAGE =
  'https://ipfs.io/ipfs/bafybeigjgzwetsye6mdolqekhhlktpzoehtpnrhfpgppmb6bp6dejkybim/warrior_without_sword.svg';

export const CharacterCard: React.FC<{
  chainId: number;
  character: Character;
}> = ({ chainId, character }) => {
  const toast = useToast();

  const {
    characterId,
    account,
    classes,
    heldItems,
    equippedItems,
    description,
    experience,
    image,
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

  const hasWarriorClass = useMemo(
    () => classes.find(c => c.name === 'Warrior') !== undefined,
    [classes],
  );

  const hasSwordItemEquipped = useMemo(
    () => equippedItems.find(i => i.name === 'Sword') !== undefined,
    [equippedItems],
  );

  const warriorClassImage = useMemo(
    () => classes.find(c => c.name === 'Warrior')?.image ?? '',
    [classes],
  );

  return (
    <VStack
      border="3px solid black"
      borderBottom="5px solid black"
      borderRight="5px solid black"
      transition="background 0.3s ease"
      py={4}
      px={8}
      spacing={4}
      w="100%"
    >
      <HStack spacing={6} w="100%">
        <VStack>
          <Box pos="relative">
            <Image
              alt="character avatar"
              w="120px"
              h="180px"
              objectFit="contain"
              src={
                hasSwordItemEquipped && hasWarriorClass
                  ? warriorClassImage
                  : hasWarriorClass
                  ? DEMO_WARRIOR_IMAGE
                  : image
              }
            />
            <HStack
              bg="white"
              border="1px solid black"
              pos="absolute"
              right="0"
              bottom="0"
              px={1}
              fontSize="xs"
            >
              <Text>{experience} XP</Text>
            </HStack>
          </Box>
          <VStack align="stretch" w="120px">
            <Button
              onClick={() => {
                toast({
                  title: 'Coming soon!',
                  position: 'top',
                  status: 'warning',
                });
              }}
              size="sm"
              w="100%"
            >
              View
            </Button>
            <ActionMenu character={character} />
          </VStack>
        </VStack>
        <VStack align="flex-start" flex={1}>
          <Text fontSize="lg" fontWeight="bold">
            {name}
          </Text>
          <Text fontSize="sm">{shortenText(description, 130)}</Text>
          <Link
            alignItems="center"
            color="blue"
            display="flex"
            fontSize="sm"
            gap={2}
            href={`${EXPLORER_URLS[chainId]}/address/${account}`}
            isExternal
            p={0}
          >
            {shortenAddress(account)}
            <Image
              alt="link to new tab"
              height="14px"
              src="/icons/new-tab.svg"
              width="14px"
            />
          </Link>
          <Box background="black" h="3px" my={4} w={20} />
          <Text fontSize="sm">Classes:</Text>
          <Wrap>
            <WrapItem>
              <VillagerClassTag />
            </WrapItem>
            {classes.map(classEntity => (
              <WrapItem key={classEntity.classId}>
                <ClassTag classEntity={classEntity} />
              </WrapItem>
            ))}
          </Wrap>
        </VStack>
      </HStack>
      {items.length > 0 && (
        <VStack w="100%" align="stretch" spacing={4}>
          <Box background="black" h="3px" my={4} w="50%" />
          <Text fontSize="sm">Items:</Text>
          <Wrap>
            {items.map(item => (
              <WrapItem key={item.itemId}>
                <ItemTag item={item} holderId={characterId} />
              </WrapItem>
            ))}
          </Wrap>
        </VStack>
      )}
    </VStack>
  );
};

export const SmallCharacterCard: React.FC<{
  chainId: number;
  character: Character;
}> = ({ chainId, character }) => {
  const toast = useToast();

  const {
    account,
    classes,
    description,
    equippedItems: items,
    experience,
    image,
    name,
  } = character;

  const hasWarriorClass = useMemo(
    () => classes.find(c => c.name === 'Warrior') !== undefined,
    [classes],
  );

  const hasSwordItemEquipped = useMemo(
    () => items.find(i => i.name === 'Sword') !== undefined,
    [items],
  );

  const warriorClassImage = useMemo(
    () => classes.find(c => c.name === 'Warrior')?.image ?? '',
    [classes],
  );

  return (
    <VStack
      border="3px solid black"
      borderBottom="5px solid black"
      borderRight="5px solid black"
      transition="background 0.3s ease"
      p={4}
      spacing={5}
      w="100%"
    >
      <HStack spacing={5} w="100%">
        <VStack align="stretch" h="100%">
          <Box pos="relative">
            <Image
              alt="character avatar"
              w="100px"
              h="150px"
              objectFit="cover"
              src={
                hasSwordItemEquipped && hasWarriorClass
                  ? warriorClassImage
                  : hasWarriorClass
                  ? DEMO_WARRIOR_IMAGE
                  : image
              }
            />
            <HStack
              bg="white"
              border="1px solid black"
              pos="absolute"
              right="0"
              bottom="0"
              px={1}
              fontSize="2xs"
            >
              <Text>{experience} XP</Text>
            </HStack>
          </Box>
          <VStack align="stretch" w="100px">
            <Button
              onClick={() => {
                toast({
                  title: 'Coming soon!',
                  position: 'top',
                  status: 'warning',
                });
              }}
              size="sm"
              w="100%"
            >
              View
            </Button>
            <ActionMenu character={character} />
          </VStack>
        </VStack>
        <VStack align="flex-start" flex={1}>
          <Text fontSize="md" fontWeight="bold">
            {name}
          </Text>
          <Text fontSize="xs">{shortenText(description, 130)}</Text>
          <Link
            alignItems="center"
            color="blue"
            display="flex"
            fontSize="sm"
            gap={2}
            href={`${EXPLORER_URLS[chainId]}/address/${account}`}
            isExternal
            p={0}
          >
            {shortenAddress(account)}
            <Image
              alt="link to new tab"
              height="14px"
              src="/icons/new-tab.svg"
              width="14px"
            />
          </Link>
          <Box background="black" h="3px" my={2} w={20} />
          <Text fontSize="xs">Classes:</Text>
          <Wrap>
            <WrapItem>
              <VillagerClassTag size="sm" />
            </WrapItem>
            {classes.map(classEntity => (
              <WrapItem key={classEntity.classId}>
                <ClassTag classEntity={classEntity} size="sm" />
              </WrapItem>
            ))}
          </Wrap>
        </VStack>
      </HStack>
      {items.length > 0 && (
        <VStack w="100%" align="stretch" spacing={4}>
          <Box background="black" h="3px" my={2} w="50%" />
          <Text fontSize="xs">Equipped items:</Text>
          <Wrap>
            {items.map(item => (
              <WrapItem key={item.itemId}>
                <ItemTag item={item} size="sm" />
              </WrapItem>
            ))}
          </Wrap>
        </VStack>
      )}
    </VStack>
  );
};

type ActionMenuProps = {
  character: Character;
};

const ActionMenu: React.FC<ActionMenuProps> = ({ character }) => {
  const { selectCharacter, playerActions, gmActions, openActionModal } =
    useActions();

  return (
    <>
      <Menu onOpen={() => selectCharacter(character)}>
        <MenuButton as={Button} size="sm" w="100%">
          Actions
        </MenuButton>
        <MenuList>
          {playerActions.length > 0 && (
            <>
              <Text
                borderBottom="1px solid black"
                fontSize="12px"
                p={3}
                textAlign="center"
                variant="heading"
              >
                Player Actions
              </Text>
              {playerActions
                .filter(a => a != PlayerActions.EQUIP_ITEM)
                .map(action => (
                  <MenuItem
                    key={action}
                    onClick={() => openActionModal(action)}
                  >
                    {action}
                  </MenuItem>
                ))}
            </>
          )}
          {gmActions.length > 0 && (
            <>
              <Text
                borderBottom="1px solid black"
                borderTop={
                  playerActions.length > 0 ? '3px solid black' : 'none'
                }
                fontSize="12px"
                p={3}
                textAlign="center"
                variant="heading"
              >
                GameMaster Actions
              </Text>
              {gmActions.map(action => (
                <MenuItem key={action} onClick={() => openActionModal(action)}>
                  {action}
                </MenuItem>
              ))}
            </>
          )}
        </MenuList>
      </Menu>
    </>
  );
};
