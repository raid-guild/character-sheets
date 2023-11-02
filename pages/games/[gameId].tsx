import {
  AspectRatio,
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Image,
  Link,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  VStack,
  Wrap,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

import { CharacterCard } from '@/components/CharacterCard';
import { CharactersPanel } from '@/components/CharactersPanel';
import { ClassesPanel } from '@/components/ClassesPanel';
import { GameTotals } from '@/components/GameTotals';
import { ItemsPanel } from '@/components/ItemsPanel';
import { JoinGame } from '@/components/JoinGame';
import { AddItemRequirementModal } from '@/components/Modals/AddItemRequirementModal';
import { ApproveTransferModal } from '@/components/Modals/ApproveTransferModal';
import { AssignClassModal } from '@/components/Modals/AssignClassModal';
import { ClaimClassModal } from '@/components/Modals/ClaimClassModal';
import { ClaimItemModal } from '@/components/Modals/ClaimItemModal';
import { DropExperienceModal } from '@/components/Modals/DropExperienceModal';
import { EditItemClaimableModal } from '@/components/Modals/EditItemClaimableModal';
import { EquipItemModal } from '@/components/Modals/EquipItemModal';
import { GiveItemsModal } from '@/components/Modals/GiveItemsModal';
import { JailPlayerModal } from '@/components/Modals/JailPlayerModal';
import { RemoveCharacterModal } from '@/components/Modals/RemoveCharacterModal';
import { RemoveItemRequirementModal } from '@/components/Modals/RemoveItemRequirementModal';
import { RenounceCharacterModal } from '@/components/Modals/RenounceCharacterModal';
import { RenounceClassModal } from '@/components/Modals/RenounceClassModal';
import { RestoreCharacterModal } from '@/components/Modals/RestoreCharacterModal';
import { RevokeClassModal } from '@/components/Modals/RevokeClassModal';
import { TransferCharacterModal } from '@/components/Modals/TransferCharacterModal';
import { UpdateCharacterMetadataModal } from '@/components/Modals/UpdateCharacterMetadataModal';
import { UpdateGameMetadataModal } from '@/components/Modals/UpdateGameMetadataModal';
import { XPPanel } from '@/components/XPPanel';
import { ActionsProvider, useActions } from '@/contexts/ActionsContext';
import { GameProvider, useGame } from '@/contexts/GameContext';
import {
  ItemActionsProvider,
  useItemActions,
} from '@/contexts/ItemActionsContext';
import { DEFAULT_CHAIN } from '@/lib/web3';
import { EXPLORER_URLS } from '@/utils/constants';
import { shortenAddress } from '@/utils/helpers';

export default function GamePageOuter(): JSX.Element {
  const {
    query: { gameId },
    push,
    isReady,
  } = useRouter();

  useEffect(() => {
    if (
      isReady &&
      (!gameId || typeof gameId !== 'string' || !isAddress(gameId))
    ) {
      push('/');
    }
  }, [gameId, isReady, push]);

  return (
    <GameProvider gameId={gameId}>
      <ActionsProvider>
        <ItemActionsProvider>
          <GamePage />
        </ItemActionsProvider>
      </ActionsProvider>
    </GameProvider>
  );
}

function GamePage(): JSX.Element {
  const { game, character, isMaster, loading } = useGame();
  const {
    assignClassModal,
    approveTransferModal,
    claimClassModal,
    editCharacterModal,
    equipItemModal,
    giveExpModal,
    giveItemsModal,
    jailPlayerModal,
    removeCharacterModal,
    renounceCharacterModal,
    renounceClassModal,
    revokeClassModal,
    transferCharacterModal,
  } = useActions();
  const {
    addRequirementModal,
    claimItemModal,
    removeRequirementModal,
    editItemClaimableModal,
  } = useItemActions();
  const { isConnected } = useAccount();

  const updateGameMetadata = useDisclosure();
  const restoreCharacterModal = useDisclosure();

  const [isConnectedAndMounted, setIsConnectedAndMounted] = useState(false);
  const [showJoinGame, setShowJoinGame] = useState(false);

  const topOfCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isConnected) {
      setIsConnectedAndMounted(true);
    } else {
      setIsConnectedAndMounted(false);
    }
  }, [isConnected]);

  const { address } = useAccount();

  const content = () => {
    if (loading) {
      return (
        <VStack as="main" pt={20}>
          <Spinner size="lg" />
        </VStack>
      );
    }

    if (!game) {
      return (
        <VStack as="main" pt={20}>
          <Text align="center">Game not found.</Text>
        </VStack>
      );
    }

    const {
      description,
      experience,
      image,
      name,
      owner,
      admins,
      masters,
      id,
      characters,
      classes,
      items,
    } = game;

    const chainId = DEFAULT_CHAIN.id;

    return (
      <Grid templateColumns="3fr 1fr" w="full" gridGap="5px">
        <HStack spacing="5px">
          <HStack
            bg="cardBG"
            h="100%"
            p={8}
            transition="background 0.3s ease"
            w="100%"
            spacing={12}
          >
            <AspectRatio ratio={1} w="100%" maxW="12rem">
              <Image
                alt="game emblem"
                background="gray.400"
                objectFit="cover"
                src={image}
                w="100%"
                h="100%"
              />
            </AspectRatio>
            <VStack spacing={4} align="flex-start">
              <Heading
                display="inline-block"
                fontSize="40px"
                fontWeight="normal"
                lineHeight="40px"
              >
                {name}
              </Heading>
              <Text fontSize="xl" fontWeight={200} mb={2}>
                {description}
              </Text>
              <HStack spacing={4}>
                <Link
                  fontSize="sm"
                  href={`${EXPLORER_URLS[chainId]}/address/${id}`}
                  isExternal
                  fontWeight={300}
                  mb={3}
                  textDecoration={'underline'}
                >
                  {shortenAddress(id)}
                </Link>
                {isMaster && (
                  <Button onClick={updateGameMetadata.onOpen} size="sm">
                    edit
                  </Button>
                )}
              </HStack>
            </VStack>
          </HStack>
          <VStack
            align="start"
            spacing={0}
            h="100%"
            bg="cardBG"
            flexShrink={0}
            p={8}
          >
            <GameTotals
              experience={experience}
              characters={characters}
              items={items}
            />
          </VStack>
        </HStack>

        <VStack align="start" spacing={4} p={8} bg="cardBG">
          <Text letterSpacing="3px" fontSize="2xs" textTransform="uppercase">
            Owner
          </Text>
          <Link
            fontSize="sm"
            href={`${EXPLORER_URLS[chainId]}/address/${owner}`}
            key={`gm-${owner}`}
            isExternal
            bg={owner === address?.toLowerCase() ? 'whiteAlpha.300' : ''}
            textDecor={owner !== address?.toLowerCase() ? 'underline' : ''}
            _hover={{
              color: 'accent',
            }}
          >
            {owner === address?.toLowerCase() ? (
              <HStack px={1} spacing={3}>
                <Text as="span">You</Text>
                <Text as="span" textDecor="underline">
                  ({shortenAddress(owner)})
                </Text>
              </HStack>
            ) : (
              shortenAddress(owner)
            )}
          </Link>
          <Text
            letterSpacing="3px"
            fontSize="2xs"
            textTransform="uppercase"
            mt={2}
          >
            Admins
          </Text>
          {admins.map(admin => (
            <Link
              fontSize="sm"
              href={`${EXPLORER_URLS[chainId]}/address/${admin}`}
              key={`gm-${admin}`}
              isExternal
              bg={admin === address?.toLowerCase() ? 'whiteAlpha.300' : ''}
              textDecor={admin !== address?.toLowerCase() ? 'underline' : ''}
              _hover={{
                color: 'accent',
              }}
            >
              {admin === address?.toLowerCase() ? (
                <HStack px={1} spacing={3}>
                  <Text as="span">You</Text>
                  <Text as="span" textDecor="underline">
                    ({shortenAddress(admin)})
                  </Text>
                </HStack>
              ) : (
                shortenAddress(admin)
              )}
            </Link>
          ))}

          <Text
            letterSpacing="3px"
            fontSize="2xs"
            mt={2}
            textTransform="uppercase"
          >
            Game Masters
          </Text>
          <Wrap spacingX={1}>
            {masters.map((master, i) => (
              <>
                <Link
                  fontSize="sm"
                  href={`${EXPLORER_URLS[chainId]}/address/${master}`}
                  key={`gm-${master}`}
                  isExternal
                  bg={master === address?.toLowerCase() ? 'whiteAlpha.300' : ''}
                  textDecor={
                    master !== address?.toLowerCase() ? 'underline' : ''
                  }
                  _hover={{
                    color: 'accent',
                  }}
                >
                  {master === address?.toLowerCase() ? (
                    <HStack px={1} spacing={3}>
                      <Text as="span">You</Text>
                      <Text as="span" textDecor="underline">
                        ({shortenAddress(master)})
                      </Text>
                    </HStack>
                  ) : (
                    shortenAddress(master)
                  )}
                </Link>
                {i !== masters.length - 1 && <Text as="span">, </Text>}
              </>
            ))}
          </Wrap>
        </VStack>
        <VStack
          align="stretch"
          position="relative"
          ref={topOfCardRef}
          spacing="5px"
        >
          <Box ref={topOfCardRef} position="absolute" top="-80px" />
          {isConnectedAndMounted && (
            <VStack p={8} bg="cardBG" align="start" spacing={4}>
              {!character && !showJoinGame && (
                <HStack w="100%" spacing={4}>
                  <Button variant="solid" onClick={() => setShowJoinGame(true)}>
                    Join this Game
                  </Button>
                  <Text fontSize="sm">
                    You don’t have a character sheet in this game.
                  </Text>
                </HStack>
              )}
              {!character && showJoinGame && (
                <JoinGame
                  onClose={() => setShowJoinGame(false)}
                  topOfCardRef={topOfCardRef}
                />
              )}
              {character && character.removed && !character.jailed && (
                <HStack spacing={4}>
                  <Button
                    variant="solid"
                    onClick={restoreCharacterModal.onOpen}
                  >
                    Restore Character
                  </Button>
                  <Text>Your character has been removed from this game.</Text>
                </HStack>
              )}
              {character && character.jailed && (
                <Text>
                  Your character is in jail. You can’t play until you’re
                  released.
                </Text>
              )}
              {character && !character.removed && !character.jailed && (
                <CharacterCard chainId={chainId} character={character} />
              )}
            </VStack>
          )}

          <Tabs
            borderColor="transparent"
            colorScheme="white"
            w="full"
            p={8}
            bg="cardBG"
          >
            <TabList>
              <Tab gap={2}>
                <Image
                  alt="users"
                  height="20px"
                  src="/icons/users.svg"
                  width="20px"
                />
                <Text>{characters.length} characters</Text>
              </Tab>
              <Tab gap={2}>
                <Image
                  alt="xp"
                  height="20px"
                  src="/icons/xp.svg"
                  width="20px"
                />
                <Text>{experience} XP</Text>
              </Tab>
              <Tab gap={2}>
                <Image
                  alt="users"
                  height="20px"
                  src="/icons/users.svg"
                  width="20px"
                />
                <Text>{classes.length} classes</Text>
              </Tab>
              <Tab gap={2}>
                <Image
                  alt="items"
                  height="20px"
                  src="/icons/items.svg"
                  width="20px"
                />
                <Text>{items.length} Items</Text>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <CharactersPanel />
              </TabPanel>
              <TabPanel px={0}>
                <XPPanel />
              </TabPanel>
              <TabPanel px={0}>
                <ClassesPanel />
              </TabPanel>
              <TabPanel px={0}>
                <ItemsPanel />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
        <VStack h="100%" bg="cardBG" p={8} align="stretch">
          <Text>Coming Soon!</Text>
        </VStack>
      </Grid>
    );
  };

  return (
    <>
      {content()}
      <UpdateGameMetadataModal {...updateGameMetadata} />
      <RestoreCharacterModal {...restoreCharacterModal} />

      {addRequirementModal && <AddItemRequirementModal />}
      {approveTransferModal && <ApproveTransferModal />}
      {assignClassModal && <AssignClassModal />}
      {claimClassModal && <ClaimClassModal />}
      {claimItemModal && <ClaimItemModal />}
      {editCharacterModal && <UpdateCharacterMetadataModal />}
      {editItemClaimableModal && <EditItemClaimableModal />}
      {equipItemModal && <EquipItemModal />}
      {giveExpModal && <DropExperienceModal />}
      {giveItemsModal && <GiveItemsModal />}
      {jailPlayerModal && <JailPlayerModal />}
      {removeCharacterModal && <RemoveCharacterModal />}
      {removeRequirementModal && <RemoveItemRequirementModal />}
      {renounceCharacterModal && <RenounceCharacterModal />}
      {renounceClassModal && <RenounceClassModal />}
      {revokeClassModal && <RevokeClassModal />}
      {transferCharacterModal && <TransferCharacterModal />}
    </>
  );
}
